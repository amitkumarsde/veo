import { useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "react-toastify";

import Avatar from "@/components/ui/Avatar";
import { Button, TextButton } from "@/components/ui/Button";
import Field from "@/components/ui/Field";
import FormPage from "@/components/ui/FormPage";
import ImagePicker from "@/components/ui/ImagePicker";
import { Input, Textarea } from "@/components/ui/Input";
import UploadProgress from "@/components/ui/UploadProgress";
import { LIMITS } from "@/constants/limits";
import { useAuth } from "@/features/auth/useAuth";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useForm } from "@/hooks/useForm";
import { useImageField } from "@/hooks/useImageField";
import { useLatest } from "@/hooks/useLatest";
import { useUnsavedChanges } from "@/hooks/useUnsavedChanges";
import { useUploadTask } from "@/hooks/useUploadTask";
import { updateProfile } from "@/services/user.service";
import { toFormData } from "@/utils/uploads";

// Name, bio and photo. The email, password and @handle can't be changed here.
const EditProfilePage = () => {
    const { user, updateUser } = useAuth();
    const navigate = useNavigate();
    const form = useForm({ name: user.name ?? "", bio: user.bio ?? "" });
    const photo = useImageField(user.avatarURL ?? "");
    const upload = useUploadTask();
    const allowLeave = useUnsavedChanges(form.isDirty || photo.changed || upload.isUploading, upload.leaveMessage);
    useDocumentTitle("Edit profile");

    // Takes the server's newer copy of the account while nothing here has been changed yet.
    const isUntouchedRef = useLatest(!form.isDirty && !photo.changed && !upload.isUploading);
    const { reset: resetForm } = form;
    const { reset: resetPhoto } = photo;
    useEffect(() => {
        if (!isUntouchedRef.current) return;
        resetForm({ name: user.name ?? "", bio: user.bio ?? "" });
        resetPhoto(user.avatarURL ?? "");
    }, [user.name, user.bio, user.avatarURL, resetForm, resetPhoto, isUntouchedRef]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        const name = form.values.name.trim();
        if (form.showErrors({ name: name.length < LIMITS.name.min && `Enter your name (at least ${LIMITS.name.min} characters).` })) return;
        try {
            const updatedUser = await upload.run((options) => updateProfile(toFormData({
                name,
                bio: form.values.bio.trim(),
                avatar: photo.file,
                removeAvatar: photo.shouldRemoveSaved,
            }), options));
            allowLeave();
            updateUser(updatedUser);
            toast.success("Profile saved");
            navigate("/profile");
        } catch (error) {
            form.showServerError(error, "Couldn't save your profile.");
        }
    };

    return (
        <FormPage
            eyebrow="Your account"
            title="Edit profile"
            description="This is how you appear next to your comments and on your channel."
            onSubmit={handleSubmit}
            actions={(
                <>
                    <Button type="submit" disabled={upload.isUploading}>{upload.isUploading ? "Saving…" : "Save profile"}</Button>
                    <TextButton as={Link} to="/profile">Cancel</TextButton>
                    <UploadProgress progress={upload.progress} />
                </>
            )}
        >
            <Field label="Photo" hint="Optional">
                <ImagePicker
                    shape="round"
                    label="profile photo"
                    currentUrl={photo.currentUrl}
                    file={photo.file}
                    removed={photo.removed}
                    onPick={photo.pick}
                    onRemove={photo.remove}
                    fallback={<Avatar name={form.values.name || user.username} className="h-full w-full rounded-full text-2xl" />}
                />
            </Field>
            <Field label="Name" hint={`@${user.username}`} error={form.errors.name}>
                <Input autoComplete="name" maxLength={LIMITS.name.max} {...form.bind("name")} />
            </Field>
            <Field label="Bio" hint={`${form.values.bio.length}/${LIMITS.bio}`} error={form.errors.bio}>
                <Textarea rows={3} maxLength={LIMITS.bio} placeholder="A line or two about you" {...form.bind("bio")} />
            </Field>
            <Field label="Email" hint="Can't be changed">
                <Input type="email" value={user.email ?? ""} disabled readOnly />
            </Field>
        </FormPage>
    );
};

export default EditProfilePage;

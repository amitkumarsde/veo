import { Link, Navigate, useNavigate } from "react-router";
import { toast } from "react-toastify";

import { Button, TextButton } from "@/components/ui/Button";
import FormPage from "@/components/ui/FormPage";
import UploadProgress from "@/components/ui/UploadProgress";
import { useAuth } from "@/features/auth/useAuth";
import ChannelFormFields from "@/features/channels/components/ChannelFormFields";
import { useChannelForm } from "@/features/channels/hooks/useChannelForm";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useUnsavedChanges } from "@/hooks/useUnsavedChanges";
import { useUploadTask } from "@/hooks/useUploadTask";
import { createChannel } from "@/services/channel.service";
import { toFormData } from "@/utils/uploads";

const CreateChannelPage = () => {
    const { user, updateUser } = useAuth();
    const navigate = useNavigate();
    const channelForm = useChannelForm();
    const upload = useUploadTask();
    const allowLeave = useUnsavedChanges(channelForm.hasChanges || upload.isUploading);
    useDocumentTitle("Create channel");

    // One channel per account: if there already is one, go to it.
    if (user.channelId && !upload.isUploading) return <Navigate to="/studio" replace />;

    const handleSubmit = async (event) => {
        event.preventDefault();
        const fields = channelForm.collectFields();
        if (!fields) return;
        try {
            const channel = await upload.run((options) => createChannel(toFormData(fields), options));
            allowLeave();
            toast.success("Your channel is ready");
            updateUser((current) => ({ ...current, channelId: channel.channelId }));
            navigate("/studio");
        } catch (error) {
            channelForm.form.showServerError(error, "Couldn't create the channel. Please try again.");
        }
    };

    return (
        <FormPage
            eyebrow="New channel"
            title="Create your channel"
            description="Your channel is where your videos live. You can change everything here later."
            onSubmit={handleSubmit}
            actions={(
                <>
                    <Button type="submit" disabled={upload.isUploading}>{upload.isUploading ? "Creating…" : "Create channel"}</Button>
                    <TextButton as={Link} to="/studio">Cancel</TextButton>
                    <UploadProgress progress={upload.progress} />
                </>
            )}
        >
            <ChannelFormFields channelForm={channelForm} autoFocusName />
        </FormPage>
    );
};

export default CreateChannelPage;

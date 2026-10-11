import { useLayoutEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { toast } from "react-toastify";

import BackToStudioLink from "@/components/common/BackToStudioLink";
import { ErrorState, LoadErrorState, Spinner } from "@/components/common/States";
import { Button, TextButton } from "@/components/ui/Button";
import FormPage from "@/components/ui/FormPage";
import UploadProgress from "@/components/ui/UploadProgress";
import { useAuth } from "@/features/auth/useAuth";
import ChannelFormFields from "@/features/channels/components/ChannelFormFields";
import { useChannelForm } from "@/features/channels/hooks/useChannelForm";
import { replaceUserChannel } from "@/features/channels/user-channels";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useResource } from "@/hooks/useResource";
import { useUnsavedChanges } from "@/hooks/useUnsavedChanges";
import { useUploadTask } from "@/hooks/useUploadTask";
import { getChannel, updateChannel } from "@/services/channel.service";
import { studioPath } from "@/utils/paths";
import { toFormData } from "@/utils/uploads";

const EditChannelPage = () => {
    const { user, updateUser } = useAuth();
    const { channelId } = useParams();
    const navigate = useNavigate();
    const channelForm = useChannelForm();
    const upload = useUploadTask();
    const allowLeave = useUnsavedChanges(channelForm.hasChanges || upload.isUploading, upload.leaveMessage);
    const { data: channel, error, loading, reload } = useResource((signal) => getChannel(channelId, signal), channelId);
    const { loadChannel } = channelForm;
    useDocumentTitle("Edit channel");

    // Before paint, so the form never shows empty fields (or the wrong video source) for a frame.
    useLayoutEffect(() => {
        if (channel) loadChannel(channel);
    }, [channel, loadChannel]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        const fields = channelForm.collectFields();
        if (!fields) return;
        try {
            const saved = await upload.run((options) => updateChannel(channelId, toFormData(fields), options));
            allowLeave();
            toast.success("Changes saved");
            updateUser((current) => replaceUserChannel(current, saved));
            navigate(studioPath(channelId));
        } catch (saveError) {
            channelForm.form.showServerError(saveError, "Couldn't save your changes.");
        }
    };

    if (loading) return <Spinner label="Loading channel" />;
    if (error || !channel) {
        return (
            <LoadErrorState
                error={error}
                onRetry={reload}
                title="Couldn't load the channel"
                notFoundTitle="Can't edit this channel"
                notFoundMessage="This channel doesn't exist."
                notFoundAction={<BackToStudioLink />}
            />
        );
    }
    if (channel.owner !== user.username) {
        return <ErrorState title="Can't edit this channel" message="You can only edit your own channel." action={<BackToStudioLink />} />;
    }

    return (
        <FormPage
            eyebrow="Channel settings"
            title="Edit channel"
            description="Changes show up everywhere right away. Your channel link stays the same."
            onSubmit={handleSubmit}
            actions={(
                <>
                    <Button type="submit" disabled={upload.isUploading}>{upload.isUploading ? "Saving…" : "Save changes"}</Button>
                    <TextButton as={Link} to="/studio">Cancel</TextButton>
                    <UploadProgress progress={upload.progress} />
                </>
            )}
        >
            <ChannelFormFields channelForm={channelForm} />
        </FormPage>
    );
};

export default EditChannelPage;

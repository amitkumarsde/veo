import { useEffect } from "react";
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
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useResource } from "@/hooks/useResource";
import { useUnsavedChanges } from "@/hooks/useUnsavedChanges";
import { useUploadTask } from "@/hooks/useUploadTask";
import { getChannel, updateChannel } from "@/services/channel.service";
import { toFormData } from "@/utils/uploads";

const EditChannelPage = () => {
    const { user } = useAuth();
    const { channelId } = useParams();
    const navigate = useNavigate();
    const channelForm = useChannelForm();
    const upload = useUploadTask();
    const allowLeave = useUnsavedChanges(channelForm.hasChanges || upload.isUploading);
    const { data: channel, error, loading, reload } = useResource((signal) => getChannel(channelId, signal), channelId);
    const { loadChannel } = channelForm;
    useDocumentTitle("Edit channel");

    useEffect(() => {
        if (channel) loadChannel(channel);
    }, [channel, loadChannel]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        const fields = channelForm.collectFields();
        if (!fields) return;
        try {
            await upload.run((options) => updateChannel(channelId, toFormData(fields), options));
            allowLeave();
            toast.success("Changes saved");
            navigate("/studio");
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

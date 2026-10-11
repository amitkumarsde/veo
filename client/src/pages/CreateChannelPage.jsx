import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router";
import { toast } from "react-toastify";

import { Button, TextButton } from "@/components/ui/Button";
import FormPage from "@/components/ui/FormPage";
import UploadProgress from "@/components/ui/UploadProgress";
import { LIMITS } from "@/constants/limits";
import { useAuth } from "@/features/auth/useAuth";
import ChannelFormFields from "@/features/channels/components/ChannelFormFields";
import { useChannelForm } from "@/features/channels/hooks/useChannelForm";
import { addUserChannel, canCreateChannel } from "@/features/channels/user-channels";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useUnsavedChanges } from "@/hooks/useUnsavedChanges";
import { useUploadTask } from "@/hooks/useUploadTask";
import { createChannel } from "@/services/channel.service";
import { studioPath } from "@/utils/paths";
import { toFormData } from "@/utils/uploads";

const CreateChannelPage = () => {
    const { user, updateUser } = useAuth();
    const navigate = useNavigate();
    const channelForm = useChannelForm();
    const upload = useUploadTask();
    // Set once the channel exists, so reaching the limit doesn't redirect before the new channel opens.
    const [createdChannelId, setCreatedChannelId] = useState(null);
    const allowLeave = useUnsavedChanges(channelForm.hasChanges || upload.isUploading, upload.leaveMessage);
    useDocumentTitle("Create channel");

    // Each account has a channel limit: once it's reached, go to the studio instead.
    if (!canCreateChannel(user) && !upload.isUploading && !createdChannelId) return <Navigate to="/studio" replace />;

    const handleSubmit = async (event) => {
        event.preventDefault();
        const fields = channelForm.collectFields();
        if (!fields) return;
        try {
            const channel = await upload.run((options) => createChannel(toFormData(fields), options));
            allowLeave();
            setCreatedChannelId(channel.channelId);
            toast.success("Your channel is ready");
            updateUser((current) => addUserChannel(current, channel));
            navigate(studioPath(channel.channelId));
        } catch (error) {
            channelForm.form.showServerError(error, "Couldn't create the channel. Please try again.");
        }
    };

    return (
        <FormPage
            eyebrow="New channel"
            title="Create your channel"
            description={`Your channel is where your videos live. You can change everything here later, and have up to ${LIMITS.channelsPerUser} channels.`}
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

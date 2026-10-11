import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { toast } from "react-toastify";

import { Button, TextButton } from "@/components/ui/Button";
import Field from "@/components/ui/Field";
import FormPage from "@/components/ui/FormPage";
import { Select } from "@/components/ui/Input";
import UploadProgress from "@/components/ui/UploadProgress";
import { useAuth } from "@/features/auth/useAuth";
import { getUserChannels, pickChannel } from "@/features/channels/user-channels";
import VideoFormFields from "@/features/videos/components/VideoFormFields";
import { useVideoForm } from "@/features/videos/hooks/useVideoForm";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useUnsavedChanges } from "@/hooks/useUnsavedChanges";
import { useUploadTask } from "@/hooks/useUploadTask";
import { createVideo } from "@/services/video.service";
import { studioPath } from "@/utils/paths";
import { toFormData } from "@/utils/uploads";

const UploadVideoPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const channels = getUserChannels(user);
    // Starts on the channel from the link (?channel=), and falls back to the first if that one is gone.
    const [chosenChannelId, setChosenChannelId] = useState(() => searchParams.get("channel"));
    const channel = pickChannel(channels, chosenChannelId);
    const videoForm = useVideoForm();
    const upload = useUploadTask();
    const allowLeave = useUnsavedChanges(videoForm.hasChanges || upload.isUploading, upload.leaveMessage);
    useDocumentTitle("Upload video");

    const handleSubmit = async (event) => {
        event.preventDefault();
        const fields = videoForm.collectFields();
        if (!fields) return;
        try {
            await upload.run((options) => createVideo(toFormData({ ...fields, channelId: channel.channelId }), options));
            allowLeave();
            toast.success("Video published");
            navigate(studioPath(channel.channelId));
        } catch (error) {
            videoForm.showServerError(error, "Couldn't publish the video. Please try again.");
        }
    };

    return (
        <FormPage
            eyebrow="Upload"
            title="Share a new video"
            description="Upload a file or paste a YouTube or MP4 link. Add a clear title and thumbnail so people know what to expect."
            onSubmit={handleSubmit}
            actions={(
                <>
                    <Button type="submit" disabled={upload.isUploading}>{upload.isUploading ? "Publishing…" : "Publish video"}</Button>
                    <TextButton as={Link} to="/studio">Cancel</TextButton>
                    <UploadProgress progress={upload.progress} />
                </>
            )}
        >
            {channels.length > 1 && (
                <Field label="Channel">
                    <Select value={channel.channelId} onChange={(event) => setChosenChannelId(event.target.value)} disabled={upload.isUploading}>
                        {channels.map((option) => <option key={option.channelId} value={option.channelId}>{option.channelName ?? option.channelId}</option>)}
                    </Select>
                </Field>
            )}
            <VideoFormFields videoForm={videoForm} />
        </FormPage>
    );
};

export default UploadVideoPage;

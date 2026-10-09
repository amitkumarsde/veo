import { Link, useNavigate } from "react-router";
import { toast } from "react-toastify";

import { Button, TextButton } from "@/components/ui/Button";
import FormPage from "@/components/ui/FormPage";
import UploadProgress from "@/components/ui/UploadProgress";
import { useAuth } from "@/features/auth/useAuth";
import VideoFormFields from "@/features/videos/components/VideoFormFields";
import { useVideoForm } from "@/features/videos/hooks/useVideoForm";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useUnsavedChanges } from "@/hooks/useUnsavedChanges";
import { useUploadTask } from "@/hooks/useUploadTask";
import { createVideo } from "@/services/video.service";
import { toFormData } from "@/utils/uploads";

const UploadVideoPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const videoForm = useVideoForm();
    const upload = useUploadTask();
    const allowLeave = useUnsavedChanges(videoForm.hasChanges || upload.isUploading);
    useDocumentTitle("Upload video");

    const handleSubmit = async (event) => {
        event.preventDefault();
        const fields = videoForm.collectFields();
        if (!fields) return;
        try {
            await upload.run((options) => createVideo(toFormData({ ...fields, channelId: user.channelId }), options));
            allowLeave();
            toast.success("Video published");
            navigate("/studio");
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
            <VideoFormFields videoForm={videoForm} />
        </FormPage>
    );
};

export default UploadVideoPage;

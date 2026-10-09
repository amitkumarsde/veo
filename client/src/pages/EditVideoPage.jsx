import { useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { toast } from "react-toastify";

import BackToStudioLink from "@/components/common/BackToStudioLink";
import { ErrorState, LoadErrorState, Spinner } from "@/components/common/States";
import { Button, TextButton } from "@/components/ui/Button";
import FormPage from "@/components/ui/FormPage";
import UploadProgress from "@/components/ui/UploadProgress";
import { useAuth } from "@/features/auth/useAuth";
import VideoFormFields from "@/features/videos/components/VideoFormFields";
import { useVideoForm } from "@/features/videos/hooks/useVideoForm";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useResource } from "@/hooks/useResource";
import { useUnsavedChanges } from "@/hooks/useUnsavedChanges";
import { useUploadTask } from "@/hooks/useUploadTask";
import { getVideo, updateVideo } from "@/services/video.service";
import { toFormData } from "@/utils/uploads";

const EditVideoPage = () => {
    const { user } = useAuth();
    const { videoId } = useParams();
    const navigate = useNavigate();
    const videoForm = useVideoForm();
    const upload = useUploadTask();
    const allowLeave = useUnsavedChanges(videoForm.hasChanges || upload.isUploading);
    const { data: video, error, loading, reload } = useResource((signal) => getVideo(videoId, signal), videoId);
    const { loadVideo } = videoForm;
    useDocumentTitle("Edit video");

    useEffect(() => {
        if (video) loadVideo(video);
    }, [video, loadVideo]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        const fields = videoForm.collectFields();
        if (!fields) return;
        try {
            await upload.run((options) => updateVideo(videoId, toFormData(fields), options));
            allowLeave();
            toast.success("Changes saved");
            navigate("/studio");
        } catch (saveError) {
            videoForm.showServerError(saveError, "Couldn't save your changes.");
        }
    };

    if (loading) return <Spinner label="Loading video" />;
    if (error || !video) {
        return (
            <LoadErrorState
                error={error}
                onRetry={reload}
                title="Couldn't load the video"
                notFoundTitle="Can't edit this video"
                notFoundMessage="This video doesn't exist."
                notFoundAction={<BackToStudioLink />}
            />
        );
    }
    if (video.uploader !== user.username) {
        return <ErrorState title="Can't edit this video" message="You can only edit your own videos." action={<BackToStudioLink />} />;
    }

    return (
        <FormPage
            eyebrow="Edit video"
            title="Update details"
            description="Change the title, thumbnail, description or the video itself. Anything you leave alone stays as it is."
            onSubmit={handleSubmit}
            actions={(
                <>
                    <Button type="submit" disabled={upload.isUploading}>{upload.isUploading ? "Saving…" : "Save changes"}</Button>
                    <TextButton as={Link} to="/studio">Cancel</TextButton>
                    <TextButton as={Link} to={`/video/${videoId}`} className="sm:ml-auto">View video</TextButton>
                    <UploadProgress progress={upload.progress} />
                </>
            )}
        >
            <VideoFormFields videoForm={videoForm} />
        </FormPage>
    );
};

export default EditVideoPage;

import Field from "@/components/ui/Field";
import ImagePicker from "@/components/ui/ImagePicker";
import { Input, Textarea } from "@/components/ui/Input";
import { LIMITS } from "@/constants/limits";
import VideoSourceField from "@/features/videos/components/VideoSourceField";

// The fields of the upload and edit video forms, driven by useVideoForm().
const VideoFormFields = ({ videoForm }) => {
    const { form, thumbnail, chooseThumbnail, mode, setMode, videoFile, chooseVideoFile, currentUploadUrl } = videoForm;

    return (
        <>
            <Field label="Video" error={form.errors.source}>
                <VideoSourceField
                    mode={mode}
                    onModeChange={setMode}
                    link={form.values.videoLink}
                    onLinkChange={(value) => { form.setField("videoLink", value); form.clearError("source"); }}
                    file={videoFile}
                    onFileChange={chooseVideoFile}
                    currentUploadUrl={currentUploadUrl}
                />
            </Field>
            <Field label="Title" hint={`${form.values.title.length}/${LIMITS.title}`} error={form.errors.title}>
                <Input maxLength={LIMITS.title} {...form.bind("title")} />
            </Field>
            <Field label="Thumbnail" error={form.errors.thumbnail}>
                <ImagePicker shape="thumbnail" label="thumbnail" currentUrl={thumbnail.currentUrl} file={thumbnail.file} onPick={chooseThumbnail} />
            </Field>
            <Field label="Description" hint={`${form.values.description.length}/${LIMITS.description}`} error={form.errors.description}>
                <Textarea rows={5} maxLength={LIMITS.description} placeholder="Tell viewers what the video is about" {...form.bind("description")} />
            </Field>
            <Field label="Categories" hint="Separate with commas" error={form.errors.category}>
                <Input placeholder="e.g. games, chess" {...form.bind("category")} />
            </Field>
        </>
    );
};

export default VideoFormFields;

import { useCallback, useState } from "react";

import { LIMITS } from "@/constants/limits";
import { VIDEO_SOURCES, getVideoLinkError } from "@/features/videos/playback";
import { useForm } from "@/hooks/useForm";
import { useImageField } from "@/hooks/useImageField";
import { parseCategories } from "@/utils/format";

const EMPTY_VALUES = { title: "", description: "", category: "", videoLink: "", source: "", thumbnail: "" };
const NOTHING_SAVED = { videoUrl: "", videoSource: null };
// Server errors about the video link or file are shown under the form's "Video" field.
const SERVER_FIELD_ALIASES = { videoUrl: "source", videoFile: "source" };

// State and checks shared by the upload and edit video pages.
export const useVideoForm = () => {
    const form = useForm(EMPTY_VALUES);
    const thumbnail = useImageField();
    const [mode, setMode] = useState(VIDEO_SOURCES.upload);
    const [videoFile, setVideoFile] = useState(null);
    const [saved, setSaved] = useState(NOTHING_SAVED);
    const { reset: resetForm, clearError } = form;
    const { reset: resetThumbnail, pick: pickThumbnail } = thumbnail;

    const loadVideo = useCallback((video) => {
        const isUpload = video.videoSource === VIDEO_SOURCES.upload;
        resetForm({
            ...EMPTY_VALUES,
            title: video.title ?? "",
            description: video.description ?? "",
            category: (video.category ?? []).join(", "),
            videoLink: isUpload ? "" : video.videoUrl ?? "",
        });
        resetThumbnail(video.thumbnailUrl ?? "");
        setSaved({ videoUrl: video.videoUrl ?? "", videoSource: isUpload ? VIDEO_SOURCES.upload : VIDEO_SOURCES.link });
        setMode(isUpload ? VIDEO_SOURCES.upload : VIDEO_SOURCES.link);
    }, [resetForm, resetThumbnail]);

    const chooseVideoFile = useCallback((file) => {
        setVideoFile(file);
        clearError("source");
    }, [clearError]);

    const chooseThumbnail = useCallback((file) => {
        pickThumbnail(file);
        clearError("thumbnail");
    }, [pickThumbnail, clearError]);

    // The fields to send (the video only if it changed), or null after showing what's missing.
    const collectFields = () => {
        const title = form.values.title.trim();
        const description = form.values.description.trim();
        const category = parseCategories(form.values.category);
        const videoUrl = form.values.videoLink.trim();

        const source = {};
        let sourceError = null;
        if (mode === VIDEO_SOURCES.upload) {
            if (videoFile) source.videoFile = videoFile;
            else if (saved.videoSource !== VIDEO_SOURCES.upload) sourceError = "Choose a video file.";
        } else {
            sourceError = getVideoLinkError(videoUrl);
            if (!sourceError && (saved.videoSource !== VIDEO_SOURCES.link || videoUrl !== saved.videoUrl)) source.videoUrl = videoUrl;
        }

        const hasErrors = form.showErrors({
            source: sourceError,
            title: !title && "Add a title.",
            thumbnail: !thumbnail.file && !thumbnail.currentUrl && "Choose a thumbnail image.",
            description: !description && "Add a description.",
            category: (!category.length && "Add at least one category.")
                || (category.length > LIMITS.categories && `Use at most ${LIMITS.categories} categories.`),
        });
        return hasErrors ? null : { title, description, category, thumbnail: thumbnail.file, ...source };
    };

    return {
        form,
        thumbnail,
        chooseThumbnail,
        mode,
        setMode,
        videoFile,
        chooseVideoFile,
        currentUploadUrl: saved.videoSource === VIDEO_SOURCES.upload ? saved.videoUrl : "",
        hasChanges: form.isDirty || thumbnail.changed || Boolean(videoFile),
        loadVideo,
        collectFields,
        showServerError: (error, fallback) => form.showServerError(error, fallback, SERVER_FIELD_ALIASES),
    };
};

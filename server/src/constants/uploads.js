import { config } from "../config/env.js";

export const FILE_KINDS = Object.freeze({
    image: {
        label: "image",
        maxBytes: config.uploads.maxImageBytes,
        maxMb: config.uploads.maxImageMb,
        types: ["image/jpeg", "image/png", "image/webp", "image/gif"],
    },
    video: {
        label: "video",
        maxBytes: config.uploads.maxVideoBytes,
        maxMb: config.uploads.maxVideoMb,
        types: ["video/mp4", "video/webm", "video/ogg"],
    },
});

export const FILE_EXTENSIONS = Object.freeze({
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
    "video/mp4": "mp4",
    "video/webm": "webm",
    "video/ogg": "ogv",
});

export const STORAGE_FOLDERS = Object.freeze({
    avatars: "avatars",
    channelBanners: "channel-banners",
    channelLogos: "channel-logos",
    thumbnails: "thumbnails",
    videos: "videos",
});

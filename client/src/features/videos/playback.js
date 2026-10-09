// Uploaded files and direct .mp4/.webm links play in a <video> tag; YouTube links use the YouTube player.

export const VIDEO_SOURCES = Object.freeze({ upload: "upload", link: "link" });

const YOUTUBE_HOST = /(^|\.)youtube(-nocookie)?\.com$/;
const YOUTUBE_SHORT_HOST = "youtu.be";
const YOUTUBE_EMBED_BASE = "https://www.youtube.com/embed";
const YOUTUBE_ID = /^[\w-]{6,20}$/;
const DIRECT_VIDEO_PATH = /\.(mp4|m4v|webm|ogv|ogg)$/i;

const parseHttpUrl = (url) => {
    try {
        const parsed = new URL(url);
        return parsed.protocol === "http:" || parsed.protocol === "https:" ? parsed : null;
    } catch {
        return null;
    }
};

const getYouTubeId = (url) => {
    const parsed = parseHttpUrl(url);
    if (!parsed) return null;
    const host = parsed.hostname.replace(/^www\./, "");
    let id = null;
    if (host === YOUTUBE_SHORT_HOST) id = parsed.pathname.slice(1).split("/")[0];
    else if (YOUTUBE_HOST.test(host)) {
        id = parsed.searchParams.get("v") ?? parsed.pathname.match(/^\/(?:embed|shorts|live|v)\/([^/?#]+)/)?.[1];
    }
    return id && YOUTUBE_ID.test(id) ? id : null;
};

const isDirectVideoUrl = (url) => DIRECT_VIDEO_PATH.test(parseHttpUrl(url)?.pathname ?? "");

// How to play a video: { type: "file" | "embed", src }, or null when it can't be played.
export const getPlayback = ({ videoUrl, videoSource } = {}) => {
    if ((videoSource === VIDEO_SOURCES.upload && parseHttpUrl(videoUrl)) || isDirectVideoUrl(videoUrl)) return { type: "file", src: videoUrl };
    const youTubeId = getYouTubeId(videoUrl);
    return youTubeId ? { type: "embed", src: `${YOUTUBE_EMBED_BASE}/${youTubeId}` } : null;
};

// Why a pasted link can't be used, or null when it can be played.
export const getVideoLinkError = (url) => {
    if (!url) return "Please paste a video link.";
    if (!getPlayback({ videoUrl: url, videoSource: VIDEO_SOURCES.link })) {
        return "This link can't be played. Use a YouTube link or a direct link to an MP4/WebM file.";
    }
    return null;
};

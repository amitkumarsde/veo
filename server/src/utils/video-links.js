// Which pasted links can be played; the same rules as the client's src/features/videos/playback.js.
const YOUTUBE_HOST = /(^|\.)youtube(-nocookie)?\.com$/;
const YOUTUBE_SHORT_HOST = "youtu.be";
const YOUTUBE_ID = /^[\w-]{6,20}$/;
const DIRECT_VIDEO_PATH = /\.(mp4|m4v|webm|ogv|ogg)$/i;

export const parseHttpUrl = (value) => {
    try {
        const url = new URL(value);
        return url.protocol === "http:" || url.protocol === "https:" ? url : null;
    } catch {
        return null;
    }
};

const getYouTubeId = (url) => {
    const host = url.hostname.replace(/^www\./, "");
    let id = null;
    if (host === YOUTUBE_SHORT_HOST) id = url.pathname.slice(1).split("/")[0];
    else if (YOUTUBE_HOST.test(host)) id = url.searchParams.get("v") ?? url.pathname.match(/^\/(?:embed|shorts|live|v)\/([^/?#]+)/)?.[1];
    return id && YOUTUBE_ID.test(id) ? id : null;
};

// A YouTube video or a direct link to an MP4/WebM/Ogg file.
export const isPlayableVideoLink = (value) => {
    const url = parseHttpUrl(value);
    return Boolean(url) && (DIRECT_VIDEO_PATH.test(url.pathname) || getYouTubeId(url) !== null);
};

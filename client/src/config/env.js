const positiveNumber = (value, fallback) => {
    const number = Number(value);
    return Number.isFinite(number) && number > 0 ? number : fallback;
};

export const env = Object.freeze({
    // I drop a trailing slash so joined URLs never get a double slash.
    apiUrl: (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/+$/, ""),
    // These must match MAX_IMAGE_MB and MAX_VIDEO_MB on the server, which checks again.
    maxImageMb: positiveNumber(import.meta.env.VITE_MAX_IMAGE_MB, 5),
    maxVideoMb: positiveNumber(import.meta.env.VITE_MAX_VIDEO_MB, 50),
});

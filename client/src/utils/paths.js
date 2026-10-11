// Page addresses, built in one place so ids are always encoded the same way.
const encode = (id) => encodeURIComponent(id);

export const videoPath = (videoId) => `/video/${encode(videoId)}`;

export const editVideoPath = (videoId) => `/update-video/${encode(videoId)}`;

export const channelPath = (channelId) => `/channel/${encode(channelId)}`;

export const editChannelPath = (channelId) => `/update-channel/${encode(channelId)}`;

// "/studio?channel=chess-club"
export const studioPath = (channelId) => (channelId ? `/studio?channel=${encode(channelId)}` : "/studio");

// "/upload-video?channel=chess-club"
export const uploadPath = (channelId) => `/upload-video?channel=${encode(channelId)}`;

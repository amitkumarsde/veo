import api from "@/services/api";

// Fetch a channel and the full video objects it references, in one call.
// Used by both the public channel page and the owner's profile.
export const fetchChannelWithVideos = async (channelId) => {
    const { data: channel } = await api.get(`/channels/${channelId}`);
    if (!channel.videos?.length) return { channel, videos: [] };
    const responses = await Promise.all(
        channel.videos.map((videoId) => api.get(`/videos/${videoId}`))
    );
    return { channel, videos: responses.map((res) => res.data) };
};

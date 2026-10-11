import { LIMITS } from "@/constants/limits";

// The user's channels, oldest first; an old saved login only has `channelId`.
export const getUserChannels = (user) => user?.channels ?? (user?.channelId ? [{ channelId: user.channelId }] : []);

export const canCreateChannel = (user) => getUserChannels(user).length < LIMITS.channelsPerUser;

// The channel with this id if the user has it, else their first channel (or null).
export const pickChannel = (channels, channelId) => channels.find((channel) => channel.channelId === channelId) ?? channels[0] ?? null;

const toSummary = ({ channelId, channelName, channelAvatarURL }) => ({ channelId, channelName, channelAvatarURL });

// For updateUser(): the account after a channel was created, edited or deleted.
export const addUserChannel = (user, channel) => ({ ...user, channels: [...getUserChannels(user), toSummary(channel)] });

export const replaceUserChannel = (user, channel) => ({
    ...user,
    channels: getUserChannels(user).map((current) => (current.channelId === channel.channelId ? toSummary(channel) : current)),
});

export const removeUserChannel = (user, channelId) => ({
    ...user,
    channels: getUserChannels(user).filter((channel) => channel.channelId !== channelId),
});

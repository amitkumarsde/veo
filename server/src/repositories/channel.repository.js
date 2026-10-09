import { CHANNEL_NAME_COLLATION, Channel } from "../models/channel.model.js";

const PUBLIC_FIELDS = "channelId channelName owner description channelBannerURL channelAvatarURL subscribers createdAt -_id";
const CARD_FIELDS = "channelId channelName channelAvatarURL subscribers -_id";

export const channelRepository = {
    build: (data) => new Channel(data),
    findPublicById: (channelId) => Channel.findOne({ channelId }).select(PUBLIC_FIELDS).lean(),
    findByIdForUpdate: (channelId) => Channel.findOne({ channelId }),
    findByOwner: (owner) => Channel.findOne({ owner }).lean(),
    findIdByOwner: (owner) => Channel.findOne({ owner }).select("channelId -_id").lean(),
    findOwnerAndName: (channelId) => Channel.findOne({ channelId }).select("owner channelName -_id").lean(),
    findSubscriberCount: (channelId) => Channel.findOne({ channelId }).select("subscribers -_id").lean(),
    findCardsByIds: (channelIds) => Channel.find({ channelId: { $in: channelIds } }).select(CARD_FIELDS).lean(),
    existsById: (channelId) => Channel.exists({ channelId }),
    existsByOwner: (owner) => Channel.exists({ owner }),
    // The collation must match the unique index so "Chess" and "chess" count as the same name.
    existsByName: (channelName, exceptChannelId) =>
        Channel.exists({ channelName, ...(exceptChannelId ? { channelId: { $ne: exceptChannelId } } : {}) }).collation(CHANNEL_NAME_COLLATION),
    incrementSubscribers: (channelIds, amount) => Channel.updateMany({ channelId: { $in: channelIds } }, { $inc: { subscribers: amount } }),
    deleteById: (channelId) => Channel.deleteOne({ channelId }),
};

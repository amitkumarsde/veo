import { CHANNEL_NAME_COLLATION, Channel } from "../models/channel.model.js";

const PUBLIC_FIELDS = "channelId channelName owner description channelBannerURL channelAvatarURL subscribers -_id";
const CARD_FIELDS = "channelId channelName channelAvatarURL subscribers -_id";
const SUMMARY_FIELDS = "channelId channelName channelAvatarURL -_id";

export const channelRepository = {
    build: (data) => new Channel(data),
    findPublicById: (channelId) => Channel.findOne({ channelId }).select(PUBLIC_FIELDS).lean(),
    findByIdForUpdate: (channelId) => Channel.findOne({ channelId }),
    findAllByOwner: (owner) => Channel.find({ owner }).lean(),
    // Oldest first, so the owner's first channel stays first.
    findSummariesByOwner: (owner) => Channel.find({ owner }).select(SUMMARY_FIELDS).sort({ createdAt: 1, _id: 1 }).lean(),
    findSlotsByOwner: (owner) => Channel.distinct("slot", { owner }),
    findOwnerAndName: (channelId) => Channel.findOne({ channelId }).select("owner channelName -_id").lean(),
    findSubscriberCount: (channelId) => Channel.findOne({ channelId }).select("subscribers -_id").lean(),
    findCardsByIds: (channelIds) => Channel.find({ channelId: { $in: channelIds } }).select(CARD_FIELDS).lean(),
    existsById: (channelId) => Channel.exists({ channelId }),
    // Must use the same case rule as the unique index, so "Chess" and "chess" count as one name.
    existsByName: (channelName, exceptChannelId) =>
        Channel.exists({ channelName, ...(exceptChannelId ? { channelId: { $ne: exceptChannelId } } : {}) }).collation(CHANNEL_NAME_COLLATION),
    incrementSubscribers: (channelIds, amount) => Channel.updateMany({ channelId: { $in: channelIds } }, { $inc: { subscribers: amount } }),
    deleteById: (channelId) => Channel.deleteOne({ channelId }),
};

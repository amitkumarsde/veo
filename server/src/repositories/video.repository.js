import { Video } from "../models/video.model.js";
import { findPage } from "../utils/pagination.js";

// What a video card needs: no long description and no media URL.
const CARD_FIELDS = "videoId title thumbnailUrl category channelId uploader views likes commentCount uploadDate";
const DETAIL_FIELDS = `${CARD_FIELDS} description videoUrl videoSource`;
const RELATED_LIMIT = 12;

export const videoRepository = {
    create: (data) => Video.create(data),
    findPage: ({ filter, sort, cursor, limit }) => findPage(Video, { filter, projection: CARD_FIELDS, sort, cursor, limit }),
    findDetailById: (videoId) => Video.findOne({ videoId }).select(DETAIL_FIELDS).lean(),
    findByIdForUpdate: (videoId) => Video.findOne({ videoId }),
    findCategoriesById: (videoId) => Video.findOne({ videoId }).select("category -_id").lean(),
    findLikeCount: (videoId) => Video.findOne({ videoId }).select("likes -_id").lean(),
    findLatestCards: (filter, excludeVideoId) =>
        Video.find({ ...filter, videoId: { $ne: excludeVideoId } })
            .select(CARD_FIELDS)
            .sort({ uploadDate: -1, _id: -1 })
            .limit(RELATED_LIMIT)
            .lean(),
    findStorageInfo: (filter) => Video.find(filter).select("videoId thumbnailUrl videoUrl videoSource -_id").lean(),
    existsById: (videoId) => Video.exists({ videoId }),
    sumChannelStats: async (channelId) => {
        const [totals] = await Video.aggregate([
            { $match: { channelId } },
            { $group: { _id: null, videos: { $sum: 1 }, views: { $sum: "$views" }, likes: { $sum: "$likes" }, comments: { $sum: "$commentCount" } } },
        ]);
        return { videos: totals?.videos ?? 0, views: totals?.views ?? 0, likes: totals?.likes ?? 0, comments: totals?.comments ?? 0 };
    },
    findTopCategories: async (limit) => {
        const rows = await Video.aggregate([
            { $unwind: "$category" },
            { $group: { _id: "$category", count: { $sum: 1 } } },
            { $sort: { count: -1, _id: 1 } },
            { $limit: limit },
        ]);
        return rows.map((row) => ({ name: row._id, count: row.count }));
    },
    incrementViews: (videoId) => Video.updateOne({ videoId }, { $inc: { views: 1 } }),
    incrementLikes: (videoIds, amount) => Video.updateMany({ videoId: { $in: videoIds } }, { $inc: { likes: amount } }),
    incrementCommentCount: (videoId, amount) => Video.updateOne({ videoId }, { $inc: { commentCount: amount } }),
    decrementCommentCounts: (countsByVideo) =>
        Video.bulkWrite(countsByVideo.map(({ videoId, count }) => ({
            updateOne: { filter: { videoId }, update: { $inc: { commentCount: -count } } },
        }))),
    renameChannel: (channelId, channelName) => Video.updateMany({ channelId }, { $set: { channelName } }),
    deleteByIds: (videoIds) => Video.deleteMany({ videoId: { $in: videoIds } }),
};

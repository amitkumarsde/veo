import { Like } from "../models/like.model.js";
import { insertIfMissing } from "../utils/mongo-errors.js";

export const likeRepository = {
    exists: (videoId, user) => Like.exists({ videoId, user }),
    add: (videoId, user) => insertIfMissing(Like, { videoId, user }),
    remove: async (videoId, user) => (await Like.deleteOne({ videoId, user })).deletedCount > 0,
    findVideoIdsByUser: (user) => Like.distinct("videoId", { user }),
    deleteManyByUser: (user) => Like.deleteMany({ user }),
    deleteManyByVideoIds: (videoIds) => Like.deleteMany({ videoId: { $in: videoIds } }),
};

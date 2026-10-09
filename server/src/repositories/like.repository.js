import { Like } from "../models/like.model.js";
import { isDuplicateKeyError } from "../utils/mongo-errors.js";

export const likeRepository = {
    exists: (videoId, user) => Like.exists({ videoId, user }),
    // An upsert, so two clicks at once insert only one like. True when a like was added.
    add: async (videoId, user) => {
        try {
            const result = await Like.updateOne({ videoId, user }, { $setOnInsert: { videoId, user } }, { upsert: true });
            return result.upsertedCount > 0;
        } catch (error) {
            if (isDuplicateKeyError(error)) return false;
            throw error;
        }
    },
    remove: async (videoId, user) => (await Like.deleteOne({ videoId, user })).deletedCount > 0,
    findVideoIdsByUser: (user) => Like.distinct("videoId", { user }),
    deleteManyByUser: (user) => Like.deleteMany({ user }),
    deleteManyByVideoIds: (videoIds) => Like.deleteMany({ videoId: { $in: videoIds } }),
};

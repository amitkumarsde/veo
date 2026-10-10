import { Subscription } from "../models/subscription.model.js";
import { isDuplicateKeyError } from "../utils/mongo-errors.js";

export const subscriptionRepository = {
    exists: (channelId, user) => Subscription.exists({ channelId, user }),
    // Adds the subscription only if it's missing, so two clicks at once add one; true when one was added.
    add: async (channelId, user) => {
        try {
            const result = await Subscription.updateOne({ channelId, user }, { $setOnInsert: { channelId, user } }, { upsert: true });
            return result.upsertedCount > 0;
        } catch (error) {
            if (isDuplicateKeyError(error)) return false;
            throw error;
        }
    },
    remove: async (channelId, user) => (await Subscription.deleteOne({ channelId, user })).deletedCount > 0,
    findChannelIdsByUser: (user) => Subscription.distinct("channelId", { user }),
    deleteManyByUser: (user) => Subscription.deleteMany({ user }),
    deleteManyByChannel: (channelId) => Subscription.deleteMany({ channelId }),
};

import { Subscription } from "../models/subscription.model.js";
import { insertIfMissing } from "../utils/mongo-errors.js";

export const subscriptionRepository = {
    exists: (channelId, user) => Subscription.exists({ channelId, user }),
    add: (channelId, user) => insertIfMissing(Subscription, { channelId, user }),
    remove: async (channelId, user) => (await Subscription.deleteOne({ channelId, user })).deletedCount > 0,
    findChannelIdsByUser: (user) => Subscription.distinct("channelId", { user }),
    deleteManyByUser: (user) => Subscription.deleteMany({ user }),
    deleteManyByChannel: (channelId) => Subscription.deleteMany({ channelId }),
};

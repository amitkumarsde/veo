import mongoose from "mongoose";

// One document per (channel, user); the unique index makes a double subscribe impossible.
const subscriptionSchema = new mongoose.Schema({
    channelId: { type: String, required: true },
    user: { type: String, required: true },     // Username
}, { timestamps: { createdAt: true, updatedAt: false }, versionKey: false });

subscriptionSchema.index({ channelId: 1, user: 1 }, { unique: true });
subscriptionSchema.index({ user: 1 });

export const Subscription = mongoose.model("Subscription", subscriptionSchema);

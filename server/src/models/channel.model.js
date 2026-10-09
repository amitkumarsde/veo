import mongoose from "mongoose";

import { LIMITS } from "../constants/limits.js";

// Channel names are unique ignoring case ("Chess" and "chess" clash).
export const CHANNEL_NAME_COLLATION = Object.freeze({ locale: "en", strength: 2 });

const channelSchema = new mongoose.Schema({
    channelId: { type: String, required: true, trim: true, unique: true },     // URL slug, never changes
    channelName: { type: String, required: true, trim: true, maxlength: LIMITS.channelName },
    owner: { type: String, required: true, trim: true, unique: true },         // Owner's username; unique = one channel per account
    description: { type: String, required: true, trim: true, maxlength: LIMITS.channelDescription },
    channelBannerURL: { type: String, trim: true, default: "" },
    channelAvatarURL: { type: String, trim: true, default: "" },
    subscribers: { type: Number, default: 0 },     // Kept in step with the subscriptions collection
}, { timestamps: true, versionKey: false });

channelSchema.index({ channelName: 1 }, { unique: true, collation: CHANNEL_NAME_COLLATION });

export const Channel = mongoose.model("Channel", channelSchema);

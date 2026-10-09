import { randomUUID } from "node:crypto";
import mongoose from "mongoose";

import { LIMITS } from "../constants/limits.js";

export const VIDEO_SOURCES = Object.freeze({ link: "link", upload: "upload" });

const videoSchema = new mongoose.Schema({
    videoId: { type: String, required: true, unique: true, default: () => randomUUID() },
    title: { type: String, required: true, trim: true, maxlength: LIMITS.title },
    description: { type: String, required: true, trim: true, maxlength: LIMITS.description },
    thumbnailUrl: { type: String, required: true, trim: true },
    videoUrl: { type: String, required: true, trim: true, maxlength: LIMITS.videoUrl },
    videoSource: { type: String, enum: Object.values(VIDEO_SOURCES), default: VIDEO_SOURCES.link },
    category: {
        type: [String],
        validate: {
            validator: (list) => list.length > 0 && list.length <= LIMITS.categories,
            message: `Add 1 to ${LIMITS.categories} categories.`,
        },
    },
    channelId: { type: String, required: true },
    channelName: { type: String, default: "" },     // Copied from the channel so text search can match it
    uploader: { type: String, required: true },     // Owner's username
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },            // Kept in step with the likes collection
    commentCount: { type: Number, default: 0 },     // Kept in step with the comments collection
    uploadDate: { type: Date, default: Date.now },
}, { versionKey: false });

// One index per list filter + sort order used by the feed, channel pages and the studio.
videoSchema.index({ uploadDate: -1, _id: -1 });
videoSchema.index({ views: -1, _id: -1 });
videoSchema.index({ category: 1, uploadDate: -1, _id: -1 });
videoSchema.index({ category: 1, views: -1, _id: -1 });
videoSchema.index({ channelId: 1, uploadDate: -1, _id: -1 });
videoSchema.index({ channelId: 1, views: -1, _id: -1 });
videoSchema.index({ uploader: 1 });
videoSchema.index(
    { title: "text", channelName: "text", category: "text", description: "text" },
    { name: "video_search", weights: { title: 10, channelName: 5, category: 5, description: 1 } },
);

export const Video = mongoose.model("Video", videoSchema);

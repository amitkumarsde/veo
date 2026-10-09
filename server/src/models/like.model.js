import mongoose from "mongoose";

// One document per (video, user); the unique index makes a double like impossible.
const likeSchema = new mongoose.Schema({
    videoId: { type: String, required: true },
    user: { type: String, required: true },     // Username
}, { timestamps: { createdAt: true, updatedAt: false }, versionKey: false });

likeSchema.index({ videoId: 1, user: 1 }, { unique: true });
likeSchema.index({ user: 1 });

export const Like = mongoose.model("Like", likeSchema);

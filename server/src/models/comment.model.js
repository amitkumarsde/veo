import mongoose from "mongoose";

import { LIMITS } from "../constants/limits.js";

// Comments live in their own collection so a video document never grows without limit.
const commentSchema = new mongoose.Schema({
    videoId: { type: String, required: true },
    author: { type: String, required: true },     // Author's username
    text: { type: String, required: true, trim: true, maxlength: LIMITS.comment },
    editedAt: { type: Date },
}, { timestamps: { createdAt: true, updatedAt: false }, versionKey: false });

commentSchema.index({ videoId: 1, createdAt: -1, _id: -1 });
commentSchema.index({ author: 1 });

export const Comment = mongoose.model("Comment", commentSchema);

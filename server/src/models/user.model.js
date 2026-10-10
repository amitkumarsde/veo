import mongoose from "mongoose";

import { LIMITS } from "../constants/limits.js";

const userSchema = new mongoose.Schema({
    // The permanent public @handle that channels, videos, comments, likes and subscriptions point to.
    username: { type: String, required: true, trim: true, unique: true },
    name: { type: String, trim: true, default: "", maxlength: LIMITS.name.max },
    email: { type: String, required: true, trim: true, lowercase: true, unique: true, maxlength: LIMITS.email },
    password: { type: String, required: true, select: false },
    avatarURL: { type: String, trim: true, default: "" },
    bio: { type: String, trim: true, default: "", maxlength: LIMITS.bio },
    // Tokens issued before this moment are rejected, so a password reset signs out old sessions.
    passwordChangedAt: { type: Date, select: false },
}, { timestamps: true, versionKey: false });

export const User = mongoose.model("User", userSchema);

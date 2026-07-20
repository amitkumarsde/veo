import mongoose from "mongoose";

const channelSchema = new mongoose.Schema({
    channelId: { type: String, required: true, trim: true, unique: true },
    channelName: { type: String, required: true, trim: true, unique: true },
    owner: { type: String, required: true, trim: true },     // userId
    description: { type: String, required: true, trim: true },
    channelBannerURL: { type: String, required: true, trim: true },
    channelAvatarURL: { type: String, required: true, trim: true },
    subscribers: { type: Number, default: 0 },
    videos: { type: [String], default: [] },
});

const Channel = mongoose.model("Channel", channelSchema);

export default Channel;

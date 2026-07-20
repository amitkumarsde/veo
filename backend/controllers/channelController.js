import Video from "../models/Video.js";
import Channel from "../models/Channel.js";
import User from "../models/User.js";

// Get all Channels.
export const getAllChannels = async (req, res) => {
    try {
        const channels = await Channel.find();
        return res.status(200).json(channels);
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error! Failed to fetch channels." });
    }
};

// Get a Channel by channelId.
export const getChannelById = async (req, res) => {
    const { channelId } = req.params;
    try {
        const channel = await Channel.findOne({ channelId });
        if (!channel) return res.status(404).json({ message: "Channel not found." });
        return res.status(200).json(channel);
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error! Failed to fetch channel." });
    }
};

// Create a Channel owned by the signed-in user.
export const createChannel = async (req, res) => {
    const { channelName, description, channelBannerURL, channelAvatarURL } = req.body;
    const owner = req.user.username;
    try {
        const existingChannel = await Channel.findOne({ channelName });
        if (existingChannel) return res.status(400).json({ message: "Channel name already taken. Please try a different name." });
        const newChannel = await Channel.create({ channelId: channelName, channelName, owner, description, channelBannerURL, channelAvatarURL });
        const user = await User.findOneAndUpdate({ userId: owner }, { $push: { channels: newChannel.channelId } }, { new: true }).select("-password");
        return res.status(201).json({ message: "Channel created successfully.", user });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error! Failed to create channel." });
    }
};

// Edit a Channel (owner only). Only editable fields are accepted.
export const editChannel = async (req, res) => {
    const { channelId } = req.params;
    try {
        const channel = await Channel.findOne({ channelId });
        if (!channel) return res.status(404).json({ message: "Channel not found." });
        if (channel.owner !== req.user.username) return res.status(403).json({ message: "You can only edit your own channel." });

        for (const field of ["description", "channelBannerURL", "channelAvatarURL"]) {
            if (req.body[field] !== undefined) channel[field] = req.body[field];
        }
        await channel.save();
        return res.status(200).json({ message: "Channel edited successfully.", channel });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error! Failed to edit channel." });
    }
};

// Delete a Channel (owner only) along with its videos.
export const deleteChannel = async (req, res) => {
    const { channelId } = req.params;
    try {
        const channel = await Channel.findOne({ channelId });
        if (!channel) return res.status(404).json({ message: "Channel not found." });
        if (channel.owner !== req.user.username) return res.status(403).json({ message: "You can only delete your own channel." });

        await channel.deleteOne();
        await Video.deleteMany({ channelId });     // Remove the channel's videos
        const user = await User.findOneAndUpdate({ userId: channel.owner }, { $pull: { channels: channelId } }, { new: true }).select("-password");
        return res.status(200).json({ message: "Channel deleted successfully.", user });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error! Failed to delete channel." });
    }
};

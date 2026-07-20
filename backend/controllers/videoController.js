import Video from "../models/Video.js";
import Channel from "../models/Channel.js";

// Get all Videos.
export const getAllVideos = async (req, res) => {
    try {
        const videos = await Video.find();
        return res.status(200).json(videos);
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error! Failed to fetch videos." });
    }
};

// Get a Video by videoId.
export const getVideoById = async (req, res) => {
    const { videoId } = req.params;
    try {
        const video = await Video.findOne({ videoId });
        if (!video) return res.status(404).json({ message: "Video not found." });
        return res.status(200).json(video);
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error! Failed to fetch video." });
    }
};

// Upload a Video to one of the signed-in user's channels.
export const uploadVideo = async (req, res) => {
    const { title, thumbnailUrl, videoUrl, description, category, channelId } = req.body;
    try {
        const channel = await Channel.findOne({ channelId });
        if (!channel) return res.status(404).json({ message: "Channel not found." });
        if (channel.owner !== req.user.username) return res.status(403).json({ message: "You can only upload to your own channel." });

        const newVideo = await Video.create({ title, thumbnailUrl, videoUrl, description, category, channelId, uploader: req.user.username });
        await Channel.findOneAndUpdate({ channelId }, { $push: { videos: newVideo.videoId } });     // Add videoId to channel's videos
        return res.status(201).json({ message: "Video uploaded successfully." });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error! Failed to upload video." });
    }
};

// Update a Video (uploader only). Only editable fields are accepted.
export const updateVideo = async (req, res) => {
    const { videoId } = req.params;
    try {
        const video = await Video.findOne({ videoId });
        if (!video) return res.status(404).json({ message: "Video not found." });
        if (video.uploader !== req.user.username) return res.status(403).json({ message: "You can only update your own video." });

        for (const field of ["title", "thumbnailUrl", "videoUrl", "description", "category"]) {
            if (req.body[field] !== undefined) video[field] = req.body[field];
        }
        await video.save();
        return res.status(200).json({ message: "Video updated successfully." });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error! Failed to update video." });
    }
};

// Delete a Video (uploader only).
export const deleteVideo = async (req, res) => {
    const { videoId } = req.params;
    try {
        const video = await Video.findOne({ videoId });
        if (!video) return res.status(404).json({ message: "Video not found." });
        if (video.uploader !== req.user.username) return res.status(403).json({ message: "You can only delete your own video." });

        await video.deleteOne();
        await Channel.findOneAndUpdate({ channelId: video.channelId }, { $pull: { videos: videoId } });     // Remove videoId from channel's videos
        return res.status(200).json({ message: "Video deleted successfully." });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error! Failed to delete video." });
    }
};

// Add a comment to the Video (posted as the signed-in user).
export const addComment = async (req, res) => {
    const { videoId, commentText } = req.body;
    try {
        const video = await Video.findOne({ videoId });
        if (!video) return res.status(404).json({ message: "Video not found." });
        video.comments.push({ userId: req.user.username, text: commentText });
        await video.save();
        return res.status(201).json({ message: "Comment added successfully." });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error! Failed to add comment." });
    }
};

// Delete a comment from the Video (author only).
export const deleteComment = async (req, res) => {
    const { videoId, commentId } = req.body;
    try {
        const video = await Video.findOne({ videoId });
        if (!video) return res.status(404).json({ message: "Video not found." });
        const comment = video.comments.find(c => c.commentId === commentId);
        if (!comment) return res.status(404).json({ message: "Comment not found." });
        if (comment.userId !== req.user.username) return res.status(403).json({ message: "You can only delete your own comment." });

        video.comments = video.comments.filter(c => c.commentId !== commentId);
        await video.save();
        return res.status(200).json({ message: "Comment deleted successfully." });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error! Failed to delete comment." });
    }
};

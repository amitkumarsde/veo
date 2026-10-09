import { Comment } from "../models/comment.model.js";
import { findPage } from "../utils/pagination.js";

export const commentRepository = {
    create: async (data) => (await Comment.create(data)).toObject(),
    findPage: ({ videoId, sort, cursor, limit }) => findPage(Comment, { filter: { videoId }, sort, cursor, limit }),
    exists: (commentId, videoId) => Comment.exists({ _id: commentId, videoId }),
    updateTextByAuthor: ({ commentId, videoId, author, text }) =>
        Comment.findOneAndUpdate(
            { _id: commentId, videoId, author },
            { $set: { text, editedAt: new Date() } },
            { new: true, runValidators: true },
        ).lean(),
    deleteByAuthor: ({ commentId, videoId, author }) => Comment.findOneAndDelete({ _id: commentId, videoId, author }).lean(),
    countPerVideoByAuthor: async (author) => {
        const rows = await Comment.aggregate([{ $match: { author } }, { $group: { _id: "$videoId", count: { $sum: 1 } } }]);
        return rows.map((row) => ({ videoId: row._id, count: row.count }));
    },
    deleteManyByAuthor: (author) => Comment.deleteMany({ author }),
    deleteManyByVideoIds: (videoIds) => Comment.deleteMany({ videoId: { $in: videoIds } }),
};

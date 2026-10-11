import mongoose from "mongoose";

import { forbidden, notFound } from "../errors/app-error.js";
import { commentRepository } from "../repositories/comment.repository.js";
import { userRepository } from "../repositories/user.repository.js";
import { videoRepository } from "../repositories/video.repository.js";
import { COMMENT_SORTS } from "../utils/pagination.js";
import { inTransaction } from "../utils/transaction.js";

const toPublicComment = (comment, author) => ({
    commentId: String(comment._id),
    text: comment.text,
    createdAt: comment.createdAt,
    editedAt: comment.editedAt ?? null,
    author: { username: comment.author, name: author?.name ?? "", avatarURL: author?.avatarURL ?? "" },
});

// Loads every author on the page with one query.
const attachAuthors = async (comments) => {
    const usernames = [...new Set(comments.map((comment) => comment.author))];
    const authors = usernames.length ? await userRepository.findAuthors(usernames) : [];
    const authorsByUsername = new Map(authors.map((author) => [author.username, author]));
    return comments.map((comment) => toPublicComment(comment, authorsByUsername.get(comment.author)));
};

const assertCommentId = (commentId) => {
    if (!mongoose.isValidObjectId(commentId)) throw notFound("Comment not found.");
};

// When nothing was found: 403 if the comment belongs to someone else, otherwise 404.
const throwMissingOrNotYours = async (commentId, videoId, action) => {
    if (await commentRepository.exists(commentId, videoId)) throw forbidden(`You can only ${action} your own comments.`);
    throw notFound("Comment not found.");
};

export const listComments = async (videoId, { sort, cursor, limit }) => {
    const page = await commentRepository.findPage({ videoId, sort: COMMENT_SORTS[sort], cursor, limit });
    return { items: await attachAuthors(page.items), nextCursor: page.nextCursor };
};

export const addComment = async (videoId, author, text) => {
    if (!(await videoRepository.existsById(videoId))) throw notFound("Video not found.");
    // The comment and the video's count are saved together, so they can't get out of step.
    const comment = await inTransaction(async () => {
        const created = await commentRepository.create({ videoId, author, text });
        await videoRepository.incrementCommentCount(videoId, 1);
        return created;
    });
    const [publicComment] = await attachAuthors([comment]);
    return publicComment;
};

export const editComment = async (videoId, commentId, author, text) => {
    assertCommentId(commentId);
    const comment = await commentRepository.updateTextByAuthor({ commentId, videoId, author, text });
    if (!comment) await throwMissingOrNotYours(commentId, videoId, "edit");
    const [publicComment] = await attachAuthors([comment]);
    return publicComment;
};

export const deleteComment = async (videoId, commentId, author) => {
    assertCommentId(commentId);
    const deleted = await inTransaction(async () => {
        const comment = await commentRepository.deleteByAuthor({ commentId, videoId, author });
        if (comment) await videoRepository.incrementCommentCount(videoId, -1);
        return Boolean(comment);
    });
    if (!deleted) await throwMissingOrNotYours(commentId, videoId, "delete");
};

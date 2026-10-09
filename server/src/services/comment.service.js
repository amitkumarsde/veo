import mongoose from "mongoose";

import { forbidden, notFound } from "../errors/app-error.js";
import { commentRepository } from "../repositories/comment.repository.js";
import { userRepository } from "../repositories/user.repository.js";
import { videoRepository } from "../repositories/video.repository.js";
import { COMMENT_SORTS } from "../utils/pagination.js";

const toPublicComment = (comment, author) => ({
    commentId: String(comment._id),
    videoId: comment.videoId,
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

// After an "own comment" lookup found nothing: 403 if it exists but belongs to someone else, else 404.
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
    const comment = await commentRepository.create({ videoId, author, text });
    await videoRepository.incrementCommentCount(videoId, 1);
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
    const comment = await commentRepository.deleteByAuthor({ commentId, videoId, author });
    if (!comment) await throwMissingOrNotYours(commentId, videoId, "delete");
    await videoRepository.incrementCommentCount(videoId, -1);
};

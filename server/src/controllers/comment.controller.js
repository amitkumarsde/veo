import * as commentService from "../services/comment.service.js";
import { sendSuccess } from "../utils/response.js";

export const listComments = async (req, res) => {
    sendSuccess(res, await commentService.listComments(req.validated.params.videoId, req.validated.query));
};

export const addComment = async (req, res) => {
    const comment = await commentService.addComment(req.validated.params.videoId, req.user.username, req.validated.body.text);
    sendSuccess(res, comment, { status: 201, message: "Comment posted." });
};

export const editComment = async (req, res) => {
    const { videoId, commentId } = req.validated.params;
    const comment = await commentService.editComment(videoId, commentId, req.user.username, req.validated.body.text);
    sendSuccess(res, comment, { message: "Comment updated." });
};

export const deleteComment = async (req, res) => {
    const { videoId, commentId } = req.validated.params;
    await commentService.deleteComment(videoId, commentId, req.user.username);
    sendSuccess(res, null, { message: "Comment deleted." });
};

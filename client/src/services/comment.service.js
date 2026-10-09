import { encodeId, http, unwrap } from "@/services/http";

const commentsUrl = (videoId) => `/videos/${encodeId(videoId)}/comments`;

export const listComments = (videoId, params, signal) => http.get(commentsUrl(videoId), { params, signal }).then(unwrap);
export const addComment = (videoId, text) => http.post(commentsUrl(videoId), { text }).then(unwrap);
export const editComment = (videoId, commentId, text) => http.patch(`${commentsUrl(videoId)}/${encodeId(commentId)}`, { text }).then(unwrap);
export const deleteComment = (videoId, commentId) => http.delete(`${commentsUrl(videoId)}/${encodeId(commentId)}`).then(unwrap);

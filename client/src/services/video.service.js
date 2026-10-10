import { encodeId, http, unwrap } from "@/services/http";
import { clearListsAfter } from "@/utils/list-cache";

export const listVideos = (params, signal) => http.get("/videos", { params, signal }).then(unwrap);
export const listCategories = (signal) => http.get("/videos/categories", { signal }).then(unwrap);
export const getVideo = (videoId, signal) => http.get(`/videos/${encodeId(videoId)}`, { signal }).then(unwrap);
export const listRelatedVideos = (videoId, signal) => http.get(`/videos/${encodeId(videoId)}/related`, { signal }).then(unwrap);

export const createVideo = (formData, options) => http.post("/videos", formData, options).then(unwrap).then(clearListsAfter);
export const updateVideo = (videoId, formData, options) =>
    http.patch(`/videos/${encodeId(videoId)}`, formData, options).then(unwrap).then(clearListsAfter);
export const deleteVideo = (videoId) => http.delete(`/videos/${encodeId(videoId)}`).then(unwrap).then(clearListsAfter);

export const setLike = (videoId, liked) => http.put(`/videos/${encodeId(videoId)}/like`, { liked }).then(unwrap);

// Counting a view is best effort, so errors are ignored.
export const recordView = (videoId) => http.post(`/videos/${encodeId(videoId)}/views`).catch(() => {});

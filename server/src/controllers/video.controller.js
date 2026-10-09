import * as videoService from "../services/video.service.js";
import { sendSuccess } from "../utils/response.js";

const CATEGORY_CACHE_SECONDS = 60;

export const listVideos = async (req, res) => {
    sendSuccess(res, await videoService.listVideos(req.validated.query));
};

export const listCategories = async (req, res) => {
    res.set("Cache-Control", `public, max-age=${CATEGORY_CACHE_SECONDS}`);
    sendSuccess(res, await videoService.listTopCategories());
};

export const getVideo = async (req, res) => {
    sendSuccess(res, await videoService.getVideo(req.validated.params.videoId, req.user));
};

export const listRelatedVideos = async (req, res) => {
    sendSuccess(res, await videoService.listRelatedVideos(req.validated.params.videoId));
};

export const createVideo = async (req, res) => {
    const video = await videoService.createVideo(req.user.username, req.validated.body, req.uploads);
    sendSuccess(res, video, { status: 201, message: "Video published." });
};

export const updateVideo = async (req, res) => {
    const video = await videoService.updateVideo(req.validated.params.videoId, req.user.username, req.validated.body, req.uploads);
    sendSuccess(res, video, { message: "Changes saved." });
};

export const deleteVideo = async (req, res) => {
    await videoService.deleteVideo(req.validated.params.videoId, req.user.username);
    sendSuccess(res, null, { message: "Video deleted." });
};

export const setLike = async (req, res) => {
    sendSuccess(res, await videoService.setLike(req.validated.params.videoId, req.user.username, req.validated.body.liked));
};

export const recordView = async (req, res) => {
    await videoService.recordView(req.validated.params.videoId);
    res.status(204).end();
};

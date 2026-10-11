import { Router } from "express";

import * as commentController from "../controllers/comment.controller.js";
import * as videoController from "../controllers/video.controller.js";
import { optionalAuth, requireAuth } from "../middleware/auth.middleware.js";
import { rateLimit } from "../middleware/rate-limit.middleware.js";
import { acceptUploads } from "../middleware/upload.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { commentSchemas } from "../validators/comment.validation.js";
import { videoSchemas } from "../validators/video.validation.js";

const videoFiles = acceptUploads({ thumbnail: "image", videoFile: "video" });

// One view per visitor per video every 10 minutes; extra calls are accepted and ignored.
const viewLimit = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 1,
    keyFor: (req) => `${req.ip}:${req.validated.params.videoId}`,
    onLimit: (req, res) => res.status(204).end(),
});

const commentLimit = rateLimit({
    windowMs: 60 * 1000,
    max: 10,
    keyFor: (req) => req.user.id,
    message: "You're commenting too fast. Please wait a minute.",
});

export const videoRouter = Router();

videoRouter.get("/", validate(videoSchemas.listVideos), videoController.listVideos);
videoRouter.get("/categories", videoController.listCategories);
videoRouter.post("/", requireAuth, videoFiles, validate(videoSchemas.createVideo), videoController.createVideo);
videoRouter.get("/:videoId", optionalAuth, validate(videoSchemas.videoById), videoController.getVideo);
videoRouter.patch("/:videoId", requireAuth, videoFiles, validate(videoSchemas.updateVideo), videoController.updateVideo);
videoRouter.delete("/:videoId", requireAuth, validate(videoSchemas.videoById), videoController.deleteVideo);
videoRouter.get("/:videoId/related", validate(videoSchemas.videoById), videoController.listRelatedVideos);
videoRouter.put("/:videoId/like", requireAuth, validate(videoSchemas.setLike), videoController.setLike);
videoRouter.post("/:videoId/views", validate(videoSchemas.videoById), viewLimit, videoController.recordView);

videoRouter.get("/:videoId/comments", validate(commentSchemas.listComments), commentController.listComments);
videoRouter.post("/:videoId/comments", requireAuth, commentLimit, validate(commentSchemas.addComment), commentController.addComment);
videoRouter.patch("/:videoId/comments/:commentId", requireAuth, validate(commentSchemas.editComment), commentController.editComment);
videoRouter.delete("/:videoId/comments/:commentId", requireAuth, validate(commentSchemas.deleteComment), commentController.deleteComment);

import { Router } from "express";

import * as channelController from "../controllers/channel.controller.js";
import { optionalAuth, requireAuth } from "../middleware/auth.middleware.js";
import { acceptUploads } from "../middleware/upload.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { channelSchemas } from "../validators/channel.validation.js";

const channelImages = acceptUploads({ banner: "image", logo: "image" });

export const channelRouter = Router();

channelRouter.post("/", requireAuth, channelImages, validate(channelSchemas.createChannel), channelController.createChannel);
channelRouter.get("/:channelId", optionalAuth, validate(channelSchemas.channelById), channelController.getChannel);
channelRouter.patch("/:channelId", requireAuth, channelImages, validate(channelSchemas.updateChannel), channelController.updateChannel);
channelRouter.delete("/:channelId", requireAuth, validate(channelSchemas.channelById), channelController.deleteChannel);
channelRouter.put("/:channelId/subscribe", requireAuth, validate(channelSchemas.setSubscription), channelController.setSubscription);

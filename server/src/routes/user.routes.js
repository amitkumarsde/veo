import { Router } from "express";

import * as userController from "../controllers/user.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { rateLimit } from "../middleware/rate-limit.middleware.js";
import { acceptUploads } from "../middleware/upload.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { userSchemas } from "../validators/user.validation.js";

const FIFTEEN_MINUTES = 15 * 60 * 1000;

// Limits by visitor IP to slow down password guessing and spam registrations.
const authLimit = rateLimit({ windowMs: FIFTEEN_MINUTES, max: 20, message: "Too many attempts. Please try again in 15 minutes." });
const resetLimit = rateLimit({ windowMs: FIFTEEN_MINUTES, max: 5, message: "Too many password reset attempts. Please try again in 15 minutes." });

export const userRouter = Router();

userRouter.post("/register", authLimit, validate(userSchemas.register), userController.register);
userRouter.post("/login", authLimit, validate(userSchemas.login), userController.login);
userRouter.post("/reset-password", resetLimit, validate(userSchemas.resetPassword), userController.resetPassword);
userRouter.get("/me", requireAuth, userController.getMe);
userRouter.patch("/me", requireAuth, acceptUploads({ avatar: "image" }), validate(userSchemas.updateProfile), userController.updateMe);
userRouter.delete("/me", requireAuth, validate(userSchemas.deleteAccount), userController.deleteMe);

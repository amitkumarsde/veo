import * as authService from "../services/auth.service.js";
import * as userService from "../services/user.service.js";
import { sendSuccess } from "../utils/response.js";

export const signUp = async (req, res) => {
    await authService.signUp(req.validated.body);
    sendSuccess(res, null, { status: 201, message: "Account created. Welcome to Veo!" });
};

export const signIn = async (req, res) => {
    const session = await authService.signIn(req.validated.body);
    sendSuccess(res, session, { message: `Welcome back, ${session.user.name || session.user.username}!` });
};

export const resetPassword = async (req, res) => {
    await authService.resetPassword(req.validated.body);
    sendSuccess(res, null, { message: "Password changed. Sign in with your new password." });
};

export const getMe = async (req, res) => {
    sendSuccess(res, await userService.getProfile(req.user.id));
};

export const updateMe = async (req, res) => {
    const user = await userService.updateProfile(req.user.id, req.validated.body, req.uploads);
    sendSuccess(res, user, { message: "Profile saved." });
};

export const deleteMe = async (req, res) => {
    await userService.deleteAccount(req.user.id, req.validated.body.password);
    sendSuccess(res, null, { message: "Your account has been deleted." });
};

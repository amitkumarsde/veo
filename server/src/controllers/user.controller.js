import * as authService from "../services/auth.service.js";
import * as userService from "../services/user.service.js";
import { sendSuccess } from "../utils/response.js";

export const register = async (req, res) => {
    await authService.register(req.validated.body);
    sendSuccess(res, null, 201);
};

export const login = async (req, res) => {
    const session = await authService.login(req.validated.body);
    sendSuccess(res, session);
};

export const resetPassword = async (req, res) => {
    await authService.resetPassword(req.validated.body);
    sendSuccess(res);
};

export const getMe = async (req, res) => {
    sendSuccess(res, await userService.getProfile(req.user.id));
};

export const updateMe = async (req, res) => {
    const user = await userService.updateProfile(req.user.id, req.validated.body, req.uploads);
    sendSuccess(res, user);
};

export const deleteMe = async (req, res) => {
    await userService.deleteAccount(req.user.id, req.validated.body.password);
    sendSuccess(res);
};

import * as channelService from "../services/channel.service.js";
import { sendSuccess } from "../utils/response.js";

export const getChannel = async (req, res) => {
    sendSuccess(res, await channelService.getChannel(req.validated.params.channelId, req.user));
};

export const createChannel = async (req, res) => {
    const channel = await channelService.createChannel(req.user.username, req.validated.body, req.uploads);
    sendSuccess(res, channel, 201);
};

export const updateChannel = async (req, res) => {
    const channel = await channelService.updateChannel(req.validated.params.channelId, req.user.username, req.validated.body, req.uploads);
    sendSuccess(res, channel);
};

export const deleteChannel = async (req, res) => {
    await channelService.deleteChannel(req.validated.params.channelId, req.user.username);
    sendSuccess(res);
};

export const setSubscription = async (req, res) => {
    const result = await channelService.setSubscription(req.validated.params.channelId, req.user.username, req.validated.body.subscribed);
    sendSuccess(res, result);
};

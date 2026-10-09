import { encodeId, http, unwrap } from "@/services/http";
import { clearListsAfter } from "@/utils/list-cache";

export const getChannel = (channelId, signal) => http.get(`/channels/${encodeId(channelId)}`, { signal }).then(unwrap);
export const createChannel = (formData, options) => http.post("/channels", formData, options).then(unwrap).then(clearListsAfter);
export const updateChannel = (channelId, formData, options) =>
    http.patch(`/channels/${encodeId(channelId)}`, formData, options).then(unwrap).then(clearListsAfter);
export const deleteChannel = (channelId) => http.delete(`/channels/${encodeId(channelId)}`).then(unwrap).then(clearListsAfter);
export const setSubscription = (channelId, subscribed) =>
    http.put(`/channels/${encodeId(channelId)}/subscribe`, { subscribed }).then(unwrap);

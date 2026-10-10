import { STORAGE_FOLDERS } from "../constants/uploads.js";
import { badRequest, conflict, fieldError, forbidden, notFound } from "../errors/app-error.js";
import { channelRepository } from "../repositories/channel.repository.js";
import { subscriptionRepository } from "../repositories/subscription.repository.js";
import { videoRepository } from "../repositories/video.repository.js";
import { isDuplicateKeyError } from "../utils/mongo-errors.js";
import { slugify } from "../utils/slugify.js";
import { deleteStoredFiles, withStoredFiles } from "./storage.service.js";
import { deleteVideosWhere } from "./video.service.js";

const NAME_TAKEN = "That channel name is taken. Try another.";
const ONE_CHANNEL_ONLY = "You already have a channel. Each account can have only one.";
const CHANNEL_ID_ATTEMPTS = 5;

const toPublicChannel = (channel) => {
    const { channelId, channelName, owner, description, channelBannerURL, channelAvatarURL, subscribers, createdAt } = channel;
    return { channelId, channelName, owner, description, channelBannerURL, channelAvatarURL, subscribers: Math.max(0, subscribers ?? 0), createdAt };
};

// The unique indexes are the real guard against two requests at once; this gives their error a clear message.
const rethrowDuplicate = (error) => {
    if (!isDuplicateKeyError(error)) throw error;
    if (error.keyPattern?.owner) throw conflict(ONE_CHANNEL_ONLY);
    if (error.keyPattern?.channelId) throw conflict("Please try again.");
    throw fieldError(409, "channelName", NAME_TAKEN);
};

// Makes the URL id from the name ("My Chess!" -> "my-chess"), adding a number if it's taken.
const createChannelId = async (channelName) => {
    const base = slugify(channelName) || "channel";
    for (let attempt = 0; attempt < CHANNEL_ID_ATTEMPTS; attempt += 1) {
        const candidate = attempt === 0 && base !== "channel" ? base : `${base}-${Math.floor(1000 + Math.random() * 9000)}`;
        if (!(await channelRepository.existsById(candidate))) return candidate;
    }
    return `${base}-${Date.now().toString(36)}`;
};

const findOwnChannel = async (channelId, username) => {
    const channel = await channelRepository.findByIdForUpdate(channelId);
    if (!channel) throw notFound("Channel not found.");
    if (channel.owner !== username) throw forbidden("You can only change your own channel.");
    return channel;
};

export const findChannelIdByOwner = async (username) => (await channelRepository.findIdByOwner(username))?.channelId ?? null;

export const getChannel = async (channelId, viewer) => {
    const channel = await channelRepository.findPublicById(channelId);
    if (!channel) throw notFound("Channel not found.");
    const [stats, subscribed] = await Promise.all([
        videoRepository.sumChannelStats(channelId),
        viewer ? subscriptionRepository.exists(channelId, viewer.username) : null,
    ]);
    return { ...toPublicChannel(channel), stats, subscribed: Boolean(subscribed) };
};

export const createChannel = async (owner, { channelName, description }, { banner, logo }) => {
    if (await channelRepository.existsByOwner(owner)) throw conflict(ONE_CHANNEL_ONLY);
    if (await channelRepository.existsByName(channelName)) throw fieldError(409, "channelName", NAME_TAKEN);

    const channelId = await createChannelId(channelName);
    const channel = channelRepository.build({ channelId, channelName, owner, description });
    await withStoredFiles(async (store) => {
        if (banner) channel.channelBannerURL = await store(banner, STORAGE_FOLDERS.channelBanners, owner);
        if (logo) channel.channelAvatarURL = await store(logo, STORAGE_FOLDERS.channelLogos, owner);
        await channel.save().catch(rethrowDuplicate);
    });
    return toPublicChannel(channel);
};

// The channelId never changes on rename, so existing links keep working.
export const updateChannel = async (channelId, owner, { channelName, description, removeBanner, removeLogo }, { banner, logo }) => {
    if ((banner && removeBanner) || (logo && removeLogo)) throw badRequest("Either upload a new image or remove it, not both.");

    const channel = await findOwnChannel(channelId, owner);
    if (channelName !== undefined) channel.channelName = channelName;
    if (description !== undefined) channel.description = description;
    const isRenamed = channel.isModified("channelName");
    if (isRenamed && (await channelRepository.existsByName(channel.channelName, channelId))) {
        throw fieldError(409, "channelName", NAME_TAKEN);
    }

    const replacedFiles = [];
    await withStoredFiles(async (store) => {
        if (banner || removeBanner) {
            replacedFiles.push(channel.channelBannerURL);
            channel.channelBannerURL = banner ? await store(banner, STORAGE_FOLDERS.channelBanners, owner) : "";
        }
        if (logo || removeLogo) {
            replacedFiles.push(channel.channelAvatarURL);
            channel.channelAvatarURL = logo ? await store(logo, STORAGE_FOLDERS.channelLogos, owner) : "";
        }
        await channel.save().catch(rethrowDuplicate);
    });
    if (isRenamed) await videoRepository.renameChannel(channelId, channel.channelName);
    await deleteStoredFiles(replacedFiles);
    return toPublicChannel(channel);
};

// Removes a channel with its videos (and their comments, likes, files) and its subscriptions.
export const deleteChannelCascade = async (channel) => {
    await deleteVideosWhere({ channelId: channel.channelId });
    await subscriptionRepository.deleteManyByChannel(channel.channelId);
    await channelRepository.deleteById(channel.channelId);
    await deleteStoredFiles(channel.channelBannerURL, channel.channelAvatarURL);
};

export const deleteChannel = async (channelId, owner) => {
    const channel = await findOwnChannel(channelId, owner);
    await deleteChannelCascade(channel);
};

// Sets the state rather than toggling it, so repeated requests can't double count.
export const setSubscription = async (channelId, username, subscribed) => {
    const channel = await channelRepository.findOwnerAndName(channelId);
    if (!channel) throw notFound("Channel not found.");
    if (channel.owner === username) throw badRequest("You can't subscribe to your own channel.");

    if (subscribed) {
        if (await subscriptionRepository.add(channelId, username)) await channelRepository.incrementSubscribers([channelId], 1);
    } else if (await subscriptionRepository.remove(channelId, username)) {
        await channelRepository.incrementSubscribers([channelId], -1);
    }
    const updated = await channelRepository.findSubscriberCount(channelId);
    return { subscribed, subscribers: Math.max(0, updated?.subscribers ?? 0) };
};

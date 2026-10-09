import { STORAGE_FOLDERS } from "../constants/uploads.js";
import { badRequest, fieldError, forbidden, notFound } from "../errors/app-error.js";
import { VIDEO_SOURCES } from "../models/video.model.js";
import { channelRepository } from "../repositories/channel.repository.js";
import { commentRepository } from "../repositories/comment.repository.js";
import { likeRepository } from "../repositories/like.repository.js";
import { subscriptionRepository } from "../repositories/subscription.repository.js";
import { videoRepository } from "../repositories/video.repository.js";
import { VIDEO_SORTS } from "../utils/pagination.js";
import { deleteStoredFiles, isStoredUrl, withStoredFiles } from "./storage.service.js";

const TOP_CATEGORY_LIMIT = 30;
const CATEGORY_CACHE_TTL_MS = 60_000;
let categoryCache = { expiresAt: 0, items: [] };

const invalidateCategoryCache = () => { categoryCache = { expiresAt: 0, items: [] }; };

const storedFilesOf = (video) => [video.thumbnailUrl, video.videoSource === VIDEO_SOURCES.upload ? video.videoUrl : null];

const toVideoDetail = (video) => {
    const { _id, videoId, title, description, thumbnailUrl, videoUrl, videoSource, category, channelId, uploader, views, likes, commentCount, uploadDate } = video;
    return { _id, videoId, title, description, thumbnailUrl, videoUrl, videoSource, category, channelId, uploader, views, likes, commentCount, uploadDate };
};

// Adds each video's channel with one query instead of one per card.
const attachChannels = async (videos) => {
    const channelIds = [...new Set(videos.map((video) => video.channelId))];
    if (!channelIds.length) return videos;
    const channels = await channelRepository.findCardsByIds(channelIds);
    const channelsById = new Map(channels.map((channel) => [channel.channelId, channel]));
    return videos.map((video) => ({ ...video, channel: channelsById.get(video.channelId) ?? null }));
};

const findOwnVideo = async (videoId, username) => {
    const video = await videoRepository.findByIdForUpdate(videoId);
    if (!video) throw notFound("Video not found.");
    if (video.uploader !== username) throw forbidden("You can only change your own videos.");
    return video;
};

// Deleting a video deletes its files, so a pasted link must never point at someone's stored upload.
const assertLinkIsExternal = (videoUrl) => {
    if (isStoredUrl(videoUrl)) throw fieldError(400, "videoUrl", "To use an uploaded video, upload the file instead of pasting its link.");
};

export const listVideos = async ({ q, category, channelId, sort, cursor, limit }) => {
    const filter = {};
    if (q) filter.$text = { $search: q };
    if (category) filter.category = category;
    if (channelId) filter.channelId = channelId;
    const page = await videoRepository.findPage({ filter, sort: VIDEO_SORTS[sort], cursor, limit });
    return { items: await attachChannels(page.items), nextCursor: page.nextCursor };
};

export const listTopCategories = async () => {
    if (Date.now() < categoryCache.expiresAt) return categoryCache.items;
    const items = await videoRepository.findTopCategories(TOP_CATEGORY_LIMIT);
    categoryCache = { expiresAt: Date.now() + CATEGORY_CACHE_TTL_MS, items };
    return items;
};

export const getVideo = async (videoId, viewer) => {
    const video = await videoRepository.findDetailById(videoId);
    if (!video) throw notFound("Video not found.");
    const [[withChannel], liked, subscribed] = await Promise.all([
        attachChannels([video]),
        viewer ? likeRepository.exists(videoId, viewer.username) : null,
        viewer ? subscriptionRepository.exists(video.channelId, viewer.username) : null,
    ]);
    return { ...withChannel, liked: Boolean(liked), subscribed: Boolean(subscribed) };
};

// Videos sharing a category, newest first; falls back to the latest videos.
export const listRelatedVideos = async (videoId) => {
    const video = await videoRepository.findCategoriesById(videoId);
    if (!video) throw notFound("Video not found.");
    let related = await videoRepository.findLatestCards({ category: { $in: video.category } }, videoId);
    if (!related.length) related = await videoRepository.findLatestCards({}, videoId);
    return attachChannels(related);
};

export const createVideo = async (uploader, { title, description, category, channelId, videoUrl }, { thumbnail, videoFile }) => {
    if (!thumbnail) throw fieldError(400, "thumbnail", "Please upload a thumbnail image.");
    if (!videoFile && !videoUrl) throw fieldError(400, "videoUrl", "Add the video as a link or a file.");
    if (videoFile && videoUrl) throw badRequest("Use either a video link or a video file, not both.");
    if (videoUrl) assertLinkIsExternal(videoUrl);

    const channel = await channelRepository.findOwnerAndName(channelId);
    if (!channel) throw notFound("Channel not found.");
    if (channel.owner !== uploader) throw forbidden("You can only upload to your own channel.");

    const video = await withStoredFiles(async (store) => {
        const thumbnailUrl = await store(thumbnail, STORAGE_FOLDERS.thumbnails, uploader);
        const source = videoFile
            ? { videoUrl: await store(videoFile, STORAGE_FOLDERS.videos, uploader), videoSource: VIDEO_SOURCES.upload }
            : { videoUrl, videoSource: VIDEO_SOURCES.link };
        return videoRepository.create({ title, description, category, channelId, channelName: channel.channelName, uploader, thumbnailUrl, ...source });
    });
    invalidateCategoryCache();
    return toVideoDetail(video);
};

export const updateVideo = async (videoId, uploader, { title, description, category, videoUrl }, { thumbnail, videoFile }) => {
    if (videoFile && videoUrl) throw badRequest("Use either a video link or a video file, not both.");
    if (videoUrl) assertLinkIsExternal(videoUrl);

    const video = await findOwnVideo(videoId, uploader);
    if (title !== undefined) video.title = title;
    if (description !== undefined) video.description = description;
    if (category !== undefined) video.category = category;

    const replacedFiles = [];
    await withStoredFiles(async (store) => {
        if (thumbnail) {
            replacedFiles.push(video.thumbnailUrl);
            video.thumbnailUrl = await store(thumbnail, STORAGE_FOLDERS.thumbnails, uploader);
        }
        const isSameLink = video.videoSource === VIDEO_SOURCES.link && video.videoUrl === videoUrl;
        if (videoFile || (videoUrl && !isSameLink)) {
            if (video.videoSource === VIDEO_SOURCES.upload) replacedFiles.push(video.videoUrl);
            video.videoUrl = videoFile ? await store(videoFile, STORAGE_FOLDERS.videos, uploader) : videoUrl;
            video.videoSource = videoFile ? VIDEO_SOURCES.upload : VIDEO_SOURCES.link;
        }
        await video.save();
    });
    await deleteStoredFiles(replacedFiles);
    invalidateCategoryCache();
    return toVideoDetail(video);
};

// Children are deleted first, so if this stops half way, running it again finishes the job.
export const deleteVideosWhere = async (filter) => {
    const videos = await videoRepository.findStorageInfo(filter);
    if (!videos.length) return;
    const videoIds = videos.map((video) => video.videoId);
    await Promise.all([commentRepository.deleteManyByVideoIds(videoIds), likeRepository.deleteManyByVideoIds(videoIds)]);
    await videoRepository.deleteByIds(videoIds);
    await deleteStoredFiles(videos.map(storedFilesOf));
    invalidateCategoryCache();
};

export const deleteVideo = async (videoId, uploader) => {
    await findOwnVideo(videoId, uploader);
    await deleteVideosWhere({ videoId });
};

// Sets the state rather than toggling it, so repeated requests can't double count.
export const setLike = async (videoId, username, liked) => {
    if (!(await videoRepository.existsById(videoId))) throw notFound("Video not found.");
    if (liked) {
        if (await likeRepository.add(videoId, username)) await videoRepository.incrementLikes([videoId], 1);
    } else if (await likeRepository.remove(videoId, username)) {
        await videoRepository.incrementLikes([videoId], -1);
    }
    const video = await videoRepository.findLikeCount(videoId);
    return { liked, likes: Math.max(0, video?.likes ?? 0) };
};

export const recordView = (videoId) => videoRepository.incrementViews(videoId);

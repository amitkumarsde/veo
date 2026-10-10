import { STORAGE_FOLDERS } from "../constants/uploads.js";
import { badRequest, fieldError, unauthorized } from "../errors/app-error.js";
import { channelRepository } from "../repositories/channel.repository.js";
import { commentRepository } from "../repositories/comment.repository.js";
import { likeRepository } from "../repositories/like.repository.js";
import { subscriptionRepository } from "../repositories/subscription.repository.js";
import { userRepository } from "../repositories/user.repository.js";
import { videoRepository } from "../repositories/video.repository.js";
import { isPasswordCorrect } from "../utils/password.js";
import { deleteChannelCascade, findChannelIdByOwner } from "./channel.service.js";
import { deleteStoredFiles, withStoredFiles } from "./storage.service.js";
import { deleteVideosWhere } from "./video.service.js";

// The account as the client sees it, without the password hash or internal fields.
export const toPublicUser = async (user) => ({
    _id: String(user._id),
    username: user.username,
    name: user.name ?? "",
    email: user.email,
    avatarURL: user.avatarURL ?? "",
    bio: user.bio ?? "",
    channelId: await findChannelIdByOwner(user.username),
    createdAt: user.createdAt,
});

const findExistingUser = async (findUser, userId) => {
    const user = await findUser(userId);
    if (!user) throw unauthorized();
    return user;
};

export const getProfile = async (userId) => toPublicUser(await findExistingUser(userRepository.findById, userId));

// Name, bio and photo only; the email, password and @handle can't change here.
export const updateProfile = async (userId, { name, bio, removeAvatar }, { avatar }) => {
    if (avatar && removeAvatar) throw badRequest("Either upload a new photo or remove it, not both.");
    const user = await findExistingUser(userRepository.findByIdForUpdate, userId);
    if (name !== undefined) user.name = name;
    if (bio !== undefined) user.bio = bio;

    const previousAvatar = user.avatarURL;
    await withStoredFiles(async (store) => {
        if (avatar) user.avatarURL = await store(avatar, STORAGE_FOLDERS.avatars, user.username);
        if (removeAvatar) user.avatarURL = "";
        await user.save();
    });
    if (avatar || removeAvatar) await deleteStoredFiles(previousAvatar);
    return toPublicUser(user);
};

// Deletes the account and everything linked to its @handle, so a new user with that handle starts clean.
export const deleteAccount = async (userId, password) => {
    const user = await findExistingUser(userRepository.findByIdWithPassword, userId);
    // 403, not 401: the session is valid, only the confirmation is wrong.
    if (!(await isPasswordCorrect(password, user.password))) throw fieldError(403, "password", "Incorrect password.");
    const { username } = user;

    const channel = await channelRepository.findByOwner(username);
    if (channel) await deleteChannelCascade(channel);
    await deleteVideosWhere({ uploader: username });

    const commentCounts = await commentRepository.countPerVideoByAuthor(username);
    if (commentCounts.length) await videoRepository.decrementCommentCounts(commentCounts);
    await commentRepository.deleteManyByAuthor(username);

    const likedVideoIds = await likeRepository.findVideoIdsByUser(username);
    if (likedVideoIds.length) await videoRepository.incrementLikes(likedVideoIds, -1);
    await likeRepository.deleteManyByUser(username);

    const subscribedChannelIds = await subscriptionRepository.findChannelIdsByUser(username);
    if (subscribedChannelIds.length) await channelRepository.incrementSubscribers(subscribedChannelIds, -1);
    await subscriptionRepository.deleteManyByUser(username);

    await userRepository.deleteById(user._id);
    await deleteStoredFiles(user.avatarURL);
};

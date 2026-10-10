// Updates an old database to the current format and builds indexes; it saves a backup first and is safe to rerun.
import fs from "node:fs";
import path from "node:path";
import mongoose from "mongoose";

import { config } from "../src/config/env.js";
import { Channel } from "../src/models/channel.model.js";
import { Comment } from "../src/models/comment.model.js";
import { Like } from "../src/models/like.model.js";
import { Subscription } from "../src/models/subscription.model.js";
import { User } from "../src/models/user.model.js";
import { Video } from "../src/models/video.model.js";

const log = (message) => console.log(`- ${message}`);

const backupCollections = async (collections) => {
    const directory = path.join(import.meta.dirname, "..", "backups", new Date().toISOString().replace(/[:.]/g, "-"));
    fs.mkdirSync(directory, { recursive: true });
    for (const [name, collection] of Object.entries(collections)) {
        // The backup has password hashes and emails, so only the owner can read it.
        fs.writeFileSync(path.join(directory, `${name}.json`), JSON.stringify(await collection.find().toArray(), null, 1), { mode: 0o600 });
    }
    log(`backup saved to ${directory}`);
};

// The new unique indexes would reject these, so we stop and change nothing until they are fixed.
const findDuplicates = async (collection, groupBy, label) => {
    const rows = await collection.aggregate([
        { $group: { _id: groupBy, count: { $sum: 1 } } },
        { $match: { _id: { $ne: null }, count: { $gt: 1 } } },
    ]).toArray();
    return rows.map((row) => `${label} "${row._id}" is used ${row.count} times`);
};

const assertNoDuplicates = async (users, channels) => {
    const problems = [
        ...(await findDuplicates(users, { $toLower: "$email" }, "email (ignoring case)")),
        ...(await findDuplicates(channels, "$owner", "channel owner")),
        ...(await findDuplicates(channels, { $toLower: "$channelName" }, "channel name (ignoring case)")),
    ];
    if (problems.length) {
        throw new Error(`fix these duplicates first, nothing was changed:\n  - ${problems.join("\n  - ")}`);
    }
    log("no duplicate emails, channel owners or channel names");
};

const migrateUsers = async (users) => {
    const withoutUsername = await users.updateMany({ username: { $exists: false }, userId: { $exists: true } }, [{ $set: { username: "$userId" } }]);
    log(`copied the handle into username for ${withoutUsername.modifiedCount} user(s)`);

    const mixedCaseEmails = await users.find({ email: { $regex: "[A-Z]" } }).project({ email: 1 }).toArray();
    for (const user of mixedCaseEmails) await users.updateOne({ _id: user._id }, { $set: { email: user.email.toLowerCase() } });
    log(`lower-cased ${mixedCaseEmails.length} email(s)`);

    const stamped = await users.updateMany({ createdAt: { $exists: false } }, [{ $set: { createdAt: { $toDate: "$_id" }, updatedAt: { $toDate: "$_id" } } }]);
    log(`added timestamps to ${stamped.modifiedCount} user(s)`);

    const cleaned = await users.updateMany({}, { $unset: { userId: "", channels: "", __v: "" } });
    log(`removed unused user fields from ${cleaned.modifiedCount} user(s)`);
};

// I match comments by their content, so running again after a crash never adds duplicates.
const moveEmbeddedComments = async (videos) => {
    let moved = 0;
    for (const video of await videos.find({ "comments.0": { $exists: true } }).toArray()) {
        await Comment.bulkWrite(video.comments.map((comment) => {
            const doc = {
                videoId: video.videoId,
                author: comment.userId,
                text: comment.text,
                createdAt: comment.timestamp ?? video.uploadDate ?? new Date(0),
                ...(comment.editedAt ? { editedAt: comment.editedAt } : {}),
            };
            return { updateOne: { filter: { videoId: doc.videoId, author: doc.author, text: doc.text, createdAt: doc.createdAt }, update: { $setOnInsert: doc }, upsert: true } };
        }));
        await videos.updateOne({ _id: video._id }, { $unset: { comments: "" } });
        moved += video.comments.length;
    }
    log(`moved ${moved} embedded comment(s)`);
};

const moveEmbeddedLikes = async (videos) => {
    let moved = 0;
    for (const video of await videos.find({ "likedBy.0": { $exists: true } }).toArray()) {
        await Like.bulkWrite(video.likedBy.map((user) => ({
            updateOne: { filter: { videoId: video.videoId, user }, update: { $setOnInsert: { videoId: video.videoId, user } }, upsert: true },
        })));
        moved += video.likedBy.length;
    }
    log(`moved ${moved} embedded like(s)`);
};

// Old data kept likes and subscribers as plain numbers, so I only raise a count to the records, never lower it.
const recountVideos = async (videos, channels) => {
    const channelNames = new Map((await channels.find().project({ channelId: 1, channelName: 1 }).toArray()).map((c) => [c.channelId, c.channelName]));
    for (const video of await videos.find().project({ videoId: 1, channelId: 1 }).toArray()) {
        const [likes, commentCount] = await Promise.all([
            Like.countDocuments({ videoId: video.videoId }),
            Comment.countDocuments({ videoId: video.videoId }),
        ]);
        await videos.updateOne({ _id: video._id }, {
            $max: { likes },
            $set: { commentCount, channelName: channelNames.get(video.channelId) ?? "" },
            $unset: { comments: "", likedBy: "", dislikes: "", __v: "" },
        });
    }
    log("counted likes and comments, copied channel names onto videos");
};

const recountChannels = async (channels) => {
    for (const channel of await channels.find().project({ channelId: 1 }).toArray()) {
        await channels.updateOne({ _id: channel._id }, {
            $max: { subscribers: await Subscription.countDocuments({ channelId: channel.channelId }) },
            $unset: { videos: "", channelLogoURL: "", __v: "" },
        });
    }
    log("counted subscribers and removed unused channel fields");
};

const run = async () => {
    await mongoose.connect(config.mongoUrl, { autoIndex: false });
    const { db } = mongoose.connection;
    const users = db.collection("users");
    const channels = db.collection("channels");
    const videos = db.collection("videos");

    await backupCollections({ users, channels, videos });
    await assertNoDuplicates(users, channels);
    await migrateUsers(users);
    await moveEmbeddedComments(videos);
    await moveEmbeddedLikes(videos);
    await recountVideos(videos, channels);
    await recountChannels(channels);

    // Builds the indexes the models define and drops ones they no longer define.
    for (const model of [User, Channel, Video, Comment, Like, Subscription]) {
        await model.syncIndexes();
        log(`indexes in sync: ${model.collection.name}`);
    }

    await mongoose.disconnect();
    console.log("Migration finished.");
};

run().catch(async (error) => {
    console.error("Migration failed:", error.message);
    await mongoose.disconnect();
    process.exit(1);
});

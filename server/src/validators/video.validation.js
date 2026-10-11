import { z } from "zod";

import { LIMITS } from "../constants/limits.js";
import { isPlayableVideoLink, parseHttpUrl } from "../utils/video-links.js";
import { optionalInput, pageCursor, pageLimit, requiredText, videoParams } from "./common.validation.js";

// "a, b" or ["a", "b"] -> ["a", "b"]: lower case, no blanks, no repeats.
const categories = z.preprocess(
    (value) => {
        const raw = Array.isArray(value) ? value : typeof value === "string" ? value.split(",") : [];
        return [...new Set(raw.filter((item) => typeof item === "string").map((item) => item.trim().toLowerCase()).filter(Boolean))];
    },
    z.array(z.string().max(LIMITS.category, `Each category must be at most ${LIMITS.category} characters.`))
        .min(1, "Add at least one category.")
        .max(LIMITS.categories, `Add at most ${LIMITS.categories} categories.`),
);

const videoUrl = optionalInput(
    z.string().trim()
        .max(LIMITS.videoUrl, "The video link is too long.")
        .refine((value) => parseHttpUrl(value) !== null, "The video link must start with http:// or https://.")
        .refine(isPlayableVideoLink, "This link can't be played. Use a YouTube link or a direct link to an MP4/WebM file."),
);

export const videoSchemas = {
    listVideos: {
        query: z.object({
            q: z.string().trim().max(LIMITS.search, `Search can be at most ${LIMITS.search} characters.`).optional(),
            category: z.string().trim().toLowerCase().max(LIMITS.category).optional(),
            channelId: z.string().trim().max(100).optional(),
            sort: z.enum(["newest", "oldest", "popular"]).catch("newest").default("newest"),
            cursor: pageCursor,
            limit: pageLimit(20, 50),
        }),
    },
    videoById: { params: videoParams },
    createVideo: {
        body: z.object({
            title: requiredText("Title", LIMITS.title),
            description: requiredText("Description", LIMITS.description),
            category: categories,
            channelId: requiredText("Channel", 100),
            videoUrl,
        }),
    },
    updateVideo: {
        params: videoParams,
        body: z.object({
            title: requiredText("Title", LIMITS.title).optional(),
            description: requiredText("Description", LIMITS.description).optional(),
            category: categories.optional(),
            videoUrl,
        }),
    },
    setLike: {
        params: videoParams,
        body: z.object({ liked: z.boolean({ error: "liked must be true or false." }) }),
    },
};

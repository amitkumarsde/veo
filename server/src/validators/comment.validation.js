import { z } from "zod";

import { LIMITS } from "../constants/limits.js";
import { pageCursor, pageLimit, pathId, requiredText, videoParams } from "./common.validation.js";

const commentParams = videoParams.extend({ commentId: pathId("Comment") });
const commentBody = z.object({ text: requiredText("Comment", LIMITS.comment) });

export const commentSchemas = {
    listComments: {
        params: videoParams,
        query: z.object({
            sort: z.enum(["newest", "oldest"]).catch("newest").default("newest"),
            cursor: pageCursor,
            limit: pageLimit(20, 50),
        }),
    },
    addComment: { params: videoParams, body: commentBody },
    editComment: { params: commentParams, body: commentBody },
    deleteComment: { params: commentParams },
};

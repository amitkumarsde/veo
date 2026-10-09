import { z } from "zod";

import { LIMITS } from "../constants/limits.js";
import { formFlag, pathId, requiredText } from "./common.validation.js";

const channelParams = z.object({ channelId: pathId("Channel") });

export const channelSchemas = {
    channelById: { params: channelParams },
    createChannel: {
        body: z.object({
            channelName: requiredText("Channel name", LIMITS.channelName),
            description: requiredText("Description", LIMITS.channelDescription),
        }),
    },
    updateChannel: {
        params: channelParams,
        body: z.object({
            channelName: requiredText("Channel name", LIMITS.channelName).optional(),
            description: requiredText("Description", LIMITS.channelDescription).optional(),
            removeBanner: formFlag.optional(),
            removeLogo: formFlag.optional(),
        }),
    },
    setSubscription: {
        params: channelParams,
        body: z.object({ subscribed: z.boolean({ error: "subscribed must be true or false." }) }),
    },
};

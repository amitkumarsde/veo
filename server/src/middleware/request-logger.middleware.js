import { randomUUID } from "node:crypto";

import { logger } from "../utils/logger.js";

const QUIET_PATHS = new Set(["/", "/health"]);

// Gives each request an id (returned as X-Request-Id) and logs one line when it finishes. Query strings are never logged.
export const requestLogger = (req, res, next) => {
    const incomingId = req.get("x-request-id");
    req.id = incomingId && /^[\w-]{1,64}$/.test(incomingId) ? incomingId : randomUUID();
    res.set("X-Request-Id", req.id);

    const startedAt = process.hrtime.bigint();
    res.on("finish", () => {
        if (QUIET_PATHS.has(req.path)) return;
        const durationMs = Math.round(Number(process.hrtime.bigint() - startedAt) / 1e6);
        logger.info("request", { requestId: req.id, method: req.method, path: req.path, status: res.statusCode, durationMs });
    });
    next();
};

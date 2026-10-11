import { randomUUID } from "node:crypto";

import { logger } from "../utils/logger.js";

const QUIET_PATHS = new Set(["/", "/health"]);

// Gives each request an id for the logs and writes one line when it ends, without the query string.
export const requestLogger = (req, res, next) => {
    req.id = randomUUID();

    const startedAt = process.hrtime.bigint();
    res.on("finish", () => {
        if (QUIET_PATHS.has(req.path)) return;
        const durationMs = Math.round(Number(process.hrtime.bigint() - startedAt) / 1e6);
        logger.info("request", { requestId: req.id, method: req.method, path: req.path, status: res.statusCode, durationMs });
    });
    next();
};

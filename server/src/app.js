import cors from "cors";
import express from "express";
import helmet from "helmet";

import { config } from "./config/env.js";
import { isDatabaseConnected } from "./config/database.js";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware.js";
import { requestLogger } from "./middleware/request-logger.middleware.js";
import { channelRouter } from "./routes/channel.routes.js";
import { userRouter } from "./routes/user.routes.js";
import { videoRouter } from "./routes/video.routes.js";

const JSON_BODY_LIMIT = "100kb";
const CORS_PREFLIGHT_CACHE_SECONDS = 86_400;

export const createApp = () => {
    const app = express();

    app.set("trust proxy", config.trustProxy);
    app.use(helmet());
    app.use(requestLogger);
    // Only the configured sites may call the API; in development any origin is allowed when none is set.
    app.use(cors({
        origin: config.corsOrigins.length ? config.corsOrigins : !config.isProduction,
        exposedHeaders: ["X-Request-Id", "Retry-After"],
        maxAge: CORS_PREFLIGHT_CACHE_SECONDS,
    }));
    app.use(express.json({ limit: JSON_BODY_LIMIT }));

    // "/" says the process is up; "/health" also checks the database (use it as Render's health check).
    app.get("/", (req, res) => res.json({ success: true, message: "Veo API is running." }));
    app.get("/health", (req, res) => {
        const databaseUp = isDatabaseConnected();
        res.status(databaseUp ? 200 : 503).json({
            success: databaseUp,
            data: { status: databaseUp ? "ok" : "degraded", database: databaseUp ? "up" : "down", uptimeSeconds: Math.round(process.uptime()) },
        });
    });

    app.use("/users", userRouter);
    app.use("/channels", channelRouter);
    app.use("/videos", videoRouter);

    app.use(notFoundHandler);
    app.use(errorHandler);
    return app;
};

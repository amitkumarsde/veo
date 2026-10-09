import { config } from "./config/env.js";
import { connectDatabase, disconnectDatabase } from "./config/database.js";
import { createApp } from "./app.js";
import { initStorage } from "./services/storage.service.js";
import { logger } from "./utils/logger.js";

// Large video uploads on slow connections can take far longer than Node's 5-minute default.
const REQUEST_TIMEOUT_MS = 30 * 60 * 1000;
const SHUTDOWN_GRACE_MS = 10_000;

process.on("unhandledRejection", (reason) => logger.error("Unhandled promise rejection", { error: String(reason?.stack ?? reason) }));
process.on("uncaughtException", (error) => {
    logger.error("Uncaught exception", { error: error.stack });
    process.exit(1);
});

const start = async () => {
    try {
        await connectDatabase();
    } catch (error) {
        logger.error("Could not connect to MongoDB", { error: error.message });
        process.exit(1);
    }
    if (config.allowPasswordReset && config.isProduction) {
        logger.warn("Password reset by email only is ON: anyone who knows an email can set its password. Set ALLOW_PASSWORD_RESET_BY_EMAIL=false to turn it off.");
    }
    await initStorage();

    const server = createApp().listen(config.port, () => logger.info(`Server listening on port ${config.port}`));
    server.requestTimeout = REQUEST_TIMEOUT_MS;

    // Render sends SIGTERM on deploys: finish open requests, close the database, then exit.
    const shutdown = (signal) => {
        logger.info(`${signal} received, shutting down`);
        server.close(async () => {
            await disconnectDatabase();
            process.exit(0);
        });
        setTimeout(() => process.exit(1), SHUTDOWN_GRACE_MS).unref();
    };
    process.once("SIGTERM", () => shutdown("SIGTERM"));
    process.once("SIGINT", () => shutdown("SIGINT"));
};

start();

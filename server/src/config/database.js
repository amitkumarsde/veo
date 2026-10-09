import mongoose from "mongoose";

import { config } from "./env.js";
import { logger } from "../utils/logger.js";

export const connectDatabase = async () => {
    mongoose.set("strictQuery", true);
    // Indexes are built automatically only in development; production runs `npm run db:migrate`.
    await mongoose.connect(config.mongoUrl, {
        autoIndex: !config.isProduction,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 10_000,
    });
    mongoose.connection.on("disconnected", () => logger.warn("MongoDB disconnected"));
    mongoose.connection.on("reconnected", () => logger.info("MongoDB reconnected"));
    logger.info("MongoDB connected");
};

export const disconnectDatabase = () => mongoose.disconnect();

export const isDatabaseConnected = () => mongoose.connection.readyState === 1;

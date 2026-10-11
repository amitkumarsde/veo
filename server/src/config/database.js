import mongoose from "mongoose";

import { config } from "./env.js";
import { logger } from "../utils/logger.js";

export const connectDatabase = async () => {
    mongoose.set("strictQuery", true);
    // Queries inside inTransaction() join its transaction without passing a session around.
    mongoose.set("transactionAsyncLocalStorage", true);
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

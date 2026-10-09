import { config } from "../config/env.js";

// JSON lines in production (searchable in Render logs), readable text locally.
const write = (level, message, meta = {}) => {
    const line = config.isProduction
        ? JSON.stringify({ level, time: new Date().toISOString(), message, ...meta })
        : `[${level}] ${message}${Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : ""}`;
    (level === "error" ? console.error : console.log)(line);
};

export const logger = {
    info: (message, meta) => write("info", message, meta),
    warn: (message, meta) => write("warn", message, meta),
    error: (message, meta) => write("error", message, meta),
};

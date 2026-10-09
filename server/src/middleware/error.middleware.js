import multer from "multer";

import { config } from "../config/env.js";
import { AppError } from "../errors/app-error.js";
import { logger } from "../utils/logger.js";
import { isDuplicateKeyError } from "../utils/mongo-errors.js";

const sendError = (res, statusCode, message, extra = {}) => res.status(statusCode).json({ success: false, message, ...extra });

const MULTER_MESSAGES = {
    LIMIT_FILE_SIZE: [413, `File too large. Images can be up to ${config.uploads.maxImageMb} MB and videos up to ${config.uploads.maxVideoMb} MB.`],
    LIMIT_FILE_COUNT: [400, "Too many files in one upload."],
    LIMIT_UNEXPECTED_FILE: [400, "Unexpected file in the upload."],
    LIMIT_FIELD_COUNT: [400, "Too many form fields."],
    LIMIT_FIELD_VALUE: [400, "A form field is too long."],
    LIMIT_PART_COUNT: [400, "The upload has too many parts."],
};

export const notFoundHandler = (req, res) => sendError(res, 404, `Route not found: ${req.method} ${req.path}`);

// Turns every error into the same JSON shape. Unexpected errors are logged with the request id and never leak details.
// eslint-disable-next-line no-unused-vars
export const errorHandler = (error, req, res, next) => {
    if (error instanceof AppError) return sendError(res, error.statusCode, error.message, error.fields ? { fields: error.fields } : {});

    if (error instanceof multer.MulterError) {
        const [statusCode, message] = MULTER_MESSAGES[error.code] ?? [400, "The upload was rejected."];
        return sendError(res, statusCode, message);
    }
    if (error?.name === "ValidationError") {
        const fields = Object.fromEntries(Object.entries(error.errors).map(([field, detail]) => [field, detail.message]));
        return sendError(res, 400, Object.values(fields)[0] ?? "Invalid data.", { fields });
    }
    if (error?.name === "CastError") return sendError(res, 400, "Invalid id or value.");
    if (isDuplicateKeyError(error)) return sendError(res, 409, "That already exists.");
    if (error?.type === "entity.parse.failed") return sendError(res, 400, "Malformed JSON body.");
    if (error?.type === "entity.too.large") return sendError(res, 413, "Request body is too large.");

    logger.error("Unhandled error", { requestId: req.id, method: req.method, path: req.path, error: error?.stack ?? String(error) });
    if (res.headersSent) return next(error);
    return sendError(res, 500, "Something went wrong. Please try again.", { requestId: req.id });
};

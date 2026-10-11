// An expected error: a status code, a message safe to show, and optional messages for form fields.
export class AppError extends Error {
    constructor(statusCode, message, fields) {
        super(message);
        this.name = "AppError";
        this.statusCode = statusCode;
        this.fields = fields;
    }
}

export const badRequest = (message, fields) => new AppError(400, message, fields);
export const unauthorized = (message = "Your session has expired. Please log in again.") => new AppError(401, message);
export const forbidden = (message) => new AppError(403, message);
export const notFound = (message) => new AppError(404, message);
export const conflict = (message) => new AppError(409, message);
export const payloadTooLarge = (message) => new AppError(413, message);
export const serviceUnavailable = (message) => new AppError(503, message);

// Same message for the toast and under the field.
export const fieldError = (statusCode, field, message) => new AppError(statusCode, message, { [field]: message });

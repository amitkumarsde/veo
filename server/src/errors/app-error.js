// An expected failure with a status and a message that is safe to show to the user.
// `fields` maps form field names to messages so the client can show them inline.
export class AppError extends Error {
    constructor(statusCode, message, fields) {
        super(message);
        this.name = "AppError";
        this.statusCode = statusCode;
        this.fields = fields;
    }
}

export const badRequest = (message, fields) => new AppError(400, message, fields);
export const unauthorized = (message = "Your session has expired. Please sign in again.") => new AppError(401, message);
export const forbidden = (message, fields) => new AppError(403, message, fields);
export const notFound = (message) => new AppError(404, message);
export const conflict = (message, fields) => new AppError(409, message, fields);
export const payloadTooLarge = (message) => new AppError(413, message);
export const serviceUnavailable = (message) => new AppError(503, message);

// Same message for the toast and under the field.
export const fieldError = (statusCode, field, message) => new AppError(statusCode, message, { [field]: message });

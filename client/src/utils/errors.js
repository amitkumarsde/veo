const GATEWAY_STATUSES = new Set([502, 503, 504]);

export const getStatus = (error) => error?.response?.status ?? null;

// The server's message for a failed request, or a fallback.
export const getErrorMessage = (error, fallback = "Something went wrong. Please try again.") =>
    error?.response?.data?.message || fallback;

// Per-field messages from the server ({ email: "..." }), shown under each input.
export const getFieldErrors = (error) => error?.response?.data?.fields ?? {};

// True when a request was cancelled on purpose (e.g. a newer search replaced it).
export const isCancelled = (error) => error?.code === "ERR_CANCELED";

// No answer at all, or the host (not the API, which always sends `success`) says the app is down.
export const isServerUnreachable = (error) => !isCancelled(error)
    && (!error?.response || (GATEWAY_STATUSES.has(getStatus(error)) && error.response.data?.success === undefined));

export const isNotFound = (error) => getStatus(error) === 404;

import axios, { CanceledError } from "axios";

import { env } from "@/config/env";
import { readToken } from "@/features/auth/session-storage";
import {
    markRequestSettled,
    markRequestStarted,
    markServerReachable,
    markServerUnreachable,
} from "@/features/server-status/server-status";
import { getStatus, isCancelled, isServerUnreachable } from "@/utils/errors";

// A sleeping Render server can take about a minute to wake; after this the page shows "unavailable".
const REQUEST_TIMEOUT_MS = 60_000;
// Only quick failures are retried; a timeout has already waited long enough.
const MAX_READ_RETRIES = 1;
const RETRY_BASE_DELAY_MS = 1000;
const TIMEOUT_CODES = new Set(["ECONNABORTED", "ETIMEDOUT"]);

let handleUnauthorized = () => {};

// The auth code sets how to log out when the server rejects the saved token.
export const setUnauthorizedHandler = (handler) => { handleUnauthorized = handler; };

export const http = axios.create({ baseURL: env.apiUrl, timeout: REQUEST_TIMEOUT_MS });

// Resolves after `ms`, or early when `signal` aborts; the listener is removed either way.
const wait = (ms, signal) => new Promise((resolve) => {
    const onAbort = () => { clearTimeout(timer); resolve(); };
    const timer = setTimeout(() => { signal?.removeEventListener("abort", onAbort); resolve(); }, ms);
    signal?.addEventListener("abort", onAbort, { once: true });
});

const isRead = (config) => (config.method ?? "get").toLowerCase() === "get";
const isTimeout = (error) => TIMEOUT_CODES.has(error?.code);

http.interceptors.request.use((config) => {
    // Uploads are slow on purpose, so they use their own timeout and don't count towards "waking up".
    if (!config.isUpload && !config.statusTracked) {
        config.statusTracked = true;
        config.countedAsPending = markRequestStarted();
    }
    const token = readToken();
    config.sentToken = token;
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

http.interceptors.response.use(
    (response) => {
        if (response.config.statusTracked) markServerReachable(response.config.countedAsPending);
        return response;
    },
    async (error) => {
        const { config } = error;
        if (!config || isCancelled(error)) {
            if (config?.statusTracked) markRequestSettled(config.countedAsPending);
            throw error;
        }

        // Only reads are retried: repeating a write could apply it twice.
        const retryCount = config.retryCount ?? 0;
        if (isRead(config) && isServerUnreachable(error) && !isTimeout(error) && retryCount < MAX_READ_RETRIES) {
            config.retryCount = retryCount + 1;
            await wait(RETRY_BASE_DELAY_MS * config.retryCount, config.signal);
            if (!config.signal?.aborted) return http(config);
            // Cancelled while waiting to retry: report it as a cancel, like any other cancelled request.
            if (config.statusTracked) markRequestSettled(config.countedAsPending);
            throw new CanceledError(undefined, config);
        }

        if (config.statusTracked) {
            if (isServerUnreachable(error)) markServerUnreachable(config.countedAsPending);
            else markServerReachable(config.countedAsPending);
        }
        // Only a rejected current login logs out; an old request can finish after a new login.
        if (getStatus(error) === 401 && !config.isAuthRequest && config.sentToken && config.sentToken === readToken()) handleUnauthorized();
        throw error;
    },
);

// Every successful API reply is { success, data }; callers only need `data`.
export const unwrap = (response) => response.data.data;

export const uploadOptions = ({ signal, onProgress }) => ({
    isUpload: true,
    timeout: 0,
    signal,
    onUploadProgress: (event) => {
        if (!event.total) return;
        onProgress?.({ percent: Math.round((event.loaded / event.total) * 100), secondsLeft: event.estimated ?? null });
    },
});

export const encodeId = (id) => encodeURIComponent(id);

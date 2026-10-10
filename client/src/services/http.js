import axios from "axios";

import { env } from "@/config/env";
import { readToken } from "@/features/auth/session-storage";
import {
    markRequestSettled,
    markRequestStarted,
    markServerReachable,
    markServerUnreachable,
} from "@/features/server-status/server-status";
import { getStatus, isCancelled, isServerUnreachable } from "@/utils/errors";

// After this a page shows "unavailable", and we keep checking the server so the page loads once it's back.
const READ_TIMEOUT_MS = 10_000;
// Writes can do real work (like deleting a channel with all its videos), so they get longer.
const WRITE_TIMEOUT_MS = 30_000;
// I retry only quick failures; a timeout has already waited long enough.
const MAX_READ_RETRIES = 1;
const RETRY_BASE_DELAY_MS = 1000;
const TIMEOUT_CODES = new Set(["ECONNABORTED", "ETIMEDOUT"]);

let handleUnauthorized = () => {};

// The auth code sets how to sign out when the server rejects the saved token.
export const setUnauthorizedHandler = (handler) => { handleUnauthorized = handler; };

export const http = axios.create({ baseURL: env.apiUrl, timeout: READ_TIMEOUT_MS });

const wait = (ms, signal) => new Promise((resolve) => {
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener("abort", () => { clearTimeout(timer); resolve(); }, { once: true });
});

const isRead = (config) => (config.method ?? "get").toLowerCase() === "get";
const isTimeout = (error) => TIMEOUT_CODES.has(error?.code);

http.interceptors.request.use((config) => {
    // Uploads are slow on purpose, so they use their own timeout and don't count towards "waking up".
    if (!config.isUpload) {
        if (!isRead(config)) config.timeout = WRITE_TIMEOUT_MS;
        if (!config.statusTracked) {
            config.statusTracked = true;
            config.countedAsPending = markRequestStarted();
        }
    }
    const token = readToken();
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
        }

        if (config.statusTracked) {
            if (isServerUnreachable(error)) markServerUnreachable(config.countedAsPending);
            else markServerReachable(config.countedAsPending);
        }
        if (getStatus(error) === 401 && !config.isAuthRequest) handleUnauthorized();
        throw error;
    },
);

// Every API reply is { success, message?, data }; callers only need `data`.
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

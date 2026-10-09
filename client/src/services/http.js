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

// Long enough for Render's free plan to wake the server from sleep.
const REQUEST_TIMEOUT_MS = 45_000;
const MAX_READ_RETRIES = 3;
const RETRY_BASE_DELAY_MS = 2000;

let handleUnauthorized = () => {};

// The auth layer registers how to sign out when the server rejects the saved token.
export const setUnauthorizedHandler = (handler) => { handleUnauthorized = handler; };

export const http = axios.create({ baseURL: env.apiUrl, timeout: REQUEST_TIMEOUT_MS });

const wait = (ms, signal) => new Promise((resolve) => {
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener("abort", () => { clearTimeout(timer); resolve(); }, { once: true });
});

http.interceptors.request.use((config) => {
    // Uploads are slow on purpose, so they don't count towards "the server is waking up".
    if (!config.isUpload && !config.statusTracked) {
        config.statusTracked = true;
        markRequestStarted();
    }
    const token = readToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

http.interceptors.response.use(
    (response) => {
        if (response.config.statusTracked) markServerReachable();
        return response;
    },
    async (error) => {
        const { config } = error;
        if (!config || isCancelled(error)) {
            if (config?.statusTracked) markRequestSettled();
            throw error;
        }

        // Only reads are retried: repeating a write could apply it twice.
        const isRead = (config.method ?? "get").toLowerCase() === "get";
        const retryCount = config.retryCount ?? 0;
        if (isRead && isServerUnreachable(error) && retryCount < MAX_READ_RETRIES) {
            config.retryCount = retryCount + 1;
            await wait(RETRY_BASE_DELAY_MS * config.retryCount, config.signal);
            if (!config.signal?.aborted) return http(config);
        }

        if (config.statusTracked) {
            if (isServerUnreachable(error)) markServerUnreachable();
            else markServerReachable();
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

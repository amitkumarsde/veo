import { env } from "@/config/env";

// Tracks if the API answers; while it's down it keeps checking, so pages reload by themselves.
export const SERVER_STATUS = Object.freeze({ unknown: "unknown", waking: "waking", online: "online", offline: "offline" });

const WAKING_NOTICE_DELAY_MS = 3500;
const RECHECK_INTERVAL_MS = 5000;
const RECHECK_TIMEOUT_MS = 10_000;

let status = SERVER_STATUS.unknown;
let pendingRequests = 0;
let wakingTimer = null;
let isRechecking = false;
const listeners = new Set();

const setStatus = (next) => {
    if (status === next) return;
    status = next;
    listeners.forEach((listener) => listener());
};

export const getServerStatus = () => status;

export const subscribeToServerStatus = (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// "/" answers as soon as the server is running, without the database or a login.
const apiAnswers = async () => {
    try {
        const response = await fetch(`${env.apiUrl}/`, { cache: "no-store", signal: AbortSignal.timeout(RECHECK_TIMEOUT_MS) });
        return response.ok;
    } catch {
        return false;
    }
};

const recheckUntilOnline = async () => {
    if (isRechecking) return;
    isRechecking = true;
    while (status !== SERVER_STATUS.online) {
        await sleep(RECHECK_INTERVAL_MS);
        if (status !== SERVER_STATUS.online && (await apiAnswers())) setStatus(SERVER_STATUS.online);
    }
    isRechecking = false;
};

// Returns whether the request was counted; the matching mark call gets this back when the request ends.
export const markRequestStarted = () => {
    if (status === SERVER_STATUS.online) return false;
    pendingRequests += 1;
    wakingTimer ??= setTimeout(() => {
        wakingTimer = null;
        if (pendingRequests > 0 && status !== SERVER_STATUS.online) setStatus(SERVER_STATUS.waking);
    }, WAKING_NOTICE_DELAY_MS);
    return true;
};

const finishRequest = (wasCounted) => {
    if (!wasCounted) return;
    pendingRequests = Math.max(0, pendingRequests - 1);
    if (pendingRequests === 0) {
        clearTimeout(wakingTimer);
        wakingTimer = null;
    }
};

// Any real answer from the API, even an error reply, means it is up.
export const markServerReachable = (wasCounted) => {
    finishRequest(wasCounted);
    setStatus(SERVER_STATUS.online);
};

export const markServerUnreachable = (wasCounted) => {
    finishRequest(wasCounted);
    setStatus(SERVER_STATUS.offline);
    recheckUntilOnline();
};

// A request that ended with no answer either way (e.g. cancelled).
export const markRequestSettled = (wasCounted) => {
    finishRequest(wasCounted);
    if (pendingRequests === 0 && status === SERVER_STATUS.waking) setStatus(SERVER_STATUS.unknown);
};

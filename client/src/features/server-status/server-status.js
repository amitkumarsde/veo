// Tracks whether the API answers. Render's free plan sleeps when idle, so the first request can take up to a minute;
// "waking" lets the UI say so instead of looking broken. "offline" means retries ran out without an answer.
export const SERVER_STATUS = Object.freeze({ unknown: "unknown", waking: "waking", online: "online", offline: "offline" });

const WAKING_NOTICE_DELAY_MS = 3500;

let status = SERVER_STATUS.unknown;
let pendingRequests = 0;
let wakingTimer = null;
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

export const markRequestStarted = () => {
    if (status === SERVER_STATUS.online) return;
    pendingRequests += 1;
    wakingTimer ??= setTimeout(() => {
        wakingTimer = null;
        if (pendingRequests > 0 && status !== SERVER_STATUS.online) setStatus(SERVER_STATUS.waking);
    }, WAKING_NOTICE_DELAY_MS);
};

const finishRequest = () => {
    pendingRequests = Math.max(0, pendingRequests - 1);
    if (pendingRequests === 0) {
        clearTimeout(wakingTimer);
        wakingTimer = null;
    }
};

// Any real answer from the API, even an error reply, means it is up.
export const markServerReachable = () => {
    finishRequest();
    setStatus(SERVER_STATUS.online);
};

export const markServerUnreachable = () => {
    finishRequest();
    setStatus(SERVER_STATUS.offline);
};

// A request that ended without telling us anything (e.g. cancelled).
export const markRequestSettled = () => {
    finishRequest();
    if (pendingRequests === 0 && status === SERVER_STATUS.waking) setStatus(SERVER_STATUS.unknown);
};

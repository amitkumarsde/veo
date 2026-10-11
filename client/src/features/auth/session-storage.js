// The login lives in localStorage because the API is on another site, where cookies are often blocked.
export const TOKEN_KEY = "token";
export const USER_KEY = "user";

const safely = (action, fallback = null) => {
    try {
        return action();
    } catch {
        return fallback;
    }
};

export const readToken = () => safely(() => localStorage.getItem(TOKEN_KEY));

export const readStoredUser = () => safely(() => {
    const raw = localStorage.getItem(USER_KEY);
    const user = raw ? JSON.parse(raw) : null;
    return user && typeof user === "object" && readToken() ? user : null;
});

export const saveSession = ({ token, user }) => safely(() => {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
});

export const clearSession = () => safely(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
});

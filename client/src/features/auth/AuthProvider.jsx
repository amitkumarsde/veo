import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";

import { AuthContext } from "@/features/auth/AuthContext";
import { USER_KEY, TOKEN_KEY, clearSession, readStoredUser, readToken, saveSession } from "@/features/auth/session-storage";
import { setUnauthorizedHandler } from "@/services/http";
import { getCurrentUser } from "@/services/user.service";

const SESSION_EXPIRED = "Your session has expired. Please log in again.";

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(readStoredUser);

    const login = useCallback(({ token, user: loggedInUser }) => {
        saveSession({ token, user: loggedInUser });
        setUser(loggedInUser);
    }, []);

    const logout = useCallback(() => {
        clearSession();
        setUser(null);
    }, []);

    // Changes the logged-in user; does nothing once logged out, so a late reply can't bring a session back.
    const updateUser = useCallback((next) => {
        setUser((previous) => {
            if (!previous || !readToken()) return previous;
            const updated = typeof next === "function" ? next(previous) : next;
            if (updated) saveSession({ user: updated });
            return updated;
        });
    }, []);

    // The server's copy of the account, applied only if the same login is still active.
    const fetchLatestUser = useCallback(async () => {
        const token = readToken();
        const latest = await getCurrentUser();
        if (token && readToken() === token) updateUser(latest);
        return latest;
    }, [updateUser]);

    useEffect(() => {
        setUnauthorizedHandler(() => {
            logout();
            toast.info(SESSION_EXPIRED, { toastId: "session-expired" });
        });
        return () => setUnauthorizedHandler(() => {});
    }, [logout]);

    // Shows the saved user at once, then swaps in the server's copy.
    useEffect(() => {
        const token = readToken();
        if (!token) return;
        getCurrentUser()
            .then((latest) => { if (readToken() === token) updateUser(latest); })
            .catch(() => {});
    }, [updateUser]);

    // Logging in or out in another tab applies here too.
    useEffect(() => {
        const onStorage = (event) => {
            if (event.key === null || event.key === TOKEN_KEY || event.key === USER_KEY) setUser(readStoredUser());
        };
        window.addEventListener("storage", onStorage);
        return () => window.removeEventListener("storage", onStorage);
    }, []);

    const value = useMemo(
        () => ({ user, login, logout, updateUser, refreshUser: fetchLatestUser }),
        [user, login, logout, updateUser, fetchLatestUser],
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

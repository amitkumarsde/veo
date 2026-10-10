import { useCallback, useEffect, useMemo, useState } from "react";

import { AuthContext } from "@/features/auth/AuthContext";
import { USER_KEY, TOKEN_KEY, clearSession, readStoredUser, readToken, saveSession } from "@/features/auth/session-storage";
import { setUnauthorizedHandler } from "@/services/http";
import { getCurrentUser } from "@/services/user.service";

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(readStoredUser);

    const signIn = useCallback(({ token, user: signedInUser }) => {
        saveSession({ token, user: signedInUser });
        setUser(signedInUser);
    }, []);

    const signOut = useCallback(() => {
        clearSession();
        setUser(null);
    }, []);

    const updateUser = useCallback((next) => {
        setUser((previous) => {
            const updated = typeof next === "function" ? next(previous) : next;
            if (updated) saveSession({ user: updated });
            return updated;
        });
    }, []);

    // We skip the update if the user signed out while the request was running.
    const refreshUser = useCallback(async () => {
        const latest = await getCurrentUser();
        if (readToken()) updateUser(latest);
        return latest;
    }, [updateUser]);

    useEffect(() => {
        setUnauthorizedHandler(signOut);
        return () => setUnauthorizedHandler(() => {});
    }, [signOut]);

    // We show the saved user at once, then replace it with the server's copy.
    useEffect(() => {
        if (!readToken()) return;
        getCurrentUser()
            .then((latest) => { if (readToken()) updateUser(latest); })
            .catch(() => {});
    }, [updateUser]);

    // Signing in or out in another tab applies here too.
    useEffect(() => {
        const onStorage = (event) => {
            if (event.key === null || event.key === TOKEN_KEY || event.key === USER_KEY) setUser(readStoredUser());
        };
        window.addEventListener("storage", onStorage);
        return () => window.removeEventListener("storage", onStorage);
    }, []);

    const value = useMemo(() => ({ user, signIn, signOut, updateUser, refreshUser }), [user, signIn, signOut, updateUser, refreshUser]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

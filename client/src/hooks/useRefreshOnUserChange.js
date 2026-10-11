import { useEffect, useRef } from "react";

import { useAuth } from "@/features/auth/useAuth";

// Calls `refresh()` after a log in or log out, so fields like `liked` or `subscribed` match the new viewer.
export const useRefreshOnUserChange = (refresh) => {
    const { user } = useAuth();
    const viewer = user?.username ?? null;
    const viewerRef = useRef(viewer);

    useEffect(() => {
        if (viewerRef.current === viewer) return;
        viewerRef.current = viewer;
        refresh();
    }, [viewer, refresh]);
};

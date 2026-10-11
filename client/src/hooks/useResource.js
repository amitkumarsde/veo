import { useCallback, useEffect, useRef, useState } from "react";

import { useLatest } from "@/hooks/useLatest";
import { isCancelled } from "@/utils/errors";

// Loads one item (a video, a channel) for `key`, cancels it when the key changes, skips a null key.
export const useResource = (fetchResource, key) => {
    const fetchRef = useLatest(fetchResource);
    const [state, setState] = useState({ key: null, data: null, error: null });
    const [attempt, setAttempt] = useState(0);
    const refreshRef = useRef(null);

    useEffect(() => {
        if (key == null) return undefined;
        const controller = new AbortController();
        fetchRef.current(controller.signal)
            .then((data) => setState({ key, data, error: null }))
            .catch((error) => { if (!isCancelled(error)) setState({ key, data: null, error }); });
        return () => {
            controller.abort();
            refreshRef.current?.abort();
        };
    }, [key, attempt, fetchRef]);

    const isCurrent = state.key === key;

    // Changes the loaded item only while it still belongs to this key, so a late reply can't land on another item.
    const setData = useCallback((update) => setState((previous) => {
        if (previous.key !== key || previous.data == null) return previous;
        return { ...previous, data: typeof update === "function" ? update(previous.data) : update };
    }), [key]);

    const reload = useCallback(() => {
        setState({ key: null, data: null, error: null });
        setAttempt((count) => count + 1);
    }, []);

    // Loads the item again in the background, keeping the current one on screen meanwhile.
    const refresh = useCallback(() => {
        if (key == null) return;
        refreshRef.current?.abort();
        const controller = new AbortController();
        refreshRef.current = controller;
        fetchRef.current(controller.signal)
            .then((data) => setState((previous) => (previous.key === key ? { key, data, error: null } : previous)))
            .catch(() => {});
    }, [key, fetchRef]);

    return {
        data: isCurrent ? state.data : null,
        error: isCurrent ? state.error : null,
        loading: key != null && !isCurrent,
        setData,
        reload,
        refresh,
    };
};

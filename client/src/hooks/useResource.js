import { useCallback, useEffect, useState } from "react";

import { useLatest } from "@/hooks/useLatest";
import { isCancelled } from "@/utils/errors";

// Loads one thing (a video, a channel) for `key` and cancels it when the key changes; a null key skips loading.
export const useResource = (fetchResource, key) => {
    const fetchRef = useLatest(fetchResource);
    const [state, setState] = useState({ key: null, data: null, error: null });
    const [attempt, setAttempt] = useState(0);

    useEffect(() => {
        if (key == null) return undefined;
        const controller = new AbortController();
        fetchRef.current(controller.signal)
            .then((data) => setState({ key, data, error: null }))
            .catch((error) => { if (!isCancelled(error)) setState({ key, data: null, error }); });
        return () => controller.abort();
    }, [key, attempt, fetchRef]);

    const isCurrent = state.key === key;
    const setData = useCallback((update) => setState((previous) => ({
        ...previous,
        data: typeof update === "function" ? update(previous.data) : update,
    })), []);
    const reload = useCallback(() => {
        setState({ key: null, data: null, error: null });
        setAttempt((count) => count + 1);
    }, []);

    return {
        data: isCurrent ? state.data : null,
        error: isCurrent ? state.error : null,
        loading: key != null && !isCurrent,
        setData,
        reload,
    };
};

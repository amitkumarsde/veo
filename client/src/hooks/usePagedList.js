import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

import { useLatest } from "@/hooks/useLatest";
import { getErrorMessage, isCancelled } from "@/utils/errors";
import { readList, removeList, writeList } from "@/utils/list-cache";

const STATUS = { loading: "loading", idle: "idle", loadingMore: "loadingMore", error: "error" };

const loadingState = (key) => ({ key, items: [], cursor: null, status: STATUS.loading, error: null });

const initialStateFor = (key) => {
    const cached = readList(key);
    return cached ? { key, items: cached.items, cursor: cached.cursor, status: STATUS.idle, error: null } : loadingState(key);
};

// A cursor-paged list for `key` (e.g. a search). A new key starts over and cancels the old request.
// `fetchPage({ cursor, signal })` returns { items, nextCursor }; `getItemKey` removes repeats between pages.
export const usePagedList = (fetchPage, { key, getItemKey }) => {
    const fetchRef = useLatest(fetchPage);
    const getItemKeyRef = useLatest(getItemKey);
    const [list, setList] = useState(() => initialStateFor(key));
    const [attempt, setAttempt] = useState(0);
    const signalRef = useRef(null);

    // A new key replaces the list during render, so a stale list is never shown or cached under the new key.
    if (list.key !== key) setList(initialStateFor(key));

    useEffect(() => {
        const controller = new AbortController();
        signalRef.current = controller.signal;
        if (!readList(key)) {
            fetchRef.current({ cursor: null, signal: controller.signal })
                .then((page) => setList({ key, items: page.items, cursor: page.nextCursor, status: STATUS.idle, error: null }))
                .catch((error) => {
                    if (!isCancelled(error)) setList({ ...loadingState(key), status: STATUS.error, error });
                });
        }
        return () => controller.abort();
    }, [key, attempt, fetchRef]);

    useEffect(() => {
        if (list.key === key && list.status === STATUS.idle) writeList(key, list.items, list.cursor);
    }, [key, list]);

    const loadMore = useCallback(() => {
        if (!list.cursor || list.status !== STATUS.idle) return;
        setList((previous) => ({ ...previous, status: STATUS.loadingMore }));
        fetchRef.current({ cursor: list.cursor, signal: signalRef.current })
            .then((page) => setList((previous) => {
                const seen = new Set(previous.items.map(getItemKeyRef.current));
                const fresh = page.items.filter((item) => !seen.has(getItemKeyRef.current(item)));
                return { ...previous, items: [...previous.items, ...fresh], cursor: page.nextCursor, status: STATUS.idle };
            }))
            .catch((error) => {
                if (isCancelled(error)) return;
                toast.error(getErrorMessage(error, "Couldn't load more. Please try again."));
                setList((previous) => ({ ...previous, status: STATUS.idle }));
            });
    }, [list.cursor, list.status, fetchRef, getItemKeyRef]);

    const setItems = useCallback((update) => setList((previous) => ({
        ...previous,
        items: typeof update === "function" ? update(previous.items) : update,
    })), []);

    const reload = useCallback(() => {
        removeList(key);
        setList(loadingState(key));
        setAttempt((count) => count + 1);
    }, [key]);

    return {
        items: list.items,
        setItems,
        loading: list.status === STATUS.loading,
        loadingMore: list.status === STATUS.loadingMore,
        error: list.error,
        hasMore: Boolean(list.cursor),
        loadMore,
        reload,
    };
};

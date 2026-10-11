import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

import { useLatest } from "@/hooks/useLatest";
import { getErrorMessage, isCancelled } from "@/utils/errors";
import { readList, removeList, writeList } from "@/utils/list-cache";

// loadMoreError: the next page failed; it loads again only when asked (the "Show more" button), never by itself.
const STATUS = { loading: "loading", idle: "idle", loadingMore: "loadingMore", loadMoreError: "loadMoreError", error: "error" };

const loadingState = (key) => ({ key, items: [], cursor: null, status: STATUS.loading, error: null });

const initialStateFor = (key) => {
    const cached = readList(key);
    return cached ? { key, items: cached.items, cursor: cached.cursor, status: STATUS.idle, error: null } : loadingState(key);
};

// A paged list for `key`; a new key starts over, and `getItemKey` removes repeats between pages.
export const usePagedList = (fetchPage, { key, getItemKey }) => {
    const fetchRef = useLatest(fetchPage);
    const getItemKeyRef = useLatest(getItemKey);
    const [list, setList] = useState(() => initialStateFor(key));
    const [attempt, setAttempt] = useState(0);
    const signalRef = useRef(null);

    // A new key resets the list during render, so an old list is never shown under the new key.
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
        if (!list.cursor || (list.status !== STATUS.idle && list.status !== STATUS.loadMoreError)) return;
        setList((previous) => ({ ...previous, status: STATUS.loadingMore }));
        fetchRef.current({ cursor: list.cursor, signal: signalRef.current })
            .then((page) => setList((previous) => {
                if (previous.key !== key) return previous;
                const seen = new Set(previous.items.map(getItemKeyRef.current));
                const fresh = page.items.filter((item) => !seen.has(getItemKeyRef.current(item)));
                return { ...previous, items: [...previous.items, ...fresh], cursor: page.nextCursor, status: STATUS.idle };
            }))
            .catch((error) => {
                if (isCancelled(error)) return;
                toast.error(getErrorMessage(error, "Couldn't load more. Please try again."));
                setList((previous) => (previous.key === key ? { ...previous, status: STATUS.loadMoreError } : previous));
            });
    }, [key, list.cursor, list.status, fetchRef, getItemKeyRef]);

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
        loadMoreFailed: list.status === STATUS.loadMoreError,
        error: list.error,
        hasMore: Boolean(list.cursor),
        loadMore,
        reload,
    };
};

import { useEffect, useRef } from "react";

import { useLatest } from "@/hooks/useLatest";

// Starts loading a bit before the end of the list is reached.
const PRELOAD_MARGIN = "600px";

// Returns a ref for an element at the end of a list; `onReach` runs when it scrolls into view.
export const useInfiniteScroll = (onReach, enabled) => {
    const sentinelRef = useRef(null);
    const onReachRef = useLatest(onReach);

    useEffect(() => {
        const sentinel = sentinelRef.current;
        if (!sentinel || !enabled) return undefined;
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) onReachRef.current();
        }, { rootMargin: PRELOAD_MARGIN });
        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [enabled, onReachRef]);

    return sentinelRef;
};

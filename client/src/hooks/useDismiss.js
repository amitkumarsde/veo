import { useEffect } from "react";

import { useLatest } from "@/hooks/useLatest";

// While `isOpen`, a click or keyboard focus outside `ref`, or the Esc key, calls `onDismiss(event)`.
export const useDismiss = (ref, isOpen, onDismiss) => {
    const onDismissRef = useLatest(onDismiss);

    useEffect(() => {
        if (!isOpen) return undefined;
        const onOutside = (event) => { if (!ref.current?.contains(event.target)) onDismissRef.current(event); };
        const onKeyDown = (event) => { if (event.key === "Escape") onDismissRef.current(event); };
        document.addEventListener("pointerdown", onOutside);
        document.addEventListener("focusin", onOutside);
        document.addEventListener("keydown", onKeyDown);
        return () => {
            document.removeEventListener("pointerdown", onOutside);
            document.removeEventListener("focusin", onOutside);
            document.removeEventListener("keydown", onKeyDown);
        };
    }, [ref, isOpen, onDismissRef]);
};

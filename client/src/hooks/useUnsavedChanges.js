import { useCallback, useEffect, useRef } from "react";
import { useBlocker } from "react-router";

import { useConfirm } from "@/features/confirm/useConfirm";

// Asks before leaving a page with unsaved changes or a running upload; call `allowLeave()` after saving.
export const useUnsavedChanges = (hasUnsavedChanges) => {
    const confirm = useConfirm();
    const unsavedRef = useRef(hasUnsavedChanges);
    const allowedRef = useRef(false);
    useEffect(() => { unsavedRef.current = hasUnsavedChanges; }, [hasUnsavedChanges]);

    const blocker = useBlocker(({ currentLocation, nextLocation }) =>
        unsavedRef.current && !allowedRef.current && currentLocation.pathname !== nextLocation.pathname);

    useEffect(() => {
        if (blocker.state !== "blocked") return;
        confirm({ title: "Leave without saving?", message: "Your changes on this page will be lost.", confirmLabel: "Leave", danger: true })
            .then((leave) => (leave ? blocker.proceed() : blocker.reset()));
    }, [blocker, confirm]);

    useEffect(() => {
        const onBeforeUnload = (event) => {
            if (unsavedRef.current && !allowedRef.current) event.preventDefault();
        };
        window.addEventListener("beforeunload", onBeforeUnload);
        return () => window.removeEventListener("beforeunload", onBeforeUnload);
    }, []);

    return useCallback(() => { allowedRef.current = true; }, []);
};

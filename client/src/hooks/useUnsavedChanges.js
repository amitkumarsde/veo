import { useCallback, useEffect, useRef } from "react";
import { useBlocker } from "react-router";

import { useConfirm } from "@/features/confirm/useConfirm";

const DEFAULT_MESSAGE = "Your changes on this page will be lost.";

// Pages that would stop a navigation right now; lets actions like logout ask first.
const activeGuards = new Set();

// Asks before leaving a page with unsaved changes or a running upload; call `allowLeave()` after saving.
export const useUnsavedChanges = (hasUnsavedChanges, message = DEFAULT_MESSAGE) => {
    const confirm = useConfirm();
    const unsavedRef = useRef(hasUnsavedChanges);
    const messageRef = useRef(message);
    const allowedRef = useRef(false);
    useEffect(() => {
        unsavedRef.current = hasUnsavedChanges;
        messageRef.current = message;
    }, [hasUnsavedChanges, message]);

    useEffect(() => {
        const guard = {
            isBlocking: () => unsavedRef.current && !allowedRef.current,
            message: () => messageRef.current,
            allow: () => { allowedRef.current = true; },
        };
        activeGuards.add(guard);
        return () => activeGuards.delete(guard);
    }, []);

    const blocker = useBlocker(({ currentLocation, nextLocation }) =>
        unsavedRef.current && !allowedRef.current && currentLocation.pathname !== nextLocation.pathname);

    useEffect(() => {
        if (blocker.state !== "blocked") return;
        confirm({ title: "Leave without saving?", message: messageRef.current, confirmLabel: "Leave", danger: true })
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

// For actions that leave the page by themselves (like logout): asks once and resolves to true when it's fine to go on.
export const confirmLeavingUnsavedPage = async (confirm, confirmLabel) => {
    const blocking = [...activeGuards].filter((guard) => guard.isBlocking());
    if (!blocking.length) return true;
    const leave = await confirm({ title: "Leave without saving?", message: blocking[0].message(), confirmLabel, danger: true });
    if (leave) blocking.forEach((guard) => guard.allow());
    return leave;
};

import { useCallback, useEffect, useRef, useState } from "react";

import { uploadOptions } from "@/services/http";
import { clearLists } from "@/utils/list-cache";

const SENT_LEAVE_MESSAGE = "Your upload has already been sent and may still be saved if you leave now.";

// Runs one upload with progress; leaving the page cancels it.
export const useUploadTask = () => {
    const [progress, setProgress] = useState(null);
    const controllerRef = useRef(null);
    const isRunningRef = useRef(false);

    useEffect(() => () => {
        if (!isRunningRef.current) return;
        controllerRef.current?.abort();
        // The server may still save an upload that was fully sent, so lists load fresh next time.
        clearLists();
    }, []);

    const run = useCallback(async (upload) => {
        const controller = new AbortController();
        controllerRef.current = controller;
        isRunningRef.current = true;
        setProgress({ percent: 0, secondsLeft: null });
        try {
            return await upload(uploadOptions({ signal: controller.signal, onProgress: setProgress }));
        } finally {
            isRunningRef.current = false;
            if (!controller.signal.aborted) setProgress(null);
        }
    }, []);

    return {
        progress,
        isUploading: progress !== null,
        // For useUnsavedChanges: once everything is sent, leaving may no longer stop the save.
        leaveMessage: progress?.percent >= 100 ? SENT_LEAVE_MESSAGE : undefined,
        run,
    };
};

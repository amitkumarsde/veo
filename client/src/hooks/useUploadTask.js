import { useCallback, useEffect, useRef, useState } from "react";

import { uploadOptions } from "@/services/http";

// Runs one upload at a time with progress. Leaving the page cancels it, so nothing finishes (or redirects) unseen.
export const useUploadTask = () => {
    const [progress, setProgress] = useState(null);
    const controllerRef = useRef(null);

    useEffect(() => () => controllerRef.current?.abort(), []);

    const run = useCallback(async (upload) => {
        const controller = new AbortController();
        controllerRef.current = controller;
        setProgress({ percent: 0, secondsLeft: null });
        try {
            return await upload(uploadOptions({ signal: controller.signal, onProgress: setProgress }));
        } finally {
            if (!controller.signal.aborted) setProgress(null);
        }
    }, []);

    return { progress, isUploading: progress !== null, run };
};

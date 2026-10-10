import { useCallback, useRef, useState } from "react";
import { toast } from "react-toastify";

import { getErrorMessage } from "@/utils/errors";

// Shows a change at once and undoes it if saving fails; extra clicks while saving are ignored.
export const useOptimisticAction = () => {
    const pendingRef = useRef(false);
    const [isPending, setIsPending] = useState(false);

    const run = useCallback(async ({ apply, request, confirm, revert }) => {
        if (pendingRef.current) return;
        pendingRef.current = true;
        setIsPending(true);
        apply();
        try {
            confirm(await request());
        } catch (error) {
            revert();
            toast.error(getErrorMessage(error, "Couldn't save that. Please try again."));
        } finally {
            pendingRef.current = false;
            setIsPending(false);
        }
    }, []);

    return { run, isPending };
};

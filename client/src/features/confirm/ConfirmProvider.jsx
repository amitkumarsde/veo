import { useCallback, useEffect, useId, useRef, useState } from "react";

import { Button, TextButton } from "@/components/ui/Button";
import { ConfirmContext } from "@/features/confirm/ConfirmContext";

// One shared confirm dialog; the browser's <dialog> handles Esc, focus and the backdrop.
export const ConfirmProvider = ({ children }) => {
    const dialogRef = useRef(null);
    const resolveRef = useRef(null);
    const [options, setOptions] = useState(null);
    const titleId = useId();
    const messageId = useId();

    const confirm = useCallback((nextOptions) => new Promise((resolve) => {
        // A new question replaces an unanswered one, which then counts as "no".
        resolveRef.current?.(false);
        resolveRef.current = resolve;
        setOptions(nextOptions);
    }), []);

    useEffect(() => {
        if (options && !dialogRef.current.open) dialogRef.current.showModal();
    }, [options]);

    const answer = (confirmed) => {
        resolveRef.current?.(confirmed);
        resolveRef.current = null;
        dialogRef.current?.close();
        setOptions(null);
    };

    return (
        <ConfirmContext.Provider value={confirm}>
            {children}
            <dialog
                ref={dialogRef}
                aria-labelledby={titleId}
                aria-describedby={options?.message ? messageId : undefined}
                onCancel={(event) => { event.preventDefault(); answer(false); }}
                className="m-auto w-[min(92vw,26rem)] rounded-ui bg-surface p-0 text-fg shadow-2xl"
            >
                {options && (
                    <div className="p-7">
                        <h2 id={titleId} className="text-xl font-bold">{options.title}</h2>
                        {options.message && <p id={messageId} className="mt-2 text-[15px] leading-relaxed text-muted">{options.message}</p>}
                        <div className="mt-8 flex items-center justify-end gap-6">
                            <TextButton onClick={() => answer(false)} tone="fg">Cancel</TextButton>
                            <Button variant={options.danger ? "danger" : "primary"} size="sm" onClick={() => answer(true)} autoFocus>
                                {options.confirmLabel ?? "Confirm"}
                            </Button>
                        </div>
                    </div>
                )}
            </dialog>
        </ConfirmContext.Provider>
    );
};

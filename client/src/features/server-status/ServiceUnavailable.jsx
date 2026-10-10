import { useEffect, useRef } from "react";
import { CloudOff, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { SERVER_STATUS } from "@/features/server-status/server-status";
import { useServerStatus } from "@/features/server-status/useServerStatus";
import { useLatest } from "@/hooks/useLatest";

// Message for when the server can't be reached; we load the page again by ourselves once it answers.
const ServiceUnavailable = ({ onRetry }) => {
    const status = useServerStatus();
    const onRetryRef = useLatest(onRetry);
    // We only retry on a change to online, so a page that fails while the server is up can't loop.
    const wasOnlineRef = useRef(status === SERVER_STATUS.online);

    useEffect(() => {
        const isOnline = status === SERVER_STATUS.online;
        if (isOnline && !wasOnlineRef.current) onRetryRef.current?.();
        wasOnlineRef.current = isOnline;
    }, [status, onRetryRef]);

    return (
        <section role="alert" className="animate-rise mx-auto flex min-h-[55vh] max-w-lg flex-col items-center justify-center py-12 text-center">
            <CloudOff size={44} strokeWidth={1.5} className="text-accent" aria-hidden />
            <h1 className="mt-6 text-3xl font-bold text-fg sm:text-4xl">Veo is temporarily unavailable</h1>
            <p className="mt-3 text-[15px] leading-relaxed text-muted">
                We can't reach our server right now. It may be starting up or down for maintenance.
                This page will load by itself as soon as it's back.
            </p>
            {onRetry && (
                <Button onClick={onRetry} className="mt-8">
                    <RefreshCw size={16} aria-hidden /> Try again
                </Button>
            )}
        </section>
    );
};

export default ServiceUnavailable;

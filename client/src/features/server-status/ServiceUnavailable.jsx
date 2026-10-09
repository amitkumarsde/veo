import { CloudOff, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/Button";

// The standard message when the API can't be reached (server stopped, asleep too long, or down for maintenance).
const ServiceUnavailable = ({ onRetry }) => (
    <section role="alert" className="animate-rise mx-auto flex min-h-[55vh] max-w-lg flex-col items-center justify-center py-12 text-center">
        <CloudOff size={44} strokeWidth={1.5} className="text-accent" aria-hidden />
        <h1 className="mt-6 text-3xl font-bold text-fg sm:text-4xl">Veo is temporarily unavailable</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-muted">
            We can't reach our server right now. It may be starting up or down for maintenance.
            Please try again in a few minutes.
        </p>
        {onRetry && (
            <Button onClick={onRetry} className="mt-8">
                <RefreshCw size={16} aria-hidden /> Try again
            </Button>
        )}
    </section>
);

export default ServiceUnavailable;

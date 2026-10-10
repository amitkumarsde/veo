import IndeterminateBar from "@/components/common/IndeterminateBar";
import { TextButton } from "@/components/ui/Button";
import ServiceUnavailable from "@/features/server-status/ServiceUnavailable";
import { isNotFound, isServerUnreachable } from "@/utils/errors";

export const Spinner = ({ label = "Loading" }) => (
    <div role="status" className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-muted">
        <IndeterminateBar className="w-32 bg-surface-3" />
        <p className="text-sm">{label}…</p>
    </div>
);

export const ErrorState = ({ title = "Something went wrong", message, action }) => (
    <div role="alert" className="flex min-h-[50vh] flex-col items-center justify-center text-center">
        <p aria-hidden className="font-display text-6xl font-extrabold text-accent">!</p>
        <h1 className="mt-4 text-2xl font-bold text-fg">{title}</h1>
        {message && <p className="mt-2 max-w-sm text-[15px] text-muted">{message}</p>}
        {action && <div className="mt-6">{action}</div>}
    </div>
);

export const EmptyState = ({ title, message, action }) => (
    <div className="col-span-full flex flex-col items-center py-20 text-center">
        <p className="text-lg font-semibold text-fg">{title}</p>
        {message && <p className="mt-1.5 max-w-sm text-[15px] text-muted">{message}</p>}
        {action && <div className="mt-5">{action}</div>}
    </div>
);

// Placeholder shaped like a video card.
export const CardSkeleton = () => (
    <div aria-hidden>
        <div className="shimmer aspect-video w-full rounded-ui" />
        <div className="shimmer mt-3 h-4 w-11/12 rounded-sm" />
        <div className="shimmer mt-2 h-3.5 w-1/2 rounded-sm" />
    </div>
);

// Picks the right screen for a failed load: server down, not found, or a general error.
export const LoadErrorState = ({ error, onRetry, title, notFoundTitle, notFoundMessage, notFoundAction }) => {
    if (isServerUnreachable(error)) return <ServiceUnavailable onRetry={onRetry} />;
    if (isNotFound(error) && notFoundTitle) return <ErrorState title={notFoundTitle} message={notFoundMessage} action={notFoundAction} />;
    return (
        <ErrorState
            title={title}
            message="Please try again in a moment."
            action={onRetry && <TextButton tone="accent" onClick={onRetry}>Try again</TextButton>}
        />
    );
};

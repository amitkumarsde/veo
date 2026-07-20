// Reusable loading / error / empty presentational states.

import { FaCircleExclamation, FaVideoSlash } from "react-icons/fa6";

// Branded ring spinner.
const Ring = ({ className = "h-8 w-8" }) => (
    <span className={`${className} animate-spin rounded-full border-2 border-border border-t-accent`} />
);

export const Spinner = ({ label = "Loading" }) => (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-muted">
        <Ring />
        <p className="text-sm">{label}…</p>
    </div>
);

export const ErrorState = ({ message = "Something went wrong." }) => (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-accent-soft text-2xl text-accent">
            <FaCircleExclamation />
        </span>
        <p className="max-w-sm text-sm text-muted">{message}</p>
    </div>
);

export const EmptyState = ({ icon, message = "Nothing to show here." }) => {
    const Icon = icon || FaVideoSlash;
    return (
        <div className="col-span-full flex flex-col items-center justify-center gap-4 py-20 text-center">
            <span className="grid h-14 w-14 place-items-center rounded-2xl border border-border bg-surface-2 text-2xl text-faint">
                <Icon />
            </span>
            <p className="max-w-sm text-sm text-muted">{message}</p>
        </div>
    );
};

// Skeleton placeholder shaped like a video card, shown while data loads.
export const CardSkeleton = () => (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        <div className="aspect-video w-full shimmer" />
        <div className="flex gap-3 p-3">
            <div className="h-9 w-9 shrink-0 rounded-full shimmer" />
            <div className="flex-1 space-y-2">
                <div className="h-3.5 w-full rounded shimmer" />
                <div className="h-3 w-2/3 rounded shimmer" />
                <div className="h-3 w-1/2 rounded shimmer" />
            </div>
        </div>
    </div>
);

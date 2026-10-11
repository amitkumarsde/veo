import IndeterminateBar from "@/components/common/IndeterminateBar";
import { SERVER_STATUS } from "@/features/server-status/server-status";
import { useServerStatus } from "@/features/server-status/useServerStatus";

// Thin bar under the header while the server is slow to answer, e.g. while it starts.
const ServerWakeNotice = () => {
    if (useServerStatus() !== SERVER_STATUS.waking) return null;

    return (
        <div role="status" className="fixed inset-x-0 top-16 z-40 border-b border-border bg-surface">
            <IndeterminateBar className="bg-surface-3" />
            <p className="mx-auto max-w-[1440px] px-4 py-2.5 text-center text-[13px] text-muted sm:px-8">
                Starting the server… the first visit can take up to a minute.
            </p>
        </div>
    );
};

export default ServerWakeNotice;

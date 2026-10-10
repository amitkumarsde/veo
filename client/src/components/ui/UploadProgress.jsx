import IndeterminateBar from "@/components/common/IndeterminateBar";
import { formatTimeLeft } from "@/utils/format";

// Upload progress line, then "Finishing up…" while the server saves the files.
const UploadProgress = ({ progress }) => {
    if (!progress) return null;
    const isSent = progress.percent >= 100;
    const timeLeft = formatTimeLeft(progress.secondsLeft);

    return (
        <div role="status" className="w-full space-y-2">
            {isSent ? (
                <IndeterminateBar className="w-full bg-surface-3" />
            ) : (
                <div className="relative h-0.5 w-full overflow-hidden bg-surface-3">
                    <span className="absolute inset-y-0 left-0 bg-accent transition-[width]" style={{ width: `${progress.percent}%` }} />
                </div>
            )}
            <p className="text-[13px] text-muted">
                {isSent ? "Finishing up…" : `Uploading ${progress.percent}%`}
                {!isSent && timeLeft && <span className="text-faint"> · {timeLeft}</span>}
            </p>
        </div>
    );
};

export default UploadProgress;

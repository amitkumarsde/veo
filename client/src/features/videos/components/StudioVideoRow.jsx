import { useState } from "react";
import { Link } from "react-router";
import { toast } from "react-toastify";

import { TextButton } from "@/components/ui/Button";
import { useConfirm } from "@/features/confirm/useConfirm";
import { deleteVideo } from "@/services/video.service";
import { getErrorMessage } from "@/utils/errors";
import { countLabel, timeAgo } from "@/utils/format";

const ROW_GRID = "grid grid-cols-[6.5rem_minmax(0,1fr)] gap-x-4 sm:gap-x-5 md:grid-cols-[8rem_minmax(0,1fr)_8rem]";

// One video in the studio table: thumbnail, title, numbers, Edit / Delete.
const StudioVideoRow = ({ video, onDeleted }) => {
    const confirm = useConfirm();
    const [isDeleting, setIsDeleting] = useState(false);
    const videoPath = `/video/${video.videoId}`;
    const editPath = `/update-video/${video.videoId}`;

    const handleDelete = async () => {
        const confirmed = await confirm({
            title: `Delete “${video.title}”?`,
            message: "Its comments and likes go too. This can't be undone.",
            confirmLabel: "Delete video",
            danger: true,
        });
        if (!confirmed) return;
        setIsDeleting(true);
        try {
            await deleteVideo(video.videoId);
            toast.success("Video deleted");
            onDeleted(video);
        } catch (error) {
            toast.error(getErrorMessage(error, "Couldn't delete the video."));
            setIsDeleting(false);
        }
    };

    const actions = (className) => (
        <div className={className}>
            <TextButton as={Link} to={editPath}>Edit</TextButton>
            <TextButton onClick={handleDelete} disabled={isDeleting} tone="danger">{isDeleting ? "Deleting…" : "Delete"}</TextButton>
        </div>
    );

    return (
        <div className={`${ROW_GRID} items-center py-5 ${isDeleting ? "opacity-50" : ""}`}>
            <Link to={videoPath} tabIndex={-1} aria-hidden className="block overflow-hidden rounded-ui bg-surface-2">
                <img src={video.thumbnailUrl} alt="" loading="lazy" decoding="async" className="aspect-video w-full object-cover" />
            </Link>
            <div className="min-w-0">
                <Link to={videoPath} className="line-clamp-2 text-[15px] font-semibold leading-snug text-fg transition-colors hover:text-accent">{video.title}</Link>
                <p className="mt-1 text-[13px] text-muted">
                    {timeAgo(video.uploadDate)} · {countLabel(video.views, "view")} · {countLabel(video.likes, "like")} · {countLabel(video.commentCount, "comment")}
                </p>
                {actions("mt-2 flex gap-5 md:hidden")}
            </div>
            {actions("hidden justify-end gap-5 md:flex")}
        </div>
    );
};

export default StudioVideoRow;

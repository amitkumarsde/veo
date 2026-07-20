import { Link } from "react-router-dom";
import { formatDistanceToNowStrict } from "date-fns";

import { formatCount } from "@/lib/format";
import { useChannel } from "@/hooks/useChannel";

// Horizontal card used in the video player's "Up next" sidebar.
const RelatedVideoCard = ({ video }) => {

    const channel = useChannel(video.channelId);

    return (
        <Link
            to={`/video/${video.videoId}`}
            className="group flex gap-3 rounded-2xl border border-transparent p-2 transition hover:border-border hover:bg-accent-soft"
        >
            <div className="relative aspect-video w-40 shrink-0 overflow-hidden rounded-xl bg-surface-2">
                <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <span className="absolute bottom-1 right-1 rounded bg-black/70 px-1 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
                    {formatCount(video.views)} views
                </span>
            </div>
            <div className="min-w-0 flex-1">
                <h4 className="line-clamp-2 text-sm font-semibold leading-snug text-fg transition group-hover:text-accent">
                    {video.title}
                </h4>
                <p className="mt-1 truncate text-xs text-muted">{channel?.channelName || video.channelId}</p>
                <p className="text-xs text-faint">
                    {formatDistanceToNowStrict(new Date(video.uploadDate))} ago
                </p>
            </div>
        </Link>
    );

};

export default RelatedVideoCard;

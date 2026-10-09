import { Link } from "react-router";

import { countLabel, timeAgo } from "@/utils/format";

// Compact row for the "Up next" list.
const RelatedVideoCard = ({ video }) => (
    <Link to={`/video/${video.videoId}`} className="group grid grid-cols-[9.5rem_minmax(0,1fr)] gap-3.5">
        <div className="overflow-hidden rounded-ui bg-surface-2">
            <img src={video.thumbnailUrl} alt="" loading="lazy" decoding="async" className="aspect-video w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
        </div>
        <div className="min-w-0">
            <h3 className="line-clamp-2 font-sans text-sm font-semibold leading-snug tracking-normal text-fg transition-colors group-hover:text-accent">{video.title}</h3>
            <p className="mt-1 truncate text-[13px] text-muted">{video.channel?.channelName ?? video.channelId}</p>
            <p className="text-[13px] text-faint">{countLabel(video.views, "view")} · {timeAgo(video.uploadDate)}</p>
        </div>
    </Link>
);

export default RelatedVideoCard;

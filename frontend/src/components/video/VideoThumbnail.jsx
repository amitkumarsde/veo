import { Link } from "react-router-dom";
import { FaPlay } from "react-icons/fa6";

import { formatCount } from "@/lib/format";

// Clickable thumbnail with a hover play button and a view-count badge.
// Shared by the feed and channel cards; relies on a `group` class on the parent
// for its hover effects.
const VideoThumbnail = ({ video }) => (
    <Link to={`/video/${video.videoId}`} className="relative block overflow-hidden rounded-xl border border-border bg-surface-2">
        <img
            src={video.thumbnailUrl}
            alt={video.title}
            className="aspect-video w-full object-cover transition duration-500 group-hover:scale-[1.04]"
        />
        <span className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />
        <span className="absolute inset-0 flex items-center justify-center opacity-0 transition duration-300 group-hover:opacity-100">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-accent-gradient text-white shadow-lg glow">
                <FaPlay className="translate-x-px text-sm" />
            </span>
        </span>
        <span className="absolute bottom-2 right-2 rounded-md bg-black/70 px-1.5 py-0.5 text-[11px] font-medium text-white backdrop-blur-sm">
            {formatCount(video.views)} views
        </span>
    </Link>
);

export default VideoThumbnail;

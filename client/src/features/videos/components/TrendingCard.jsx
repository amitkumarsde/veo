import { Link } from "react-router";

import { preloadPage } from "@/app/page-loaders";
import VideoThumbnail from "@/features/videos/components/VideoThumbnail";
import { countLabel } from "@/utils/format";
import { videoPath } from "@/utils/paths";

// Ranked card for "Trending now": thumbnail, then a large outlined rank beside the title.
const TrendingCard = ({ video, rank }) => (
    <article className="group">
        <VideoThumbnail video={video} />
        <div className="mt-4 flex gap-4">
            <span aria-hidden className="text-outline font-display text-5xl font-extrabold leading-[0.85] tracking-[-0.05em] transition-colors group-hover:text-accent">
                {String(rank).padStart(2, "0")}
            </span>
            <div className="min-w-0">
                <h3 className="line-clamp-2 font-sans text-[15px] font-semibold leading-snug tracking-normal text-fg">
                    <Link to={videoPath(video.videoId)} onMouseEnter={preloadPage("video")} className="transition-colors hover:text-accent">{video.title}</Link>
                </h3>
                <p className="mt-1 truncate text-[13px] text-muted">
                    {video.channel?.channelName ?? video.channelId}<span aria-hidden className="mx-1.5 text-faint">·</span>{countLabel(video.views, "view")}
                </p>
            </div>
        </div>
    </article>
);

export default TrendingCard;

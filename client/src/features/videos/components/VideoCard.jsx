import { Link } from "react-router";

import { preloadPage } from "@/app/page-loaders";
import VideoThumbnail from "@/features/videos/components/VideoThumbnail";
import { countLabel, timeAgo } from "@/utils/format";

// Video in a grid: thumbnail, title, then channel · views · time.
const VideoCard = ({ video, showChannel = true }) => (
    <article className="group min-w-0">
        <VideoThumbnail video={video} />
        <h3 className="mt-3 line-clamp-2 font-sans text-[15px] font-semibold leading-snug tracking-normal text-fg">
            <Link to={`/video/${video.videoId}`} onMouseEnter={preloadPage("video")} className="transition-colors hover:text-accent">{video.title}</Link>
        </h3>
        <p className="mt-1 text-[13px] text-muted">
            {showChannel && (
                <>
                    <Link to={`/channel/${video.channelId}`} onMouseEnter={preloadPage("channel")} className="transition-colors hover:text-accent">
                        {video.channel?.channelName ?? video.channelId}
                    </Link>
                    <span aria-hidden className="mx-1.5 text-faint">·</span>
                </>
            )}
            {countLabel(video.views, "view")}<span aria-hidden className="mx-1.5 text-faint">·</span>{timeAgo(video.uploadDate)}
        </p>
    </article>
);

export default VideoCard;

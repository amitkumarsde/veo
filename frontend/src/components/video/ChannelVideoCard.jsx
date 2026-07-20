import { formatDistanceToNowStrict } from "date-fns";

import VideoThumbnail from "@/components/video/VideoThumbnail";

// Compact video card for a channel page (no channel row — the channel is
// already the page context).
const ChannelVideoCard = ({ video }) => {

    return (
        <article className="group rounded-2xl p-2 transition-colors duration-300 hover:bg-accent-soft">
            <VideoThumbnail video={video} />

            <div className="mt-3">
                <h4 className="line-clamp-2 text-sm font-semibold leading-snug text-fg transition group-hover:text-accent">
                    {video.title}
                </h4>
                <p className="mt-1 text-xs text-faint">
                    {formatDistanceToNowStrict(new Date(video.uploadDate))} ago
                </p>
            </div>
        </article>
    );

};

export default ChannelVideoCard;

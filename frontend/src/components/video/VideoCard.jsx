import { Link } from "react-router-dom";
import { formatDistanceToNowStrict } from "date-fns";

import VideoThumbnail from "@/components/video/VideoThumbnail";
import { useChannel } from "@/hooks/useChannel";

// Primary feed card (home grid): thumbnail, channel avatar, title and meta.
const VideoCard = ({ video }) => {

    const channel = useChannel(video.channelId);

    return (
        <article className="group rounded-2xl p-2 transition-colors duration-300 hover:bg-accent-soft">
            <VideoThumbnail video={video} />

            <div className="mt-3">
                <div className="flex gap-3">
                    <Link to={`/channel/${video.channelId}`} className="shrink-0">
                        <img
                            src={channel?.channelAvatarURL}
                            alt=""
                            className="h-9 w-9 rounded-full bg-surface-2 object-cover ring-1 ring-border"
                        />
                    </Link>
                    <h4 className="line-clamp-2 min-w-0 text-sm font-semibold leading-snug text-fg transition group-hover:text-accent">
                        {video.title}
                    </h4>
                </div>
                <div className="mt-2 flex items-center gap-1.5 pl-12 text-xs text-muted">
                    <span className="truncate">{channel?.channelName || video.channelId}</span>
                    <span className="text-faint">•</span>
                    <span className="shrink-0 text-faint">
                        {formatDistanceToNowStrict(new Date(video.uploadDate))} ago
                    </span>
                </div>
            </div>
        </article>
    );

};

export default VideoCard;

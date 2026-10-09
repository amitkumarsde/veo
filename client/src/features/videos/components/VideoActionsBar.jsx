import { Link } from "react-router";
import { Pencil, ThumbsUp } from "lucide-react";

import { Button, TextButton } from "@/components/ui/Button";
import Avatar from "@/components/ui/Avatar";
import ShareMenu from "@/features/videos/components/ShareMenu";
import { formatCount, pluralize } from "@/utils/format";

// Channel and Subscribe (or Edit for the owner) on one side; Like and Share on the other.
const VideoActionsBar = ({ video, isOwner, engagement }) => {
    const channelName = video.channel?.channelName ?? video.channelId;
    const channelPath = `/channel/${video.channelId}`;

    return (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-6 border-b border-border pb-6">
            <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-3">
                <Link to={channelPath} aria-hidden tabIndex={-1}>
                    <Avatar src={video.channel?.channelAvatarURL} name={channelName} className="h-11 w-11 rounded-ui text-sm" />
                </Link>
                <div className="min-w-0">
                    <Link to={channelPath} className="block truncate font-semibold text-fg transition-colors hover:text-accent">{channelName}</Link>
                    <p className="text-[13px] text-muted">{pluralize(video.channel?.subscribers ?? 0, "subscriber")}</p>
                </div>
                {isOwner ? (
                    <TextButton as={Link} to={`/update-video/${video.videoId}`} tone="accent" className="sm:ml-3"><Pencil size={16} aria-hidden /> Edit video</TextButton>
                ) : video.subscribed ? (
                    <TextButton onClick={engagement.toggleSubscription} disabled={engagement.isSubscriptionPending} tone="fg" className="sm:ml-3">Subscribed</TextButton>
                ) : (
                    <Button size="sm" onClick={engagement.toggleSubscription} disabled={engagement.isSubscriptionPending} className="sm:ml-3">Subscribe</Button>
                )}
            </div>
            <div className="flex items-center gap-7">
                <TextButton
                    onClick={engagement.toggleLike}
                    aria-pressed={Boolean(video.liked)}
                    aria-label={`Like (${formatCount(video.likes)})`}
                    active={video.liked}
                    tone="fg"
                    disabled={engagement.isLikePending}
                >
                    <ThumbsUp size={18} fill={video.liked ? "currentColor" : "none"} aria-hidden /> {formatCount(video.likes)}
                </TextButton>
                <ShareMenu title={video.title} />
            </div>
        </div>
    );
};

export default VideoActionsBar;

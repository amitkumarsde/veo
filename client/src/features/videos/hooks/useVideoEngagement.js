import { toast } from "react-toastify";

import { nextSubscriberCount, useSubscriptionToggle } from "@/features/channels/hooks/useSubscriptionToggle";
import { useOptimisticAction } from "@/hooks/useOptimisticAction";
import { setLike } from "@/services/video.service";

// Like and Subscribe on the video page. Each updates at once and only undoes its own change if saving fails.
export const useVideoEngagement = ({ video, updateVideo, isSignedIn }) => {
    const like = useOptimisticAction();

    const applyLike = ({ liked, likes, delta = 0 }) =>
        updateVideo((current) => ({ ...current, liked, likes: likes ?? Math.max(0, (current.likes ?? 0) + delta) }));

    const toggleLike = () => {
        if (!isSignedIn) {
            toast.info("Sign in to like videos.");
            return;
        }
        const liked = !video.liked;
        like.run({
            apply: () => applyLike({ liked, delta: liked ? 1 : -1 }),
            request: () => setLike(video.videoId, liked),
            confirm: (result) => applyLike(result),
            revert: () => applyLike({ liked: !liked, delta: liked ? -1 : 1 }),
        });
    };

    const { toggleSubscription, isSubscriptionPending } = useSubscriptionToggle({
        channelId: video?.channelId,
        isSubscribed: Boolean(video?.subscribed),
        isSignedIn,
        applySubscription: (change) => updateVideo((current) => ({
            ...current,
            subscribed: change.subscribed,
            channel: current.channel && { ...current.channel, subscribers: nextSubscriberCount(current.channel.subscribers, change) },
        })),
    });

    return { toggleLike, isLikePending: like.isPending, toggleSubscription, isSubscriptionPending };
};

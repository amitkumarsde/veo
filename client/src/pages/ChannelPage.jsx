import { useCallback, useState } from "react";
import { Link, useParams } from "react-router";
import { Settings2 } from "lucide-react";

import { EmptyState, LoadErrorState, Spinner } from "@/components/common/States";
import { Button, TextButton } from "@/components/ui/Button";
import TextTabs from "@/components/ui/TextTabs";
import { DEFAULT_SORT, VIDEO_SORT_OPTIONS } from "@/constants/sort-options";
import { useAuth } from "@/features/auth/useAuth";
import ChannelHeader from "@/features/channels/components/ChannelHeader";
import { nextSubscriberCount, useSubscriptionToggle } from "@/features/channels/hooks/useSubscriptionToggle";
import VideoGrid from "@/features/videos/components/VideoGrid";
import { usePagedVideos } from "@/features/videos/hooks/usePagedVideos";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useResource } from "@/hooks/useResource";
import { getChannel } from "@/services/channel.service";
import { listVideos } from "@/services/video.service";

const PAGE_SIZE = 24;

const ChannelPage = () => {
    const { channelId } = useParams();
    const { user } = useAuth();
    const [sort, setSort] = useState(DEFAULT_SORT);
    const { data: channel, error, loading, setData: setChannel, reload } = useResource((signal) => getChannel(channelId, signal), channelId);
    const { toggleSubscription, isSubscriptionPending } = useSubscriptionToggle({
        channelId,
        isSubscribed: Boolean(channel?.subscribed),
        isSignedIn: Boolean(user),
        applySubscription: (change) => setChannel((current) => ({
            ...current,
            subscribed: change.subscribed,
            subscribers: nextSubscriberCount(current.subscribers, change),
        })),
    });
    useDocumentTitle(channel?.channelName);

    const fetchPage = useCallback(({ cursor, signal }) => listVideos({ channelId, sort, cursor, limit: PAGE_SIZE }, signal), [channelId, sort]);
    const videos = usePagedVideos(fetchPage, `channel|${channelId}|${sort}`);

    if (loading) return <Spinner label="Loading channel" />;
    if (error || !channel) {
        return (
            <LoadErrorState
                error={error}
                onRetry={reload}
                title="Couldn't load this channel"
                notFoundTitle="Channel not found"
                notFoundMessage="It may have been deleted."
                notFoundAction={<TextButton as={Link} to="/" tone="accent">Back to home</TextButton>}
            />
        );
    }

    const isOwner = user?.username === channel.owner;
    const actions = isOwner
        ? <TextButton as={Link} to="/studio" tone="accent"><Settings2 size={17} aria-hidden /> Manage channel</TextButton>
        : channel.subscribed
            ? <TextButton onClick={toggleSubscription} disabled={isSubscriptionPending} tone="fg">Subscribed</TextButton>
            : <Button onClick={toggleSubscription} disabled={isSubscriptionPending}>Subscribe</Button>;

    return (
        <div className="animate-rise">
            <ChannelHeader channel={channel} actions={actions} />

            <div className="mb-10 mt-14 flex flex-wrap items-end justify-between gap-x-6 border-b border-border">
                <h2 className="pb-2 text-xl font-bold text-fg">Videos</h2>
                <TextTabs options={VIDEO_SORT_OPTIONS} value={sort} onChange={setSort} label="Sort videos" />
            </div>

            {videos.error ? (
                <EmptyState title="Couldn't load the videos" action={<TextButton tone="accent" onClick={videos.reload}>Try again</TextButton>} />
            ) : (
                <VideoGrid
                    list={videos}
                    showChannel={false}
                    skeletonCount={4}
                    empty={<EmptyState title="No videos yet" message={isOwner ? "Your uploads will show up here." : "Check back soon."} />}
                />
            )}
        </div>
    );
};

export default ChannelPage;

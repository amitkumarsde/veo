import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { toast } from "react-toastify";
import { Plus } from "lucide-react";

import LoadMore from "@/components/common/LoadMore";
import { EmptyState, LoadErrorState, Spinner } from "@/components/common/States";
import { Button, TextButton } from "@/components/ui/Button";
import TextTabs from "@/components/ui/TextTabs";
import { DEFAULT_SORT, STUDIO_SORT_OPTIONS } from "@/constants/sort-options";
import { useAuth } from "@/features/auth/useAuth";
import ChannelHeader from "@/features/channels/components/ChannelHeader";
import ChannelStats from "@/features/channels/components/ChannelStats";
import { canCreateChannel, getUserChannels, pickChannel, removeUserChannel } from "@/features/channels/user-channels";
import { useConfirm } from "@/features/confirm/useConfirm";
import StudioVideoRow from "@/features/videos/components/StudioVideoRow";
import { usePagedVideos } from "@/features/videos/hooks/usePagedVideos";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useResource } from "@/hooks/useResource";
import { deleteChannel, getChannel } from "@/services/channel.service";
import { listVideos } from "@/services/video.service";
import { getErrorMessage, isNotFound } from "@/utils/errors";
import { pluralize } from "@/utils/format";
import { channelPath, editChannelPath, uploadPath } from "@/utils/paths";

const PAGE_SIZE = 25;

const CreateChannelPrompt = () => (
    <section className="animate-rise mx-auto max-w-xl py-16 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Studio</p>
        <h1 className="mt-4 text-4xl font-bold leading-tight text-fg sm:text-5xl">Start your channel</h1>
        <p className="mt-4 text-[15px] leading-relaxed text-muted">A channel is your home on Veo. Create one to upload videos and build an audience.</p>
        <Button as={Link} to="/create-channel" className="mt-8"><Plus size={18} aria-hidden /> Create channel</Button>
    </section>
);

const StudioVideos = ({ channelId, onVideoDeleted }) => {
    const [sort, setSort] = useState(DEFAULT_SORT);
    const fetchPage = useCallback(({ cursor, signal }) => listVideos({ channelId, sort, cursor, limit: PAGE_SIZE }, signal), [channelId, sort]);
    const videos = usePagedVideos(fetchPage, `studio|${channelId}|${sort}`);

    const handleDeleted = (deleted) => {
        videos.setItems((items) => items.filter((video) => video.videoId !== deleted.videoId));
        onVideoDeleted(deleted);
    };

    return (
        <>
            <div className="mt-14 flex flex-wrap items-end justify-between gap-x-6 border-b border-border">
                <h2 className="pb-2 text-xl font-bold text-fg">Videos</h2>
                <TextTabs options={STUDIO_SORT_OPTIONS} value={sort} onChange={setSort} label="Sort videos" />
            </div>

            {videos.loading ? (
                <p role="status" className="py-8 text-sm text-muted">Loading videos…</p>
            ) : videos.error ? (
                <EmptyState title="Couldn't load your videos" action={<TextButton tone="accent" onClick={videos.reload}>Try again</TextButton>} />
            ) : videos.items.length === 0 ? (
                <EmptyState
                    title="No videos yet"
                    message="Upload your first video to get started."
                    action={<TextButton as={Link} to={uploadPath(channelId)} tone="accent">Upload a video</TextButton>}
                />
            ) : (
                <div className="divide-y divide-border">
                    {videos.items.map((video) => <StudioVideoRow key={video.videoId} video={video} onDeleted={handleDeleted} />)}
                </div>
            )}
            <LoadMore hasMore={videos.hasMore} loading={videos.loadingMore} failed={videos.loadMoreFailed} onLoadMore={videos.loadMore} />
        </>
    );
};

// Switch between the account's channels, or start another one while under the limit.
const ChannelSwitcher = ({ channels, channelId, onChange, canCreate }) => (
    <div className="mb-10 flex flex-wrap items-end justify-between gap-x-6 border-b border-border">
        <TextTabs
            options={channels.map((channel) => ({ value: channel.channelId, label: channel.channelName ?? channel.channelId }))}
            value={channelId}
            onChange={onChange}
            label="Your channels"
            capitalize={false}
            className="min-w-0"
        />
        {canCreate && <TextButton as={Link} to="/create-channel" tone="accent" className="pb-2 text-sm"><Plus size={16} aria-hidden /> New channel</TextButton>}
    </div>
);

// Channel workspace: totals, edit or delete, and its videos; ?channel= picks the channel.
const StudioPage = () => {
    const { user, updateUser, refreshUser } = useAuth();
    const confirm = useConfirm();
    const [searchParams, setSearchParams] = useSearchParams();
    const channels = getUserChannels(user);
    const channelId = pickChannel(channels, searchParams.get("channel"))?.channelId;
    const { data: channel, error, loading, setData: setChannel, reload } = useResource((signal) => getChannel(channelId, signal), channelId ?? null);
    const [isDeleting, setIsDeleting] = useState(false);
    useDocumentTitle("Studio");

    // A channel deleted elsewhere is dropped here at once (opening the next one) and the account reloads in the background.
    const channelIsGone = isNotFound(error);
    useEffect(() => {
        if (!channelIsGone) return;
        updateUser((current) => removeUserChannel(current, channelId));
        refreshUser().catch(() => {});
    }, [channelIsGone, channelId, updateUser, refreshUser]);

    const handleDeleteChannel = async () => {
        const confirmed = await confirm({
            title: `Delete “${channel.channelName}”?`,
            message: `This also deletes its ${pluralize(channel.stats?.videos ?? 0, "video")}, their comments and likes. This can't be undone.`,
            confirmLabel: "Delete channel",
            danger: true,
        });
        if (!confirmed || isDeleting) return;
        setIsDeleting(true);
        try {
            await deleteChannel(channelId);
            toast.success("Channel deleted");
            setSearchParams({}, { replace: true });
            updateUser((current) => removeUserChannel(current, channelId));
        } catch (deleteError) {
            toast.error(getErrorMessage(deleteError, "Couldn't delete the channel."));
        } finally {
            // The studio stays open on the next channel, so its Delete button must work again.
            setIsDeleting(false);
        }
    };

    const handleVideoDeleted = (deleted) => setChannel((current) => current && {
        ...current,
        stats: {
            videos: Math.max(0, current.stats.videos - 1),
            views: Math.max(0, current.stats.views - (deleted.views ?? 0)),
            likes: Math.max(0, current.stats.likes - (deleted.likes ?? 0)),
            comments: Math.max(0, current.stats.comments - (deleted.commentCount ?? 0)),
        },
    });

    if (!channelId) return <CreateChannelPrompt />;

    const switcher = (
        <ChannelSwitcher
            channels={channels}
            channelId={channelId}
            onChange={(nextChannelId) => setSearchParams({ channel: nextChannelId })}
            canCreate={canCreateChannel(user)}
        />
    );
    if (loading || channelIsGone) return <>{switcher}<Spinner label="Loading your studio" /></>;
    if (error || !channel) return <>{switcher}<LoadErrorState error={error} onRetry={reload} title="Couldn't load your studio" /></>;

    return (
        <div className="animate-rise">
            {switcher}
            <ChannelHeader
                channel={channel}
                eyebrow="Your studio"
                actions={(
                    <>
                        <TextButton as={Link} to={channelPath(channelId)}>View channel</TextButton>
                        <TextButton as={Link} to={editChannelPath(channelId)}>Update</TextButton>
                        <TextButton onClick={handleDeleteChannel} disabled={isDeleting} tone="danger">{isDeleting ? "Deleting…" : "Delete"}</TextButton>
                    </>
                )}
            />
            <ChannelStats channel={channel} />
            <StudioVideos channelId={channelId} onVideoDeleted={handleVideoDeleted} />
        </div>
    );
};

export default StudioPage;

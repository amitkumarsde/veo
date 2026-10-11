import { useCallback, useEffect } from "react";
import { Link, useParams } from "react-router";

import { LoadErrorState, Spinner } from "@/components/common/States";
import { TextButton } from "@/components/ui/Button";
import { useAuth } from "@/features/auth/useAuth";
import CommentSection from "@/features/comments/components/CommentSection";
import RelatedVideoCard from "@/features/videos/components/RelatedVideoCard";
import VideoActionsBar from "@/features/videos/components/VideoActionsBar";
import VideoDetails from "@/features/videos/components/VideoDetails";
import VideoPlayerFrame from "@/features/videos/components/VideoPlayerFrame";
import { useVideoEngagement } from "@/features/videos/hooks/useVideoEngagement";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useRefreshOnUserChange } from "@/hooks/useRefreshOnUserChange";
import { useResource } from "@/hooks/useResource";
import { getVideo, listRelatedVideos, recordView } from "@/services/video.service";

const UpNext = ({ videoId }) => {
    const related = useResource((signal) => listRelatedVideos(videoId, signal), videoId);
    const videos = related.data ?? [];

    return (
        <aside aria-labelledby="up-next-heading">
            <h2 id="up-next-heading" className="border-b border-border pb-3 text-lg font-bold text-fg">Up next</h2>
            {related.loading ? (
                <p role="status" className="pt-5 text-sm text-muted">Loading…</p>
            ) : videos.length === 0 ? (
                <p className="pt-5 text-sm text-muted">{related.error ? "Couldn't load related videos." : "Nothing related yet."}</p>
            ) : (
                <div className="space-y-5 pt-5">{videos.map((video) => <RelatedVideoCard key={video.videoId} video={video} />)}</div>
            )}
        </aside>
    );
};

const VideoView = ({ videoId }) => {
    const { user } = useAuth();
    const { data: video, error, loading, setData: setVideo, reload, refresh } = useResource((signal) => getVideo(videoId, signal), videoId);
    useRefreshOnUserChange(refresh);
    const engagement = useVideoEngagement({ video, updateVideo: setVideo, isLoggedIn: Boolean(user) });
    useDocumentTitle(video?.title);

    useEffect(() => { recordView(videoId); }, [videoId]);

    const changeCommentCount = useCallback(
        (delta) => setVideo((current) => current && { ...current, commentCount: Math.max(0, (current.commentCount ?? 0) + delta) }),
        [setVideo],
    );

    if (loading) return <Spinner label="Loading video" />;
    if (error || !video) {
        return (
            <LoadErrorState
                error={error}
                onRetry={reload}
                title="Couldn't load this video"
                notFoundTitle="Video not found"
                notFoundMessage="It may have been removed."
                notFoundAction={<TextButton as={Link} to="/" tone="accent">Back to home</TextButton>}
            />
        );
    }

    return (
        <div className="grid gap-12 xl:grid-cols-[minmax(0,1fr)_22rem] xl:gap-14">
            <article className="min-w-0">
                <VideoPlayerFrame video={video} />
                <h1 className="mt-7 break-words text-3xl font-bold leading-tight text-fg sm:text-4xl">{video.title}</h1>
                <VideoActionsBar video={video} isOwner={user?.username === video.uploader} engagement={engagement} />
                <VideoDetails key={video.videoId} video={video} />
                <CommentSection videoId={video.videoId} commentCount={video.commentCount} user={user} onCountChange={changeCommentCount} />
            </article>
            <UpNext videoId={videoId} />
        </div>
    );
};

// A fresh page per video, so a like, subscribe or comment still saving for the last video can't land on this one.
const VideoPage = () => {
    const { videoId } = useParams();
    return <VideoView key={videoId} videoId={videoId} />;
};

export default VideoPage;

import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { formatDistanceToNowStrict } from "date-fns";
import { toast } from "react-toastify";
import { FaThumbsUp, FaThumbsDown, FaLink, FaPaperPlane, FaUser } from "react-icons/fa6";
import { FaRegThumbsUp, FaRegThumbsDown, FaRegTrashCan } from "react-icons/fa6";

import api from "@/services/api";
import { useAuth } from "@/hooks/useAuth";
import RelatedVideoCard from "@/components/video/RelatedVideoCard";
import { Spinner, ErrorState } from "@/components/feedback/States";
import { formatCount, getYouTubeId } from "@/lib/format";
import { useChannel } from "@/hooks/useChannel";

const VideoPlayer = () => {

    const { videoId } = useParams();

    const { user } = useAuth();
    const [video, setVideo] = useState(null);
    const [videos, setVideos] = useState([]);
    const [commentText, setCommentText] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Local interactive UI state (client-side only).
    const [reaction, setReaction] = useState(null); // "like" | "dislike" | null
    const [subscribed, setSubscribed] = useState(false);
    const [showDescription, setShowDescription] = useState(false);

    // Fetch Video by videoId. Reset per-video state first so navigating between
    // videos shows the spinner instead of the previous video's data/reactions.
    useEffect(() => {
        setLoading(true);
        setError(null);
        setReaction(null);
        setSubscribed(false);
        setShowDescription(false);
        const fetchVideo = async () => {
            try {
                const response = await api.get(`/videos/${videoId}`);
                setVideo(response.data);
            } catch (error) {
                toast.error(error.response?.data?.message || "Failed to fetch video..");
                setError("Failed to fetch video.");
            } finally {
                setLoading(false);
            }
        };
        fetchVideo();
    }, [videoId]);

    // Channel info, loaded once the video (and its channelId) is available.
    const channel = useChannel(video?.channelId);

    // Add a comment to the video.
    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!user) {
            toast.warn("Please login to add a comment.");
            return;
        }
        try {
            const response = await api.post('/videos/addComment', { videoId, commentText });
            toast.success(response.data?.message || "Comment added successfully..");
            const updatedVideo = await api.get(`/videos/${videoId}`);
            setVideo(updatedVideo.data);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to add comment..");
        } finally {
            setCommentText("");
        }
    };

    // Delete a comment from the video.
    const handleDeleteComment = async (commentId) => {
        try {
            const response = await api.delete('/videos/deleteComment', {
                data: { videoId, commentId }
            });
            toast.success(response.data?.message || "Comment deleted successfully..");
            const updatedVideo = await api.get(`/videos/${videoId}`);
            setVideo(updatedVideo.data);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to delete comment..");
        }
    };

    // Copy the current video link to the clipboard.
    const handleShare = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            toast.success("Link copied to clipboard!");
        } catch {
            toast.error("Could not copy link.");
        }
    };

    const handleReaction = (type) => setReaction(prev => (prev === type ? null : type));

    const handleSubscribe = () => {
        setSubscribed(prev => !prev);
        toast.success(subscribed ? "Unsubscribed" : "Subscribed!");
    };

    // Fetch all videos (for related list).
    useEffect(() => {
        const fetchVideos = async () => {
            try {
                const response = await api.get('/videos');
                setVideos(response.data);
            } catch {
                // Silently ignore the errors
            }
        };
        fetchVideos();
    }, []);

    // Other videos that share a category with the one being watched.
    const relatedVideos = useMemo(() => {
        if (!video) return [];
        return videos.filter((v) =>
            v.videoId !== videoId && v.category?.some((cat) => video.category?.includes(cat))
        );
    }, [video, videos, videoId]);

    if (loading) return <Spinner label="Loading video" />;
    if (error) return <ErrorState message={error} />;

    // Derive live like/dislike counts including the local reaction.
    const likeCount = (video.likes || 0) + (reaction === "like" ? 1 : 0);
    const dislikeCount = (video.dislikes || 0) + (reaction === "dislike" ? 1 : 0);

    const pill = "flex items-center gap-2 rounded-full border border-border bg-surface-2 px-4 py-2 text-sm font-medium text-fg transition hover:bg-surface-3";

    return (
        <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_400px]">
            {/* Main column */}
            <div className="min-w-0">
                <div className="overflow-hidden rounded-2xl border border-border bg-black shadow-2xl shadow-black/30">
                    <iframe
                        className="aspect-video w-full"
                        src={`https://www.youtube.com/embed/${getYouTubeId(video.videoUrl)}`}
                        title={video.title}
                        allow="autoplay; clipboard-write; encrypted-media; picture-in-picture"
                        allowFullScreen
                    ></iframe>
                </div>

                <h1 className="mt-5 font-display text-xl font-bold leading-snug text-fg sm:text-2xl">{video.title}</h1>

                {/* Channel row + action buttons */}
                <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <Link to={`/channel/${video.channelId}`}>
                            <img src={channel?.channelAvatarURL} alt="" className="h-11 w-11 rounded-full bg-surface-2 object-cover ring-1 ring-border" />
                        </Link>
                        <div className="min-w-0">
                            <Link to={`/channel/${video.channelId}`} className="block truncate font-semibold text-fg transition hover:text-accent">
                                {channel?.channelName || video.channelId}
                            </Link>
                            <p className="text-xs text-muted">{formatCount(channel?.subscribers)} subscribers</p>
                        </div>
                        <button
                            onClick={handleSubscribe}
                            className={`ml-2 rounded-full px-5 py-2 text-sm font-semibold transition ${
                                subscribed
                                    ? "border border-border bg-surface-2 text-fg hover:bg-surface-3"
                                    : "bg-accent-gradient text-white shadow-lg shadow-accent/25 hover:opacity-90"
                            }`}
                        >
                            {subscribed ? "Subscribed" : "Subscribe"}
                        </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <div className="flex items-center overflow-hidden rounded-full border border-border bg-surface-2">
                            <button
                                onClick={() => handleReaction("like")}
                                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition hover:bg-surface-3 ${reaction === "like" ? "text-accent" : "text-fg"}`}
                            >
                                {reaction === "like" ? <FaThumbsUp /> : <FaRegThumbsUp />}
                                {formatCount(likeCount)}
                            </button>
                            <span className="h-5 w-px bg-border" />
                            <button
                                onClick={() => handleReaction("dislike")}
                                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition hover:bg-surface-3 ${reaction === "dislike" ? "text-accent" : "text-fg"}`}
                            >
                                {reaction === "dislike" ? <FaThumbsDown className="-scale-x-100" /> : <FaRegThumbsDown className="-scale-x-100" />}
                                {formatCount(dislikeCount)}
                            </button>
                        </div>
                        <button onClick={handleShare} className={pill}>
                            <FaLink /> Copy link
                        </button>
                    </div>
                </div>

                {/* Description */}
                <div className="mt-5 rounded-2xl border border-border bg-surface p-4 text-sm">
                    <p className="font-semibold text-fg">
                        {formatCount(video.views)} views • {formatDistanceToNowStrict(new Date(video.uploadDate))} ago
                    </p>
                    <p className={`mt-2 whitespace-pre-line text-muted ${showDescription ? "" : "line-clamp-2"}`}>
                        {video.description}
                    </p>
                    <button
                        onClick={() => setShowDescription(prev => !prev)}
                        className="mt-2 text-sm font-semibold text-accent transition hover:opacity-80"
                    >
                        {showDescription ? "Show less" : "Show more"}
                    </button>
                </div>

                {/* Comments */}
                <div className="mt-8">
                    <h2 className="mb-4 font-display text-base font-semibold text-fg">{video.comments.length} Comments</h2>
                    <form onSubmit={handleAddComment} className="mb-6 flex items-center gap-3">
                        {user ? (
                            <img src={user.avatarURL} alt="" className="h-9 w-9 shrink-0 rounded-full bg-surface-2 object-cover ring-1 ring-border" />
                        ) : (
                            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-surface-2 text-muted ring-1 ring-border">
                                <FaUser className="text-sm" />
                            </span>
                        )}
                        <input
                            type="text"
                            placeholder="Add a comment…"
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            className="w-full rounded-full border border-border bg-surface-2/60 px-4 py-2 text-sm text-fg outline-none transition placeholder:text-faint focus:border-accent/60 focus:bg-surface"
                        />
                        <button
                            type="submit"
                            disabled={!commentText.trim()}
                            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent-gradient text-white shadow-lg shadow-accent/25 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
                        >
                            <FaPaperPlane className="text-sm" />
                        </button>
                    </form>

                    {video.comments.length === 0 ? (
                        <p className="text-sm text-muted">No comments yet. Be the first!</p>
                    ) : (
                        <div className="space-y-5">
                            {video.comments.map((comment) => (
                                <div key={comment.commentId} className="flex gap-3">
                                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent-soft text-sm font-bold uppercase text-accent">
                                        {comment.userId?.charAt(0)}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs text-faint">
                                            <span className="font-semibold text-fg">@{comment.userId}</span>{" "}
                                            • {formatDistanceToNowStrict(new Date(comment.timestamp))} ago
                                        </p>
                                        <p className="text-sm text-muted">
                                            {comment.text}{" "}
                                            {user && comment.userId === user.userId && (
                                                <button
                                                    onClick={() => handleDeleteComment(comment.commentId)}
                                                    className="ml-1 text-faint transition hover:text-red-500"
                                                    aria-label="Delete comment"
                                                >
                                                    <FaRegTrashCan className="text-sm" />
                                                </button>
                                            )}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Related videos */}
            <aside className="space-y-3">
                <h2 className="font-display text-base font-semibold text-fg">Up next</h2>
                {relatedVideos.length === 0 ? (
                    <p className="text-sm text-muted">No related videos found.</p>
                ) : (
                    relatedVideos.map((v) => <RelatedVideoCard key={v._id} video={v} />)
                )}
            </aside>
        </section>
    );

};

export default VideoPlayer;

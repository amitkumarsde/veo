import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";

import { fetchChannelWithVideos } from "@/services/channels";
import ChannelVideoCard from "@/components/video/ChannelVideoCard";
import { Spinner, ErrorState, EmptyState } from "@/components/feedback/States";
import { formatCount } from "@/lib/format";

const Channel = () => {

    const { channelId } = useParams();

    const [channel, setChannel] = useState(null);
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [subscribed, setSubscribed] = useState(false);

    // Fetch channel and its videos.
    useEffect(() => {
        const loadChannel = async () => {
            try {
                const { channel, videos } = await fetchChannelWithVideos(channelId);
                setChannel(channel);
                setVideos(videos);
            } catch (error) {
                toast.error(error.response?.data?.message || "Failed to fetch channel..");
                setError("Failed to fetch channel.");
            } finally {
                setLoading(false);
            }
        };
        loadChannel();
    }, [channelId]);

    if (loading) return <Spinner label="Loading channel" />;
    if (error) return <ErrorState message={error} />;

    return (
        <section className="animate-fade-up">
            {/* Banner */}
            <div className="relative overflow-hidden rounded-3xl border border-border">
                <img src={channel.channelBannerURL} alt="Channel banner" className="h-36 w-full bg-surface-2 object-cover sm:h-56" />
                <div className="absolute inset-0 bg-gradient-to-t from-canvas/90 via-canvas/20 to-transparent" />
            </div>

            {/* Info */}
            <div className="relative z-10 -mt-12 flex flex-col items-center gap-5 px-2 sm:-mt-16 sm:flex-row sm:items-end">
                <img
                    src={channel.channelAvatarURL}
                    alt=""
                    className="h-28 w-28 rounded-3xl bg-surface-2 object-cover ring-4 ring-canvas sm:h-32 sm:w-32"
                />
                <div className="flex-1 text-center sm:pb-1 sm:text-left">
                    <h1 className="font-display text-2xl font-bold tracking-tight text-fg sm:text-3xl">{channel.channelName}</h1>
                    <p className="mt-1.5 text-sm text-muted">
                        <span className="font-medium text-fg">@{channel.owner}</span>{" "}
                        • {formatCount(channel.subscribers)} subscribers • {channel.videos?.length || 0} videos
                    </p>
                    <p className="mx-auto mt-2 max-w-2xl text-sm text-muted sm:mx-0">{channel.description}</p>
                </div>
                <button
                    onClick={() => setSubscribed(prev => !prev)}
                    className={`rounded-full px-6 py-2.5 text-sm font-semibold transition sm:mb-1 ${
                        subscribed
                            ? "border border-border bg-surface-2 text-fg hover:bg-surface-3"
                            : "bg-accent-gradient text-white shadow-lg shadow-accent/25 hover:opacity-90"
                    }`}
                >
                    {subscribed ? "Subscribed" : "Subscribe"}
                </button>
            </div>

            {/* Section heading */}
            <div className="mt-8 flex items-baseline gap-3 border-b border-border pb-3">
                <h2 className="font-display text-lg font-semibold text-fg">Videos</h2>
                <span className="text-xs text-faint">{channel.videos?.length || 0}</span>
            </div>

            {/* Videos */}
            <div className="grid grid-cols-1 gap-x-4 gap-y-8 pt-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {videos.length === 0 ? (
                    <EmptyState message="No videos uploaded on this channel." />
                ) : (
                    videos.map(video => <ChannelVideoCard key={video._id} video={video} />)
                )}
            </div>
        </section>
    );

};

export default Channel;

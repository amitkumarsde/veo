import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { formatDistanceToNowStrict } from "date-fns";
import { toast } from "react-toastify";
import { FaPlay, FaMagnifyingGlass, FaChevronLeft, FaChevronRight } from "react-icons/fa6";

import api from "@/services/api";
import VideoCard from "@/components/video/VideoCard";
import { CardSkeleton, ErrorState, EmptyState } from "@/components/feedback/States";
import { useSearch } from "@/hooks/useSearch";
import { formatCount } from "@/lib/format";

const Home = () => {

    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchCategory, setSearchCategory] = useState("all");
    const [heroIndex, setHeroIndex] = useState(0);
    const { searchText, setSearchText } = useSearch();

    // Fetch all videos.
    useEffect(() => {
        const fetchVideos = async () => {
            try {
                const response = await api.get(`/videos`);
                setVideos(response.data);
            } catch (error) {
                toast.error(error.response?.data?.message || "Failed to fetch videos..");
                setError("Failed to fetch videos.");
            } finally {
                setLoading(false);
            }
        };
        fetchVideos();
    }, []);

    // Extract unique categories.
    const videoCategories = useMemo(() => [
        "all", ...new Set(videos.flatMap(video => video?.category || []).filter(Boolean))
    ], [videos]);

    // Videos matching the current search text and selected category.
    const homeVideos = useMemo(() => {
        const query = searchText.toLowerCase();
        return videos.filter(video => {
            const matchesSearch =
                video?.title?.toLowerCase().includes(query) ||
                video?.uploader?.toLowerCase().includes(query);
            const matchesCategory = searchCategory === "all" || video?.category?.includes(searchCategory);
            return matchesSearch && matchesCategory;
        });
    }, [videos, searchText, searchCategory]);

    // Show a featured hero (top 3 videos) only on the default, unfiltered feed.
    const showHero = !loading && !searchText && searchCategory === "all" && homeVideos.length > 0;
    const heroVideos = showHero ? homeVideos.slice(0, 3) : [];
    const gridVideos = homeVideos;
    const activeHero = heroVideos.length ? heroIndex % heroVideos.length : 0;

    // Auto-advance the hero carousel every 3 seconds.
    useEffect(() => {
        if (heroVideos.length <= 1) return;
        const id = setInterval(() => setHeroIndex(i => (i + 1) % heroVideos.length), 3000);
        return () => clearInterval(id);
    }, [heroVideos.length]);

    if (error) return <ErrorState message={error} />;

    const goHero = (dir) => setHeroIndex(i => (i + dir + heroVideos.length) % heroVideos.length);

    return (
        <section className="-mt-6">
            {/* Category chips */}
            <nav className="no-scrollbar sticky top-15 z-20 -mx-4 flex gap-2 overflow-x-auto border-b border-border bg-canvas/80 px-4 py-3 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
                {videoCategories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => { setSearchCategory(cat); setSearchText(""); }}
                        className={`whitespace-nowrap rounded-full border px-4 py-1.5 text-sm font-medium capitalize transition ${
                            searchCategory === cat
                                ? "border-transparent bg-accent-gradient text-white shadow-md shadow-accent/25"
                                : "border-border bg-surface text-muted hover:border-border-strong hover:text-fg"
                        }`}
                    >
                        {cat}
                    </button>
                ))}
            </nav>

            {/* Featured hero — auto-advancing carousel of the top 3 videos */}
            {showHero && heroVideos.length > 0 && (
                <div className="animate-fade-up relative mt-6 overflow-hidden rounded-3xl border border-border glow">
                    <div className="relative h-64 sm:h-80 md:h-[28rem]">
                        {heroVideos.map((video, i) => (
                            <div
                                key={video._id || i}
                                className={`absolute inset-0 transition-opacity duration-700 ${
                                    i === activeHero ? "opacity-100" : "pointer-events-none opacity-0"
                                }`}
                                aria-hidden={i !== activeHero}
                            >
                                <img src={video.thumbnailUrl} alt={video.title} className="h-full w-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent" />
                                <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
                                <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10">
                                    <h1 className="line-clamp-2 max-w-2xl font-display text-2xl font-bold leading-tight text-white sm:text-4xl">
                                        {video.title}
                                    </h1>
                                    <p className="mt-2 hidden max-w-xl text-sm text-white/70 sm:line-clamp-2">{video.description}</p>
                                    <p className="mt-3 text-xs text-white/60">
                                        {formatCount(video.views)} views • {formatDistanceToNowStrict(new Date(video.uploadDate))} ago
                                    </p>
                                    <Link
                                        to={`/video/${video.videoId}`}
                                        className="mt-5 inline-flex items-center gap-2 rounded-full bg-accent-gradient px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-accent/30 transition hover:opacity-90"
                                    >
                                        <FaPlay className="translate-x-px" /> Watch now
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>

                    {heroVideos.length > 1 && (
                        <>
                            <button
                                onClick={() => goHero(-1)}
                                aria-label="Previous"
                                className="glass absolute left-3 top-1/2 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-border text-fg transition hover:bg-surface-2 sm:left-5"
                            >
                                <FaChevronLeft className="text-sm" />
                            </button>
                            <button
                                onClick={() => goHero(1)}
                                aria-label="Next"
                                className="glass absolute right-3 top-1/2 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-border text-fg transition hover:bg-surface-2 sm:right-5"
                            >
                                <FaChevronRight className="text-sm" />
                            </button>
                            <div className="absolute right-5 top-5 z-10 flex gap-1.5">
                                {heroVideos.map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setHeroIndex(i)}
                                        aria-label={`Go to slide ${i + 1}`}
                                        className={`h-1.5 rounded-full transition-all ${
                                            i === activeHero ? "w-6 bg-white" : "w-1.5 bg-white/50 hover:bg-white/80"
                                        }`}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* Section heading */}
            {!loading && gridVideos.length > 0 && (
                <div className="mt-8 flex items-baseline justify-between">
                    <h2 className="font-display text-lg font-semibold text-fg">
                        {searchText ? "Search results" : searchCategory !== "all" ? `#${searchCategory}` : "Recommended"}
                    </h2>
                    <span className="text-xs text-faint">{gridVideos.length} videos</span>
                </div>
            )}

            {/* Video grid */}
            <div className="grid grid-cols-1 gap-x-4 gap-y-8 pt-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {loading ? (
                    Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)
                ) : gridVideos.length === 0 ? (
                    <EmptyState icon={FaMagnifyingGlass} message="No videos match your search." />
                ) : (
                    gridVideos.map(video => <VideoCard key={video._id} video={video} />)
                )}
            </div>
        </section>
    );

};

export default Home;

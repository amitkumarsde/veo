import { useCallback } from "react";

import { CardSkeleton } from "@/components/common/States";
import TrendingCard from "@/features/videos/components/TrendingCard";
import { usePagedVideos } from "@/features/videos/hooks/usePagedVideos";
import { listVideos } from "@/services/video.service";

const TRENDING_COUNT = 4;
const MIN_TO_SHOW = 2;

// The most-watched videos. Hidden when there are too few to make a row, or when they fail to load.
const TrendingSection = () => {
    const fetchTrending = useCallback(({ signal }) => listVideos({ sort: "popular", limit: TRENDING_COUNT }, signal), []);
    const trending = usePagedVideos(fetchTrending, "home|trending");
    if (!trending.loading && trending.items.length < MIN_TO_SHOW) return null;

    const slots = trending.loading ? Array.from({ length: TRENDING_COUNT }, () => null) : trending.items;

    return (
        <section aria-labelledby="trending-heading" className="mt-12">
            <h2 id="trending-heading" className="mb-6 text-xs font-semibold uppercase tracking-[0.18em] text-accent">Trending now</h2>
            {/* Swipe sideways on phones; a 2- or 4-column grid on larger screens. */}
            <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory scroll-px-4 gap-5 overflow-x-auto px-4 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:gap-y-10 sm:overflow-visible sm:px-0 lg:grid-cols-4">
                {slots.map((video, index) => (
                    <div key={video?.videoId ?? index} className="w-[78%] shrink-0 snap-start sm:w-auto">
                        {video ? <TrendingCard video={video} rank={index + 1} /> : <CardSkeleton />}
                    </div>
                ))}
            </div>
        </section>
    );
};

export default TrendingSection;

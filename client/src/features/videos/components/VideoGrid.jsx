import LoadMore from "@/components/common/LoadMore";
import { CardSkeleton } from "@/components/common/States";
import VideoCard from "@/features/videos/components/VideoCard";

const SKELETON_COUNT = 8;

// Grid of video cards with placeholders while loading and `empty` when there are none.
const VideoGrid = ({ list, empty, showChannel = true, skeletonCount = SKELETON_COUNT }) => (
    <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {list.loading
            ? Array.from({ length: skeletonCount }, (_, index) => <CardSkeleton key={index} />)
            : list.items.length === 0
                ? empty
                : list.items.map((video) => <VideoCard key={video.videoId} video={video} showChannel={showChannel} />)}
        <LoadMore hasMore={list.hasMore} loading={list.loadingMore} failed={list.loadMoreFailed} onLoadMore={list.loadMore} />
    </div>
);

export default VideoGrid;

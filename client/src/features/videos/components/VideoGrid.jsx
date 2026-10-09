import LoadMore from "@/components/common/LoadMore";
import { CardSkeleton } from "@/components/common/States";
import VideoCard from "@/features/videos/components/VideoCard";

const SKELETON_COUNT = 8;

// Responsive grid of video cards for a paged list, with skeletons while loading and `empty` when there is nothing.
const VideoGrid = ({ list, empty, showChannel = true, skeletonCount = SKELETON_COUNT }) => (
    <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {list.loading
            ? Array.from({ length: skeletonCount }, (_, index) => <CardSkeleton key={index} />)
            : list.items.length === 0
                ? empty
                : list.items.map((video) => <VideoCard key={video.videoId} video={video} showChannel={showChannel} />)}
        <LoadMore hasMore={list.hasMore} loading={list.loadingMore} onLoadMore={list.loadMore} />
    </div>
);

export default VideoGrid;

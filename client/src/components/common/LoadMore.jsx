import { TextButton } from "@/components/ui/Button";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";

// End of a list: loads the next page when it comes into view; after a failed page only the button tries again.
const LoadMore = ({ hasMore, loading, failed = false, onLoadMore, label = "Show more" }) => {
    const sentinelRef = useInfiniteScroll(onLoadMore, hasMore && !loading && !failed);
    if (!hasMore) return null;

    return (
        <div ref={sentinelRef} className="col-span-full flex justify-center py-8">
            <TextButton onClick={onLoadMore} disabled={loading} tone="fg">{loading ? "Loading…" : failed ? "Try again" : label}</TextButton>
        </div>
    );
};

export default LoadMore;

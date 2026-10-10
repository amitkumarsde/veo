import { TextButton } from "@/components/ui/Button";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";

// End of a list: loads the next page when it scrolls into view, with a button as a backup.
const LoadMore = ({ hasMore, loading, onLoadMore, label = "Show more" }) => {
    const sentinelRef = useInfiniteScroll(onLoadMore, hasMore && !loading);
    if (!hasMore) return null;

    return (
        <div ref={sentinelRef} className="col-span-full flex justify-center py-8">
            <TextButton onClick={onLoadMore} disabled={loading} tone="fg">{loading ? "Loading…" : label}</TextButton>
        </div>
    );
};

export default LoadMore;

import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { ArrowRight, Upload } from "lucide-react";

import { EmptyState, LoadErrorState } from "@/components/common/States";
import { TextButton } from "@/components/ui/Button";
import TextTabs from "@/components/ui/TextTabs";
import { DEFAULT_SORT, VIDEO_SORT_OPTIONS } from "@/constants/sort-options";
import { useAuth } from "@/features/auth/useAuth";
import TrendingSection from "@/features/videos/components/TrendingSection";
import VideoGrid from "@/features/videos/components/VideoGrid";
import { usePagedVideos } from "@/features/videos/hooks/usePagedVideos";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { listCategories, listVideos } from "@/services/video.service";
import { getStatus } from "@/utils/errors";
import { greeting } from "@/utils/format";

const ALL_CATEGORIES = "all";
const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 300;
const todayLabel = () => new Date().toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" });

const HomeIntro = ({ user }) => (
    <>
        <header className="flex flex-wrap items-end justify-between gap-6">
            <div>
                <p className="text-sm text-muted">{todayLabel()}</p>
                <h1 className="mt-2 text-4xl font-bold leading-tight text-fg sm:text-5xl">
                    {user ? greeting(user.name || user.username) : <>Stories worth <span className="text-accent">watching.</span></>}
                </h1>
            </div>
            {user ? (
                <TextButton as={Link} to="/upload-video" tone="accent"><Upload size={17} aria-hidden /> Share a video</TextButton>
            ) : (
                <TextButton as={Link} to="/signup" tone="accent">Join Veo to like, comment and upload <ArrowRight size={17} aria-hidden /></TextButton>
            )}
        </header>
        <TrendingSection />
    </>
);

// Category chips are optional: if they fail to load the feed still works.
const useCategoryOptions = () => {
    const [categories, setCategories] = useState([]);
    useEffect(() => {
        const controller = new AbortController();
        listCategories(controller.signal).then(setCategories).catch(() => {});
        return () => controller.abort();
    }, []);
    return [{ value: ALL_CATEGORIES, label: "All" }, ...categories.map(({ name }) => ({ value: name, label: name }))];
};

const HomePage = () => {
    const { user } = useAuth();
    // Search, category and sort live in the URL, so results can be shared and Back works.
    const [searchParams, setSearchParams] = useSearchParams();
    const query = searchParams.get("q")?.trim() ?? "";
    const category = searchParams.get("category") || ALL_CATEGORIES;
    const sortParam = searchParams.get("sort");
    const sort = VIDEO_SORT_OPTIONS.some((option) => option.value === sortParam) ? sortParam : DEFAULT_SORT;
    const debouncedQuery = useDebouncedValue(query, SEARCH_DEBOUNCE_MS);
    const categoryOptions = useCategoryOptions();
    const isFiltered = Boolean(query) || category !== ALL_CATEGORIES;
    useDocumentTitle(query ? `“${query}”` : category !== ALL_CATEGORIES ? `#${category}` : null);

    const fetchPage = useCallback(({ cursor, signal }) => listVideos({
        q: debouncedQuery || undefined,
        category: category === ALL_CATEGORIES ? undefined : category,
        sort,
        cursor,
        limit: PAGE_SIZE,
    }, signal), [debouncedQuery, category, sort]);
    const videos = usePagedVideos(fetchPage, `home|${debouncedQuery}|${category}|${sort}`);

    const setParam = (name, value, defaultValue) => {
        const next = new URLSearchParams(searchParams);
        if (!value || value === defaultValue) next.delete(name);
        else next.set(name, value);
        setSearchParams(next);
    };
    const clearFilters = () => setSearchParams(new URLSearchParams());

    if (videos.error) {
        // A filter the server rejects (e.g. a hand-edited URL) would fail again, so "Try again" clears it instead.
        const retry = getStatus(videos.error) === 400 ? clearFilters : videos.reload;
        return <LoadErrorState error={videos.error} onRetry={retry} title="Couldn't load videos" />;
    }

    return (
        <div className="animate-rise">
            {query ? (
                <header>
                    <p className="text-sm text-muted">Search results for</p>
                    <h1 className="mt-1 break-words text-4xl font-bold text-fg sm:text-5xl">“{query}”</h1>
                </header>
            ) : !isFiltered && <HomeIntro user={user} />}

            <div className={`sticky top-16 z-20 -mx-4 mb-10 flex flex-col border-b border-border bg-canvas px-4 sm:-mx-8 sm:flex-row sm:items-end sm:justify-between sm:gap-8 sm:px-8 ${isFiltered && !query ? "" : "mt-14"}`}>
                <TextTabs options={categoryOptions} value={category} onChange={(value) => setParam("category", value, ALL_CATEGORIES)} label="Categories" className="min-w-0" />
                <TextTabs options={VIDEO_SORT_OPTIONS} value={sort} onChange={(value) => setParam("sort", value, DEFAULT_SORT)} label="Sort" className="shrink-0 border-t border-border sm:border-t-0" />
            </div>

            <VideoGrid
                list={videos}
                empty={(
                    <EmptyState
                        title={query ? `Nothing found for “${query}”` : "No videos here yet"}
                        message={isFiltered ? "Try a different word or category." : "Be the first to upload one."}
                        action={isFiltered && <TextButton tone="accent" onClick={clearFilters}>Clear filters</TextButton>}
                    />
                )}
            />
        </div>
    );
};

export default HomePage;

import { usePagedList } from "@/hooks/usePagedList";

const getVideoKey = (video) => video.videoId;

// A cursor-paged list of video cards; see usePagedList.
export const usePagedVideos = (fetchPage, key) => usePagedList(fetchPage, { key, getItemKey: getVideoKey });

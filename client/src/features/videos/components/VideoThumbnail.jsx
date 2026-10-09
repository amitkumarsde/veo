import { Link } from "react-router";

import { preloadPage } from "@/app/page-loaders";

// Thumbnail linking to the video. Hidden from screen readers because the title link next to it goes to the same place.
const VideoThumbnail = ({ video }) => (
    <Link
        to={`/video/${video.videoId}`}
        onMouseEnter={preloadPage("video")}
        tabIndex={-1}
        aria-hidden
        className="block overflow-hidden rounded-ui bg-surface-2"
    >
        <img
            src={video.thumbnailUrl}
            alt=""
            loading="lazy"
            decoding="async"
            className="aspect-video w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
    </Link>
);

export default VideoThumbnail;

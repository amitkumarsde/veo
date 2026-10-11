import { Link } from "react-router";

import { preloadPage } from "@/app/page-loaders";
import { videoPath } from "@/utils/paths";

// Thumbnail link to the video, hidden from screen readers because the title link goes to the same place.
const VideoThumbnail = ({ video }) => (
    <Link
        to={videoPath(video.videoId)}
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

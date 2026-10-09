import { useState } from "react";
import { Link } from "react-router";

import { TextButton } from "@/components/ui/Button";
import { countLabel, timeAgo } from "@/utils/format";

const LONG_DESCRIPTION_CHARS = 280;
const LONG_DESCRIPTION_LINES = 4;

const isLongText = (text = "") => text.length > LONG_DESCRIPTION_CHARS || text.split("\n").length > LONG_DESCRIPTION_LINES;

// Views, date, category links and the description (collapsed when long).
const VideoDetails = ({ video }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const isLong = isLongText(video.description);

    return (
        <div className="border-b border-border py-6">
            <p className="text-sm font-medium text-fg">
                {countLabel(video.views, "view")}<span aria-hidden className="mx-1.5 text-faint">·</span>{timeAgo(video.uploadDate)}
                {video.category?.map((category) => (
                    <Link key={category} to={`/?category=${encodeURIComponent(category)}`} className="ml-3 inline-block text-accent transition-colors hover:text-accent-hover">
                        #{category}
                    </Link>
                ))}
            </p>
            <p className={`mt-3 max-w-3xl whitespace-pre-line break-words text-[15px] leading-relaxed text-muted ${isLong && !isExpanded ? "line-clamp-3" : ""}`}>
                {video.description}
            </p>
            {isLong && (
                <TextButton onClick={() => setIsExpanded((expanded) => !expanded)} aria-expanded={isExpanded} tone="fg" className="mt-2">
                    {isExpanded ? "Show less" : "Show more"}
                </TextButton>
            )}
        </div>
    );
};

export default VideoDetails;

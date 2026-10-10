import { getPlayback } from "@/features/videos/playback";

// Plays files and direct links in a <video> tag, and YouTube links in the YouTube player.
const VideoPlayerFrame = ({ video }) => {
    const playback = getPlayback(video);

    return (
        <div className="overflow-hidden rounded-ui bg-black">
            {playback?.type === "file" ? (
                <video key={playback.src} className="aspect-video w-full" src={playback.src} poster={video.thumbnailUrl} controls playsInline preload="metadata" />
            ) : playback?.type === "embed" ? (
                <iframe
                    className="aspect-video w-full"
                    src={playback.src}
                    title={video.title}
                    allow="autoplay; clipboard-write; encrypted-media; picture-in-picture"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                />
            ) : (
                <div className="flex aspect-video w-full flex-col items-center justify-center gap-1 px-4 text-center text-white/70">
                    <p className="font-medium">This video can't be played.</p>
                    <p className="text-sm text-white/50">The link no longer works or isn't supported.</p>
                </div>
            )}
        </div>
    );
};

export default VideoPlayerFrame;

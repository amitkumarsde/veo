import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { formatDistanceToNowStrict } from "date-fns";
import { FaPen, FaTrash } from "react-icons/fa6";

import api from "@/services/api";
import { formatCount } from "@/lib/format";

// Video card for the owner's profile: adds update / delete controls.
const ProfileVideoCard = ({ video }) => {

    const navigate = useNavigate();

    const handleDeleteVideo = async () => {
        const confirmDelete = window.confirm("Are you sure you want to delete this video?");
        if (!confirmDelete) return;

        try {
            const response = await api.delete(`/videos/delete/${video.videoId}`);
            toast.success(response.data?.message || "Video deleted successfully..");
            navigate(`/channel/${video.channelId}`);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to delete video..");
        }
    };

    return (
        <article className="group overflow-hidden rounded-2xl border border-border bg-surface transition duration-300 hover:-translate-y-1 hover:border-accent/40 hover:bg-accent-soft hover:shadow-xl hover:shadow-black/20">
            <Link to={`/video/${video.videoId}`} className="relative block overflow-hidden">
                <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    className="aspect-video w-full bg-surface-2 object-cover transition duration-500 group-hover:scale-[1.04]"
                />
                <span className="absolute bottom-2 right-2 rounded-md bg-black/70 px-1.5 py-0.5 text-[11px] font-medium text-white backdrop-blur-sm">
                    {formatCount(video.views)} views
                </span>
            </Link>
            <div className="p-3">
                <h4 className="line-clamp-2 text-sm font-semibold leading-snug text-fg">{video.title}</h4>
                <p className="mt-1 text-xs text-faint">
                    {formatDistanceToNowStrict(new Date(video.uploadDate))} ago
                </p>
                <div className="mt-3 flex gap-2">
                    <Link
                        to={`/update-video/${video.videoId}`}
                        className="flex flex-1 items-center justify-center gap-2 rounded-full bg-surface-2 px-3 py-1.5 text-xs font-medium text-fg transition hover:bg-surface-3"
                    >
                        <FaPen /> Update
                    </Link>
                    <button
                        onClick={handleDeleteVideo}
                        className="flex flex-1 items-center justify-center gap-2 rounded-full bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-500 transition hover:bg-red-500/20 dark:text-red-400"
                    >
                        <FaTrash /> Delete
                    </button>
                </div>
            </div>
        </article>
    );

};

export default ProfileVideoCard;

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaArrowRightFromBracket, FaTrash, FaEye, FaPenToSquare, FaVideo, FaTv } from "react-icons/fa6";
import { FaRegCircleUser } from "react-icons/fa6";

import api from "@/services/api";
import { fetchChannelWithVideos } from "@/services/channels";
import { useAuth } from "@/hooks/useAuth";
import ProfileVideoCard from "@/components/video/ProfileVideoCard";
import { Spinner, ErrorState, EmptyState } from "@/components/feedback/States";

const Profile = () => {

    const { user, setUser } = useAuth();
    const [channel, setChannel] = useState(null);
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const navigate = useNavigate();

    // Fetch user's channel and its videos.
    useEffect(() => {
        if (!user?.channels?.length) {
            setLoading(false);
            return;
        }
        const loadProfile = async () => {
            try {
                const { channel, videos } = await fetchChannelWithVideos(user.channels[0]);
                setChannel(channel);
                setVideos(videos);
            } catch {
                toast.error("Oops! Something went wrong.");
                setError("Oops! Something went wrong.");
            } finally {
                setLoading(false);
            }
        };
        loadProfile();
    }, [user]);

    // Delete channel.
    const handleDeleteChannel = async () => {
        const confirmDelete = window.confirm("Are you sure you want to delete this channel?");
        if (!confirmDelete) return;
        try {
            const response = await api.delete(`/channels/delete/${user.channels[0]}`);
            toast.success(response.data?.message || "Channel deleted successfully..");
            localStorage.setItem("user", JSON.stringify(response.data?.user));
            setUser(response.data?.user);
            setChannel(null);
            setVideos([]);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to delete channel..");
        }
    };

    // Sign out.
    const handleSignOut = () => {
        setUser(null); setChannel(null); setVideos([]);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        toast.success("Signed out successfully..");
        navigate('/');
    };

    if (loading) return <Spinner label="Loading profile" />;
    if (error) return <ErrorState message={error} />;

    if (!user) return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
            <span className="grid h-16 w-16 place-items-center rounded-2xl border border-border bg-surface-2 text-3xl text-faint">
                <FaRegCircleUser />
            </span>
            <p className="text-muted">Please sign in to view your profile.</p>
            <Link to="/signin" className="rounded-full bg-accent-gradient px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-accent/25 transition hover:opacity-90">Sign in</Link>
        </div>
    );

    const secondaryBtn = "flex items-center justify-center gap-2 rounded-full border border-border bg-surface-2 px-4 py-2 text-sm font-medium text-fg transition hover:bg-surface-3";

    return (
        <section className="animate-fade-up">
            {/* Profile info */}
            <div className="relative flex flex-col items-center gap-5 overflow-hidden rounded-3xl border border-border bg-surface p-6 sm:flex-row sm:items-start sm:p-8">
                <div aria-hidden className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-accent/15 blur-3xl" />
                <img src={user?.avatarURL} alt="" className="relative h-24 w-24 rounded-2xl bg-surface-2 object-cover ring-1 ring-border" />
                <div className="relative flex-1 text-center sm:text-left">
                    <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-center sm:justify-between">
                        {channel ? (
                            <h1 className="font-display text-2xl font-bold tracking-tight text-fg">{channel.channelName}</h1>
                        ) : (
                            <p className="text-lg font-semibold text-gradient">No channel yet</p>
                        )}
                        <div className="flex gap-2">
                            <button onClick={handleSignOut} className={secondaryBtn}>
                                Sign out <FaArrowRightFromBracket />
                            </button>
                            {channel && (
                                <button onClick={handleDeleteChannel} className="grid place-items-center rounded-full bg-red-500/10 px-4 py-2 text-sm font-medium text-red-500 transition hover:bg-red-500/20 dark:text-red-400" aria-label="Delete channel">
                                    <FaTrash />
                                </button>
                            )}
                        </div>
                    </div>
                    <p className="mt-2 text-sm text-muted">Username: <span className="text-fg">@{user?.username}</span></p>
                    <p className="text-sm text-muted">Email: <span className="text-fg">{user?.email}</span></p>
                    <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
                        {channel ? (
                            <>
                                <Link to={`/channel/${user.channels[0]}`} className={secondaryBtn}>
                                    <FaEye /> View channel
                                </Link>
                                <Link to={`/update-channel/${user.channels[0]}`} className={secondaryBtn}>
                                    <FaPenToSquare /> Edit channel
                                </Link>
                            </>
                        ) : (
                            <Link to="/create-channel" className="rounded-full bg-accent-gradient px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-accent/25 transition hover:opacity-90">
                                Create channel
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* Videos */}
            <div className="mt-8">
                <div className="flex items-center justify-between border-b border-border pb-3">
                    <h2 className="font-display text-lg font-semibold text-fg">Manage videos</h2>
                    {channel && (
                        <Link to="/upload-video" className="flex items-center gap-2 rounded-full bg-accent-gradient px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-accent/25 transition hover:opacity-90">
                            <FaVideo /> Upload
                        </Link>
                    )}
                </div>
                <div className="grid grid-cols-1 gap-x-4 gap-y-8 pt-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {channel ? (
                        videos.length === 0 ? (
                            <EmptyState message="No videos uploaded yet." />
                        ) : (
                            videos.map(video => <ProfileVideoCard key={video._id} video={video} />)
                        )
                    ) : (
                        <EmptyState icon={FaTv} message="Please create a channel to upload videos." />
                    )}
                </div>
            </div>
        </section>
    );

};

export default Profile;

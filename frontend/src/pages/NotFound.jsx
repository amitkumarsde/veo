import { Link, useRouteError } from "react-router-dom";
import { FaPlay, FaArrowLeft } from "react-icons/fa6";

const NotFound = () => {

    const error = useRouteError();
    // This renders outside App's theme wrapper, so mirror the saved theme here.
    const isDark = localStorage.getItem("theme") !== "light";

    return (
        <div className={isDark ? "dark" : ""}>
            <div className="relative flex min-h-screen flex-col items-center justify-center gap-5 overflow-hidden bg-canvas px-4 text-center text-fg">
                {/* Ambient glow */}
                <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/3 h-96 w-96 -translate-x-1/2 rounded-full bg-accent/20 blur-[140px]" />

                <span className="relative grid h-14 w-14 place-items-center rounded-full bg-accent-gradient text-white shadow-lg glow">
                    <FaPlay className="text-base" />
                </span>
                <h1 className="relative font-display text-6xl font-bold tracking-tight text-gradient">
                    {error?.status || 404}
                </h1>
                <p className="relative text-lg font-semibold text-fg">
                    {error?.statusText || "Page not found"}
                </p>
                <p className="relative max-w-md text-sm text-muted">
                    {error?.data || "The page you're looking for doesn't exist or has been moved."}
                </p>
                <Link
                    to="/"
                    className="relative mt-2 flex items-center gap-2 rounded-full bg-accent-gradient px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-accent/25 transition hover:opacity-90"
                >
                    <FaArrowLeft /> Back to home
                </Link>
            </div>
        </div>
    );

};

export default NotFound;

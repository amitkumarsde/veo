import { useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaMagnifyingGlass, FaXmark, FaPlay, FaSun, FaMoon } from "react-icons/fa6";

import { useAuth } from "@/hooks/useAuth";
import { useSearch } from "@/hooks/useSearch";
import { useTheme } from "@/hooks/useTheme";

const Header = () => {

    const { user } = useAuth();
    const { searchText, setSearchText } = useSearch();
    const { isTheme, setIsTheme } = useTheme();
    const navigate = useNavigate();
    const searchRef = useRef(null);

    // Focus the search box on "/" or ⌘/Ctrl-K.
    useEffect(() => {
        const onKey = (e) => {
            const typing = /^(INPUT|TEXTAREA)$/.test(document.activeElement?.tagName);
            if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing)) {
                e.preventDefault();
                searchRef.current?.focus();
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        searchRef.current?.blur();
        navigate("/");
    };

    const iconBtn = "grid h-10 w-10 place-items-center rounded-full text-muted transition hover:bg-surface-2 hover:text-fg";

    return (
        <header className="fixed inset-x-0 top-0 z-30 h-16 border-b border-border glass">
            <div className="flex h-full items-center gap-2 px-4 sm:gap-3 sm:px-6">
                {/* Brand */}
                <Link to="/" className="flex shrink-0 items-center gap-2.5" aria-label="Veo home">
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-accent-gradient text-white shadow-lg glow">
                        <FaPlay className="text-xs" />
                    </span>
                    <span className="hidden font-display text-2xl font-bold tracking-tight text-fg sm:inline">Veo</span>
                </Link>

                {/* Search */}
                <form onSubmit={handleSubmit} className="flex flex-1 justify-center">
                    <div className="flex h-10 w-full max-w-xl items-center gap-2.5 rounded-full border border-border bg-surface-2/60 px-4 transition focus-within:border-accent/60 focus-within:bg-surface focus-within:shadow-[0_0_0_4px_var(--accent-soft)]">
                        <input
                            ref={searchRef}
                            type="text"
                            placeholder="Search videos, channels…"
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            className="w-full bg-transparent text-sm text-fg outline-none placeholder:text-faint"
                        />
                        {searchText && (
                            <button
                                type="button"
                                onClick={() => setSearchText("")}
                                className="shrink-0 text-faint transition hover:text-fg"
                                aria-label="Clear search"
                            >
                                <FaXmark />
                            </button>
                        )}
                        <button type="submit" aria-label="Search" className="shrink-0 text-faint transition hover:text-fg">
                            <FaMagnifyingGlass className="text-sm" />
                        </button>
                    </div>
                </form>

                {/* Right actions */}
                <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
                    <button onClick={() => setIsTheme(!isTheme)} className={iconBtn} aria-label="Toggle theme">
                        {isTheme ? <FaSun /> : <FaMoon />}
                    </button>
                    {user ? (
                        <Link to="/profile" aria-label="Your profile" className="ml-0.5">
                            <img
                                src={user.avatarURL}
                                alt="avatar"
                                className="h-9 w-9 rounded-full bg-surface-2 object-cover ring-2 ring-border transition hover:ring-accent"
                            />
                        </Link>
                    ) : (
                        <Link
                            to="/signin"
                            className="rounded-full bg-accent-gradient px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-accent/25 transition hover:opacity-90"
                        >
                            Sign in
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );

};

export default Header;

import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router";
import { Clapperboard, Moon, Search, Sun, Upload, X } from "lucide-react";

import Logo from "@/components/common/Logo";
import ProfileMenu from "@/components/layout/ProfileMenu";
import { Button, TextButton } from "@/components/ui/Button";
import { LIMITS } from "@/constants/limits";
import { useAuth } from "@/features/auth/useAuth";
import { useTheme } from "@/features/theme/useTheme";

// "/?q=…", keeping the current category and sort when already on the home page.
const buildSearchUrl = (location, query) => {
    const params = new URLSearchParams(location.pathname === "/" ? location.search : "");
    if (query) params.set("q", query);
    else params.delete("q");
    const search = params.toString();
    return search ? `/?${search}` : "/";
};

const navLinkClass = ({ isActive }) =>
    `hidden items-center gap-1.5 text-sm font-medium transition-colors md:inline-flex ${isActive ? "text-accent" : "text-muted hover:text-fg"}`;

const Header = () => {
    const { user } = useAuth();
    const { isDark, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const searchInputRef = useRef(null);
    const isHome = location.pathname === "/";
    const urlQuery = isHome ? new URLSearchParams(location.search).get("q") ?? "" : "";
    const [searchText, setSearchText] = useState(urlQuery);
    const [syncedUrlQuery, setSyncedUrlQuery] = useState(urlQuery);
    const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

    // Keep the box in step with the URL (Back button, "Clear filters"…).
    if (syncedUrlQuery !== urlQuery) {
        setSyncedUrlQuery(urlQuery);
        setSearchText(urlQuery);
    }

    // "/" or Ctrl/⌘+K jumps to search.
    useEffect(() => {
        const onKeyDown = (event) => {
            const isTyping = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName) || document.activeElement?.isContentEditable;
            if ((event.key === "k" && (event.metaKey || event.ctrlKey)) || (event.key === "/" && !isTyping)) {
                event.preventDefault();
                setIsMobileSearchOpen(true);
                requestAnimationFrame(() => searchInputRef.current?.focus());
            }
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, []);

    // On the home page results update while typing (one history entry per search); on other pages search runs on Enter.
    const handleSearchChange = (value) => {
        setSearchText(value);
        if (isHome) navigate(buildSearchUrl(location, value.trim()), { replace: Boolean(urlQuery) });
    };
    const handleSearchSubmit = (event) => {
        event.preventDefault();
        searchInputRef.current?.blur();
        navigate(buildSearchUrl(location, searchText.trim()));
    };

    return (
        <header className="fixed inset-x-0 top-0 z-30 h-16 border-b border-border bg-canvas">
            <div className="mx-auto flex h-full max-w-[1440px] items-center gap-4 px-4 sm:gap-6 sm:px-8">
                <Logo className={`text-[26px] ${isMobileSearchOpen ? "hidden sm:inline-flex" : ""}`} />

                <form role="search" onSubmit={handleSearchSubmit} className={`${isMobileSearchOpen ? "flex" : "hidden sm:flex"} min-w-0 flex-1 items-center justify-center`}>
                    <label className="flex h-10 w-full max-w-lg items-center gap-3 rounded-ui bg-surface-2 px-3.5 text-faint transition-colors focus-within:bg-surface focus-within:ring-1 focus-within:ring-accent">
                        <Search size={17} aria-hidden />
                        <input
                            ref={searchInputRef}
                            type="search"
                            aria-label="Search videos and channels"
                            placeholder="Search videos and channels"
                            maxLength={LIMITS.search}
                            value={searchText}
                            onChange={(event) => handleSearchChange(event.target.value)}
                            className="w-full min-w-0 bg-transparent text-[15px] text-fg outline-none placeholder:text-faint [&::-webkit-search-cancel-button]:hidden"
                        />
                        {searchText && (
                            <button type="button" onClick={() => handleSearchChange("")} aria-label="Clear search" className="transition-colors hover:text-fg">
                                <X size={16} aria-hidden />
                            </button>
                        )}
                    </label>
                    {isMobileSearchOpen && (
                        <TextButton onClick={() => setIsMobileSearchOpen(false)} className="ml-4 sm:hidden">Cancel</TextButton>
                    )}
                </form>

                <nav aria-label="Main" className={`${isMobileSearchOpen ? "hidden sm:flex" : "flex"} ml-auto items-center gap-5 sm:ml-0 sm:gap-6`}>
                    <button type="button" onClick={() => setIsMobileSearchOpen(true)} aria-label="Search" className="text-muted transition-colors hover:text-accent sm:hidden">
                        <Search size={20} aria-hidden />
                    </button>
                    {user && (
                        <>
                            <NavLink to="/studio" className={navLinkClass}><Clapperboard size={17} aria-hidden /> Studio</NavLink>
                            <NavLink to="/upload-video" className={navLinkClass}><Upload size={17} aria-hidden /> Upload</NavLink>
                        </>
                    )}
                    <button type="button" onClick={toggleTheme} aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"} className="text-muted transition-colors hover:text-accent">
                        {isDark ? <Sun size={19} aria-hidden /> : <Moon size={19} aria-hidden />}
                    </button>
                    {user ? (
                        <ProfileMenu user={user} />
                    ) : (
                        <>
                            <TextButton as={Link} to="/login" tone="fg" className="hidden sm:inline-flex">Log in</TextButton>
                            <Button as={Link} to="/register" size="sm">Join Veo</Button>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
};

export default Header;

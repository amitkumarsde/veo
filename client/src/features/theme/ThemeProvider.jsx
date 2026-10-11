import { useCallback, useEffect, useMemo, useState } from "react";

import { ThemeContext } from "@/features/theme/ThemeContext";

const THEME_KEY = "theme";
const DARK_QUERY = "(prefers-color-scheme: dark)";

// public/theme-init.js already set the theme before the page showed.
const readInitialTheme = () => document.documentElement.classList.contains("dark");

const hasSavedChoice = () => {
    try {
        return localStorage.getItem(THEME_KEY) !== null;
    } catch {
        return false;
    }
};

// Follows the device's light or dark setting (and its changes) until a theme is picked.
export const ThemeProvider = ({ children }) => {
    const [isDark, setIsDark] = useState(readInitialTheme);

    useEffect(() => {
        document.documentElement.classList.toggle("dark", isDark);
    }, [isDark]);

    useEffect(() => {
        const media = window.matchMedia?.(DARK_QUERY);
        if (!media) return undefined;
        const onChange = (event) => { if (!hasSavedChoice()) setIsDark(event.matches); };
        media.addEventListener("change", onChange);
        return () => media.removeEventListener("change", onChange);
    }, []);

    // Only a click on the toggle saves a choice.
    const toggleTheme = useCallback(() => {
        const next = !isDark;
        try {
            localStorage.setItem(THEME_KEY, next ? "dark" : "light");
        } catch {
            // If storage is blocked (private mode), the choice lasts for this visit only.
        }
        setIsDark(next);
    }, [isDark]);
    const value = useMemo(() => ({ isDark, toggleTheme }), [isDark, toggleTheme]);

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

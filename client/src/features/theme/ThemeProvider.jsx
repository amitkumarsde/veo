import { useCallback, useEffect, useMemo, useState } from "react";

import { ThemeContext } from "@/features/theme/ThemeContext";

const THEME_KEY = "theme";

// public/theme-init.js already applied the saved (or device) theme before the first paint.
const readInitialTheme = () => document.documentElement.classList.contains("dark");

export const ThemeProvider = ({ children }) => {
    const [isDark, setIsDark] = useState(readInitialTheme);

    useEffect(() => {
        document.documentElement.classList.toggle("dark", isDark);
        try {
            localStorage.setItem(THEME_KEY, isDark ? "dark" : "light");
        } catch {
            // Storage can be blocked (private mode); the choice then lasts for this visit only.
        }
    }, [isDark]);

    const toggleTheme = useCallback(() => setIsDark((previous) => !previous), []);
    const value = useMemo(() => ({ isDark, toggleTheme }), [isDark, toggleTheme]);

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

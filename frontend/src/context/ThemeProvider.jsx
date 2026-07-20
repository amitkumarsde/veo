import { useEffect, useState } from 'react';

import { ThemeContext } from '@/context/ThemeContext';

export const ThemeProvider = ({ children }) => {
    // Restore the saved theme, defaulting to dark.
    const [isTheme, setIsTheme] = useState(() => localStorage.getItem('theme') !== 'light');

    // Persist theme choice + reflect it on <html> so the page scrollbar
    // (which lives above the app wrapper) is themed too.
    useEffect(() => {
        localStorage.setItem('theme', isTheme ? 'dark' : 'light');
        document.documentElement.classList.toggle('dark', isTheme);
    }, [isTheme]);

    return (
        <ThemeContext.Provider value={{ isTheme, setIsTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

import { createContext } from 'react';

// Tracks the dark/light theme. `isTheme` is true for dark.
export const ThemeContext = createContext({
    isTheme: true,
    setIsTheme: () => {},
});

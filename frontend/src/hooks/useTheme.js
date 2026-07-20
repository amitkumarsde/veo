import { useContext } from 'react';

import { ThemeContext } from '@/context/ThemeContext';

// Access the current theme flag and its setter.
export const useTheme = () => useContext(ThemeContext);

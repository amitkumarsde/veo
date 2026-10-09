import { useContext } from "react";

import { ThemeContext } from "@/features/theme/ThemeContext";

export const useTheme = () => useContext(ThemeContext);

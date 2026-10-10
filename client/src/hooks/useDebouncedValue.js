import { useEffect, useState } from "react";

// Returns the value once it stops changing for `delayMs`, so search runs when typing pauses.
export const useDebouncedValue = (value, delayMs = 300) => {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const timer = setTimeout(() => setDebounced(value), delayMs);
        return () => clearTimeout(timer);
    }, [value, delayMs]);
    return debounced;
};

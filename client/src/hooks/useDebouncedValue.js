import { useEffect, useState } from "react";

// The value once it has stopped changing for `delayMs` (search runs when typing pauses).
export const useDebouncedValue = (value, delayMs = 300) => {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const timer = setTimeout(() => setDebounced(value), delayMs);
        return () => clearTimeout(timer);
    }, [value, delayMs]);
    return debounced;
};

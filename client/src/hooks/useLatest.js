import { useLayoutEffect, useRef } from "react";

// A ref that always holds the newest value, so callbacks can use it without restarting effects.
export const useLatest = (value) => {
    const ref = useRef(value);
    useLayoutEffect(() => { ref.current = value; });
    return ref;
};

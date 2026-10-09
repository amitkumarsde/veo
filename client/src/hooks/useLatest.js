import { useLayoutEffect, useRef } from "react";

// A ref that always holds the latest value, for callbacks that must not restart effects when they change.
export const useLatest = (value) => {
    const ref = useRef(value);
    useLayoutEffect(() => { ref.current = value; });
    return ref;
};

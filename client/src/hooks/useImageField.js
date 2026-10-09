import { useCallback, useState } from "react";

// One optional image on a form: the saved URL, a newly picked file, or "remove the saved one".
export const useImageField = (initialUrl = "") => {
    const [image, setImage] = useState({ currentUrl: initialUrl, file: null, removed: false, changed: false });

    const pick = useCallback((file) => setImage((previous) => ({ ...previous, file, removed: false, changed: true })), []);
    const remove = useCallback(() => setImage((previous) => ({ ...previous, file: null, removed: true, changed: true })), []);
    const reset = useCallback((currentUrl = "") => setImage({ currentUrl, file: null, removed: false, changed: false }), []);

    return {
        ...image,
        pick,
        remove,
        reset,
        // Only a saved image can be removed; a just-picked one is simply dropped.
        shouldRemoveSaved: image.removed && !image.file && Boolean(image.currentUrl),
    };
};

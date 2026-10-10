import { useEffect, useState } from "react";

// A temporary URL to preview a picked file, freed when the file changes or the component closes.
export const useObjectUrl = (file) => {
    const [preview, setPreview] = useState(null);

    useEffect(() => {
        if (!file) return undefined;
        const url = URL.createObjectURL(file);
        // I create and free the URL in one effect, so React's double run in development can't free a URL in use.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setPreview({ file, url });
        return () => URL.revokeObjectURL(url);
    }, [file]);

    return preview?.file === file ? preview.url : null;
};

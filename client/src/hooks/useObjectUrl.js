import { useEffect, useState } from "react";

// A temporary URL to preview a picked file, freed when the file changes or the component closes.
export const useObjectUrl = (file) => {
    const [preview, setPreview] = useState(null);

    useEffect(() => {
        if (!file) return undefined;
        const url = URL.createObjectURL(file);
        // eslint-disable-next-line react-hooks/set-state-in-effect -- one effect makes and frees the URL, so React's double run can't free a URL in use
        setPreview({ file, url });
        return () => URL.revokeObjectURL(url);
    }, [file]);

    return preview?.file === file ? preview.url : null;
};

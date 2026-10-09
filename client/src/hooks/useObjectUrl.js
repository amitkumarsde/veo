import { useEffect, useState } from "react";

// A temporary URL to preview a picked file, released when the file changes or the component unmounts.
export const useObjectUrl = (file) => {
    const [preview, setPreview] = useState(null);

    useEffect(() => {
        if (!file) return undefined;
        const url = URL.createObjectURL(file);
        // Created and revoked in the same effect, so React's dev double-run can't revoke a URL still on screen.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setPreview({ file, url });
        return () => URL.revokeObjectURL(url);
    }, [file]);

    return preview?.file === file ? preview.url : null;
};

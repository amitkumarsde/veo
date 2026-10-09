import { useEffect } from "react";

const APP_NAME = "Veo";

// "Upload video · Veo"
export const useDocumentTitle = (title) => {
    useEffect(() => {
        document.title = title ? `${title} · ${APP_NAME}` : APP_NAME;
    }, [title]);
};

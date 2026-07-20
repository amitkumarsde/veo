import { useEffect, useState } from "react";

import api from "@/services/api";

// Fetch a channel by id. Returns null until it loads; errors are swallowed
// (callers fall back to showing the raw channelId). Shared by the cards and
// the video player so the fetch logic lives in one place.
export const useChannel = (channelId) => {
    const [channel, setChannel] = useState(null);

    useEffect(() => {
        if (!channelId) return;
        let active = true;
        api.get(`/channels/${channelId}`)
            .then(res => { if (active) setChannel(res.data); })
            .catch(() => { /* Silently ignore the errors */ });
        return () => { active = false; };
    }, [channelId]);

    return channel;
};

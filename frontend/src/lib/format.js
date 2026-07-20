// Compact number formatting: 1234 -> "1.2K", 3_400_000 -> "3.4M"
export const formatCount = (value) => {
    const n = Number(value) || 0;
    if (n < 1000) return `${n}`;
    if (n < 1_000_000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}K`;
    if (n < 1_000_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
    return `${(n / 1_000_000_000).toFixed(1).replace(/\.0$/, "")}B`;
};

// Extract the YouTube video id from a watch/share URL, or return null.
export const getYouTubeId = (url) => {
    try {
        const parsed = new URL(url);
        if (parsed.hostname.includes("youtu.be")) return parsed.pathname.slice(1);
        return parsed.searchParams.get("v");
    } catch {
        return null;
    }
};

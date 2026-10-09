const compactNumber = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 });
const relativeTime = new Intl.RelativeTimeFormat("en", { numeric: "always" });
const monthYear = new Intl.DateTimeFormat("en", { month: "long", year: "numeric" });

const TIME_UNITS = [
    ["year", 365 * 24 * 3600],
    ["month", 30 * 24 * 3600],
    ["week", 7 * 24 * 3600],
    ["day", 24 * 3600],
    ["hour", 3600],
    ["minute", 60],
    ["second", 1],
];

const toDate = (value) => {
    const date = new Date(value);
    return value && !Number.isNaN(date.getTime()) ? date : null;
};

// 1234 -> "1.2K", 3_400_000 -> "3.4M"
export const formatCount = (value) => compactNumber.format(Number(value) || 0);

// "1 view" / "1.2K views"
export const countLabel = (count, noun) => `${formatCount(count)} ${noun}${Number(count) === 1 ? "" : "s"}`;

// "1 video" / "3 videos", with the full number.
export const pluralize = (count, noun) => `${count} ${noun}${count === 1 ? "" : "s"}`;

// "3 days ago"; an unreadable date shows "—" instead of breaking the page.
export const timeAgo = (value) => {
    const date = toDate(value);
    if (!date) return "—";
    const seconds = Math.round((date.getTime() - Date.now()) / 1000);
    const [unit, size] = TIME_UNITS.find(([, unitSeconds]) => Math.abs(seconds) >= unitSeconds) ?? TIME_UNITS.at(-1);
    return relativeTime.format(Math.round(seconds / size), unit);
};

// "October 2026", or null when the date can't be read.
export const formatMonthYear = (value) => {
    const date = toDate(value);
    return date ? monthYear.format(date) : null;
};

// "1.4 MB"
export const formatBytes = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// "about 2 min left" / "a few seconds left"
export const formatTimeLeft = (seconds) => {
    if (seconds == null || !Number.isFinite(seconds)) return "";
    if (seconds < 10) return "a few seconds left";
    if (seconds < 60) return `about ${Math.round(seconds)} sec left`;
    return `about ${Math.round(seconds / 60)} min left`;
};

// "Good evening, Amit" by the viewer's own clock.
export const greeting = (name) => {
    const hour = new Date().getHours();
    const partOfDay = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
    return name ? `${partOfDay}, ${name.split(" ")[0]}` : partOfDay;
};

// "Games, chess" -> ["games", "chess"]
export const parseCategories = (text) => [...new Set(text.split(",").map((category) => category.trim().toLowerCase()).filter(Boolean))];

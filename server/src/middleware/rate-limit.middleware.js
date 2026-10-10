// In-memory limiter: at most `max` hits per `windowMs` for each key, keeping at most MAX_KEYS keys.
const MAX_KEYS = 50_000;

export const rateLimit = ({ windowMs, max, message, keyFor = (req) => req.ip, onLimit }) => {
    const hits = new Map();

    setInterval(() => {
        const now = Date.now();
        for (const [key, entry] of hits) if (entry.resetAt <= now) hits.delete(key);
    }, windowMs).unref();

    return (req, res, next) => {
        const now = Date.now();
        const key = keyFor(req) ?? "unknown";
        let entry = hits.get(key);
        if (!entry || entry.resetAt <= now) {
            if (!entry && hits.size >= MAX_KEYS) hits.delete(hits.keys().next().value);
            entry = { count: 0, resetAt: now + windowMs };
            hits.set(key, entry);
        }
        entry.count += 1;
        if (entry.count <= max) return next();
        if (onLimit) return onLimit(req, res);
        res.set("Retry-After", String(Math.ceil((entry.resetAt - now) / 1000)));
        return res.status(429).json({ success: false, message });
    };
};

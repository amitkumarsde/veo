// Loaded lists are kept for a few minutes so going Back shows them instantly at the same scroll spot.
const MAX_AGE_MS = 5 * 60 * 1000;
const cache = new Map();

export const readList = (key) => {
    const entry = cache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.savedAt > MAX_AGE_MS) {
        cache.delete(key);
        return null;
    }
    return entry;
};

export const writeList = (key, items, cursor) => cache.set(key, { items, cursor, savedAt: Date.now() });

export const removeList = (key) => cache.delete(key);

// Called after anything is created, edited or deleted, so every list loads fresh.
export const clearLists = () => cache.clear();

// For promise chains: `.then(clearListsAfter)` passes the result through unchanged.
export const clearListsAfter = (result) => {
    clearLists();
    return result;
};

// Mirrors server/src/constants/limits.js; the server enforces them again.
export const LIMITS = Object.freeze({
    name: { min: 2, max: 50 },
    bio: 200,
    password: { min: 6, max: 72 },
    channelName: 50,
    channelDescription: 1000,
    title: 100,
    description: 5000,
    categories: 10,
    comment: 1000,
    search: 100,
});

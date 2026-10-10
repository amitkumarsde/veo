// Same limits as server/src/constants/limits.js; the server checks them again.
export const LIMITS = Object.freeze({
    name: { min: 2, max: 50 },
    bio: 200,
    // bcrypt only uses the first 72 bytes of a password.
    password: { min: 6, maxBytes: 72 },
    channelName: 50,
    channelDescription: 1000,
    title: 100,
    description: 5000,
    categories: 10,
    comment: 1000,
    search: 100,
});

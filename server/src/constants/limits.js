// Text limits for validation and the models; the client has the same ones in src/constants/limits.js.
export const LIMITS = Object.freeze({
    name: { min: 2, max: 50 },
    bio: 200,
    // bcrypt only uses the first 72 bytes of a password.
    password: { min: 6, maxBytes: 72 },
    email: 254,
    channelName: 50,
    channelDescription: 1000,
    title: 100,
    description: 5000,
    categories: 10,
    category: 30,
    comment: 1000,
    search: 100,
    videoUrl: 2000,
    channelsPerUser: 3,
});

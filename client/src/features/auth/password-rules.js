import { LIMITS } from "@/constants/limits";

// Returns why a new password can't be used, or null; like the server, I count bytes, not letters.
export const getNewPasswordError = (password) => {
    if (password.length < LIMITS.password.min) return `Use at least ${LIMITS.password.min} characters.`;
    if (new TextEncoder().encode(password).length > LIMITS.password.maxBytes) return "That password is too long. Use fewer or simpler characters.";
    return null;
};

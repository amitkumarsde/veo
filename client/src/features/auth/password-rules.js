import { LIMITS } from "@/constants/limits";

// Why a new password can't be used, or null; counts bytes, not letters, like the server.
export const getNewPasswordError = (password) => {
    if (password.length < LIMITS.password.min) return `Use at least ${LIMITS.password.min} characters.`;
    if (new TextEncoder().encode(password).length > LIMITS.password.maxBytes) return "That password is too long. Use fewer or simpler characters.";
    return null;
};

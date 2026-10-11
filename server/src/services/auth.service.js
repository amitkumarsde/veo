import mongoose from "mongoose";

import { config } from "../config/env.js";
import { conflict, fieldError, forbidden, unauthorized } from "../errors/app-error.js";
import { userRepository } from "../repositories/user.repository.js";
import { isDuplicateKeyError } from "../utils/mongo-errors.js";
import { UNKNOWN_USER_HASH, hashPassword, isPasswordCorrect } from "../utils/password.js";
import { signAccessToken, verifyAccessToken } from "./token.service.js";
import { toPublicUser } from "./user.service.js";

const EMAIL_TAKEN = "An account with this email already exists.";
const WRONG_CREDENTIALS = "Wrong email or password.";
const USERNAME_ATTEMPTS = 6;

// "Amit Kumar" -> "amitkumar", with a random number added while taken.
const generateUsername = async (name) => {
    const cleaned = name.normalize("NFKD").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 20);
    const base = cleaned.length >= 3 ? cleaned : `user${cleaned}`;
    for (let attempt = 0; attempt < USERNAME_ATTEMPTS; attempt += 1) {
        const candidate = attempt === 0 ? base : `${base}${Math.floor(1000 + Math.random() * 9000)}`;
        if (!(await userRepository.existsByUsername(candidate))) return candidate;
    }
    return `${base}${Date.now().toString(36)}`;
};

export const register = async ({ name, email, password }) => {
    if (await userRepository.existsByEmail(email)) throw fieldError(409, "email", EMAIL_TAKEN);
    const username = await generateUsername(name);
    try {
        await userRepository.create({ username, name, email, password: await hashPassword(password) });
    } catch (error) {
        // Two registrations at the same moment: the unique indexes reject the second one.
        if (!isDuplicateKeyError(error)) throw error;
        throw error.keyPattern?.email ? fieldError(409, "email", EMAIL_TAKEN) : conflict("Please try again.");
    }
};

export const login = async ({ email, password }) => {
    const user = await userRepository.findByEmailWithPassword(email);
    const passwordMatches = await isPasswordCorrect(password, user?.password ?? UNKNOWN_USER_HASH);
    if (!user || !passwordMatches) throw unauthorized(WRONG_CREDENTIALS);
    return { token: signAccessToken(user._id), user: await toPublicUser(user) };
};

// Knowing the email is enough here, so this works only when ALLOW_PASSWORD_RESET_BY_EMAIL=true.
export const resetPassword = async ({ email, newPassword }) => {
    if (!config.allowPasswordReset) throw forbidden("Password reset is turned off. Please contact support.");
    const user = await userRepository.findByEmailForUpdate(email);
    if (!user) throw fieldError(404, "email", "No account uses this email.");
    user.password = await hashPassword(newPassword);
    user.passwordChangedAt = new Date();
    await user.save();
};

// The logged-in user for a token, or null; tokens made before the last password change are refused.
export const resolveSession = async (token) => {
    const claims = verifyAccessToken(token);
    if (!claims || !mongoose.isValidObjectId(claims.sub)) return null;
    const user = await userRepository.findSessionById(claims.sub);
    if (!user) return null;
    // Tokens keep whole seconds only, so the time is rounded up and a token from the same second is refused too.
    const changedAtSeconds = user.passwordChangedAt ? Math.ceil(user.passwordChangedAt.getTime() / 1000) : 0;
    if (claims.iat < changedAtSeconds) return null;
    return { id: String(user._id), username: user.username };
};

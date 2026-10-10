import { z } from "zod";

import { LIMITS } from "../constants/limits.js";
import { email, formFlag, newPassword } from "./common.validation.js";

const name = z.string({ error: "Name is required." }).trim()
    .min(LIMITS.name.min, `Name must be at least ${LIMITS.name.min} characters.`)
    .max(LIMITS.name.max, `Name must be at most ${LIMITS.name.max} characters.`);

// Current passwords are only compared with their hash, so any non-empty value of a sane size is fine.
const currentPassword = (message) => z.string({ error: message }).min(1, message).max(1024, message);

export const userSchemas = {
    signUp: { body: z.object({ name, email, password: newPassword() }) },
    signIn: {
        body: z.object({
            email: z.string({ error: "Email is required." }).trim().toLowerCase().min(1, "Email is required.").max(LIMITS.email),
            password: currentPassword("Password is required."),
        }),
    },
    resetPassword: { body: z.object({ email, newPassword: newPassword("New password") }) },
    updateProfile: {
        body: z.object({
            name: name.optional(),
            bio: z.string().trim().max(LIMITS.bio, `Bio must be at most ${LIMITS.bio} characters.`).optional(),
            removeAvatar: formFlag.optional(),
        }),
    },
    deleteAccount: { body: z.object({ password: currentPassword("Please enter your password to confirm.") }) },
};

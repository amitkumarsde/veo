import { z } from "zod";

import { LIMITS } from "../constants/limits.js";

// Unknown fields are dropped, and anything that isn't text where text is expected (e.g. { "$ne": null })
// is rejected, which also blocks NoSQL operator injection.

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const requiredText = (label, max) => z.string({ error: `${label} is required.` }).trim()
    .min(1, `${label} is required.`)
    .max(max, `${label} must be at most ${max} characters.`);

// Blank text counts as "not sent".
export const optionalInput = (schema) =>
    z.preprocess((value) => (typeof value === "string" && !value.trim() ? undefined : value), schema.optional());

export const email = z.string({ error: "Email is required." }).trim().toLowerCase()
    .max(LIMITS.email, "Please enter a valid email address.")
    .regex(EMAIL_PATTERN, "Please enter a valid email address.");

export const newPassword = (label = "Password") => z.string({ error: `${label} is required.` })
    .min(LIMITS.password.min, `${label} must be at least ${LIMITS.password.min} characters.`)
    .refine((value) => Buffer.byteLength(value) <= LIMITS.password.maxBytes, `${label} is too long.`);

// Multipart form fields arrive as text, so "true" means true.
export const formFlag = z.preprocess((value) => value === true || value === "true" || value === "1", z.boolean());

export const pageLimit = (fallback, max) => z.coerce.number().int().min(1).max(max).catch(fallback).default(fallback);

export const pageCursor = z.string().max(200).optional();

export const pathId = (label) => z.string().trim().min(1, `${label} is required.`).max(100, `Invalid ${label.toLowerCase()}.`);

export const videoParams = z.object({ videoId: pathId("Video") });

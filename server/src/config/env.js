import { z } from "zod";

const MB = 1024 * 1024;

const blankToUndefined = (value) => (typeof value === "string" && value.trim() === "" ? undefined : value);
const optionalText = z.preprocess(blankToUndefined, z.string().trim().optional());
const flag = (fallback) => z.preprocess(blankToUndefined, z.enum(["true", "false"]).default(String(fallback))).transform((value) => value === "true");
const megabytes = (fallback) => z.preprocess(blankToUndefined, z.coerce.number().positive().default(fallback));
const commaList = z.preprocess(blankToUndefined, z.string().default(""))
    .transform((value) => value.split(",").map((item) => item.trim()).filter(Boolean));

const envSchema = z.object({
    NODE_ENV: z.preprocess(blankToUndefined, z.enum(["development", "production"]).default("development")),
    PORT: z.preprocess(blankToUndefined, z.coerce.number().int().positive().default(5001)),
    MONGO_URL: z.string({ error: "is required" }).trim().min(1, "is required"),
    JWT_SECRET: z.string({ error: "is required" }).min(1, "is required"),
    JWT_EXPIRES_IN: z.preprocess(blankToUndefined, z.string().default("2d")),
    CORS_ORIGINS: commaList,
    TRUST_PROXY: z.preprocess(blankToUndefined, z.coerce.number().int().min(0).optional()),
    ALLOW_PASSWORD_RESET_BY_EMAIL: flag(true),
    STORAGE_ENDPOINT: optionalText,
    STORAGE_ACCESS_KEY: optionalText,
    STORAGE_SECRET_KEY: optionalText,
    STORAGE_BUCKET: z.preprocess(blankToUndefined, z.string().trim().default("veo")),
    STORAGE_REGION: z.preprocess(blankToUndefined, z.string().trim().default("us-east-1")),
    STORAGE_PUBLIC_URL: optionalText,
    STORAGE_FORCE_PATH_STYLE: flag(true),
    MAX_IMAGE_MB: megabytes(5),
    MAX_VIDEO_MB: megabytes(200),
}).superRefine((env, ctx) => {
    const isProduction = env.NODE_ENV === "production";
    if (isProduction && env.JWT_SECRET.length < 32) {
        ctx.addIssue({ code: "custom", path: ["JWT_SECRET"], message: "must be at least 32 characters in production" });
    }
    if (isProduction && env.CORS_ORIGINS.length === 0) {
        ctx.addIssue({ code: "custom", path: ["CORS_ORIGINS"], message: "is required in production (the frontend URL)" });
    }
    const storageKeys = ["STORAGE_ENDPOINT", "STORAGE_ACCESS_KEY", "STORAGE_SECRET_KEY", "STORAGE_PUBLIC_URL"];
    const setCount = storageKeys.filter((key) => env[key]).length;
    if (setCount > 0 && setCount < storageKeys.length) {
        ctx.addIssue({ code: "custom", path: ["STORAGE_ENDPOINT"], message: `set all of ${storageKeys.join(", ")} or none of them` });
    }
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
    const problems = parsed.error.issues.map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`).join("\n");
    console.error(`Invalid environment configuration:\n${problems}`);
    process.exit(1);
}

const env = parsed.data;
const isProduction = env.NODE_ENV === "production";
const trimSlashes = (url) => url.replace(/\/+$/, "");

export const config = Object.freeze({
    isProduction,
    port: env.PORT,
    mongoUrl: env.MONGO_URL,
    jwt: { secret: env.JWT_SECRET, expiresIn: env.JWT_EXPIRES_IN },
    corsOrigins: env.CORS_ORIGINS,
    // Render puts one proxy in front of the app; the real client IP is needed for rate limits.
    trustProxy: env.TRUST_PROXY ?? (isProduction ? 1 : 0),
    allowPasswordReset: env.ALLOW_PASSWORD_RESET_BY_EMAIL,
    storage: env.STORAGE_ENDPOINT
        ? {
            endpoint: env.STORAGE_ENDPOINT,
            accessKeyId: env.STORAGE_ACCESS_KEY,
            secretAccessKey: env.STORAGE_SECRET_KEY,
            bucket: env.STORAGE_BUCKET,
            region: env.STORAGE_REGION,
            publicUrl: trimSlashes(env.STORAGE_PUBLIC_URL),
            forcePathStyle: env.STORAGE_FORCE_PATH_STYLE,
        }
        : null,
    uploads: {
        maxImageMb: env.MAX_IMAGE_MB,
        maxVideoMb: env.MAX_VIDEO_MB,
        maxImageBytes: Math.floor(env.MAX_IMAGE_MB * MB),
        maxVideoBytes: Math.floor(env.MAX_VIDEO_MB * MB),
    },
});

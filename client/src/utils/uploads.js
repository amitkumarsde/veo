import { env } from "@/config/env";

const FILE_KINDS = {
    image: { types: ["image/jpeg", "image/png", "image/webp", "image/gif"], maxMb: env.maxImageMb, names: "JPG, PNG, WebP or GIF" },
    video: { types: ["video/mp4", "video/webm", "video/ogg"], maxMb: env.maxVideoMb, names: "MP4, WebM or OGG" },
};

export const acceptAttribute = (kind) => FILE_KINDS[kind].types.join(",");

export const fileHint = (kind) => `${FILE_KINDS[kind].names} · up to ${FILE_KINDS[kind].maxMb} MB`;

// Why a picked file can't be used, or null; a quick check, and the server checks the file again.
export const getFileError = (file, kind) => {
    const { types, maxMb, names } = FILE_KINDS[kind];
    if (!types.includes(file.type)) return `Please choose a ${names} file.`;
    if (file.size > maxMb * 1024 * 1024) return `That file is too large — the limit is ${maxMb} MB.`;
    return null;
};

// Multipart body; undefined, null and false values are left out.
export const toFormData = (fields) => {
    const formData = new FormData();
    for (const [key, value] of Object.entries(fields)) {
        if (value === undefined || value === null || value === false) continue;
        if (Array.isArray(value)) formData.append(key, value.join(","));
        else formData.append(key, value === true ? "true" : value);
    }
    return formData;
};

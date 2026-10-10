import { randomUUID } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { Transform } from "node:stream";
import { pipeline } from "node:stream/promises";
import multer from "multer";

import { FILE_EXTENSIONS, FILE_KINDS } from "../constants/uploads.js";
import { badRequest, fieldError, payloadTooLarge, serviceUnavailable } from "../errors/app-error.js";
import { UPLOADS_UNAVAILABLE_MESSAGE, isStorageEnabled } from "../services/storage.service.js";

// Uploads go to a temp folder first (big videos never sit in memory), get checked, then get stored.
const TEMP_DIR = path.join(os.tmpdir(), "veo-uploads");
fs.mkdirSync(TEMP_DIR, { recursive: true });

const HEADER_BYTES = 16;
const MAX_TEXT_FIELDS = 20;
const MAX_TEXT_FIELD_BYTES = 64 * 1024;
// File brands that are still images or audio, not playable video.
const NON_VIDEO_BRANDS = new Set(["heic", "heix", "hevc", "hevx", "heim", "heis", "mif1", "msf1", "avif", "avis", "M4A ", "M4B ", "M4P "]);

const typeNames = (kind) => kind.types.map((type) => FILE_EXTENSIONS[type].toUpperCase()).join(", ");

// Finds the real type from the first bytes, so a renamed HTML or SVG file can't pass as an image.
const detectContentType = (header) => {
    const ascii = (start, end) => header.toString("latin1", start, end);
    if (header[0] === 0xff && header[1] === 0xd8 && header[2] === 0xff) return "image/jpeg";
    if (header[0] === 0x89 && ascii(1, 4) === "PNG") return "image/png";
    if (ascii(0, 4) === "GIF8") return "image/gif";
    if (ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") return "image/webp";
    if (ascii(4, 8) === "ftyp" && !NON_VIDEO_BRANDS.has(ascii(8, 12))) return "video/mp4";
    if (header[0] === 0x1a && header[1] === 0x45 && header[2] === 0xdf && header[3] === 0xa3) return "video/webm";
    if (ascii(0, 4) === "OggS") return "video/ogg";
    return null;
};

const removeFile = (filePath) => fs.promises.rm(filePath, { force: true }).catch(() => {});

// Saves each file to a temp file, stops it when it's over its size limit, and keeps its first bytes to check the type.
const createTempStorage = (fieldKinds) => ({
    _handleFile(req, file, callback) {
        const kind = FILE_KINDS[fieldKinds[file.fieldname]];
        const filePath = path.join(TEMP_DIR, randomUUID());
        let size = 0;
        let header = Buffer.alloc(0);

        const sizeGuard = new Transform({
            transform(chunk, encoding, done) {
                size += chunk.length;
                if (size > kind.maxBytes) {
                    return done(payloadTooLarge(`"${file.fieldname}" is too large. The limit is ${kind.maxMb} MB.`));
                }
                if (header.length < HEADER_BYTES) header = Buffer.concat([header, chunk]).subarray(0, HEADER_BYTES);
                return done(null, chunk);
            },
        });

        pipeline(file.stream, sizeGuard, fs.createWriteStream(filePath))
            .then(() => callback(null, { path: filePath, size, header }))
            .catch(async (error) => {
                await removeFile(filePath);
                callback(error);
            });
    },
    _removeFile(req, file, callback) {
        removeFile(file.path).then(() => callback(null));
    },
});

const checkUploadedFiles = (files, fieldKinds) => {
    const uploads = {};
    for (const [fieldName, [file]] of Object.entries(files ?? {})) {
        const kind = FILE_KINDS[fieldKinds[fieldName]];
        const contentType = detectContentType(file.header);
        if (!kind.types.includes(contentType)) {
            throw fieldError(400, fieldName, `"${fieldName}" is not a supported ${kind.label}. Use ${typeNames(kind)}.`);
        }
        uploads[fieldName] = { path: file.path, size: file.size, contentType };
    }
    return uploads;
};

// Accepts the given file fields; text fields go to req.body and checked files to req.uploads.
export const acceptUploads = (fieldKinds) => {
    const fieldNames = Object.keys(fieldKinds);
    const parseMultipart = multer({
        storage: createTempStorage(fieldKinds),
        limits: {
            fileSize: Math.max(...fieldNames.map((name) => FILE_KINDS[fieldKinds[name]].maxBytes)),
            files: fieldNames.length,
            fields: MAX_TEXT_FIELDS,
            fieldSize: MAX_TEXT_FIELD_BYTES,
        },
        fileFilter: (req, file, callback) => {
            const kind = FILE_KINDS[fieldKinds[file.fieldname]];
            if (!kind) return callback(badRequest(`Unexpected file field "${file.fieldname}".`));
            if (!isStorageEnabled()) return callback(serviceUnavailable(UPLOADS_UNAVAILABLE_MESSAGE));
            if (!kind.types.includes(file.mimetype)) {
                return callback(fieldError(400, file.fieldname, `"${file.fieldname}" must be a ${typeNames(kind)} ${kind.label}.`));
            }
            return callback(null, true);
        },
    }).fields(fieldNames.map((name) => ({ name, maxCount: 1 })));

    return (req, res, next) => {
        // Temp files are removed once the response is done, whatever the outcome.
        res.on("close", () => {
            for (const file of Object.values(req.files ?? {}).flat()) removeFile(file.path);
        });
        parseMultipart(req, res, (error) => {
            if (error) return next(error);
            try {
                req.uploads = checkUploadedFiles(req.files, fieldKinds);
                return next();
            } catch (checkError) {
                return next(checkError);
            }
        });
    };
};

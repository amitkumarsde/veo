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
import { rateLimit } from "./rate-limit.middleware.js";

// Uploads go to a temp folder first (big videos never sit in memory), get checked, then get stored.
const TEMP_DIR = path.join(os.tmpdir(), "veo-uploads");
fs.mkdirSync(TEMP_DIR, { recursive: true });

// Enough of the start of a file to read the MP4 brand list, the WebM doctype and the Ogg codec.
const HEADER_BYTES = 64;
const MAX_TEXT_FIELDS = 20;
const MAX_TEXT_FIELD_BYTES = 64 * 1024;
// MP4 brands that browsers play; QuickTime (.mov), 3GP, HEIC images and M4A audio are not among them.
const MP4_BRANDS = new Set(["isom", "iso2", "iso3", "iso4", "iso5", "iso6", "iso8", "mp41", "mp42", "avc1", "dash", "mmp4", "M4V ", "M4VH", "M4VP", "MSNV"]);
// Main brands of image and audio files, which also list the MP4 brands above as compatible.
const NON_VIDEO_BRANDS = new Set(["heic", "heix", "hevc", "hevx", "heim", "heis", "mif1", "msf1", "avif", "avis", "M4A ", "M4B ", "M4P "]);

// Uploads fill temp disk, so each user can send at most 20 every 15 minutes.
const uploadLimit = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    keyFor: (req) => req.user.id,
    message: "Too many uploads. Please try again in 15 minutes.",
});

const typeNames = (kind) => kind.types.map((type) => FILE_EXTENSIONS[type].toUpperCase()).join(", ");

// Reads the MP4 brand list: the main brand, then the brands the file also works as.
const isPlayableMp4 = (header, ascii) => {
    if (ascii(4, 8) !== "ftyp" || NON_VIDEO_BRANDS.has(ascii(8, 12))) return false;
    const boxEnd = Math.min(header.length, header.readUInt32BE(0));
    const brands = [ascii(8, 12)];
    for (let offset = 16; offset + 4 <= boxEnd; offset += 4) brands.push(ascii(offset, offset + 4));
    return brands.some((brand) => MP4_BRANDS.has(brand));
};

// Finds the real type from the first bytes, so a renamed HTML/SVG file or a MOV, MKV or audio file can't pass.
const detectContentType = (header) => {
    const ascii = (start, end) => header.toString("latin1", start, end);
    if (header.length < 12) return null;
    if (header[0] === 0xff && header[1] === 0xd8 && header[2] === 0xff) return "image/jpeg";
    if (header[0] === 0x89 && ascii(1, 4) === "PNG") return "image/png";
    if (ascii(0, 4) === "GIF8") return "image/gif";
    if (ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") return "image/webp";
    if (isPlayableMp4(header, ascii)) return "video/mp4";
    // A Matroska file is WebM only when it says "webm" inside.
    if (header[0] === 0x1a && header[1] === 0x45 && header[2] === 0xdf && header[3] === 0xa3 && ascii(0, header.length).includes("webm")) return "video/webm";
    // The first Ogg page names its codec: Theora is video, Vorbis or Opus is audio only.
    if (ascii(0, 4) === "OggS" && ascii(0, header.length).includes("\x80theora")) return "video/ogg";
    return null;
};

const removeFile = (filePath) => fs.promises.rm(filePath, { force: true }).catch(() => {});

// Saves each file to a temp file, stops it if too big, and keeps its first bytes to check its real type.
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

// Accepts these file fields (limited per user); text goes to req.body, checked files to req.uploads.
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

    const parseAndCheck = (req, res, next) => {
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
    // Must come after requireAuth, which sets req.user.
    return [uploadLimit, parseAndCheck];
};

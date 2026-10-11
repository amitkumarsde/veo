import { randomUUID } from "node:crypto";
import fs from "node:fs";
import { DeleteObjectsCommand, HeadBucketCommand, S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";

import { config } from "../config/env.js";
import { FILE_EXTENSIONS } from "../constants/uploads.js";
import { serviceUnavailable } from "../errors/app-error.js";
import { logger } from "../utils/logger.js";

// Saves public files in Supabase Storage (create the bucket in the Supabase dashboard).
const settings = config.storage;
const client = settings
    ? new S3Client({
        endpoint: settings.endpoint,
        region: settings.region,
        credentials: { accessKeyId: settings.accessKeyId, secretAccessKey: settings.secretAccessKey },
        forcePathStyle: settings.forcePathStyle,
    })
    : null;

const S3_DELETE_BATCH = 1000;
export const UPLOADS_UNAVAILABLE_MESSAGE = "File uploads are not available right now. Please try again later.";

let bucketReady = false;
let bucketSetup = null;

export const isStorageEnabled = () => client !== null;

const describeStorageError = (error) => {
    const code = error?.code || error?.cause?.code || error?.name;
    if (code === "ECONNREFUSED") return `nothing is listening at ${settings.endpoint}`;
    if (code === "ENOTFOUND") return `cannot resolve the host in ${settings.endpoint}`;
    if (code === "InvalidAccessKeyId" || code === "SignatureDoesNotMatch") return "wrong STORAGE_ACCESS_KEY / STORAGE_SECRET_KEY";
    return `${error?.name || "Error"}: ${error?.message}`;
};

const checkBucketExists = async () => {
    try {
        await client.send(new HeadBucketCommand({ Bucket: settings.bucket }));
    } catch (error) {
        const status = error?.$metadata?.httpStatusCode;
        // Keys with limited rights may not be allowed to look at the bucket itself.
        const isBadCredentials = ["InvalidAccessKeyId", "SignatureDoesNotMatch"].includes(error?.name ?? error?.Code);
        if (status === 403 && !isBadCredentials) return;
        if (status === 404 || error?.name === "NotFound") {
            throw new Error(`bucket "${settings.bucket}" does not exist; create it in the storage dashboard`, { cause: error });
        }
        throw error;
    }
};

// Retries until it works once, so a storage outage at startup doesn't turn uploads off for good.
const ensureBucketReady = async () => {
    if (bucketReady) return;
    bucketSetup ??= checkBucketExists()
        .then(() => {
            bucketReady = true;
            logger.info("Storage ready", { bucket: settings.bucket, publicUrl: settings.publicUrl });
        })
        .finally(() => { bucketSetup = null; });
    await bucketSetup;
};

export const initStorage = async () => {
    if (!client) {
        logger.warn("Storage is not configured (STORAGE_ENDPOINT / STORAGE_ACCESS_KEY / STORAGE_SECRET_KEY): uploads are off.");
        return;
    }
    try {
        await ensureBucketReady();
    } catch (error) {
        logger.error("Storage check failed; it will be retried on the next upload", { error: describeStorageError(error) });
    }
};

const ownerSegment = (owner) => String(owner).replace(/[^A-Za-z0-9_-]/g, "_") || "user";

// Sends a checked temp file to the bucket and returns its public URL; keys are never reused.
const uploadFile = async (file, folder, owner) => {
    if (!client) throw serviceUnavailable(UPLOADS_UNAVAILABLE_MESSAGE);
    try {
        await ensureBucketReady();
    } catch (error) {
        logger.error("Storage unavailable", { error: describeStorageError(error) });
        throw serviceUnavailable(UPLOADS_UNAVAILABLE_MESSAGE);
    }
    const key = `${folder}/${ownerSegment(owner)}/${randomUUID()}.${FILE_EXTENSIONS[file.contentType]}`;
    await new Upload({
        client,
        params: {
            Bucket: settings.bucket,
            Key: key,
            Body: fs.createReadStream(file.path),
            ContentType: file.contentType,
            CacheControl: "public, max-age=31536000, immutable",
        },
    }).done();
    return `${settings.publicUrl}/${key}`;
};

const keyFromUrl = (url) => {
    if (!client || typeof url !== "string" || !url.startsWith(`${settings.publicUrl}/`)) return null;
    return url.slice(settings.publicUrl.length + 1) || null;
};

// True only for files stored by this server; pasted links and outside images are never deleted.
export const isStoredUrl = (url) => keyFromUrl(url) !== null;

// Never throws, because a leftover file must not fail the request.
export const deleteStoredFiles = async (...urls) => {
    const keys = [...new Set(urls.flat(Infinity).map(keyFromUrl).filter(Boolean))];
    for (let start = 0; start < keys.length; start += S3_DELETE_BATCH) {
        const batch = keys.slice(start, start + S3_DELETE_BATCH);
        try {
            await client.send(new DeleteObjectsCommand({
                Bucket: settings.bucket,
                Delete: { Objects: batch.map((Key) => ({ Key })), Quiet: true },
            }));
        } catch (error) {
            logger.warn("Could not delete stored files", { count: batch.length, error: describeStorageError(error) });
        }
    }
};

// Runs `work` with a `store` function; if `work` fails, the files it stored are deleted.
export const withStoredFiles = async (work) => {
    const storedUrls = [];
    const store = async (file, folder, owner) => {
        const url = await uploadFile(file, folder, owner);
        storedUrls.push(url);
        return url;
    };
    try {
        return await work(store);
    } catch (error) {
        await deleteStoredFiles(storedUrls);
        throw error;
    }
};

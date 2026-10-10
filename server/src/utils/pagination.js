import mongoose from "mongoose";

import { badRequest } from "../errors/app-error.js";

// Cursor paging: stays correct while new items arrive and is fast at any depth.
export const VIDEO_SORTS = Object.freeze({
    newest: { name: "newest", field: "uploadDate", direction: -1, type: "date" },
    oldest: { name: "oldest", field: "uploadDate", direction: 1, type: "date" },
    popular: { name: "popular", field: "views", direction: -1, type: "number" },
});

export const COMMENT_SORTS = Object.freeze({
    newest: { name: "newest", field: "createdAt", direction: -1, type: "date" },
    oldest: { name: "oldest", field: "createdAt", direction: 1, type: "date" },
});

const encodeCursor = (sort, doc) =>
    Buffer.from(JSON.stringify([sort.name, doc[sort.field], String(doc._id)])).toString("base64url");

const decodeCursor = (cursor, sort) => {
    let parts;
    try {
        parts = JSON.parse(Buffer.from(cursor, "base64url").toString());
    } catch {
        throw badRequest("Invalid cursor.");
    }
    const [name, rawValue, id] = Array.isArray(parts) ? parts : [];
    if (name !== sort.name || !mongoose.isValidObjectId(id)) throw badRequest("Invalid cursor.");
    const value = sort.type === "date" ? new Date(rawValue) : Number(rawValue);
    if (Number.isNaN(sort.type === "date" ? value.getTime() : value)) throw badRequest("Invalid cursor.");
    return { value, id: new mongoose.Types.ObjectId(id) };
};

const filterAfterCursor = (cursor, sort) => {
    if (!cursor) return {};
    const { value, id } = decodeCursor(cursor, sort);
    const operator = sort.direction === -1 ? "$lt" : "$gt";
    return { $or: [{ [sort.field]: { [operator]: value } }, { [sort.field]: value, _id: { [operator]: id } }] };
};

// Fetches one extra document to know whether another page exists.
export const findPage = async (model, { filter, projection, sort, cursor, limit }) => {
    const docs = await model
        .find({ ...filter, ...filterAfterCursor(cursor, sort) }, projection)
        .sort({ [sort.field]: sort.direction, _id: sort.direction })
        .limit(limit + 1)
        .lean();
    const items = docs.slice(0, limit);
    return { items, nextCursor: docs.length > limit ? encodeCursor(sort, items.at(-1)) : null };
};

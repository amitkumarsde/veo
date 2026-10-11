const DUPLICATE_KEY_CODE = 11000;

// A unique index rejected the write (e.g. two identical requests at the same moment).
export const isDuplicateKeyError = (error) => error?.code === DUPLICATE_KEY_CODE;

// Adds the document only if it's missing, so two clicks at once add it once; true when it was added.
export const insertIfMissing = async (model, doc) => {
    try {
        const result = await model.updateOne(doc, { $setOnInsert: doc }, { upsert: true });
        return result.upsertedCount > 0;
    } catch (error) {
        if (isDuplicateKeyError(error)) return false;
        throw error;
    }
};

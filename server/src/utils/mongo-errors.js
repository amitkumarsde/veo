const DUPLICATE_KEY_CODE = 11000;

// A unique index rejected the write (e.g. two identical requests at the same moment).
export const isDuplicateKeyError = (error) => error?.code === DUPLICATE_KEY_CODE;

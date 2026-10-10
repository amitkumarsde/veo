import bcrypt from "bcryptjs";

const BCRYPT_ROUNDS = 10;

export const hashPassword = (password) => bcrypt.hash(password, BCRYPT_ROUNDS);
export const isPasswordCorrect = (password, hash) => bcrypt.compare(password, hash);

// I compare against this when an email is unknown, so the reply time doesn't show which emails exist.
export const UNKNOWN_USER_HASH = bcrypt.hashSync("veo-unknown-user", BCRYPT_ROUNDS);

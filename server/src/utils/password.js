import bcrypt from "bcryptjs";

const BCRYPT_ROUNDS = 10;

export const hashPassword = (password) => bcrypt.hash(password, BCRYPT_ROUNDS);
export const isPasswordCorrect = (password, hash) => bcrypt.compare(password, hash);

// Compared against when an email is unknown, so response time doesn't reveal which emails exist.
export const UNKNOWN_USER_HASH = bcrypt.hashSync("veo-unknown-user", BCRYPT_ROUNDS);

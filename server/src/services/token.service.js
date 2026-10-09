import jwt from "jsonwebtoken";

import { config } from "../config/env.js";

const ALGORITHM = "HS256";

export const signAccessToken = (userId) =>
    jwt.sign({}, config.jwt.secret, { algorithm: ALGORITHM, expiresIn: config.jwt.expiresIn, subject: String(userId) });

// The token's claims, or null when it is missing, malformed, expired or forged.
export const verifyAccessToken = (token) => {
    try {
        const claims = jwt.verify(token, config.jwt.secret, { algorithms: [ALGORITHM] });
        return typeof claims?.sub === "string" && typeof claims.iat === "number" ? claims : null;
    } catch {
        return null;
    }
};

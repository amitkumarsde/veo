import jwt from "jsonwebtoken";

import { config } from "../config/env.js";

const ALGORITHM = "HS256";
const TOKEN_LIFETIME = "2d";

export const signAccessToken = (userId) =>
    jwt.sign({}, config.jwtSecret, { algorithm: ALGORITHM, expiresIn: TOKEN_LIFETIME, subject: String(userId) });

// Returns the token's claims, or null when it's missing, broken, expired or fake.
export const verifyAccessToken = (token) => {
    try {
        const claims = jwt.verify(token, config.jwtSecret, { algorithms: [ALGORITHM] });
        return typeof claims?.sub === "string" && typeof claims.iat === "number" ? claims : null;
    } catch {
        return null;
    }
};

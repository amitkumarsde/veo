import { unauthorized } from "../errors/app-error.js";
import { resolveSession } from "../services/auth.service.js";

const readBearerToken = (req) => {
    const [scheme, token] = (req.get("authorization") ?? "").split(" ");
    return /^Bearer$/i.test(scheme ?? "") && token ? token : null;
};

// Protected routes: sets req.user = { id, username } or answers 401.
export const requireAuth = async (req, res, next) => {
    const token = readBearerToken(req);
    const user = token ? await resolveSession(token) : null;
    if (!user) throw unauthorized();
    req.user = user;
    next();
};

// For public routes that show a bit more to logged-in visitors; a bad token counts as logged out.
export const optionalAuth = async (req, res, next) => {
    const token = readBearerToken(req);
    if (token) req.user = (await resolveSession(token)) ?? undefined;
    next();
};

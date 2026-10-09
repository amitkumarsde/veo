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

// Public routes that show a little more to signed-in viewers (e.g. "you liked this"). Bad tokens count as signed out.
export const optionalAuth = async (req, res, next) => {
    const token = readBearerToken(req);
    if (token) req.user = (await resolveSession(token)) ?? undefined;
    next();
};

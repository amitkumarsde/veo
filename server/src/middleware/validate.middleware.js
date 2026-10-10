import { badRequest } from "../errors/app-error.js";

const REQUEST_PARTS = ["params", "query", "body"];

// Checks the request with Zod; clean values go to req.validated and bad input gets a 400 with a message per field.
export const validate = (schemas) => (req, res, next) => {
    req.validated = {};
    for (const part of REQUEST_PARTS) {
        if (!schemas[part]) continue;
        const result = schemas[part].safeParse(req[part] ?? {});
        if (!result.success) {
            const fields = {};
            for (const issue of result.error.issues) fields[issue.path[0] ?? part] ??= issue.message;
            throw badRequest(Object.values(fields)[0], fields);
        }
        req.validated[part] = result.data;
    }
    next();
};

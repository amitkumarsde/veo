// Every successful reply has the same shape: { success: true, message?, data }.
export const sendSuccess = (res, data = null, { status = 200, message } = {}) =>
    res.status(status).json({ success: true, ...(message ? { message } : {}), data });

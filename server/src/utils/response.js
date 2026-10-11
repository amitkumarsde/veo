// Every successful reply has the same shape: { success: true, data }.
export const sendSuccess = (res, data = null, status = 200) => res.status(status).json({ success: true, data });

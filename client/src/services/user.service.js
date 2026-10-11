import { http, unwrap } from "@/services/http";

// Wrong credentials on these forms are form errors, not an expired session.
const AUTH_REQUEST = { isAuthRequest: true };

export const register = (credentials) => http.post("/users/register", credentials, AUTH_REQUEST).then(unwrap);
export const login = (credentials) => http.post("/users/login", credentials, AUTH_REQUEST).then(unwrap);
export const resetPassword = (body) => http.post("/users/reset-password", body, AUTH_REQUEST).then(unwrap);

export const getCurrentUser = () => http.get("/users/me").then(unwrap);
export const updateProfile = (formData, options) => http.patch("/users/me", formData, options).then(unwrap);
export const deleteAccount = (password) => http.delete("/users/me", { data: { password } }).then(unwrap);

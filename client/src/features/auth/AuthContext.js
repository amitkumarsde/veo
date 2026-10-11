import { createContext } from "react";

// { user, login({ token, user }), logout(), updateUser(user | updater), refreshUser() }
export const AuthContext = createContext(null);

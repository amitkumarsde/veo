import { createContext } from "react";

// { user, signIn({ token, user }), signOut(), updateUser(user | updater), refreshUser() }
export const AuthContext = createContext(null);

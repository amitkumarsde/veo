import { createContext } from 'react';

// Holds the authenticated user (or null) and exposes a setter. `loading` is
// true only while the persisted user is being restored on first mount.
export const AuthContext = createContext({
    user: null,
    setUser: () => {},
    loading: true,
});

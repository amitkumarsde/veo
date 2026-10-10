import { createContext } from "react";

// confirm({ title, message, confirmLabel, danger }) -> Promise<boolean>
export const ConfirmContext = createContext(() => Promise.resolve(false));

import { createContext } from "react";

// confirm({ title, message, confirmLabel, cancelLabel, danger }) -> Promise<boolean>
export const ConfirmContext = createContext(() => Promise.resolve(false));

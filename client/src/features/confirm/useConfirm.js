import { useContext } from "react";

import { ConfirmContext } from "@/features/confirm/ConfirmContext";

export const useConfirm = () => useContext(ConfirmContext);

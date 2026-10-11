import { useCallback } from "react";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";

import { useAuth } from "@/features/auth/useAuth";
import { useConfirm } from "@/features/confirm/useConfirm";
import { confirmLeavingUnsavedPage } from "@/hooks/useUnsavedChanges";

// Logs out from any page, asking first if there are unsaved changes; going home first stops a jump to /login.
export const useLogout = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const confirm = useConfirm();

    return useCallback(async (message = "Logged out") => {
        if (!(await confirmLeavingUnsavedPage(confirm, "Log out"))) return;
        await navigate("/", { replace: true, flushSync: true });
        logout();
        toast.success(message);
    }, [navigate, logout, confirm]);
};

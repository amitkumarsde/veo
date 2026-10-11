import { Navigate, Outlet, useLocation } from "react-router";

import { useAuth } from "@/features/auth/useAuth";
import { getUserChannels } from "@/features/channels/user-channels";

// Sends logged-out visitors to log in, and with `requireChannel` users without a channel to create one.
const RequireAuth = ({ requireChannel = false }) => {
    const { user } = useAuth();
    const location = useLocation();

    if (!user) return <Navigate to="/login" replace state={{ from: `${location.pathname}${location.search}` }} />;
    if (requireChannel && getUserChannels(user).length === 0) return <Navigate to="/create-channel" replace />;
    return <Outlet />;
};

export default RequireAuth;

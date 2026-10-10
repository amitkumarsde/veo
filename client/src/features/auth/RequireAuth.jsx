import { Navigate, Outlet, useLocation } from "react-router";

import { useAuth } from "@/features/auth/useAuth";

// Sends signed-out visitors to sign in, and with `requireChannel` users without a channel to create one.
const RequireAuth = ({ requireChannel = false }) => {
    const { user } = useAuth();
    const location = useLocation();

    if (!user) return <Navigate to="/signin" replace state={{ from: `${location.pathname}${location.search}` }} />;
    if (requireChannel && !user.channelId) return <Navigate to="/create-channel" replace />;
    return <Outlet />;
};

export default RequireAuth;

import { Navigate, Outlet, useLocation } from "react-router";

import { useAuth } from "@/features/auth/useAuth";

// Route guard for the UI only; the API enforces every permission itself.
// Signed-out visitors go to sign in; with `requireChannel`, users without a channel go to create one.
const RequireAuth = ({ requireChannel = false }) => {
    const { user } = useAuth();
    const location = useLocation();

    if (!user) return <Navigate to="/signin" replace state={{ from: `${location.pathname}${location.search}` }} />;
    if (requireChannel && !user.channelId) return <Navigate to="/create-channel" replace />;
    return <Outlet />;
};

export default RequireAuth;

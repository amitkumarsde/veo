import { createBrowserRouter } from "react-router";

import { pageLoaders } from "@/app/page-loaders";
import { Spinner } from "@/components/common/States";
import RootLayout from "@/components/layout/RootLayout";
import RequireAuth from "@/features/auth/RequireAuth";
import HomePage from "@/pages/HomePage";
import NotFoundPage from "@/pages/NotFoundPage";
import RouteErrorPage from "@/pages/RouteErrorPage";

// Loads a page file and uses its default export as the route screen.
const lazyPage = (name) => async () => ({ Component: (await pageLoaders[name]()).default });

export const router = createBrowserRouter([
    {
        path: "/",
        element: <RootLayout />,
        errorElement: <RouteErrorPage />,
        hydrateFallbackElement: <Spinner />,
        children: [
            { index: true, element: <HomePage /> },
            { path: "signin", lazy: lazyPage("signIn") },
            { path: "signup", lazy: lazyPage("signUp") },
            { path: "forgot-password", lazy: lazyPage("forgotPassword") },
            { path: "channel/:channelId", lazy: lazyPage("channel") },
            { path: "video/:videoId", lazy: lazyPage("video") },
            {
                element: <RequireAuth />,
                children: [
                    { path: "profile", lazy: lazyPage("profile") },
                    { path: "profile/edit", lazy: lazyPage("editProfile") },
                    { path: "studio", lazy: lazyPage("studio") },
                    { path: "create-channel", lazy: lazyPage("createChannel") },
                    { path: "update-channel/:channelId", lazy: lazyPage("editChannel") },
                    { path: "update-video/:videoId", lazy: lazyPage("editVideo") },
                ],
            },
            {
                element: <RequireAuth requireChannel />,
                children: [{ path: "upload-video", lazy: lazyPage("uploadVideo") }],
            },
            { path: "*", element: <NotFoundPage /> },
        ],
    },
]);

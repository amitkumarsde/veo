// Each page is its own chunk, downloaded on first visit. Links can start the download early on hover.
export const pageLoaders = {
    signIn: () => import("@/pages/SignInPage"),
    signUp: () => import("@/pages/SignUpPage"),
    forgotPassword: () => import("@/pages/ForgotPasswordPage"),
    profile: () => import("@/pages/ProfilePage"),
    editProfile: () => import("@/pages/EditProfilePage"),
    studio: () => import("@/pages/StudioPage"),
    channel: () => import("@/pages/ChannelPage"),
    video: () => import("@/pages/VideoPage"),
    createChannel: () => import("@/pages/CreateChannelPage"),
    editChannel: () => import("@/pages/EditChannelPage"),
    uploadVideo: () => import("@/pages/UploadVideoPage"),
    editVideo: () => import("@/pages/EditVideoPage"),
};

export const preloadPage = (name) => () => { pageLoaders[name]().catch(() => {}); };

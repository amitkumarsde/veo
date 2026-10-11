// Each page loads as its own file on first visit; hovering a link starts the download early.
export const pageLoaders = {
    login: () => import("@/pages/LoginPage"),
    register: () => import("@/pages/RegisterPage"),
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

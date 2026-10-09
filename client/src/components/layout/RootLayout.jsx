import { Outlet, ScrollRestoration, useNavigation } from "react-router";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import IndeterminateBar from "@/components/common/IndeterminateBar";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import ServerWakeNotice from "@/features/server-status/ServerWakeNotice";
import { useTheme } from "@/features/theme/useTheme";

const RootLayout = () => {
    const { isDark } = useTheme();
    const navigation = useNavigation();

    return (
        <div className="flex min-h-screen flex-col bg-canvas text-fg">
            <ScrollRestoration />
            <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-surface focus:px-3 focus:py-2">
                Skip to content
            </a>
            <Header />
            {navigation.state === "loading" && (
                <div className="fixed inset-x-0 top-16 z-40">
                    <IndeterminateBar />
                </div>
            )}
            <ServerWakeNotice />

            <main id="main" className="mx-auto w-full max-w-[1440px] flex-1 px-4 pb-24 pt-24 sm:px-8">
                <Outlet />
            </main>

            <Footer />
            <ToastContainer
                position="bottom-center"
                autoClose={3000}
                hideProgressBar
                closeButton={false}
                theme={isDark ? "dark" : "light"}
                toastClassName="!min-h-0 !rounded-ui !bg-fg !px-4 !py-3 !text-sm !font-medium !text-canvas !shadow-xl"
            />
        </div>
    );
};

export default RootLayout;

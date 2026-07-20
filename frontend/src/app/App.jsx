import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { FaSpinner } from 'react-icons/fa6';
import 'react-toastify/dist/ReactToastify.css';

import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import Header from '@/layouts/Header';

// Scrolls the window to the top whenever the route changes.
const ScrollToTop = () => {
    const { pathname } = useLocation();
    useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
    return null;
};

function App() {

    const { loading } = useAuth();
    const { isTheme } = useTheme();

    if (loading) return (
        <div className={isTheme ? "dark" : ""}>
            <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-canvas text-fg">
                <span className="font-display text-3xl font-bold tracking-tight text-gradient">VEO</span>
                <FaSpinner className="animate-spin text-xl text-accent" />
            </div>
        </div>
    );

    return (
        <div className={isTheme ? "dark" : ""}>
            <div className="relative min-h-screen overflow-x-hidden bg-canvas text-fg">
                <ScrollToTop />
                <Header />

                <main>
                    <div className="mx-auto max-w-[1600px] px-4 pb-20 pt-20 sm:px-6 lg:px-8">
                        <Outlet />
                    </div>
                </main>
            </div>

            <ToastContainer
                position="bottom-right"
                autoClose={2500}
                theme={isTheme ? "dark" : "light"}
                toastClassName="!rounded-xl !border !border-border !bg-surface !text-fg"
            />
        </div>
    );

}

export default App;

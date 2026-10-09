import { useEffect } from "react";
import { useRouteError } from "react-router";
import { ArrowLeft } from "lucide-react";

import Logo from "@/components/common/Logo";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

// Shown when rendering crashes or a page chunk fails to download (often after a new deploy).
const RouteErrorPage = () => {
    const error = useRouteError();
    useDocumentTitle("Something went wrong");
    useEffect(() => { console.error(error); }, [error]);

    return (
        <section className="flex min-h-screen flex-col items-start justify-center bg-canvas px-4 py-16 text-fg sm:px-8">
            <Logo className="mb-16 text-2xl" />
            <p className="font-display text-[clamp(6rem,18vw,12rem)] font-extrabold leading-none tracking-[-0.06em] text-accent">Oops</p>
            <h1 className="mt-6 text-3xl font-bold sm:text-4xl">Something went wrong</h1>
            <p className="mt-3 max-w-md text-[15px] text-muted">An unexpected error happened. Reloading the page usually fixes it.</p>
            <div className="mt-8 flex flex-wrap gap-6 text-[15px] font-medium">
                <button type="button" onClick={() => window.location.reload()} className="text-accent transition-colors hover:text-accent-hover">Reload page</button>
                <a href="/" className="inline-flex items-center gap-2 text-muted transition-colors hover:text-fg"><ArrowLeft size={18} aria-hidden /> Back to home</a>
            </div>
        </section>
    );
};

export default RouteErrorPage;

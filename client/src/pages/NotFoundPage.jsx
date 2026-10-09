import { Link } from "react-router";
import { ArrowLeft } from "lucide-react";

import { useDocumentTitle } from "@/hooks/useDocumentTitle";

const NotFoundPage = () => {
    useDocumentTitle("Page not found");

    return (
        <section className="flex min-h-[60vh] flex-col items-start justify-center py-16">
            <p className="font-display text-[clamp(6rem,18vw,12rem)] font-extrabold leading-none tracking-[-0.06em] text-accent">404</p>
            <h1 className="mt-6 text-3xl font-bold text-fg sm:text-4xl">This page doesn't exist</h1>
            <p className="mt-3 max-w-md text-[15px] text-muted">The link may be broken, or the page was moved.</p>
            <Link to="/" className="mt-8 inline-flex items-center gap-2 text-[15px] font-medium text-accent transition-colors hover:text-accent-hover">
                <ArrowLeft size={18} aria-hidden /> Back to home
            </Link>
        </section>
    );
};

export default NotFoundPage;

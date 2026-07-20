// Shared layout + framing for all auth / CRUD forms.

import { FaPlay } from "react-icons/fa6";

const FormShell = ({ title, subtitle, onSubmit, children }) => (
    <section className="flex min-h-[72vh] items-center justify-center">
        <div className="animate-fade-up w-full max-w-md">
            <form
                onSubmit={onSubmit}
                className="glow relative space-y-4 overflow-hidden rounded-3xl border border-border bg-surface/90 p-6 shadow-2xl shadow-black/20 sm:p-8"
            >
                {/* Accent wash along the top edge */}
                <div aria-hidden className="pointer-events-none absolute inset-x-0 -top-24 h-40 bg-accent/20 blur-3xl" />

                <div className="relative text-center">
                    <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-accent-gradient text-white shadow-lg glow">
                        <FaPlay className="text-sm" />
                    </span>
                    <h2 className="mt-4 font-display text-2xl font-bold tracking-tight text-fg">{title}</h2>
                    {subtitle && <p className="mt-1.5 text-sm text-muted">{subtitle}</p>}
                </div>

                <div className="relative space-y-4">{children}</div>
            </form>
        </div>
    </section>
);

export default FormShell;

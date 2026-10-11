// Log in / register / reset: a brand panel on large screens, the form beside it.
const AuthLayout = ({ title, subtitle, onSubmit, children, footer }) => (
    <section className="animate-rise mx-auto grid min-h-[calc(100vh-10rem)] max-w-6xl items-center gap-12 py-6 lg:grid-cols-2 lg:gap-20">
        <div className="hidden lg:block">
            <p className="font-display text-[clamp(3rem,6vw,5.5rem)] font-extrabold leading-[0.95] tracking-[-0.045em] text-fg">
                Stories<br />worth<br /><span className="text-accent">watching.</span>
            </p>
            <p className="mt-8 max-w-sm text-[15px] leading-relaxed text-muted">
                Find videos you will actually enjoy, follow the channels you love, and share your own.
            </p>
        </div>
        <div className="w-full max-w-md justify-self-center lg:justify-self-end">
            <h1 className="text-4xl font-bold text-fg">{title}</h1>
            {subtitle && <p className="mt-2 text-[15px] text-muted">{subtitle}</p>}
            <form onSubmit={onSubmit} noValidate className="mt-10 space-y-6">{children}</form>
            {footer && <div className="mt-8 border-t border-border pt-6 text-sm text-muted">{footer}</div>}
        </div>
    </section>
);

export default AuthLayout;

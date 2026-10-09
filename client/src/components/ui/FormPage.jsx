// Create/edit page: title and short help on one side, the form on the other (stacked on phones).
const FormPage = ({ eyebrow, title, description, onSubmit, children, actions }) => (
    <section className="animate-rise mx-auto grid max-w-5xl gap-10 py-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] md:gap-16">
        <header className="md:sticky md:top-28 md:self-start">
            {eyebrow && <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">{eyebrow}</p>}
            <h1 className="mt-3 text-4xl font-bold leading-[1.05] text-fg sm:text-5xl">{title}</h1>
            {description && <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-muted">{description}</p>}
        </header>
        <form onSubmit={onSubmit} noValidate className="min-w-0 space-y-7">
            {children}
            {actions && <div className="flex flex-wrap items-center gap-x-6 gap-y-4 border-t border-border pt-7">{actions}</div>}
        </form>
    </section>
);

export default FormPage;

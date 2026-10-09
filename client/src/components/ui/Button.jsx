const VARIANTS = {
    primary: "bg-accent text-on-accent hover:bg-accent-hover",
    danger: "bg-danger text-white hover:opacity-90",
};
const SIZES = { md: "h-11 px-5 text-sm", sm: "h-9 px-3.5 text-[13px]" };

const TONES = {
    muted: "text-muted hover:text-accent",
    fg: "text-fg hover:text-accent",
    accent: "text-accent hover:text-accent-hover",
    danger: "text-danger hover:opacity-75",
};

// Solid button, reserved for the main action on a screen. `as` renders e.g. a router Link with the same look.
export const Button = ({ as: Component = "button", variant = "primary", size = "md", className = "", type, ...props }) => (
    <Component
        type={Component === "button" ? type ?? "button" : undefined}
        className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-ui font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
        {...props}
    />
);

// Text-only action used for most secondary actions.
export const TextButton = ({ as: Component = "button", tone = "muted", active = false, className = "", type, ...props }) => (
    <Component
        type={Component === "button" ? type ?? "button" : undefined}
        className={`inline-flex items-center gap-1.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${active ? "text-accent" : TONES[tone]} ${className}`}
        {...props}
    />
);

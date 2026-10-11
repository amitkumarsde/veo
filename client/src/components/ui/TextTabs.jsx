// A row of text buttons that filter a list; capitalize={false} keeps names as typed.
const TextTabs = ({ options, value, onChange, label, className = "", capitalize = true }) => (
    <div role="group" aria-label={label} className={`no-scrollbar flex gap-6 overflow-x-auto ${className}`}>
        {options.map((option) => {
            const isActive = option.value === value;
            return (
                <button
                    key={option.value}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => onChange(option.value)}
                    className={`relative shrink-0 whitespace-nowrap py-2 text-sm font-medium ${capitalize ? "capitalize" : ""} transition-colors ${isActive ? "text-accent" : "text-muted hover:text-fg"}`}
                >
                    {option.label}
                    <span aria-hidden className={`absolute inset-x-0 -bottom-px h-0.5 bg-accent transition-transform ${isActive ? "scale-x-100" : "scale-x-0"}`} />
                </button>
            );
        })}
    </div>
);

export default TextTabs;

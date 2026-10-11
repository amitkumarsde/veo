import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

const FIELD_CLASS = "w-full rounded-ui border border-transparent bg-surface-2 px-3.5 text-[15px] text-fg placeholder:text-faint transition-colors hover:border-border-strong focus:border-accent focus:bg-surface focus:outline-none aria-[invalid=true]:border-danger disabled:cursor-not-allowed disabled:opacity-60";

export const Input = ({ className = "", ...props }) => <input className={`${FIELD_CLASS} h-11 ${className}`} {...props} />;

export const Select = ({ className = "", children, ...props }) => (
    <select className={`${FIELD_CLASS} h-11 ${className}`} {...props}>{children}</select>
);

export const Textarea = ({ className = "", rows = 4, ...props }) => (
    <textarea rows={rows} className={`${FIELD_CLASS} resize-y py-2.5 leading-relaxed ${className}`} {...props} />
);

export const PasswordInput = (props) => {
    const [isVisible, setIsVisible] = useState(false);
    return (
        <div className="relative">
            <Input type={isVisible ? "text" : "password"} className="pr-12" {...props} />
            <button
                type="button"
                onClick={() => setIsVisible((visible) => !visible)}
                aria-label={isVisible ? "Hide password" : "Show password"}
                aria-pressed={isVisible}
                className="absolute inset-y-0 right-0 grid w-11 place-items-center text-faint transition-colors hover:text-fg"
            >
                {isVisible ? <EyeOff size={18} aria-hidden /> : <Eye size={18} aria-hidden />}
            </button>
        </div>
    );
};

import { Children, cloneElement, useId } from "react";

// Label, hint and error around one input, linked together for screen readers.
const Field = ({ label, hint, error, children }) => {
    const generatedId = useId();
    const control = Children.only(children);
    const id = control.props.id ?? generatedId;
    const errorId = `${id}-error`;

    return (
        <div className="space-y-2">
            <div className="flex items-baseline justify-between gap-3">
                <label htmlFor={id} className="text-sm font-medium text-fg">{label}</label>
                {hint && <span className="text-xs text-faint">{hint}</span>}
            </div>
            {cloneElement(control, { id, "aria-invalid": Boolean(error), "aria-describedby": error ? errorId : undefined })}
            {error && <p id={errorId} className="text-[13px] text-danger">{error}</p>}
        </div>
    );
};

export default Field;

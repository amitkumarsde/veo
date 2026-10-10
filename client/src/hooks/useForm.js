import { useCallback, useState } from "react";
import { toast } from "react-toastify";

import { getErrorMessage, getFieldErrors } from "@/utils/errors";

// Focus the first field with an error once it has rendered.
const focusFirstError = () => requestAnimationFrame(() => document.querySelector('[aria-invalid="true"]')?.focus());

// Form values, per-field errors and whether the user changed anything.
export const useForm = (initialValues) => {
    const [values, setValues] = useState(initialValues);
    const [errors, setErrors] = useState({});
    const [isDirty, setIsDirty] = useState(false);

    const setField = useCallback((name, value) => {
        setValues((previous) => ({ ...previous, [name]: value }));
        setErrors((previous) => (previous[name] ? { ...previous, [name]: undefined } : previous));
        setIsDirty(true);
    }, []);

    const clearError = useCallback((name) => setErrors((previous) => (previous[name] ? { ...previous, [name]: undefined } : previous)), []);

    // Spread onto an input: <Input {...bind("title")} />
    const bind = (name) => ({ name, value: values[name] ?? "", onChange: (event) => setField(name, event.target.value) });

    // Loads saved data without counting it as a change.
    const reset = useCallback((nextValues) => {
        setValues(nextValues);
        setErrors({});
        setIsDirty(false);
    }, []);

    // Shows the given messages under their fields; returns true when there was at least one.
    const showErrors = (nextErrors) => {
        const present = Object.fromEntries(Object.entries(nextErrors).filter(([, message]) => message));
        if (!Object.keys(present).length) return false;
        setErrors(present);
        focusFirstError();
        return true;
    };

    // Server errors go under their fields (renamed by `aliases`); anything else shows as a toast.
    const showServerError = (error, fallback, aliases = {}) => {
        const shown = {};
        for (const [field, message] of Object.entries(getFieldErrors(error))) {
            const name = aliases[field] ?? field;
            if (name in values) shown[name] = message;
        }
        if (!showErrors(shown)) toast.error(getErrorMessage(error, fallback));
    };

    return { values, errors, isDirty, setField, clearError, bind, reset, showErrors, showServerError };
};

import { useState } from "react";

// "Amit Kumar" -> "AK"
const getInitials = (name = "") =>
    name.trim().split(/\s+/).slice(0, 2).map((word) => word.charAt(0)).join("").toUpperCase() || "?";

// The photo, or initials when there is none or it fails to load. Size and shape come from className.
const Avatar = ({ src, name, className = "h-9 w-9 rounded-full", alt = "" }) => {
    const [failedSrc, setFailedSrc] = useState(null);

    if (src && failedSrc !== src) {
        return <img src={src} alt={alt} loading="lazy" decoding="async" onError={() => setFailedSrc(src)} className={`${className} shrink-0 bg-surface-2 object-cover`} />;
    }
    return (
        <span
            role={alt ? "img" : undefined}
            aria-label={alt || undefined}
            aria-hidden={alt ? undefined : true}
            className={`${className} grid shrink-0 select-none place-items-center bg-accent-soft font-display font-bold text-accent`}
        >
            {getInitials(name)}
        </span>
    );
};

export default Avatar;

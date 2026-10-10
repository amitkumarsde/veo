import { useState } from "react";

// "Amit Kumar" -> "AK"
const getInitials = (name = "") =>
    name.trim().split(/\s+/).slice(0, 2).map((word) => word.charAt(0)).join("").toUpperCase() || "?";

// Shows the photo, or initials if there is none or it fails; className sets size and shape.
const Avatar = ({ src, name, className = "h-9 w-9 rounded-full" }) => {
    const [failedSrc, setFailedSrc] = useState(null);

    if (src && failedSrc !== src) {
        return <img src={src} alt="" loading="lazy" decoding="async" onError={() => setFailedSrc(src)} className={`${className} shrink-0 bg-surface-2 object-cover`} />;
    }
    return (
        <span
            aria-hidden
            className={`${className} grid shrink-0 select-none place-items-center bg-accent-soft font-display font-bold text-accent`}
        >
            {getInitials(name)}
        </span>
    );
};

export default Avatar;

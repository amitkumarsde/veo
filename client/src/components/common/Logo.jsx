import { Link } from "react-router";

// The Veo wordmark: bold lowercase "veo" with a square accent dot.
const Logo = ({ className = "text-2xl" }) => (
    <Link to="/" aria-label="Veo home" className={`inline-flex items-baseline font-display font-extrabold tracking-[-0.04em] text-fg ${className}`}>
        veo<span aria-hidden className="ml-0.5 inline-block h-[0.22em] w-[0.22em] bg-accent" />
    </Link>
);

export default Logo;

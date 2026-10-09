// Thin moving bar for waits of unknown length. Width and track colour come from className.
const IndeterminateBar = ({ className = "" }) => (
    <div aria-hidden className={`relative h-0.5 overflow-hidden ${className}`}>
        <span className="progress-indeterminate absolute inset-y-0 left-0 w-1/3 bg-accent" />
    </div>
);

export default IndeterminateBar;

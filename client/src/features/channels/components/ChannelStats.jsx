import { formatCount } from "@/utils/format";

// Totals for all the channel's videos, counted by the server.
const ChannelStats = ({ channel }) => {
    const stats = channel.stats ?? {};
    const totals = [
        ["Subscribers", channel.subscribers],
        ["Views", stats.views],
        ["Likes", stats.likes],
        ["Comments", stats.comments],
    ];

    return (
        <dl className="mt-12 grid grid-cols-2 border-y border-border sm:grid-cols-4">
            {totals.map(([label, value], index) => (
                <div key={label} className={`py-6 ${index % 2 ? "pl-6" : ""} ${index > 0 ? "sm:border-l sm:border-border sm:pl-6" : ""}`}>
                    <dt className="text-[13px] text-muted">{label}</dt>
                    <dd className="mt-1 font-display text-3xl font-bold tabular-nums text-fg sm:text-4xl">{formatCount(value)}</dd>
                </div>
            ))}
        </dl>
    );
};

export default ChannelStats;

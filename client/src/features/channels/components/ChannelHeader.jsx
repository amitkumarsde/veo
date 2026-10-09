import Avatar from "@/components/ui/Avatar";
import { pluralize } from "@/utils/format";

// Channel top: banner (or a flat accent band), logo, name, totals and actions.
const ChannelHeader = ({ channel, eyebrow, actions }) => (
    <header>
        {channel.channelBannerURL ? (
            <img src={channel.channelBannerURL} alt="" className="aspect-[3/1] w-full rounded-ui bg-surface-2 object-cover sm:aspect-[5/1]" />
        ) : (
            <div aria-hidden className="aspect-[6/1] w-full rounded-ui bg-accent-soft sm:aspect-[8/1]" />
        )}
        <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-end">
            <Avatar src={channel.channelAvatarURL} name={channel.channelName} className="h-20 w-20 rounded-ui text-3xl sm:h-24 sm:w-24" />
            <div className="min-w-0 flex-1">
                {eyebrow && <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">{eyebrow}</p>}
                <h1 className="mt-1 break-words text-4xl font-bold leading-tight text-fg sm:truncate sm:text-5xl">{channel.channelName}</h1>
                <p className="mt-2 text-sm text-muted">
                    @{channel.owner}
                    <span aria-hidden className="mx-1.5 text-faint">·</span>{pluralize(channel.subscribers ?? 0, "subscriber")}
                    <span aria-hidden className="mx-1.5 text-faint">·</span>{pluralize(channel.stats?.videos ?? 0, "video")}
                </p>
            </div>
            {actions && <div className="flex flex-wrap items-center gap-6">{actions}</div>}
        </div>
        {channel.description && <p className="mt-6 max-w-3xl whitespace-pre-line break-words text-[15px] leading-relaxed text-muted">{channel.description}</p>}
    </header>
);

export default ChannelHeader;

import { useState } from "react";
import { Link } from "react-router";
import { ArrowRight, LogOut, Pencil } from "lucide-react";

import Avatar from "@/components/ui/Avatar";
import { Button, TextButton } from "@/components/ui/Button";
import Field from "@/components/ui/Field";
import { PasswordInput } from "@/components/ui/Input";
import { useAuth } from "@/features/auth/useAuth";
import { useLogout } from "@/features/auth/useLogout";
import { canCreateChannel, getUserChannels } from "@/features/channels/user-channels";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useForm } from "@/hooks/useForm";
import { deleteAccount } from "@/services/user.service";
import { clearLists } from "@/utils/list-cache";
import { formatMonthYear } from "@/utils/format";
import { studioPath } from "@/utils/paths";

const DetailRow = ({ label, children }) => (
    <div className="grid gap-1 py-5 sm:grid-cols-[12rem_minmax(0,1fr)] sm:gap-8">
        <dt className="text-sm text-muted">{label}</dt>
        <dd className="min-w-0 break-words text-[15px] text-fg">{children}</dd>
    </div>
);

const DeleteAccountSection = ({ channelCount, onDeleted }) => {
    const [isConfirming, setIsConfirming] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const form = useForm({ password: "" });

    const cancel = () => {
        setIsConfirming(false);
        form.reset({ password: "" });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (form.showErrors({ password: !form.values.password && "Enter your password to confirm." })) return;
        setIsDeleting(true);
        try {
            await deleteAccount(form.values.password);
            onDeleted();
        } catch (error) {
            form.showServerError(error, "Couldn't delete your account.");
            setIsDeleting(false);
        }
    };

    return (
        <section className="mt-16" aria-labelledby="delete-account-heading">
            <h2 id="delete-account-heading" className="text-lg font-bold text-danger">Delete account</h2>
            <p className="mt-2 text-[15px] leading-relaxed text-muted">
                This permanently deletes your account
                {channelCount === 1 ? ", your channel and all its videos" : channelCount > 1 ? `, your ${channelCount} channels and all their videos` : ""}
                , plus your comments, likes and subscriptions. It can't be undone.
            </p>
            {isConfirming ? (
                <form onSubmit={handleSubmit} noValidate className="mt-6 max-w-md space-y-5">
                    <Field label="Your password" error={form.errors.password}>
                        <PasswordInput autoComplete="current-password" autoFocus {...form.bind("password")} />
                    </Field>
                    <div className="flex items-center gap-6">
                        <Button type="submit" variant="danger" disabled={isDeleting}>{isDeleting ? "Deleting…" : "Delete forever"}</Button>
                        <TextButton onClick={cancel}>Cancel</TextButton>
                    </div>
                </form>
            ) : (
                <TextButton onClick={() => setIsConfirming(true)} tone="danger" className="mt-5">Delete my account…</TextButton>
            )}
        </section>
    );
};

// Account page: details, edit, log out, channel and delete account.
const ProfilePage = () => {
    const { user } = useAuth();
    const leave = useLogout();
    const channels = getUserChannels(user);
    useDocumentTitle("Your profile");

    const handleAccountDeleted = () => {
        clearLists();
        leave("Your account has been deleted");
    };

    const displayName = user.name || user.username;
    const memberSince = formatMonthYear(user.createdAt);

    return (
        <div className="animate-rise mx-auto max-w-3xl">
            <header className="flex flex-col gap-6 sm:flex-row sm:items-center">
                <Avatar src={user.avatarURL} name={displayName} className="h-24 w-24 rounded-full text-3xl" />
                <div className="min-w-0 flex-1">
                    <h1 className="truncate text-4xl font-bold text-fg sm:text-5xl">{displayName}</h1>
                    <p className="mt-1 text-[15px] text-muted">@{user.username}</p>
                </div>
                <div className="flex items-center gap-6">
                    <TextButton as={Link} to="/profile/edit" tone="accent"><Pencil size={16} aria-hidden /> Edit profile</TextButton>
                    <TextButton onClick={() => leave("Logged out")}><LogOut size={16} aria-hidden /> Log out</TextButton>
                </div>
            </header>
            {user.bio && <p className="mt-8 whitespace-pre-line break-words text-[15px] leading-relaxed text-fg">{user.bio}</p>}

            <dl className="mt-12 divide-y divide-border border-y border-border">
                <DetailRow label="Email">{user.email}</DetailRow>
                {memberSince && <DetailRow label="Member since">{memberSince}</DetailRow>}
                <DetailRow label={channels.length > 1 ? "Channels" : "Channel"}>
                    <div className="flex flex-col items-start gap-3">
                        {channels.map((channel) => (
                            <TextButton key={channel.channelId} as={Link} to={studioPath(channel.channelId)} tone="fg" className="text-[15px]">
                                <Avatar src={channel.channelAvatarURL} name={channel.channelName ?? "?"} className="h-6 w-6 rounded-sm text-[10px]" />
                                {channel.channelName ?? "Your channel"} <ArrowRight size={16} aria-hidden />
                            </TextButton>
                        ))}
                        {canCreateChannel(user) && (
                            <TextButton as={Link} to="/create-channel" tone="accent" className="text-[15px]">
                                {channels.length ? "Create another channel" : "Create a channel"} <ArrowRight size={16} aria-hidden />
                            </TextButton>
                        )}
                    </div>
                </DetailRow>
            </dl>

            <DeleteAccountSection channelCount={channels.length} onDeleted={handleAccountDeleted} />
        </div>
    );
};

export default ProfilePage;

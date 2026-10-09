import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "react-toastify";
import { ArrowRight, LogOut, Pencil } from "lucide-react";

import Avatar from "@/components/ui/Avatar";
import { Button, TextButton } from "@/components/ui/Button";
import Field from "@/components/ui/Field";
import { PasswordInput } from "@/components/ui/Input";
import { useAuth } from "@/features/auth/useAuth";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useForm } from "@/hooks/useForm";
import { useResource } from "@/hooks/useResource";
import { getChannel } from "@/services/channel.service";
import { deleteAccount } from "@/services/user.service";
import { clearLists } from "@/utils/list-cache";
import { formatMonthYear } from "@/utils/format";

const DetailRow = ({ label, children }) => (
    <div className="grid gap-1 py-5 sm:grid-cols-[12rem_minmax(0,1fr)] sm:gap-8">
        <dt className="text-sm text-muted">{label}</dt>
        <dd className="min-w-0 break-words text-[15px] text-fg">{children}</dd>
    </div>
);

const DeleteAccountSection = ({ hasChannel, onDeleted }) => {
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
                This permanently deletes your account{hasChannel ? ", your channel and all its videos" : ""}, plus your comments, likes and subscriptions. It can't be undone.
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

// Your account: details, edit, sign out, your channel, and delete account.
const ProfilePage = () => {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const channel = useResource((signal) => getChannel(user.channelId, signal), user.channelId ?? null).data;
    useDocumentTitle("Your profile");

    // Leave the protected page first, so the sign-in guard doesn't redirect to /signin instead.
    const leave = async (message) => {
        await navigate("/", { replace: true, flushSync: true });
        signOut();
        toast.success(message);
    };
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
                    <TextButton onClick={() => leave("Signed out")}><LogOut size={16} aria-hidden /> Sign out</TextButton>
                </div>
            </header>
            {user.bio && <p className="mt-8 whitespace-pre-line break-words text-[15px] leading-relaxed text-fg">{user.bio}</p>}

            <dl className="mt-12 divide-y divide-border border-y border-border">
                <DetailRow label="Email">{user.email}</DetailRow>
                {memberSince && <DetailRow label="Member since">{memberSince}</DetailRow>}
                <DetailRow label="Channel">
                    {user.channelId ? (
                        <TextButton as={Link} to="/studio" tone="fg" className="text-[15px]">
                            <Avatar src={channel?.channelAvatarURL} name={channel?.channelName ?? "?"} className="h-6 w-6 rounded-sm text-[10px]" />
                            {channel?.channelName ?? "Your channel"} <ArrowRight size={16} aria-hidden />
                        </TextButton>
                    ) : (
                        <TextButton as={Link} to="/create-channel" tone="accent" className="text-[15px]">Create a channel <ArrowRight size={16} aria-hidden /></TextButton>
                    )}
                </DetailRow>
            </dl>

            <DeleteAccountSection hasChannel={Boolean(user.channelId)} onDeleted={handleAccountDeleted} />
        </div>
    );
};

export default ProfilePage;

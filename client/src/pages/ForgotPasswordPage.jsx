import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { toast } from "react-toastify";

import AuthLayout from "@/components/ui/AuthLayout";
import { Button, TextButton } from "@/components/ui/Button";
import Field from "@/components/ui/Field";
import { Input, PasswordInput } from "@/components/ui/Input";
import { LIMITS } from "@/constants/limits";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useForm } from "@/hooks/useForm";
import { resetPassword } from "@/services/user.service";

// Sets a new password for the account with this email (no email is sent).
const ForgotPasswordPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const form = useForm({ email: location.state?.email ?? "", newPassword: "", confirmPassword: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);
    useDocumentTitle("Reset password");

    const handleSubmit = async (event) => {
        event.preventDefault();
        const email = form.values.email.trim();
        const { newPassword, confirmPassword } = form.values;
        if (form.showErrors({
            email: !email && "Enter your email.",
            newPassword: newPassword.length < LIMITS.password.min && `Use at least ${LIMITS.password.min} characters.`,
            confirmPassword: newPassword !== confirmPassword && "Passwords don't match.",
        })) return;
        setIsSubmitting(true);
        try {
            await resetPassword({ email, newPassword });
            toast.success("Password changed. Sign in with your new password.");
            navigate("/signin", { replace: true, state: { email } });
        } catch (error) {
            form.showServerError(error, "Couldn't change the password. Please try again.");
            setIsSubmitting(false);
        }
    };

    return (
        <AuthLayout
            title="Reset password"
            subtitle="Enter your account email and choose a new password."
            onSubmit={handleSubmit}
            footer={<>Remembered it? <TextButton as={Link} to="/signin" tone="accent">Back to sign in</TextButton></>}
        >
            <Field label="Email" error={form.errors.email}>
                <Input type="email" autoComplete="email" autoFocus={!form.values.email} {...form.bind("email")} />
            </Field>
            <Field label="New password" hint={`At least ${LIMITS.password.min} characters`} error={form.errors.newPassword}>
                <PasswordInput autoComplete="new-password" maxLength={LIMITS.password.max} {...form.bind("newPassword")} />
            </Field>
            <Field label="Confirm new password" error={form.errors.confirmPassword}>
                <PasswordInput autoComplete="new-password" maxLength={LIMITS.password.max} {...form.bind("confirmPassword")} />
            </Field>
            <Button type="submit" disabled={isSubmitting} className="w-full">{isSubmitting ? "Saving…" : "Change password"}</Button>
        </AuthLayout>
    );
};

export default ForgotPasswordPage;

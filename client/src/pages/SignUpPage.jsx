import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router";
import { toast } from "react-toastify";

import AuthLayout from "@/components/ui/AuthLayout";
import { Button, TextButton } from "@/components/ui/Button";
import Field from "@/components/ui/Field";
import { Input, PasswordInput } from "@/components/ui/Input";
import { LIMITS } from "@/constants/limits";
import { useAuth } from "@/features/auth/useAuth";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useForm } from "@/hooks/useForm";
import { signUp } from "@/services/user.service";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const SignUpPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const form = useForm({ name: "", email: "", password: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);
    useDocumentTitle("Create account");

    if (user) return <Navigate to="/" replace />;

    const handleSubmit = async (event) => {
        event.preventDefault();
        const name = form.values.name.trim();
        const email = form.values.email.trim();
        const { password } = form.values;
        if (form.showErrors({
            name: name.length < LIMITS.name.min && `Enter your name (at least ${LIMITS.name.min} characters).`,
            email: !EMAIL_PATTERN.test(email) && "Enter a valid email address.",
            password: password.length < LIMITS.password.min && `Use at least ${LIMITS.password.min} characters.`,
        })) return;
        setIsSubmitting(true);
        try {
            await signUp({ name, email, password });
            toast.success("Account created. Welcome to Veo!");
            navigate("/signin", { state: { email } });
        } catch (error) {
            form.showServerError(error, "Couldn't create your account. Please try again.");
            setIsSubmitting(false);
        }
    };

    return (
        <AuthLayout
            title="Create your account"
            subtitle="It takes less than a minute."
            onSubmit={handleSubmit}
            footer={<>Already have an account? <TextButton as={Link} to="/signin" tone="accent">Sign in</TextButton></>}
        >
            <Field label="Name" error={form.errors.name}>
                <Input autoComplete="name" autoFocus maxLength={LIMITS.name.max} {...form.bind("name")} />
            </Field>
            <Field label="Email" error={form.errors.email}>
                <Input type="email" autoComplete="email" {...form.bind("email")} />
            </Field>
            <Field label="Password" hint={`At least ${LIMITS.password.min} characters`} error={form.errors.password}>
                <PasswordInput autoComplete="new-password" maxLength={LIMITS.password.max} {...form.bind("password")} />
            </Field>
            <Button type="submit" disabled={isSubmitting} className="w-full">{isSubmitting ? "Creating account…" : "Create account"}</Button>
        </AuthLayout>
    );
};

export default SignUpPage;

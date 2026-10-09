import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router";
import { toast } from "react-toastify";

import AuthLayout from "@/components/ui/AuthLayout";
import { Button, TextButton } from "@/components/ui/Button";
import Field from "@/components/ui/Field";
import { Input, PasswordInput } from "@/components/ui/Input";
import { useAuth } from "@/features/auth/useAuth";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useForm } from "@/hooks/useForm";
import { signIn as requestSignIn } from "@/services/user.service";

// Only in-app paths are accepted as a return address.
const safeReturnPath = (path) => (typeof path === "string" && path.startsWith("/") && !path.startsWith("//") ? path : "/");

const SignInPage = () => {
    const { user, signIn } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    // The email is filled in when coming from sign up or password reset.
    const form = useForm({ email: location.state?.email ?? "", password: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);
    useDocumentTitle("Sign in");

    if (user && !isSubmitting) return <Navigate to="/" replace />;

    const handleSubmit = async (event) => {
        event.preventDefault();
        const email = form.values.email.trim();
        if (form.showErrors({
            email: !email && "Enter your email.",
            password: !form.values.password && "Enter your password.",
        })) return;
        setIsSubmitting(true);
        try {
            const session = await requestSignIn({ email, password: form.values.password });
            signIn(session);
            toast.success(`Welcome back, ${session.user.name || session.user.username}!`);
            navigate(safeReturnPath(location.state?.from), { replace: true });
        } catch (error) {
            form.showServerError(error, "Couldn't sign you in. Please try again.");
            setIsSubmitting(false);
        }
    };

    return (
        <AuthLayout
            title="Welcome back"
            subtitle="Sign in to like, comment and upload."
            onSubmit={handleSubmit}
            footer={<>New to Veo? <TextButton as={Link} to="/signup" tone="accent">Create an account</TextButton></>}
        >
            <Field label="Email" error={form.errors.email}>
                <Input type="email" autoComplete="email" autoFocus={!form.values.email} {...form.bind("email")} />
            </Field>
            <Field
                label="Password"
                error={form.errors.password}
                hint={<TextButton as={Link} to="/forgot-password" state={{ email: form.values.email.trim() }} className="text-xs">Forgot password?</TextButton>}
            >
                <PasswordInput autoComplete="current-password" autoFocus={Boolean(form.values.email)} {...form.bind("password")} />
            </Field>
            <Button type="submit" disabled={isSubmitting} className="w-full">{isSubmitting ? "Signing in…" : "Sign in"}</Button>
        </AuthLayout>
    );
};

export default SignInPage;

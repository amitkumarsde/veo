import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import api from "@/services/api";
import { useAuth } from "@/hooks/useAuth";
import FormShell from "@/components/ui/FormShell";
import { inputClass, primaryBtn, secondaryBtn } from "@/components/ui/formStyles";

const SignIn = () => {

    const { setUser } = useAuth();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleSignIn = async (e) => {
        e.preventDefault();
        if (!username || !password) {
            toast.warn("Please fill out all fields..");
            return;
        }
        setLoading(true);
        try {
            const response = await api.post('/users/signin', { username, password });
            toast.success(response.data?.message || "Signed in successfully..");
            localStorage.setItem("token", response.data?.token);
            localStorage.setItem("user", JSON.stringify(response.data?.user));
            setUser(response.data?.user);
            navigate('/');
        } catch (error) {
            toast.error(error.response?.data?.message || "Sign in failed. Please try again..");
        } finally {
            setLoading(false);
        }
    };

    return (
        <FormShell title="Sign In" subtitle="Welcome back! Please enter your details." onSubmit={handleSignIn}>
            <input type="text" placeholder="Username" autoComplete="username" name="username" value={username} onChange={e => setUsername(e.target.value)} className={inputClass} />
            <input type="password" placeholder="Password" autoComplete="current-password" name="password" value={password} onChange={e => setPassword(e.target.value)} className={inputClass} />
            <button type="submit" disabled={loading} className={`${primaryBtn} disabled:opacity-60`}>
                {loading ? "Signing in..." : "Sign In"}
            </button>
            <p className="text-center text-sm text-muted">Don't have an account?</p>
            <Link to="/signup" className={secondaryBtn}>Sign Up</Link>
        </FormShell>
    );

};

export default SignIn;

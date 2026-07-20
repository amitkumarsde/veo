import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import api from "@/services/api";
import FormShell from "@/components/ui/FormShell";
import { inputClass, primaryBtn, secondaryBtn } from "@/components/ui/formStyles";

const SignUp = () => {

    const [form, setForm] = useState({ username: "", email: "", password: "", avatarURL: "" });
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSignUp = async (e) => {
        e.preventDefault();
        const { username, email, password, avatarURL } = form;
        if (!username || !email || !password || !avatarURL) {
            toast.warn("Please fill out all fields..");
            return;
        }
        setLoading(true);
        try {
            const response = await api.post('/users/signup', { username, email, password, avatarURL });
            toast.success(response.data?.message || "Signed up successfully..");
            navigate('/signin');
        } catch (error) {
            toast.error(error.response?.data?.message || "Sign up failed. Please try again..");
        } finally {
            setLoading(false);
        }
    };

    return (
        <FormShell title="Sign Up" subtitle="Create your account to get started." onSubmit={handleSignUp}>
            <input type="text" placeholder="Username" autoComplete="username" name="username" value={form.username} onChange={handleChange} className={inputClass} />
            <input type="email" placeholder="Email" autoComplete="email" name="email" value={form.email} onChange={handleChange} className={inputClass} />
            <input type="password" placeholder="Password" autoComplete="new-password" name="password" value={form.password} onChange={handleChange} className={inputClass} />
            <input type="url" placeholder="Avatar URL" autoComplete="off" name="avatarURL" value={form.avatarURL} onChange={handleChange} className={inputClass} />
            <button type="submit" disabled={loading} className={`${primaryBtn} disabled:opacity-60`}>
                {loading ? "Creating account..." : "Sign Up"}
            </button>
            <Link to="/" className={secondaryBtn}>Cancel</Link>
        </FormShell>
    );

};

export default SignUp;

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import api from "@/services/api";
import { useAuth } from "@/hooks/useAuth";
import FormShell from "@/components/ui/FormShell";
import { inputClass, primaryBtn, secondaryBtn } from "@/components/ui/formStyles";

const CreateChannel = () => {

    const { setUser } = useAuth();
    const [form, setForm] = useState({ channelName: "", description: "", channelBannerURL: "", channelAvatarURL: "" });
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleCreateChannel = async (e) => {
        e.preventDefault();
        const { channelName, description, channelBannerURL, channelAvatarURL } = form;
        if (!channelName || !description || !channelBannerURL || !channelAvatarURL) {
            toast.warn("Please fill out all fields..");
            return;
        }
        setLoading(true);
        try {
            const response = await api.post('/channels/create', {
                channelName, description, channelBannerURL, channelAvatarURL
            });
            toast.success(response.data?.message || "Channel created successfully..");
            localStorage.setItem("user", JSON.stringify(response.data?.user));
            setUser(response.data?.user);
            navigate('/profile');
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to create channel! Please try again..");
        } finally {
            setLoading(false);
        }
    };

    return (
        <FormShell title="Create Channel" subtitle="Set up your channel to start uploading." onSubmit={handleCreateChannel}>
            <input type="text" placeholder="Channel Name" name="channelName" value={form.channelName} onChange={handleChange} className={inputClass} />
            <input type="text" placeholder="Description (1-2 lines)" name="description" value={form.description} onChange={handleChange} className={inputClass} />
            <input type="url" placeholder="Channel Banner URL" name="channelBannerURL" value={form.channelBannerURL} onChange={handleChange} className={inputClass} />
            <input type="url" placeholder="Channel Avatar URL" name="channelAvatarURL" value={form.channelAvatarURL} onChange={handleChange} className={inputClass} />
            <button type="submit" disabled={loading} className={`${primaryBtn} disabled:opacity-60`}>
                {loading ? "Creating..." : "Create Channel"}
            </button>
            <Link to="/profile" className={secondaryBtn}>Cancel</Link>
        </FormShell>
    );

};

export default CreateChannel;

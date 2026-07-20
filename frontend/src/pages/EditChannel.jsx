import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

import api from "@/services/api";
import FormShell from "@/components/ui/FormShell";
import { inputClass, primaryBtn, secondaryBtn } from "@/components/ui/formStyles";

const EditChannel = () => {

    const [form, setForm] = useState({ description: "", channelBannerURL: "", channelAvatarURL: "" });
    const [loading, setLoading] = useState(false);

    const { channelId } = useParams();
    const navigate = useNavigate();

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleEditChannel = async (e) => {
        e.preventDefault();
        const { description, channelBannerURL, channelAvatarURL } = form;
        if (!description || !channelBannerURL || !channelAvatarURL) {
            toast.warn("Please fill out all fields..");
            return;
        }
        setLoading(true);
        try {
            const response = await api.put(`/channels/edit/${channelId}`, {
                description, channelBannerURL, channelAvatarURL
            });
            toast.success(response.data?.message || "Channel edited successfully..");
            navigate('/profile');
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to edit channel..");
        } finally {
            setLoading(false);
        }
    };

    return (
        <FormShell title="Edit Channel" subtitle="Update your channel details." onSubmit={handleEditChannel}>
            <input type="text" placeholder="Description (1-2 lines)" name="description" value={form.description} onChange={handleChange} className={inputClass} />
            <input type="url" placeholder="Channel Banner URL" name="channelBannerURL" value={form.channelBannerURL} onChange={handleChange} className={inputClass} />
            <input type="url" placeholder="Channel Avatar URL" name="channelAvatarURL" value={form.channelAvatarURL} onChange={handleChange} className={inputClass} />
            <button type="submit" disabled={loading} className={`${primaryBtn} disabled:opacity-60`}>
                {loading ? "Saving..." : "Save Changes"}
            </button>
            <Link to="/profile" className={secondaryBtn}>Cancel</Link>
        </FormShell>
    );

};

export default EditChannel;

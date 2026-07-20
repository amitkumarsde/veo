import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

import api from "@/services/api";
import FormShell from "@/components/ui/FormShell";
import { inputClass, primaryBtn, secondaryBtn } from "@/components/ui/formStyles";

const UpdateVideo = () => {

    const [form, setForm] = useState({ title: "", thumbnailUrl: "", videoUrl: "", category: "", description: "" });
    const [loading, setLoading] = useState(false);

    const { videoId } = useParams();
    const navigate = useNavigate();

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleUpdateVideo = async (e) => {
        e.preventDefault();
        const { title, thumbnailUrl, videoUrl, description, category } = form;
        if (!title || !thumbnailUrl || !videoUrl || !description || !category) {
            toast.warn("Please fill out all fields..");
            return;
        }
        setLoading(true);
        try {
            const response = await api.put(`/videos/update/${videoId}`, {
                title, thumbnailUrl, videoUrl,
                category: category.split(',').map(c => c.trim().toLowerCase()),
                description
            });
            toast.success(response.data?.message || "Video updated successfully..");
            navigate('/profile');
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update video..");
        } finally {
            setLoading(false);
        }
    };

    return (
        <FormShell title="Update Video" subtitle="Edit your video details." onSubmit={handleUpdateVideo}>
            <input type="text" placeholder="Title" name="title" value={form.title} onChange={handleChange} className={inputClass} />
            <input type="url" placeholder="Thumbnail URL" name="thumbnailUrl" value={form.thumbnailUrl} onChange={handleChange} className={inputClass} />
            <input type="url" placeholder="Video URL" name="videoUrl" value={form.videoUrl} onChange={handleChange} className={inputClass} />
            <textarea placeholder="Description" name="description" rows={3} value={form.description} onChange={handleChange} className={`${inputClass} resize-none`} />
            <input type="text" placeholder="Category (e.g. games, chess)" name="category" value={form.category} onChange={handleChange} className={inputClass} />
            <button type="submit" disabled={loading} className={`${primaryBtn} disabled:opacity-60`}>
                {loading ? "Updating..." : "Update Video"}
            </button>
            <Link to="/profile" className={secondaryBtn}>Cancel</Link>
        </FormShell>
    );

};

export default UpdateVideo;

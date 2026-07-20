import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import api from "@/services/api";
import { useAuth } from "@/hooks/useAuth";
import FormShell from "@/components/ui/FormShell";
import { inputClass, primaryBtn, secondaryBtn } from "@/components/ui/formStyles";

const UploadVideo = () => {

    const { user } = useAuth();
    const [formData, setFormData] = useState({ title: "", thumbnailUrl: "", videoUrl: "", description: "", category: "" });
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleUploadVideo = async (e) => {
        e.preventDefault();
        const { title, thumbnailUrl, videoUrl, description, category } = formData;
        if (!title || !thumbnailUrl || !videoUrl || !description || !category) {
            toast.warn("Please fill out all fields..");
            return;
        }
        setLoading(true);
        try {
            const response = await api.post('/videos/upload', {
                title, thumbnailUrl, videoUrl, description,
                category: category.split(',').map(c => c.trim().toLowerCase()),
                channelId: user.channels[0]
            });
            toast.success(response.data?.message || "Video uploaded Successfully..");
            navigate(`/channel/${user.channels[0]}`);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to upload video..");
        } finally {
            setLoading(false);
        }
    };

    return (
        <FormShell title="Upload Video" subtitle="Share your video with the world." onSubmit={handleUploadVideo}>
            <input type="text" placeholder="Title" name="title" value={formData.title} onChange={handleChange} className={inputClass} />
            <input type="url" placeholder="Thumbnail URL" name="thumbnailUrl" value={formData.thumbnailUrl} onChange={handleChange} className={inputClass} />
            <input type="url" placeholder="Video URL" name="videoUrl" value={formData.videoUrl} onChange={handleChange} className={inputClass} />
            <textarea placeholder="Description" name="description" rows={3} value={formData.description} onChange={handleChange} className={`${inputClass} resize-none`} />
            <input type="text" placeholder="Category (e.g. games, chess)" name="category" value={formData.category} onChange={handleChange} className={inputClass} />
            <button type="submit" disabled={loading} className={`${primaryBtn} disabled:opacity-60`}>
                {loading ? "Uploading..." : "Upload Video"}
            </button>
            <Link to="/profile" className={secondaryBtn}>Cancel</Link>
        </FormShell>
    );

};

export default UploadVideo;

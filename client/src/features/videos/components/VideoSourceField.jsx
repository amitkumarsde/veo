import { useRef } from "react";
import { toast } from "react-toastify";
import { Film, X } from "lucide-react";

import { TextButton } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import TextTabs from "@/components/ui/TextTabs";
import { VIDEO_SOURCES } from "@/features/videos/playback";
import { useObjectUrl } from "@/hooks/useObjectUrl";
import { formatBytes } from "@/utils/format";
import { acceptAttribute, fileHint, getFileError } from "@/utils/uploads";

const MODE_OPTIONS = [
    { value: VIDEO_SOURCES.upload, label: "Upload a file" },
    { value: VIDEO_SOURCES.link, label: "Paste a link" },
];

// The video as an uploaded file or a pasted link; `currentUploadUrl` is the saved file on the edit page.
const VideoSourceField = ({ id, mode, onModeChange, link, onLinkChange, file, onFileChange, currentUploadUrl = "", ...ariaProps }) => {
    const inputRef = useRef(null);
    const fileUrl = useObjectUrl(file);
    const previewUrl = fileUrl || currentUploadUrl;

    const pickFile = (picked) => {
        if (!picked) return;
        const error = getFileError(picked, "video");
        if (error) toast.warn(error);
        else onFileChange(picked);
    };

    return (
        <div className="space-y-4">
            <TextTabs options={MODE_OPTIONS} value={mode} onChange={onModeChange} label="Video source" className="border-b border-border" />

            {mode === VIDEO_SOURCES.link ? (
                <Input id={id} type="url" inputMode="url" placeholder="https://www.youtube.com/watch?v=…" value={link} onChange={(event) => onLinkChange(event.target.value)} {...ariaProps} />
            ) : (
                <div className="space-y-4">
                    {previewUrl && <video src={previewUrl} controls preload="metadata" className="aspect-video w-full rounded-ui bg-black" />}
                    <div className="flex flex-wrap items-center gap-4">
                        <Film size={22} strokeWidth={1.5} className="shrink-0 text-faint" aria-hidden />
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-[15px] text-fg">{file ? file.name : currentUploadUrl ? "Current video" : "No file chosen"}</p>
                            <p className="text-xs text-faint">{file ? formatBytes(file.size) : fileHint("video")}</p>
                        </div>
                        {file && (
                            <button type="button" onClick={() => onFileChange(null)} aria-label="Clear chosen file" className="text-faint transition-colors hover:text-fg">
                                <X size={18} aria-hidden />
                            </button>
                        )}
                        <TextButton onClick={() => inputRef.current?.click()} tone="accent">{previewUrl ? "Replace" : "Choose file"}</TextButton>
                    </div>
                    <input
                        ref={inputRef}
                        id={id}
                        type="file"
                        accept={acceptAttribute("video")}
                        className="sr-only"
                        tabIndex={-1}
                        {...ariaProps}
                        onChange={(event) => { pickFile(event.target.files?.[0]); event.target.value = ""; }}
                    />
                </div>
            )}
        </div>
    );
};

export default VideoSourceField;

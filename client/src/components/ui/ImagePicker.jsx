import { useRef, useState } from "react";
import { toast } from "react-toastify";
import { ImagePlus } from "lucide-react";

import { TextButton } from "@/components/ui/Button";
import { useObjectUrl } from "@/hooks/useObjectUrl";
import { acceptAttribute, fileHint, getFileError } from "@/utils/uploads";

const SHAPES = {
    banner: "aspect-[4/1] w-full rounded-ui",
    thumbnail: "aspect-video w-full rounded-ui",
    square: "h-24 w-24 rounded-ui",
    round: "h-24 w-24 rounded-full",
};

// Pick an image by click or drag and drop, with a preview. Without `onRemove` the image can only be replaced.
const ImagePicker = ({ id, shape = "thumbnail", currentUrl = "", file = null, removed = false, onPick, onRemove, fallback, label = "image", ...ariaProps }) => {
    const inputRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileUrl = useObjectUrl(file);
    const previewUrl = fileUrl || (removed ? "" : currentUrl);
    const isWide = shape === "banner" || shape === "thumbnail";
    const openPicker = () => inputRef.current?.click();

    const pickFile = (picked) => {
        if (!picked) return;
        const error = getFileError(picked, "image");
        if (error) toast.warn(error);
        else onPick(picked);
    };

    return (
        <div className={isWide ? "space-y-3" : "flex flex-wrap items-center gap-6"}>
            <button
                type="button"
                onClick={openPicker}
                onDragOver={(event) => { event.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(event) => { event.preventDefault(); setIsDragging(false); pickFile(event.dataTransfer.files?.[0]); }}
                aria-label={`Choose ${label}`}
                className={`${SHAPES[shape]} relative shrink-0 overflow-hidden bg-surface-2 transition-shadow hover:ring-1 hover:ring-border-strong ${isDragging ? "ring-2 ring-accent" : ""}`}
            >
                {previewUrl ? (
                    <img src={previewUrl} alt="" className="h-full w-full object-cover" />
                ) : fallback ?? (
                    <span className="flex h-full w-full flex-col items-center justify-center gap-2 px-4 text-faint">
                        <ImagePlus size={isWide ? 26 : 22} strokeWidth={1.5} aria-hidden />
                        {isWide && <span className="text-sm">Drop an image or click to choose</span>}
                    </span>
                )}
            </button>

            <div className="space-y-1.5">
                <div className="flex items-center gap-5">
                    <TextButton onClick={openPicker} tone="accent">{previewUrl ? "Change" : "Choose image"}</TextButton>
                    {onRemove && previewUrl && <TextButton onClick={onRemove} tone="danger">Remove</TextButton>}
                </div>
                <p className="text-xs text-faint">{fileHint("image")}</p>
            </div>

            <input
                ref={inputRef}
                id={id}
                type="file"
                accept={acceptAttribute("image")}
                className="sr-only"
                tabIndex={-1}
                {...ariaProps}
                onChange={(event) => { pickFile(event.target.files?.[0]); event.target.value = ""; }}
            />
        </div>
    );
};

export default ImagePicker;

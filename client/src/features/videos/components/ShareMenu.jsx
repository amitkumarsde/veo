import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { Link2, Mail, MessageCircle, Send, Share2, Smartphone, Users } from "lucide-react";

import { TextButton } from "@/components/ui/Button";

const MENU_ITEM_CLASS = "flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-fg transition-colors hover:bg-surface-2 hover:text-accent focus-visible:bg-surface-2";

const shareDestinations = (title, url) => {
    const text = encodeURIComponent(title);
    const link = encodeURIComponent(url);
    return [
        { label: "WhatsApp", Icon: MessageCircle, href: `https://wa.me/?text=${text}%20${link}` },
        { label: "X (Twitter)", Icon: Send, href: `https://twitter.com/intent/tweet?text=${text}&url=${link}` },
        { label: "Facebook", Icon: Users, href: `https://www.facebook.com/sharer/sharer.php?u=${link}` },
        { label: "Email", Icon: Mail, href: `mailto:?subject=${text}&body=${link}` },
    ];
};

// Share menu: the phone's share sheet when there is one, copy link, and common sites.
const ShareMenu = ({ title }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);
    const url = window.location.href;
    const canUseShareSheet = typeof navigator.share === "function";

    useEffect(() => {
        if (!isOpen) return undefined;
        const closeOnOutsidePointer = (event) => { if (!menuRef.current?.contains(event.target)) setIsOpen(false); };
        const closeOnEscape = (event) => { if (event.key === "Escape") setIsOpen(false); };
        document.addEventListener("pointerdown", closeOnOutsidePointer);
        document.addEventListener("keydown", closeOnEscape);
        return () => {
            document.removeEventListener("pointerdown", closeOnOutsidePointer);
            document.removeEventListener("keydown", closeOnEscape);
        };
    }, [isOpen]);

    const copyLink = async () => {
        setIsOpen(false);
        try {
            await navigator.clipboard.writeText(url);
            toast.success("Link copied");
        } catch {
            toast.error("Couldn't copy the link.");
        }
    };

    const openShareSheet = async () => {
        setIsOpen(false);
        try {
            await navigator.share({ title, url });
        } catch (error) {
            if (error?.name !== "AbortError") toast.error("Couldn't open sharing.");
        }
    };

    return (
        <div ref={menuRef} className="relative">
            <TextButton onClick={() => setIsOpen((open) => !open)} aria-haspopup="menu" aria-expanded={isOpen} tone="fg" active={isOpen}>
                <Share2 size={18} aria-hidden /> Share
            </TextButton>
            {isOpen && (
                <div role="menu" className="absolute right-0 z-20 mt-3 w-56 overflow-hidden rounded-ui border border-border bg-surface py-1.5 shadow-xl">
                    {canUseShareSheet && (
                        <button type="button" role="menuitem" onClick={openShareSheet} className={MENU_ITEM_CLASS}><Smartphone size={16} aria-hidden /> Share via…</button>
                    )}
                    <button type="button" role="menuitem" onClick={copyLink} className={MENU_ITEM_CLASS}><Link2 size={16} aria-hidden /> Copy link</button>
                    {shareDestinations(title, url).map(({ label, Icon, href }) => (
                        <a key={label} role="menuitem" href={href} target="_blank" rel="noopener noreferrer" onClick={() => setIsOpen(false)} className={MENU_ITEM_CLASS}>
                            <Icon size={16} aria-hidden /> {label}
                        </a>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ShareMenu;

import { useId, useRef, useState } from "react";
import { toast } from "react-toastify";
import { Link2, Mail, MessageCircle, Send, Share2, Smartphone, Users } from "lucide-react";

import { TextButton } from "@/components/ui/Button";
import { MENU_CLASS, MENU_ITEM_CLASS } from "@/components/ui/menu-styles";
import { useDismiss } from "@/hooks/useDismiss";

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

// Share menu: the phone's share sheet when there is one, copy link and common sites; closes when focus leaves it.
const ShareMenu = ({ title }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);
    const buttonRef = useRef(null);
    const listId = useId();
    const url = window.location.href;
    const canUseShareSheet = typeof navigator.share === "function";

    // Esc puts the keyboard focus back on the Share button.
    useDismiss(menuRef, isOpen, (event) => {
        setIsOpen(false);
        if (event.type === "keydown") buttonRef.current?.focus();
    });

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
            <TextButton ref={buttonRef} onClick={() => setIsOpen((open) => !open)} aria-expanded={isOpen} aria-controls={isOpen ? listId : undefined} tone="fg" active={isOpen}>
                <Share2 size={18} aria-hidden /> Share
            </TextButton>
            {isOpen && (
                <div id={listId} className={`absolute right-0 z-20 mt-3 w-56 ${MENU_CLASS}`}>
                    {canUseShareSheet && (
                        <button type="button" onClick={openShareSheet} className={MENU_ITEM_CLASS}><Smartphone size={16} aria-hidden /> Share via…</button>
                    )}
                    <button type="button" onClick={copyLink} className={MENU_ITEM_CLASS}><Link2 size={16} aria-hidden /> Copy link</button>
                    {shareDestinations(title, url).map(({ label, Icon, href }) => (
                        <a key={label} href={href} target="_blank" rel="noopener noreferrer" onClick={() => setIsOpen(false)} className={MENU_ITEM_CLASS}>
                            <Icon size={16} aria-hidden /> {label}
                        </a>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ShareMenu;

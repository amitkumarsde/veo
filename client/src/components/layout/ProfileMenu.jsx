import { useId, useRef, useState } from "react";
import { Link } from "react-router";
import { LogOut, UserRound } from "lucide-react";

import Avatar from "@/components/ui/Avatar";
import { MENU_CLASS, MENU_ITEM_CLASS } from "@/components/ui/menu-styles";
import { useLogout } from "@/features/auth/useLogout";
import { useDismiss } from "@/hooks/useDismiss";

// Avatar menu (Profile, Log out): opens on mouse hover, or on tap / Enter, and closes when focus leaves it.
const ProfileMenu = ({ user }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);
    const buttonRef = useRef(null);
    const pointerTypeRef = useRef("");
    const listId = useId();
    const logout = useLogout();

    // Esc puts the keyboard focus back on the avatar.
    useDismiss(menuRef, isOpen, (event) => {
        setIsOpen(false);
        if (event.type === "keydown") buttonRef.current?.focus();
    });

    // Hover already opened the menu, so a mouse click keeps it open instead of closing it.
    const handleClick = () => {
        const isMouse = pointerTypeRef.current === "mouse";
        pointerTypeRef.current = "";
        setIsOpen((open) => isMouse || !open);
    };

    return (
        <div
            ref={menuRef}
            className="relative"
            onPointerEnter={(event) => { if (event.pointerType === "mouse") setIsOpen(true); }}
            onPointerLeave={(event) => { if (event.pointerType === "mouse") setIsOpen(false); }}
        >
            <button
                ref={buttonRef}
                type="button"
                onPointerDown={(event) => { pointerTypeRef.current = event.pointerType; }}
                onClick={handleClick}
                aria-expanded={isOpen}
                aria-controls={isOpen ? listId : undefined}
                aria-label="Your account"
                className="flex rounded-full transition-opacity hover:opacity-80"
            >
                <Avatar src={user.avatarURL} name={user.name || user.username} className="h-8 w-8 rounded-full text-xs" />
            </button>
            {isOpen && (
                // Padding instead of a margin, so the pointer can cross from the avatar to the menu without leaving it.
                <div className="absolute right-0 top-full z-40 pt-3">
                    <div id={listId} className={`w-48 ${MENU_CLASS}`}>
                        <Link to="/profile" onClick={() => setIsOpen(false)} className={MENU_ITEM_CLASS}>
                            <UserRound size={16} aria-hidden /> Profile
                        </Link>
                        <button type="button" onClick={() => { setIsOpen(false); logout(); }} className={MENU_ITEM_CLASS}>
                            <LogOut size={16} aria-hidden /> Log out
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfileMenu;

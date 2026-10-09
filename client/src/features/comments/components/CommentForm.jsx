import { useState } from "react";
import { toast } from "react-toastify";

import Avatar from "@/components/ui/Avatar";
import { Button, TextButton } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Input";
import { LIMITS } from "@/constants/limits";

const NEAR_LIMIT_RATIO = 0.9;

// New comment box. `onSubmit(text)` resolves to true when the comment was posted.
const CommentForm = ({ user, onSubmit }) => {
    const [text, setText] = useState("");
    const [isPosting, setIsPosting] = useState(false);

    const promptSignIn = () => {
        if (!user) toast.info("Sign in to comment.");
        return !user;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (promptSignIn()) return;
        const trimmed = text.trim();
        if (!trimmed || isPosting) return;
        setIsPosting(true);
        const isPosted = await onSubmit(trimmed);
        setIsPosting(false);
        if (isPosted) setText("");
    };

    return (
        <form onSubmit={handleSubmit} className="flex gap-4 border-b border-border py-6">
            <Avatar src={user?.avatarURL} name={user ? user.name || user.username : "?"} className="h-9 w-9 rounded-full text-xs" />
            <div className="min-w-0 flex-1">
                <Textarea
                    rows={text ? 3 : 1}
                    placeholder={user ? "Add a comment…" : "Sign in to join the conversation"}
                    aria-label="Add a comment"
                    maxLength={LIMITS.comment}
                    value={text}
                    readOnly={!user}
                    onFocus={promptSignIn}
                    onChange={(event) => setText(event.target.value)}
                    onKeyDown={(event) => { if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) handleSubmit(event); }}
                />
                {text && (
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                        <span className={`text-xs ${text.length > LIMITS.comment * NEAR_LIMIT_RATIO ? "text-danger" : "text-faint"}`}>
                            {text.length}/{LIMITS.comment}
                        </span>
                        <div className="flex items-center gap-5">
                            <TextButton onClick={() => setText("")}>Cancel</TextButton>
                            <Button type="submit" size="sm" disabled={!text.trim() || isPosting}>{isPosting ? "Posting…" : "Comment"}</Button>
                        </div>
                    </div>
                )}
            </div>
        </form>
    );
};

export default CommentForm;

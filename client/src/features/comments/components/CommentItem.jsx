import { useState } from "react";

import Avatar from "@/components/ui/Avatar";
import { TextButton } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Input";
import { LIMITS } from "@/constants/limits";
import { useConfirm } from "@/features/confirm/useConfirm";
import { timeAgo } from "@/utils/format";

// One comment; its author can edit it in place or delete it. `onSave` resolves to true when saved.
const CommentItem = ({ comment, isOwn, onSave, onDelete }) => {
    const confirm = useConfirm();
    const [isEditing, setIsEditing] = useState(false);
    const [draft, setDraft] = useState(comment.text);
    const [isBusy, setIsBusy] = useState(false);
    const { author } = comment;

    const startEditing = () => {
        setDraft(comment.text);
        setIsEditing(true);
    };

    const save = async () => {
        const text = draft.trim();
        if (!text || isBusy) return;
        if (text === comment.text) {
            setIsEditing(false);
            return;
        }
        setIsBusy(true);
        const isSaved = await onSave(comment.commentId, text);
        setIsBusy(false);
        if (isSaved) setIsEditing(false);
    };

    const remove = async () => {
        if (isBusy || !(await confirm({ title: "Delete this comment?", confirmLabel: "Delete", danger: true }))) return;
        setIsBusy(true);
        const isDeleted = await onDelete(comment.commentId);
        if (!isDeleted) setIsBusy(false);
    };

    return (
        <article className="flex gap-4 py-5">
            <Avatar src={author.avatarURL} name={author.name || author.username} className="h-9 w-9 rounded-full text-xs" />
            <div className="min-w-0 flex-1">
                <p className="text-[13px] text-muted">
                    <span className="font-semibold text-fg">{author.name || `@${author.username}`}</span>
                    <span aria-hidden className="mx-1.5 text-faint">·</span>
                    <time dateTime={comment.createdAt}>{timeAgo(comment.createdAt)}</time>
                    {comment.editedAt && <span className="text-faint" title={new Date(comment.editedAt).toLocaleString()}> · edited</span>}
                </p>

                {isEditing ? (
                    <div className="mt-2 space-y-3">
                        <Textarea
                            value={draft}
                            onChange={(event) => setDraft(event.target.value)}
                            onKeyDown={(event) => {
                                if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); save(); }
                                if (event.key === "Escape") setIsEditing(false);
                            }}
                            rows={2}
                            maxLength={LIMITS.comment}
                            autoFocus
                            aria-label="Edit comment"
                        />
                        <div className="flex items-center gap-5">
                            <TextButton onClick={save} tone="accent" disabled={isBusy || !draft.trim()}>{isBusy ? "Saving…" : "Save"}</TextButton>
                            <TextButton onClick={() => setIsEditing(false)}>Cancel</TextButton>
                        </div>
                    </div>
                ) : (
                    <p className="mt-1 whitespace-pre-line break-words text-[15px] leading-relaxed text-fg">{comment.text}</p>
                )}

                {isOwn && !isEditing && (
                    <div className="mt-2 flex gap-5">
                        <TextButton onClick={startEditing} disabled={isBusy} className="text-[13px]">Edit</TextButton>
                        <TextButton onClick={remove} disabled={isBusy} tone="danger" className="text-[13px]">Delete</TextButton>
                    </div>
                )}
            </div>
        </article>
    );
};

export default CommentItem;

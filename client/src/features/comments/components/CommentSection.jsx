import { useCallback, useState } from "react";
import { toast } from "react-toastify";

import LoadMore from "@/components/common/LoadMore";
import TextTabs from "@/components/ui/TextTabs";
import { COMMENT_SORT_OPTIONS, DEFAULT_SORT } from "@/constants/sort-options";
import CommentForm from "@/features/comments/components/CommentForm";
import CommentItem from "@/features/comments/components/CommentItem";
import { usePagedList } from "@/hooks/usePagedList";
import { addComment, deleteComment, editComment, listComments } from "@/services/comment.service";
import { getErrorMessage } from "@/utils/errors";
import { pluralize } from "@/utils/format";

const PAGE_SIZE = 20;
const getCommentKey = (comment) => comment.commentId;

// Comments for one video. `onCountChange(delta)` keeps the video's comment total in step.
const CommentSection = ({ videoId, commentCount, user, onCountChange }) => {
    const [sort, setSort] = useState(DEFAULT_SORT);
    const fetchPage = useCallback(
        ({ cursor, signal }) => listComments(videoId, { sort, cursor, limit: PAGE_SIZE }, signal),
        [videoId, sort],
    );
    const comments = usePagedList(fetchPage, { key: `comments|${videoId}|${sort}`, getItemKey: getCommentKey });
    const { setItems } = comments;

    const handleAdd = async (text) => {
        try {
            const comment = await addComment(videoId, text);
            // Show it where it belongs: first when newest-first, last only once the end of the list is loaded.
            if (sort === "newest") setItems((items) => [comment, ...items]);
            else if (!comments.hasMore) setItems((items) => [...items, comment]);
            onCountChange(1);
            return true;
        } catch (error) {
            toast.error(getErrorMessage(error, "Couldn't post your comment."));
            return false;
        }
    };

    const handleSave = async (commentId, text) => {
        try {
            const updated = await editComment(videoId, commentId, text);
            setItems((items) => items.map((comment) => (comment.commentId === commentId ? updated : comment)));
            return true;
        } catch (error) {
            toast.error(getErrorMessage(error, "Couldn't save your comment."));
            return false;
        }
    };

    const handleDelete = async (commentId) => {
        try {
            await deleteComment(videoId, commentId);
            setItems((items) => items.filter((comment) => comment.commentId !== commentId));
            onCountChange(-1);
            return true;
        } catch (error) {
            toast.error(getErrorMessage(error, "Couldn't delete the comment."));
            return false;
        }
    };

    return (
        <section className="pt-8" aria-labelledby="comments-heading">
            <div className="flex flex-wrap items-end justify-between gap-x-6 border-b border-border">
                <h2 id="comments-heading" className="pb-2 text-xl font-bold text-fg">{pluralize(commentCount ?? 0, "comment")}</h2>
                <TextTabs options={COMMENT_SORT_OPTIONS} value={sort} onChange={setSort} label="Sort comments" />
            </div>

            <CommentForm user={user} onSubmit={handleAdd} />

            {comments.loading ? (
                <p role="status" className="py-6 text-sm text-muted">Loading comments…</p>
            ) : comments.error ? (
                <p className="py-6 text-sm text-muted">
                    Couldn't load comments.{" "}
                    <button type="button" onClick={comments.reload} className="font-medium text-accent hover:text-accent-hover">Try again</button>
                </p>
            ) : comments.items.length === 0 ? (
                <p className="py-6 text-sm text-muted">No comments yet. Start the conversation.</p>
            ) : (
                <div className="divide-y divide-border">
                    {comments.items.map((comment) => (
                        <CommentItem
                            key={comment.commentId}
                            comment={comment}
                            isOwn={comment.author.username === user?.username}
                            onSave={handleSave}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            )}
            <LoadMore hasMore={comments.hasMore} loading={comments.loadingMore} onLoadMore={comments.loadMore} label="More comments" />
        </section>
    );
};

export default CommentSection;

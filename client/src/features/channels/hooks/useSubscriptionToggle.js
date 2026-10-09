import { toast } from "react-toastify";

import { useOptimisticAction } from "@/hooks/useOptimisticAction";
import { setSubscription } from "@/services/channel.service";

// Subscribe / unsubscribe. `applySubscription({ subscribed, subscribers?, delta? })` updates the page:
// `delta` is the guess shown at once, `subscribers` the exact count from the server.
export const useSubscriptionToggle = ({ channelId, isSubscribed, isSignedIn, applySubscription }) => {
    const { run, isPending } = useOptimisticAction();

    const toggleSubscription = () => {
        if (!isSignedIn) {
            toast.info("Sign in to subscribe.");
            return;
        }
        const subscribed = !isSubscribed;
        run({
            apply: () => applySubscription({ subscribed, delta: subscribed ? 1 : -1 }),
            request: () => setSubscription(channelId, subscribed),
            confirm: (result) => applySubscription({ subscribed: result.subscribed, subscribers: result.subscribers }),
            revert: () => applySubscription({ subscribed: !subscribed, delta: subscribed ? -1 : 1 }),
        });
    };

    return { toggleSubscription, isSubscriptionPending: isPending };
};

// The new subscriber count for an applySubscription() call.
export const nextSubscriberCount = (current, { subscribers, delta = 0 }) => subscribers ?? Math.max(0, (current ?? 0) + delta);

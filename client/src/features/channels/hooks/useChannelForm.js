import { useCallback } from "react";

import { useForm } from "@/hooks/useForm";
import { useImageField } from "@/hooks/useImageField";

const EMPTY_VALUES = { channelName: "", description: "" };

// State and checks shared by the create and edit channel pages.
export const useChannelForm = () => {
    const form = useForm(EMPTY_VALUES);
    const banner = useImageField();
    const logo = useImageField();
    const { reset: resetForm } = form;
    const { reset: resetBanner } = banner;
    const { reset: resetLogo } = logo;

    const loadChannel = useCallback((channel) => {
        resetForm({ channelName: channel.channelName ?? "", description: channel.description ?? "" });
        resetBanner(channel.channelBannerURL ?? "");
        resetLogo(channel.channelAvatarURL ?? "");
    }, [resetForm, resetBanner, resetLogo]);

    // The fields to send, or null after showing what is missing.
    const collectFields = () => {
        const channelName = form.values.channelName.trim();
        const description = form.values.description.trim();
        const hasErrors = form.showErrors({
            channelName: !channelName && "Give your channel a name.",
            description: !description && "Add a short description.",
        });
        if (hasErrors) return null;
        return {
            channelName,
            description,
            banner: banner.file,
            logo: logo.file,
            removeBanner: banner.shouldRemoveSaved,
            removeLogo: logo.shouldRemoveSaved,
        };
    };

    return {
        form,
        banner,
        logo,
        hasChanges: form.isDirty || banner.changed || logo.changed,
        loadChannel,
        collectFields,
    };
};

import Avatar from "@/components/ui/Avatar";
import Field from "@/components/ui/Field";
import ImagePicker from "@/components/ui/ImagePicker";
import { Input, Textarea } from "@/components/ui/Input";
import { LIMITS } from "@/constants/limits";

// The fields of the create and edit channel forms, driven by useChannelForm().
const ChannelFormFields = ({ channelForm, autoFocusName = false }) => {
    const { form, banner, logo } = channelForm;

    return (
        <>
            <Field label="Channel name" hint={`${form.values.channelName.length}/${LIMITS.channelName}`} error={form.errors.channelName}>
                <Input maxLength={LIMITS.channelName} autoFocus={autoFocusName} {...form.bind("channelName")} />
            </Field>
            <Field label="Description" hint={`${form.values.description.length}/${LIMITS.channelDescription}`} error={form.errors.description}>
                <Textarea rows={4} maxLength={LIMITS.channelDescription} placeholder="What is your channel about?" {...form.bind("description")} />
            </Field>
            <Field label="Banner" hint="Optional">
                <ImagePicker
                    shape="banner"
                    label="banner"
                    currentUrl={banner.currentUrl}
                    file={banner.file}
                    removed={banner.removed}
                    onPick={banner.pick}
                    onRemove={banner.remove}
                />
            </Field>
            <Field label="Logo" hint="Optional">
                <ImagePicker
                    shape="square"
                    label="logo"
                    currentUrl={logo.currentUrl}
                    file={logo.file}
                    removed={logo.removed}
                    onPick={logo.pick}
                    onRemove={logo.remove}
                    fallback={<Avatar name={form.values.channelName || "?"} className="h-full w-full rounded-ui text-2xl" />}
                />
            </Field>
        </>
    );
};

export default ChannelFormFields;

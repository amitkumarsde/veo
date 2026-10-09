import Logo from "@/components/common/Logo";

const Footer = () => (
    <footer className="border-t border-border">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-3 px-4 py-8 text-sm text-faint sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <Logo className="text-xl" />
            <p>Stories worth watching · © {new Date().getFullYear()} Veo</p>
        </div>
    </footer>
);

export default Footer;

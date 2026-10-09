import { AuthProvider } from "@/features/auth/AuthProvider";
import { ConfirmProvider } from "@/features/confirm/ConfirmProvider";
import { ThemeProvider } from "@/features/theme/ThemeProvider";

const AppProviders = ({ children }) => (
    <AuthProvider>
        <ThemeProvider>
            <ConfirmProvider>{children}</ConfirmProvider>
        </ThemeProvider>
    </AuthProvider>
);

export default AppProviders;

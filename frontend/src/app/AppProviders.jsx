import { AuthProvider } from '@/context/AuthProvider';
import { SearchProvider } from '@/context/SearchProvider';
import { ThemeProvider } from '@/context/ThemeProvider';

const AppProviders = ({ children }) => (
    <AuthProvider>
        <SearchProvider>
            <ThemeProvider>{children}</ThemeProvider>
        </SearchProvider>
    </AuthProvider>
);

export default AppProviders;

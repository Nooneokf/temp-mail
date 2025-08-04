import { cookies } from 'next/headers';
import { AuthProvider } from '@/contexts/AuthContext'; // Keep your existing AuthProvider

export async function AuthContextWrapper({ children }: { children: React.ReactNode }) {
    // This `cookies()` function from 'next/headers' can ONLY be used in Server Components.
    // It safely reads the cookies from the incoming request on the server.
    const cookieStore = await cookies();
    const token = cookieStore.get('app_jwt')?.value;

    return (
        <AuthProvider initialToken={token}>
            {children}
        </AuthProvider>
    );
}
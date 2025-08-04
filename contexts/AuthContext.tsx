"use client";

import { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react';
import { getCookie, deleteCookie } from 'cookies-next';
import { useRouter } from 'next/navigation';

// --- Define the shape of our user and custom domains ---
interface CustomDomain {
    domain: string;
    verified: boolean;
}

interface User {
    wyiUserId: string; // Explicitly named for clarity
    email: string;
    name: string;
    plan: 'anonymous' | 'free' | 'pro'; // Plan is part of the user object
    customDomains?: CustomDomain[];
}

// --- Define the context's public interface ---
interface AuthContextType {
    isAuthenticated: boolean;
    user: User | null;
    plan: 'anonymous' | 'free' | 'pro';
    isLoading: boolean;
    logout: () => void;
    
    // --- New mechanism for a global login popup ---
    isLoginPopupOpen: boolean;
    openLoginPopup: () => void;
    closeLoginPopup: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- New props interface ---
interface AuthProviderProps {
    children: ReactNode;
    initialToken?: string; // This prop is passed from the server
}

export const AuthProvider = ({ children, initialToken }: AuthProviderProps) => {
    const [user, setUser] = useState<User | null>(null);
    const [plan, setPlan] = useState<'anonymous' | 'free' | 'pro'>('anonymous');
    // Start with isLoading: true ONLY if we have a token to validate
    const [isLoading, setIsLoading] = useState(!!initialToken);
    const [isLoginPopupOpen, setIsLoginPopupOpen] = useState(false);
    const router = useRouter();

    const openLoginPopup = () => setIsLoginPopupOpen(true);
    const closeLoginPopup = () => setIsLoginPopupOpen(false);

    const logout = useCallback(async () => {
        deleteCookie('app_jwt', { path: '/' });
        await fetch('/api/auth/logout', {
          method: "POST"
        })
        setUser(null);
        setPlan('anonymous');
        setIsLoginPopupOpen(false);
        router.push('/');
    }, [router]);

    // This function now takes the token directly, no need for getCookie here.
    const validateAndFetchUser = useCallback(async (token: string) => {
        try {
            const response = await fetch('/api/user/me', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Token validation failed');
            
            const data = await response.json();
            if (data.success && data.user) {
                setUser(data.user);
                setPlan(data.user.plan);
            } else {
                throw new Error(data.message || 'Invalid user data received');
            }
        } catch (error) {
            console.error("Session validation error:", error);
            logout();
        } finally {
            setIsLoading(false);
        }
    }, [logout]);

    // The useEffect now simply checks if the initialToken was passed from the server.
    useEffect(() => {
        if (initialToken) {
            validateAndFetchUser(initialToken);
        }
        // No dependency array change needed. This runs once on component mount.
    }, [initialToken, validateAndFetchUser]);

    return (
        <AuthContext.Provider value={{
            isAuthenticated: !!user,
            user,
            plan,
            isLoading,
            logout,
            isLoginPopupOpen,
            openLoginPopup,
            closeLoginPopup
        }}>
            {children}
        </AuthContext.Provider>
    );
};
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
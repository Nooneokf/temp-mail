import { AppFooter } from '@/components/app-footer';
import { AppHeader } from '@/components/app-header';
import React from 'react';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <>
            <AppHeader />
            {children}
            <AppFooter />
        </>
    );
};

export default Layout;
"use client";

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CustomDomainManager } from '@/components/dashboard/CustomDomainManager';
import { MuteListManager } from '@/components/dashboard/MuteListManager';
import { Loader2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface DashboardData {
    customDomains: any[];
    mutedSenders: string[];
}

export default function DashboardPage() {
    const { data: session, status } = useSession();
    const isAuthLoading = status === 'loading';
    const [data, setData] = useState<DashboardData | null>(null);
    const [isDataLoading, setIsDataLoading] = useState(true);

    useEffect(() => {
        if (!isAuthLoading && session?.user?.plan === 'pro') {
            const fetchData = async () => {
                try {
                    const response = await fetch('/api/user/dashboard-data');
                    if (!response.ok) throw new Error('Failed to fetch dashboard data');
                    const dashboardData = await response.json();
                    setData(dashboardData);
                } catch (error) {
                    console.error(error);
                } finally {
                    setIsDataLoading(false);
                }
            };
            fetchData();
        } else {
            setIsDataLoading(false);
        }
    }, [session?.user?.plan, isAuthLoading]);

    const isLoading = isAuthLoading || isDataLoading;

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    // If not logged in
    if (!session?.user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
                <h1 className="text-2xl font-bold mb-4">Sign in to Access the Pro Dashboard</h1>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                    This page is for PRO plan users only. Please sign in to your account to continue.
                </p>
                <Link
                    href="/signin"
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                    Sign In
                </Link>
                <Link
                    href="/blog/pro-dashboard-guide"
                    className="mt-4 text-blue-500 hover:underline"
                >
                    How to Get Access & Use the Pro Dashboard →
                </Link>
            </div>
        );
    }

    // If logged in but not PRO
    if (session?.user && session.user.plan !== 'pro') {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
                <h1 className="text-2xl font-bold mb-4">Upgrade to PRO to Access This Page</h1>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                    The Pro Dashboard unlocks advanced features like custom domains and muted sender lists.
                </p>
                <Link
                    href="/pricing"
                    className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                    Upgrade to PRO
                </Link>
                <Link
                    href="/blog/pro-dashboard-guide"
                    className="mt-4 text-blue-500 hover:underline"
                >
                    Step-by-Step Guide to Using the Pro Dashboard →
                </Link>
            </div>
        );
    }

    // If logged in & PRO
    if (!data) {
        return <div className="text-center p-10">Could not load dashboard data.</div>;
    }

    return (
        <div className="container mx-auto py-10 px-4">
            <h1 className="text-3xl font-bold mb-8">Pro Dashboard</h1>
            <div className="grid gap-8">
                <CustomDomainManager initialDomains={data.customDomains} />
                <MuteListManager initialSenders={data.mutedSenders} />
            </div>
        </div>
    );
}

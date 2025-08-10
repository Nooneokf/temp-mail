"use client";

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CustomDomainManager } from '@/components/dashboard/CustomDomainManager';
import { MuteListManager } from '@/components/dashboard/MuteListManager';
import { Loader2 } from 'lucide-react';
import { useSession } from 'next-auth/react';

interface DashboardData {
    customDomains: any[];
    mutedSenders: string[];
}

export default function DashboardPage() {
    const {data: session, status} = useSession();
    const isAuthLoading = status === 'loading';
    const router = useRouter();
    const [data, setData] = useState<DashboardData | null>(null);
    const [isDataLoading, setIsDataLoading] = useState(true);

    useEffect(() => {
        // Auth guard
        if (!isAuthLoading && (!session?.user || session?.user.plan !== 'pro')) {
            router.push('/');
        }

        // Fetch dashboard data if authenticated as pro
        if (!isAuthLoading && session?.user && session?.user.plan === 'pro') {
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
        }
    }, [session?.user, session?.user.plan, isAuthLoading, router]);

    // Combined loading state
    const isLoading = isAuthLoading || isDataLoading;

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }
    
    // This check ensures data is loaded before rendering children
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
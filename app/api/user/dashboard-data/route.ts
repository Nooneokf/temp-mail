
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { fetchFromServiceAPI } from '@/lib/api';

export async function GET() {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // For now, return empty arrays until backend is properly configured
    // This prevents the dashboard from crashing
    const mockData = {
        customDomains: [],
        mutedSenders: []
    };

    try {
        // Try to fetch real data, but fall back to mock if endpoints don't exist
        const data = await fetchFromServiceAPI(`/user/${session.user.id}/dashboard-data`);
        return NextResponse.json(data);
    } catch (error) {
        console.log('Backend not available, returning mock data for development');
        return NextResponse.json(mockData);
    }
}

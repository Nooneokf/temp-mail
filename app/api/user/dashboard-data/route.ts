// app/api/user/dashboard-data/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { fetchFromServiceAPI } from '@/lib/api';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET(request: NextRequest) {
    // Get the session using the server-side utility
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const serviceResponse = await fetchFromServiceAPI(`/user/${session.user.id}/dashboard-data`);
        
        // The serviceResponse already contains the data we need.
        return NextResponse.json(serviceResponse);

    } catch (error) {
        console.error("Dashboard data fetch error:", error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
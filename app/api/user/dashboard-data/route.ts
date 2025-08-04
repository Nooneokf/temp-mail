// app/api/user/dashboard-data/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, fetchFromServiceAPI } from '@/lib/api';

export async function GET(request: NextRequest) {
    const decodedToken = await authenticateRequest(request);

    if (!decodedToken || !decodedToken.wyiUserId) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const serviceResponse = await fetchFromServiceAPI(`/user/${decodedToken.wyiUserId}/dashboard-data`);
        
        // The serviceResponse already contains the data we need.
        return NextResponse.json(serviceResponse);

    } catch (error) {
        console.error("Dashboard data fetch error:", error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
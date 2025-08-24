// app/api/user/domains/verify/route.ts
import { NextResponse } from 'next/server';
import { fetchFromServiceAPI } from '@/lib/api';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(request: Request) {
    // Get the session using the server-side utility
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { domain, userId } = await request.json();
    if (!domain || !userId) {
        return NextResponse.json({ message: 'Domain and userId are required.' }, { status: 400 });
    }

    try {
        // Proxy the request to the Service API's new verification endpoint
        const serviceResponse = await fetchFromServiceAPI(`/user/${userId}/domains/${domain}/verify`, {
            method: 'POST',
            body: JSON.stringify({
                domain: domain,
                userId: userId // Pass the authenticated user ID
            }),
        });

        return NextResponse.json(serviceResponse);

    } catch (error: any) {
        // Forward the error message from the service API if available
        return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
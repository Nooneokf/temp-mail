// app/api/user/domains/verify/route.ts
import { NextResponse } from 'next/server';
import { authenticateRequest, fetchFromServiceAPI } from '@/lib/api';

export async function POST(request: Request) {
    const decodedToken = await authenticateRequest(request);
    if (!decodedToken || decodedToken.plan !== 'pro') {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }
    
    const { domain } = await request.json();
    if (!domain) {
        return NextResponse.json({ message: 'Domain is required.' }, { status: 400 });
    }

    try {
        // Proxy the request to the Service API's new verification endpoint
        const serviceResponse = await fetchFromServiceAPI(`/user/domains/verify`, {
            method: 'POST',
            body: JSON.stringify({
                domain: domain,
                wyiUserId: decodedToken.wyiUserId
            }),
        });
        
        return NextResponse.json(serviceResponse);

    } catch (error: any) {
        // Forward the error message from the service API if available
        return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
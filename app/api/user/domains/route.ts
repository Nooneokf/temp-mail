// app/api/user/domains/route.ts
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
        // Proxy the request to the Service API
        const serviceResponse = await fetchFromServiceAPI(`/user/domains`, {
            method: 'POST',
            body: JSON.stringify({
                domain: domain,
                wyiUserId: decodedToken.wyiUserId // Pass the authenticated user ID
            }),
        });

        return NextResponse.json(serviceResponse);

    } catch (error: any) {
        return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    const decodedToken = await authenticateRequest(request);
    if (!decodedToken || decodedToken.plan !== 'pro') {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }
    const { domain } = await request.json();

    try {
        const serviceResponse = await fetchFromServiceAPI(`/user/domains`, {
            method: 'DELETE',
            body: JSON.stringify({ domain, wyiUserId: decodedToken.wyiUserId }),
        });
        return NextResponse.json(serviceResponse);

    } catch (error: any) {
        return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
    }
}

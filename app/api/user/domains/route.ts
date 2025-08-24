// app/api/user/domains/route.ts
import { NextResponse } from 'next/server';
import { fetchFromServiceAPI } from '@/lib/api';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';


// --- NEW GET METHOD ---
export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Fetch domains from your Express backend
        const serviceResponse = await fetchFromServiceAPI(`/user/${session.user.id}/domains`);
        console.log("Fetched domains:", serviceResponse.domains.map((d: any) => d.domain));
        return NextResponse.json(serviceResponse.domains); // Return the domains array directly
    } catch (error: any) {
        return NextResponse.json({ message: error.message || 'Server Error' }, { status: 500 });
    }
}


export async function POST(request: Request) {
    // Get the session using the server-side utility
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { domain, userId } = await request.json(); // Changed wyiUserId to userId
    if (!domain || !userId) { // Changed wyiUserId to userId
        return NextResponse.json({ message: 'Domain and userId are required.' }, { status: 400 });
    }

    try {
        // Proxy the request to the Service API
        const serviceResponse = await fetchFromServiceAPI(`/user/domains`, {
            method: 'POST',
            body: JSON.stringify({
                domain: domain,
                userId: userId // Pass the authenticated user ID
            }),
        });

        console.log(serviceResponse)

        return NextResponse.json(serviceResponse);

    } catch (error: any) {
        return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    // Get the session using the server-side utility
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const { domain, userId } = await request.json(); // Changed wyiUserId to userId

    try {
        const serviceResponse = await fetchFromServiceAPI(`/user/domains`, {
            method: 'DELETE',
            body: JSON.stringify({ domain, userId: userId }) // Pass the authenticated user ID, changed wyiUserId to userId
        });
        return NextResponse.json(serviceResponse);

    } catch (error: any) {
        return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
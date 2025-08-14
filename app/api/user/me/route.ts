// app/api/user/me/route.ts

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { fetchFromServiceAPI } from '@/lib/api'; // <-- Your helper for calling the backend
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET(request: Request) {
    // 1. Authenticate the request using the NextAuth session.
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        // 2. Instead of connecting to Mongo, call your backend service API.
        // The `session.user.id` holds the `wyiUserId`.
        const serviceResponse = await fetchFromServiceAPI(`/user/profile/${session.user.id}`);
        
        // 3. Check if the backend returned a successful response.
        if (serviceResponse.success && serviceResponse.user) {
            // Forward the user data from the service to the client.
            return NextResponse.json({ success: true, user: serviceResponse.user });
        } else {
            // If the backend reported an error (e.g., user not found), forward that.
            // The status code can be determined from the backend's response if needed.
            return NextResponse.json(
                { message: serviceResponse.message || 'User not found in backend service.' }, 
                { status: 404 }
            );
        }

    } catch (error: any) {
        // This 'catch' block now handles network errors or if the service API itself is down.
        console.error("API Error calling service from /user/me:", error);
        return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
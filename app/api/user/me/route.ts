import { NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/api';
import { connectToMongo } from '@/lib/mongo'; // <-- Import the connection helper

export async function GET(request: Request) {
    const decodedToken = await authenticateRequest(request);
    if (!decodedToken) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Get a cached or new connection to the database
        const { db } = await connectToMongo();

        const user = await db.collection('users').findOne(
            { wyiUserId: decodedToken.wyiUserId }
        );

        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, user });
    } catch (error) {
        console.error("API Error in /user/me:", error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
// app/api/user/mute/route.ts

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { fetchFromServiceAPI } from '@/lib/api';
import { authOptions } from '../../auth/[...nextauth]/route';

// MUTE a sender
export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.plan !== 'pro') {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const { senderToMute, userId } = await request.json();
    if (!senderToMute || !userId) {
        return NextResponse.json({ message: 'Sender and userId are required.' }, { status: 400 });
    }

    try {
        const serviceResponse = await fetchFromServiceAPI(`/user/${userId}/mute`, {
            method: 'POST',
            body: JSON.stringify({ senderToMute, userId }),
        });
        return NextResponse.json(serviceResponse);
    } catch (error: any) {
        return NextResponse.json({ message: error.message || 'Server Error' }, { status: 500 });
    }
}

// UNMUTE a sender
export async function DELETE(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { senderToUnmute, userId } = await request.json();
    if (!senderToUnmute || !userId) {
        return NextResponse.json({ message: 'Sender and userId are required.' }, { status: 400 });
    }

    try {
        const serviceResponse = await fetchFromServiceAPI(`/user/${userId}/mute/${senderToUnmute}`, {
            method: 'DELETE',
            body: JSON.stringify({ senderToUnmute, userId }),
        });
        return NextResponse.json(serviceResponse);
    } catch (error: any) {
        return NextResponse.json({ message: error.message || 'Server Error' }, { status: 500 });
    }
}
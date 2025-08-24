
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { code } = await request.json();

        if (!code) {
            return NextResponse.json({ message: 'Redeem code is required' }, { status: 400 });
        }

        // Get the valid redeem code from environment variables
        const validRedeemCode = process.env.REDEEM_CODE;

        if (!validRedeemCode) {
            return NextResponse.json({ message: 'Redeem system is not configured' }, { status: 500 });
        }

        // Check if the provided code matches the valid code
        if (code.toUpperCase() === validRedeemCode.toUpperCase()) {
            // Code is valid - you can store this in a database or session if needed
            // For now, we'll just return success
            return NextResponse.json({ 
                success: true, 
                message: 'Redeem code is valid! Please sign in with Discord to activate your pro plan.' 
            });
        } else {
            return NextResponse.json({ message: 'Invalid redeem code' }, { status: 400 });
        }

    } catch (error) {
        console.error('Error processing redeem code:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}

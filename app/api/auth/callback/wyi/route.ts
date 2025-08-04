import { NextResponse } from 'next/server';
import { sign } from '@/lib/jwt';
import { connectToMongo } from '@/lib/mongo';

// --- Helper Interfaces for Type Safety ---
interface WYITokenResponse {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    token_type: 'Bearer';
    scope: string[];
}

interface WYIUserResponse {
    _id: string; // This is the unique user ID, equivalent to 'sub' in standard OIDC
    email: string;
    username: string;
    firstName: string;
    lastName: string;
    isProUser: boolean; // This is the key field for plan status
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const appUrl = process.env.NEXT_PUBLIC_APP_URL!;

    if (!code) {
        return NextResponse.redirect(new URL('/?error=Authorization code is missing.', appUrl));
    }

    try {
        // --- Step 1: Exchange Authorization Code for Access Token ---
        const tokenResponse = await fetch('https://whatsyour.info/api/v1/oauth/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                grant_type: 'authorization_code',
                code,
                client_id: process.env.WYI_CLIENT_ID!,
                client_secret: process.env.WYI_CLIENT_SECRET!,
                redirect_uri: `${appUrl}/api/auth/callback/wyi`
            })
        });

        if (!tokenResponse.ok) {
            const errorBody = await tokenResponse.json();
            console.error('WYI Token Exchange Failed:', errorBody);
            throw new Error('Failed to exchange authorization code for a token.');
        }
        const tokens: WYITokenResponse = await tokenResponse.json();


        // --- Step 2: Use Access Token to Fetch User Details from WYI ---
        const userResponse = await fetch('https://whatsyour.info/api/v1/me', {
            headers: { 'Authorization': `Bearer ${tokens.access_token}` }
        });

        if (!userResponse.ok) {
            const errorBody = await userResponse.json();
            console.error('WYI User Info Fetch Failed:', errorBody);
            throw new Error('Failed to fetch user information from the provider.');
        }
        const wyiUser: WYIUserResponse = await userResponse.json();

        console.log(wyiUser)


         // --- Step 3 (CRITICAL): Upsert User in YOUR Database (Revised Logic) ---
        const { db } = await connectToMongo();
        const usersCollection = db.collection('users');

        // Prepare the document with the latest data from the OAuth provider
        const updateDoc = {
            $set: {
                wyiUserId: wyiUser._id,
                email: wyiUser.email,
                name: `${wyiUser.firstName} ${wyiUser.lastName}`.trim(),
                plan: wyiUser.isProUser ? 'pro' : 'free',
                lastLoginAt: new Date(),
            },
            $setOnInsert: {
                createdAt: new Date(),
                inboxes: [],
                customDomains: [],
                mutedSenders: [],
            }
        };
        
        const filter = { wyiUserId: wyiUser._id };
        const options = { upsert: true };

        // --- Step 3a: Perform the upsert operation ---
        // We don't need the return value from this operation, just that it completes without error.
        await usersCollection.updateOne(filter, updateDoc, options);

        // --- Step 3b: Immediately fetch the complete user record ---
        // This is now guaranteed to exist and be up-to-date.
        const ourUserInDb = await usersCollection.findOne(filter);
        
        if (!ourUserInDb) {
            // If we get here, something is fundamentally wrong with the DB connection or permissions.
            // This is a much more serious and unlikely error.
            throw new Error('Database consistency error: Failed to find user immediately after upsert.');
        }

        // --- Step 4: Create YOUR Application's JWT ---
        const appTokenPayload = {
            wyiUserId: ourUserInDb.wyiUserId,
            name: ourUserInDb.name,
            plan: ourUserInDb.plan,
        };
        const appToken = await sign(appTokenPayload);

        // --- Step 5: Set Secure Cookie and Redirect User Home ---
        const response = NextResponse.redirect(new URL('/', appUrl));
        response.cookies.set('app_jwt', appToken, {
            httpOnly: true, // Prevents client-side JS access
            secure: process.env.NODE_ENV !== 'development', // Only send over HTTPS in production
            sameSite: 'lax', // Good balance of security and usability
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: '/',
        });

        return response;

    } catch (error: any) {
        console.error("Authentication callback processing error:", error);
        // Redirect with a user-friendly error message
        return NextResponse.redirect(new URL('/?error=Authentication failed. Please try again.', appUrl));
    }
}
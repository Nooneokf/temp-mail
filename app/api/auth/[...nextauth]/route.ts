// app/api/auth/[...nextauth]/route.ts

import NextAuth from 'next-auth';
import type { NextAuthOptions, User, Account } from 'next-auth';
import { fetchFromServiceAPI } from '@/lib/api';

interface WYIProfile {
    _id: string;
    email: string;
    firstName: string;
    lastName: string;
    isProUser: boolean;
}

// This function calls your backend to create or update the user
// It replicates the logic from your original WYI callback.
async function upsertUserInBackend(profile: WYIProfile) {
    try {
        // This endpoint needs to exist on your Express backend.
        // It should handle the upsert logic based on wyiUserId.
        await fetchFromServiceAPI('/auth/upsert-user', {
            method: 'POST',
            body: JSON.stringify({
                wyiUserId: profile._id,
                email: profile.email,
                name: `${profile.firstName} ${profile.lastName}`.trim(),
                plan: profile.isProUser ? 'pro' : 'free',
            }),
        });
    } catch (error) {
        console.error("Failed to upsert user in backend:", error);
        // If this fails, the login should be aborted.
        throw new Error("Could not sync user with backend.");
    }
}


export const authOptions: NextAuthOptions = {
    session: {
        strategy: 'jwt',
    },
    providers: [
        {
            id: 'wyi',
            name: 'WhatsYourInfo',
            type: 'oauth',
            authorization: "https://whatsyour.info/oauth/authorize?scope=profile:read+email:read",
            token: "https://whatsyour.info/api/v1/oauth/token",
            userinfo: "https://whatsyour.info/api/v1/me",
            clientId: process.env.WYI_CLIENT_ID,
            clientSecret: process.env.WYI_CLIENT_SECRET,

            profile(profile: WYIProfile): User {
                return {
                    id: profile._id,
                    name: `${profile.firstName} ${profile.lastName}`.trim(),
                    email: profile.email,
                    plan: profile.isProUser ? 'pro' : 'free',
                };
            },
        },
    ],
    callbacks: {
        async signIn({ user, account, profile }) {
            if (account?.provider === 'wyi' && profile) {
                try {
                    // On every sign-in, ensure the user exists and is up-to-date in your database
                    await upsertUserInBackend(profile as WYIProfile);
                    return true; // Allow the sign-in
                } catch (error) {
                    console.error("Sign-in aborted due to backend error:", error);
                    return false; // Prevent sign-in if the backend sync fails
                }
            }
            return false;
        },

        async jwt({ token, user }) {
            // After sign-in, add custom properties from the User object to the JWT
            if (user) {
                token.id = user.id;
                token.plan = (user as any).plan;
            }
            return token;
        },

        async session({ session, token }) {
            // Make the custom properties available on the client-side session object
            if (token) {
                session.user.id = token.id as string;
                session.user.plan = token.plan as 'free' | 'pro';
            }
            return session;
        },
    },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
// app/api/auth/[...nextauth]/route.ts

import NextAuth from 'next-auth';
import type { NextAuthOptions, User } from 'next-auth';
import { fetchFromServiceAPI } from '@/lib/api';

interface WYIProfile {
    _id: string;
    email: string;
    firstName: string;
    lastName: string;
    isProUser: boolean;
    username: string
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
            // It's better practice to use the object format for authorization
            authorization: {
                url: "https://whatsyour.info/oauth/authorize",
                params: { scope: "profile:read email:read" },
            },

            // --- START OF THE FIX ---
            // Explicitly define how to request the token, matching your working example.
            token: {
                url: "https://whatsyour.info/api/v1/oauth/token",
                async request(context) {
                    const response = await fetch("https://whatsyour.info/api/v1/oauth/token", {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                          grant_type: "authorization_code",
                          code: context.params.code,
                          redirect_uri: context.provider.callbackUrl,
                          client_id: context.provider.clientId,
                          client_secret: context.provider.clientSecret,
                        }),
                    });
        
                    const tokens = await response.json();
                    if (!response.ok) {
                        console.error("Token request failed:", tokens);
                        throw new Error(tokens.error_description || "Token request failed");
                    }
                    // The request function needs to return an object with a `tokens` property
                    return { tokens };
                },
            },
            // --- END OF THE FIX ---

            // --- START OF THE CRITICAL FIX ---
            // We must also override the userinfo request to use fetch.
            userinfo: {
                url: "https://whatsyour.info/api/v1/me",
                async request(context) {
                    // The context contains the tokens from the previous step.
                    const { tokens } = context;

                    const response = await fetch("https://whatsyour.info/api/v1/me", {
                        headers: {
                            // Use the access token to authenticate the request to the userinfo endpoint.
                            Authorization: `Bearer ${tokens.access_token}`,
                            "User-Agent": "freecustom-email-app",
                        }
                    });

                    if (!response.ok) {
                        const text = await response.text();
                        throw new Error(`Userinfo request failed: ${text}`);
                    }

                    // The request function must return the user profile JSON object.
                    const profile = await response.json();
                    return profile;
                }
            },
            // --- END OF THE CRITICAL FIX ---
            clientId: process.env.WYI_CLIENT_ID,
            clientSecret: process.env.WYI_CLIENT_SECRET,

            profile(profile: WYIProfile): User {
                return {
                    id: profile._id,
                    name: `${profile.firstName} ${profile.lastName}`.trim(),
                    email: profile.email,
                    image: `https://whatsyour.info/api/v1/avatar/${profile.username}`,
                    plan: profile.isProUser ? 'pro' : 'free',
                };
            },
        },
    ],
    callbacks: {
        async signIn({ user, account, profile }) {
            // This callback runs AFTER the token exchange is successful.
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

        async jwt({ token, user, account }) {
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
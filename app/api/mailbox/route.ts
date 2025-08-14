// app/api/mailbox/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { fetchFromServiceAPI } from '@/lib/api'
import { authOptions } from '../auth/[...nextauth]/route'
import jwt from "jsonwebtoken";

// Define the shape of your NextAuth session
interface UserSession {
  user?: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
  // This is the crucial part: assuming the token is stored here by your JWT callback
  accessToken?: string 
}

export async function GET(request: Request) {
  // 1. Get the server-side session and the token from NextAuth.js
  const session: UserSession | null = await getServerSession(authOptions);

    const plan = session?.user.plan || "";

  // 2. Sign { plan } with NEXTAUTH_SECRET
  const signedToken = jwt.sign(
    { plan },
    process.env.NEXTAUTH_SECRET as string,
    { algorithm: "HS256", expiresIn: "15m" }
  );


  const { searchParams } = new URL(request.url)
  const mailbox = searchParams.get('fullMailboxId')
  const messageId = searchParams.get('messageId')

  if (!mailbox) {
    return NextResponse.json({ error: 'Mailbox parameter is required' }, { status: 400 })
  }

  try {
    let data;
    const options = {
      headers: {
        // 3. Pass the JWT to your backend service API
        'Authorization': `Bearer ${signedToken}`
      }
    };
    
    if (messageId) {
      // Fetch a single message
      data = await fetchFromServiceAPI(`/mailbox/${mailbox}/message/${messageId}`, options);
    } else {
      // Fetch the list of messages
      data = await fetchFromServiceAPI(`/mailbox/${mailbox}`, options);
    }
    return NextResponse.json(data);

  } catch (error) {
    console.error('API request failed:', error);
    // It's good practice to not expose the internal error message to the client
    return NextResponse.json({ error: 'Failed to fetch data from the service API' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  // 1. Get the server-side session and the token from NextAuth.js
  const session: UserSession | null = await getServerSession(authOptions);

  const plan = session?.user.plan || "";

  // 2. Sign { plan } with NEXTAUTH_SECRET
  const signedToken = jwt.sign(
    { plan },
    process.env.NEXTAUTH_SECRET as string,
    { algorithm: "HS256", expiresIn: "15m" }
  );


  const { searchParams } = new URL(request.url)
  const mailbox = searchParams.get('fullMailboxId')
  const messageId = searchParams.get('messageId')

  if (!mailbox || !messageId) {
    return NextResponse.json({ error: 'Mailbox and messageId parameters are required' }, { status: 400 })
  }

  try {
    const data = await fetchFromServiceAPI(`/mailbox/${mailbox}/message/${messageId}`, {
      method: "DELETE",
      headers: {
        // 3. Pass the JWT to your backend service API
        'Authorization': `Bearer ${signedToken}`
      }
    });
    return NextResponse.json(data);

  } catch (error) {
    console.error('API request failed during DELETE:', error);
    return NextResponse.json({ error: 'Failed to delete the message' }, { status: 500 });
  }
}
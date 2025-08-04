import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ message: 'Logged out successfully' });

  response.cookies.set({
    name: 'app_jwt',
    value: '',
    path: '/',
    expires: new Date(0), // Expire immediately
    httpOnly: true,
    sameSite: 'lax',
  });

  return response;
}

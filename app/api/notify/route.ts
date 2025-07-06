// app/api/notify/route.ts

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client
// Note: It's best practice to create a shared Supabase client instance
// in a lib/supabase/server.ts file, but for simplicity, we'll initialize it here.
// These variables must be in your .env.local file.
const supabaseUrl = "https://jzkqtjyigreixokfubne.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp6a3RxanlpZ3JlaXhva2Z1Ym5lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4MzIzNDAsImV4cCI6MjA2NzQwODM0MH0.eNx7P6hoKZiv9TPqZfQr-Yq-QiMc0esnvt8Fb9p3KeE"

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// This is the handler for POST requests to /api/notify
export async function POST(request: Request) {
  try {
    // Parse the request body to get the email
    const body = await request.json();
    const { email } = body as any

    // --- Validation ---
    // Basic email validation
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { error: 'A valid email address is required.' },
        { status: 400 }
      );
    }

    // --- Database Interaction ---
    // Insert the new email into the 'ditmail-notify' table
    const { data, error } = await supabase
      .from('ditmail-notify')
      .insert([{ email: email.toLowerCase() }]) // Store emails in lowercase to help prevent duplicates
      .select();

    // --- Error Handling ---
    // Handle potential errors from Supabase
    if (error) {
      console.error('Supabase error:', error.message);

      // Check for the unique constraint violation error code from PostgreSQL
      if (error.code === '23505') {
        // This means the email already exists. We can return a success-like message
        // to avoid letting the user know the email is already in the DB.
        return NextResponse.json(
          { message: 'Thank you! You are on the list.' },
          { status: 200 } // Use 200 OK to not signal a "conflict" state to the user
        );
      }

      // For other database errors, return a generic server error
      return NextResponse.json(
        { error: 'Could not add email to the notification list.' },
        { status: 500 }
      );
    }

    // --- Success ---
    return NextResponse.json(
      { message: 'Thank you! You will be notified at launch.' },
      { status: 200 }
    );

  } catch (err: any) {
    // Handle errors from parsing the request body or other unexpected issues
    console.error('API Route Error:', err);
    
    if (err instanceof SyntaxError) {
      return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
    }

    return NextResponse.json(
      { error: 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}
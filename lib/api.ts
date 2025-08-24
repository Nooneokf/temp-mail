import { verify } from '@/lib/jwt';

// These environment variables point to your *SERVICE API*, not the Next.js app itself.
const SERVICE_API_URL = process.env.SERVICE_API_URL; // e.g., https://api.tempmail.encorebot.me
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY; // The *same* key as in your service API

if (!SERVICE_API_URL || !INTERNAL_API_KEY) {
    throw new Error("SERVICE_API_URL and INTERNAL_API_KEY must be defined in .env.local");
}

/**
 * A secure server-side function to fetch data from your internal Service API.
 * This should ONLY be called from your Next.js API routes (`/api/*`).
 * @param path The path of the service endpoint (e.g., `/health`).
 * @param options The standard Fetch API options object.
 * @returns The JSON response from the service.
 */
export async function fetchFromServiceAPI(path: string, options: RequestInit = {}) {
    const url = `${SERVICE_API_URL}${path}`;

    // Securely add the RapidAPI headers
    const headers = {
        'Content-Type': 'application/json',
        'X-RapidAPI-Key': INTERNAL_API_KEY!,
        'X-RapidAPI-Host': process.env.RAPIDAPI_HOST!,
        ...options.headers,
    };

    try {
        const response = await fetch(url, { ...options, headers });
        
        // Handle non-ok responses
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'An unknown API error occurred.' }));
            // Re-throw an error with a message from the service API if available
            throw new Error(errorData.message || `Service API request failed with status ${response.status}`);
        }
        
        // Handle successful but empty responses (e.g., for a DELETE request)
        if (response.status === 204 || response.headers.get('content-length') === '0') {
            return { success: true };
        }

        return await response.json();
    } catch (error) {
        console.error(`Service API fetch error for path ${path}:`, error);
        // Ensure we always throw an Error object
        throw error instanceof Error ? error : new Error('A network or parsing error occurred.');
    }
}

/**
 * Verifies the JWT from the user's browser.
 * This is used to protect the Next.js API routes themselves.
 * @param request The incoming Next.js API request.
 * @returns The decoded JWT payload or null if invalid.
 */
export async function authenticateRequest(request: Request): Promise<any | null> {
    let token = request.headers.get('Authorization')?.split('Bearer ')[1];

    if (!token) {
        return null;
    }

    try {
        return await verify(token);
    } catch (error) {
        console.error('Failed to verify token:', error);
        return null;
    }
}

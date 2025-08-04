import { MongoClient, Db } from 'mongodb';

// --- Type Definitions for a better developer experience ---
// These can be expanded and moved to a central types file as your app grows.
export interface CustomDomain {
    domain: string;
    verified: boolean;
    mxRecord: string;
    txtRecord: string;
}

export interface UserInDb {
    _id: any; // MongoDB's ObjectId
    wyiUserId: string; // The unique ID from whatsyour.info
    email: string;
    name: string;
    plan: 'anonymous' | 'free' | 'pro';
    inboxes: string[];
    customDomains: CustomDomain[];
    mutedSenders: string[];
    createdAt: Date;
    lastLoginAt: Date;
}


// --- Connection Logic ---

const MONGO_URI = process.env.MONGO_URI;
const DB_NAME = 'freecustomemail'; // e.g., 'freecustomemail'

if (!MONGO_URI) {
    throw new Error(
        'Please define the MONGO_URI environment variable inside your .env.local file'
    );
}

if (!DB_NAME) {
    throw new Error(
        'Please define the MONGO_DB_NAME environment variable inside your .env.local file'
    );
}


/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections from growing exponentially
 * during API Route usage. In production, this pattern is also efficient
 * for serverless environments like Vercel, allowing a single connection
 * to be reused across multiple invocations of the same function.
 */
// @ts-ignore
let cached: { client: MongoClient; db: Db } = global.mongo;

if (!cached) {
    // @ts-ignore
    cached = global.mongo = { client: null, db: null };
}

/**
 * The main connection function. It checks for a cached connection and
 * creates a new one if it doesn't exist.
 * @returns A promise that resolves to an object containing the MongoClient instance and the Db instance.
 */
export async function connectToMongo(): Promise<{ client: MongoClient; db: Db }> {
    if (cached.client && cached.db) {
        return cached;
    }

    try {
        const client = new MongoClient(MONGO_URI!);
        
        await client.connect();
        
        const db = client.db(DB_NAME);

        // --- Create necessary indexes on first connect ---
        // This is an idempotent operation. It will only create indexes if they don't already exist.
        // Doing this here ensures your indexes are always in place in any environment.
        await db.collection<UserInDb>('users').createIndex({ wyiUserId: 1 }, { unique: true });
        await db.collection('users').createIndex({ "customDomains.domain": 1 });
        // Add more indexes here as needed for your queries.
        
        console.log("Successfully connected to MongoDB and ensured indexes.");

        cached.client = client;
        cached.db = db;

        return cached;
    } catch (error) {
        console.error("Failed to connect to MongoDB:", error);
        // We throw the error to ensure that any operation trying to use the DB fails fast
        // if the connection itself could not be established.
        throw error;
    }
}
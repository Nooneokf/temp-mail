// app/api/stats/route.ts
import { NextResponse } from 'next/server'
import { authenticateRequest, fetchFromServiceAPI } from '@/lib/api'

export async function GET(request: Request) {
    if (!await authenticateRequest(request)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const data = await fetchFromServiceAPI(`/health`)
        return NextResponse.json(data)
    } catch (error) {
        console.error('API request failed:', error)
        return NextResponse.json({ error: 'Failed to fetch status data from the API' }, { status: 500 })
    }
}
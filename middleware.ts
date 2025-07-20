import { NextResponse } from 'next/server'
import { getPostBySlug } from './lib/posts'

export function middleware(req: { nextUrl: { pathname: any } }) {
    const url = req.nextUrl.pathname

    // Check if the URL starts with /blog/ and if the post exists
    const postExists = async (slug: string) => {
        const { data, content } = await getPostBySlug(slug)
        return data && content
    }

    if (url.startsWith('/blog/') && !postExists(url)) {
        return NextResponse.rewrite('/404')
    }

    return NextResponse.next()
}

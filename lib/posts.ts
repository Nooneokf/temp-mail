import matter from 'gray-matter';
// Import the manifest generated at build time
import posts from './blog-manifest.json';

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  excerpt?: string;
}

/**
 * Returns a sorted list of all blog post metadata.
 * Reads from the pre-built manifest and does NOT use the file system.
 */
export function getBlogPosts(): BlogPost[] {
  // The posts are already sorted by the build script.
  return posts;
}

/**
 * Returns an array of slugs for use in generateStaticParams.
 * Reads from the pre-built manifest.
 */
export function getAllPostSlugs(): string[] {
  return posts.map((post) => post.slug);
}

/**
 * Fetches the content of a single blog post by its slug.
 * This function is serverless-friendly because the markdown files are in the `public`
 * directory and accessible via a URL.
 */
export async function getPostBySlug(slug: string) {
  // This part of your code was already correct!
  // We fetch the raw markdown file from its public URL.
  const res = await fetch(`https://www.tempmail.encorebot.me/blog/${slug}.md`);

  if (!res.ok) {
    // Handle the case where the post is not found
    return null;
  }
  
  const fileContent = await res.text();
  const { data, content } = matter(fileContent);

  return { data, content };
}
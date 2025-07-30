// lib/posts.ts
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const blogDirectory = path.join(process.cwd(), 'public/blog')

export function getAllPostSlugs() {
  return fs.readdirSync(blogDirectory)
    .filter((file) => file.endsWith('.md'))
    .map((file) => file.replace('.md', ''))
}

export async function getPostBySlug(slug: string) {
    const res = await fetch(`https://www.freecustom.email/blog/${slug}.md`) // if in public/blog/
    const fileContent = await res.text()
  
    const { data, content } = matter(fileContent)
    return { data, content }
  }
  
  export interface BlogPost {
  slug: string
  title: string
  date: string
  excerpt?: string
}

export function getBlogPosts(): BlogPost[] {
  const blogDir = path.join(process.cwd(), 'public/blog')
  const files = fs.readdirSync(blogDir)

  return files
    .filter(filename => filename.endsWith('.md'))
    .map(filename => {
      const filePath = path.join(blogDir, filename)
      const fileContent = fs.readFileSync(filePath, 'utf8')
      const { data, content } = matter(fileContent)
      return {
        slug: filename.replace('.md', ''),
        title: data.title,
        date: data.date,
        excerpt: data.excerpt || content.slice(0, 120).replace(/\n/g, '') + '...',
      }
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import MarkdownRenderer from '@/components/md-renderer'

interface BlogPostProps {
  params: {
    slug: string
  }
}

export default async function BlogPost({ params }: BlogPostProps) {
  const { slug } = params
  const filePath = path.join(process.cwd(), 'content/blog', `${slug}.md`)
  const fileContent = fs.readFileSync(filePath, 'utf8')
  const { data, content } = matter(fileContent)

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">{data.title}</h1>
      <p className="text-sm text-gray-500 mb-6">{new Date(data.date).toLocaleDateString()}</p>
      <div className="text-lg mb-5 md:mb-10">

      <MarkdownRenderer content={content} />
      </div>
    </div>
  )
}


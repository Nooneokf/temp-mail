import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import html from 'remark-html'

interface BlogPostProps {
  params: {
    slug: string
  }
}

export default async function BlogPost({ params }: BlogPostProps) {
  const { slug } = params
  const filePath = path.join(process.cwd(), 'app/blog', `${slug}.md`)
  const fileContent = fs.readFileSync(filePath, 'utf8')
  const { data, content } = matter(fileContent)
  const processedContent = await remark().use(html).process(content)
  const contentHtml = processedContent.toString()

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">{data.title}</h1>
      <p className="text-sm text-gray-500 mb-6">{new Date(data.date).toLocaleDateString()}</p>
      <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: contentHtml }} />
    </div>
  )
}


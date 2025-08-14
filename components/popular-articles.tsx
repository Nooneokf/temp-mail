import Link from 'next/link'
import posts from '@/lib/blog-manifest.json'; // Adjust the path if necessary

// The BlogPost interface might already be defined elsewhere, but including it here for clarity
interface BlogPost {
  slug: string;
  title: string;
  date: string;
  // The manifest we created provides an 'excerpt'
  excerpt: string; 
}

export function PopularArticles() {
  // The manifest is already sorted by date, so we just need to take the first 4.
  // The data fetching logic is completely gone!
  const popularPosts: BlogPost[] = posts.slice(0, 4);


  return (
    <section className="my-12">
      <h2 className="mb-8 text-center text-3xl font-bold">Popular Articles</h2>
      <div className="grid gap-6 md:grid-cols-2">
        {popularPosts.map((post, index) => (
          <div key={index} className="rounded-lg border bg-card p-4 shadow-sm">
            <Link href={`/blog/${post.slug}`}>
              <h3 className="mb-2 text-xl font-semibold">{post.title}</h3>
            </Link>
            <p className="text-sm text-muted-foreground">{post.excerpt}</p>
            <p className="mt-2 text-sm text-gray-500">{new Date(post.date).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
    </section>
  )
}


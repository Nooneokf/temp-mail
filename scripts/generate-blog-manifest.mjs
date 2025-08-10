import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

// Path to your markdown files
const blogDir = path.join(process.cwd(), 'public/blog');

function generateManifest() {
  console.log('🔍 Generating blog post manifest...');
  const files = fs.readdirSync(blogDir);

  const posts = files
    .filter(filename => filename.endsWith('.md'))
    .map(filename => {
      const filePath = path.join(blogDir, filename);
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const { data, content } = matter(fileContent);

      // Create a short excerpt if one isn't provided in the frontmatter
      const excerpt = data.excerpt || content.slice(0, 150).replace(/\n/g, ' ') + '...';

      return {
        slug: filename.replace('.md', ''),
        title: data.title,
        date: data.date,
        excerpt: excerpt,
      };
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Write the manifest to a file that the app can import
  // Place it in a lib or utils folder for easy access
  fs.writeFileSync(
    path.join(process.cwd(), 'lib/blog-manifest.json'),
    JSON.stringify(posts, null, 2)
  );

  console.log(`✅ Blog manifest generated with ${posts.length} posts.`);
}

generateManifest();
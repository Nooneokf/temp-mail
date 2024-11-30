import Link from "next/link"

export function AppFooter() {
  const links = [
    "Privacy Policy (please read)",
  ]

  return (
    <footer className="bg-muted py-6">
      <div className="container mx-auto px-4">
        <nav className="flex flex-wrap justify-center gap-4">
          {links.map((link) => (
            <Link
              key={link}
              href="/blog/privacy-policy"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              {link}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  )
}


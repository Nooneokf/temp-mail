export function AppFooter() {
  const links = [
    "PREMIUM",
    "API",
    "ARTICLES",
    "10 MINUTE MAIL",
    "EMAIL GENERATOR",
    "PRIVACY",
    "TERMS",
    "FAQ",
    "CONTACTS",
    "ADVERTISING"
  ]

  return (
    <footer className="bg-muted py-6">
      <div className="container mx-auto px-4">
        <nav className="flex flex-wrap justify-center gap-4">
          {links.map((link) => (
            <a
              key={link}
              href="#"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              {link}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  )
}


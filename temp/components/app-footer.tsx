import Link from "next/link"

export function AppFooter() {

  return (
    <footer className="bg-muted py-6">
      <div className="container mx-auto px-4">
        <nav className="flex flex-wrap justify-center gap-4">
          <div className="mt-8 flex flex-col sm:flex-row justify-between items-center">
            <p className="text-sm text-center text-gray-600">
              © {new Date().getFullYear()} DishIs Technologies. All rights reserved.
            </p>
            <div className="mt-4 sm:mt-0">
              <Link
                href="/blog/privacy-policy"
                className="text-sm text-gray-600 hover:text-blue-600"
              >
                Privacy Policy
              </Link>
              <a href="#" className="text-sm text-gray-600 hover:text-blue-600">Terms of Service</a>
            </div>
          </div>
        </nav>
      </div>
    </footer>
  )
}


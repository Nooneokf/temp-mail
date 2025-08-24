import Link from "next/link";

export function AppFooter() {
  return (
    <footer className="bg-gradient-to-r from-slate-900 to-slate-800 py-12 border-t border-slate-700">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row justify-between items-center space-y-6 lg:space-y-0">
          <div className="flex flex-col items-center lg:items-start space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">TM</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Temp-Mail</span>
            </div>
            <p className="text-sm text-slate-400 text-center lg:text-left max-w-md">
              Secure, fast, and reliable temporary email addresses for privacy-conscious users.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-8">
            <div className="flex flex-wrap justify-center gap-6 items-center">
              <Link
                href="/blog/privacy-policy"
                className="text-sm text-slate-300 hover:text-blue-400 transition-colors duration-200"
              >
                Privacy Policy
              </Link>
              <Link
                href="/blog/terms-of-service"
                className="text-sm text-slate-300 hover:text-blue-400 transition-colors duration-200"
              >
                Terms of Service
              </Link>
              <Link
                href="/docs"
                className="text-sm text-slate-300 hover:text-blue-400 transition-colors duration-200"
              >
                API Docs
              </Link>
            </div>
            <div className="text-center">
              <p className="text-sm text-slate-400">
                © {new Date().getFullYear()} Team Epic. All rights reserved.
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Built with ❤️ for privacy
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

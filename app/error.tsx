"use client";

import Link from "next/link";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  console.error(error);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <h1 className="text-3xl font-bold mb-4">Something went wrong</h1>
      <p className="mb-6 text-gray-600 max-w-lg">
        We’re sorry, but an unexpected error occurred while loading this page.
        If you keep seeing this message, please contact our support team so we
        can help resolve the issue.
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={() => reset()}
          className="px-5 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition"
        >
          Try Again
        </button>

        <Link
          href="/contact"
          className="px-5 py-2 rounded bg-gray-200 hover:bg-gray-300 transition"
        >
          Contact Us
        </Link>
      </div>

      {error?.digest && (
        <p className="mt-6 text-sm text-gray-400">
          Error Code: <code>{error.digest}</code>
        </p>
      )}
    </div>
  );
}

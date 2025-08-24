"use client";

export default function NotProView() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <h1 className="text-2xl font-bold mb-4">
        Feature Coming Soon
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
        This feature is currently in development. Check back later for updates.
      </p>
    </div>
  );
}
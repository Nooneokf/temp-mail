"use client";

import { useState } from "react";
import {AuthPopup} from "@/components/AuthPopup";

export default function UnauthView() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <h1 className="text-2xl font-bold mb-4">
        Sign in to Access the Dashboard
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
        Please sign in with your Discord account to access the dashboard features.
      </p>
      <button
        onClick={() => setIsAuthOpen(true)}
        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
      >
        Sign In
      </button>
      <AuthPopup isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
}

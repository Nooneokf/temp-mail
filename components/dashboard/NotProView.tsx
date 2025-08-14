"use client";

import { useState } from "react";
import {AuthPopup} from "@/components/AuthPopup";

export default function NotProView() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <h1 className="text-2xl font-bold mb-4">
        Upgrade to PRO to Access This Page
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
        The Pro Dashboard unlocks advanced features like custom domains and
        muted sender lists.
      </p>
      <button
        onClick={() => setIsAuthOpen(true)}
        className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
      >
        Buy PRO
      </button>
      <AuthPopup isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
}

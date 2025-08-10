// components/DITMailPopup.tsx

'use client';

import { useState, useEffect } from 'react';
import { IoClose } from 'react-icons/io5';
import Link from 'next/link';

export function DITMailPopup() {
  const [isPopupVisible, setIsPopupVisible] = useState(false);

  useEffect(() => {
    const popupDismissed = localStorage.getItem('ditmailPopupDismissed');
    if (!popupDismissed) {
      const timer = setTimeout(() => {
        setIsPopupVisible(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismissPopup = () => {
    setIsPopupVisible(false);
    localStorage.setItem('ditmailPopupDismissed', 'true');
  };

  if (!isPopupVisible) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 p-4 w-[90%] sm:w-96 max-w-full bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700">
      <button
        onClick={handleDismissPopup}
        className="absolute top-2 right-2 z-10 text-gray-500 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white transition-colors"
        aria-label="Dismiss"
      >
        <IoClose size={24} />
      </button>

      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          🚀 New Sign-In Feature!
        </h2>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          You can now sign in to unlock powerful new features including:
        </p>
        <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300">
          <li>Save and sync your email settings</li>
          <li>Access Pro-only tools instantly</li>
          <li>Get early access to upcoming features</li>
        </ul>
        <Link
          href="/signin"
          className="mt-3 inline-block text-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          Sign In Now
        </Link>
      </div>
    </div>
  );
}

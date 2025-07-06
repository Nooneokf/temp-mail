// components/NotifyModal.tsx

'use client';

import { useState } from 'react';
import { IoClose } from 'react-icons/io5';

interface NotifyModalProps {
  onClose: () => void; // Function to close the modal
}

export function NotifyModal({ onClose }: NotifyModalProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setMessage('');
    
    // Simple console log for transparency, as requested
    console.log(`
      --- DITMail Notification ---
      Thank you for your interest!
      We are only taking your email (${email}) for a one-time notification when DITMail officially launches.
      Your email will not be used for marketing, sold, or shared.
      No tracking or other data is being collected. This is totally optional.
      Thank you for your trust!
      ---------------------------
    `);

    try {
      const response = await fetch('/api/notify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json() as any;

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong.');
      }
      
      // Handle success and "already on list" cases with the same positive message
      setMessage('Thank you! We will notify you at launch.');
      setEmail(''); // Clear the input on success

      // Optional: close the modal after a short delay on success
      setTimeout(() => {
        onClose();
      }, 2500);

    } catch (error: any) {
      setMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-6 sm:p-8 max-w-md w-full border border-gray-200 dark:border-gray-700">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          aria-label="Close"
        >
          <IoClose size={24} />
        </button>

        <h3 className="text-xl font-bold text-center text-gray-900 dark:text-white">
          Be the First to Know!
        </h3>
        <p className="mt-2 text-sm text-center text-gray-600 dark:text-gray-300">
          Enter your email to get a one-time notification when DITMail officially launches. No spam, ever.
        </p>

        <form onSubmit={handleSubmit} className="mt-6">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your-email@example.com"
            required
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading || !!message} // Disable if loading or success message is shown
          />

          <button
            type="submit"
            disabled={isLoading || !!message}
            className="w-full mt-4 px-4 py-2 text-base font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Submitting...' : 'Notify Me'}
          </button>
        </form>

        {message && (
          <p className={`mt-4 text-center text-sm font-medium ${message.includes('Thank you') ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

// In your globals.css (or similar) for the fade-in effect:
/*

*/
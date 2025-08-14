"use client";

import { useEffect } from 'react';

type ShortcutMap = { [key: string]: () => void };

export const useKeyboardShortcuts = (shortcuts: ShortcutMap, plan: 'anonymous' | 'free' | 'pro') => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((event.target as HTMLElement).tagName)) {
        return; // Don't trigger shortcuts when typing
      }
      
      const shortcut = event.key.toLowerCase();
      
      if (plan === 'anonymous') return; // No shortcuts for anonymous users
      
      if (plan === 'free') {
          // Allow only basic shortcuts for free users
          const allowedShortcuts = ['r', 'c'];
          if (allowedShortcuts.includes(shortcut) && shortcuts[shortcut]) {
            event.preventDefault();
            shortcuts[shortcut]();
          }
      }

      if (plan === 'pro') {
          // Allow all shortcuts for pro users
          if (shortcuts[shortcut]) {
            event.preventDefault();
            shortcuts[shortcut]();
          }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [shortcuts, plan]);
};
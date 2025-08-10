// components/app-header.tsx
"use client";

import { useTranslations } from 'next-intl';
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { Moon, Sun, Menu as MenuIconLucide, X as CloseIcon, Gift } from "lucide-react";
import Link from 'next/link';
import { FaDiscord, FaGithub, FaPatreon } from "react-icons/fa";
import { useState, useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import Navigation from "./Navigation";
import { motion, AnimatePresence } from "framer-motion";
import { AuthPopup } from './AuthPopup';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuItem, DropdownMenuContent } from './ui/dropdown-menu';
import { LATEST_CHANGELOG_VERSION } from "@/lib/changelog"; // <-- Import latest version
import { WhatsNewModal } from "./WhatsNewModal"; // <-- Import the modal
import { signIn, signOut, useSession } from 'next-auth/react';

export function AppHeader() {
  const t = useTranslations('AppHeader');
  const { theme, setTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { data: session, status } = useSession(); // <-- Use the session hook
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  // --- "WHAT'S NEW" STATE ---
  const [isWhatsNewOpen, setIsWhatsNewOpen] = useState(false);
  const [hasSeenLatest, setHasSeenLatest] = useState(true);

  useEffect(() => {
    // On component mount, check if the user has seen the latest version
    const seenVersion = localStorage.getItem('seenChangelogVersion');
    if (seenVersion !== LATEST_CHANGELOG_VERSION) {
      setHasSeenLatest(false);
    }
  }, []);

  const openWhatsNew = () => {
    setIsWhatsNewOpen(true);
    // When they open it, mark the latest version as seen
    localStorage.setItem('seenChangelogVersion', LATEST_CHANGELOG_VERSION);
    setHasSeenLatest(true);
  };
  // --- END "WHAT'S NEW" STATE ---


  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  const toggleMobileMenu = useCallback(() => {
    setMenuOpen((prev) => !prev);
  }, []);

  const handleMobileLinkClick = useCallback(() => {
    setMenuOpen(false);
  }, []);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);


  const renderAuthButton = () => {
    if (status === 'loading') {
      return <div className="h-9 w-24 bg-muted rounded animate-pulse"></div>;
    }
    if (status === 'authenticated') {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost">{session.user?.name || 'Account'}</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem asChild><Link href="/dashboard">Dashboard</Link></DropdownMenuItem>
            <DropdownMenuItem onClick={() => signOut()}>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }
    return <Button onClick={() => setIsPopupOpen(true)}>Login</Button>;
  };

  return (
    <>
      <header className="border-b w-full relative z-50 bg-background">
        <div className="mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2" aria-label="Home" onClick={menuOpen ? handleMobileLinkClick : undefined}>
            <Image
              src="/logo.webp"
              alt="FreeCustom.Email Logo"
              width={40}
              height={40}
              className="h-8 w-8 sm:h-10 sm:w-10" />
            <span className="text-base sm:text-lg md:text-xl font-bold whitespace-nowrap">
              FreeCustom.Email
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-4">
            <Navigation />

            {/* --- AUTH BUTTON LOGIC --- */}
            {renderAuthButton()}

            {/* --- END AUTH BUTTON LOGIC --- */}
            {/* --- "WHAT'S NEW" BUTTON --- */}
            <Button
              variant="ghost"
              size="icon"
              onClick={openWhatsNew}
              className="relative p-2"
              aria-label={'whats new'}
            >
              <Gift className="h-5 w-5" />
              {!hasSeenLatest && (
                <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
                </span>
              )}
            </Button>
            {/* --- END "WHAT'S NEW" BUTTON --- */}

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="p-2"
              aria-label={t('aria_toggle_theme')}
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">{t('aria_toggle_theme')}</span>
            </Button>
          </div>

          <div className="md:hidden flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="p-2"
              aria-label={t('aria_toggle_theme')}
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">{t('aria_toggle_theme')}</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMobileMenu}
              className="p-2"
              aria-label={menuOpen ? t('aria_close_menu') : t('aria_open_menu')}
              aria-expanded={menuOpen}
            >
              <MenuIconLucide className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <AnimatePresence>
          {menuOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.4 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-30 bg-black backdrop-blur-sm" />

              {/* Mobile Side Menu */}
              <motion.div
                ref={menuRef}
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "tween", duration: 0.3 }}
                className="fixed top-0 right-0 bottom-0 w-72 bg-background z-40 shadow-lg px-6 py-6 flex flex-col gap-4 md:hidden"
              >
                {/* Close Button */}
                <button
                  className="ml-auto mb-4 p-1 rounded hover:bg-accent"
                  onClick={() => setMenuOpen(false)}
                  aria-label={t('aria_close_menu')}
                >
                  <CloseIcon className="h-5 w-5" />
                </button>

                <Link href="/docs" className="text-sm hover:underline py-1" aria-label={t('aria_api_docs')} onClick={handleMobileLinkClick}>
                  {t('api_docs')}
                </Link>
                <Link href="/blog" className="text-sm hover:underline py-1" onClick={handleMobileLinkClick}>
                  Blog
                </Link>
                <a
                  href="https://github.com/DishIs/temp-mail"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm hover:underline flex items-center gap-1 py-1"
                  aria-label={t('aria_github')}
                  onClick={handleMobileLinkClick}
                >
                  <FaGithub className="h-4 w-4" /> {t('github')}
                </a>
                <a
                  href="https://www.patreon.com/maildrop"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm hover:underline flex items-center gap-1 py-1"
                  aria-label={t('aria_patreon')}
                  onClick={handleMobileLinkClick}
                >
                  <FaPatreon className="h-4 w-4" /> {t('patreon')}
                </a>
                <a
                  href="https://discord.gg/Ztp7kT2QBz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm hover:underline flex items-center gap-1 py-1"
                  aria-label={t('aria_discord')}
                  onClick={handleMobileLinkClick}
                >
                  <FaDiscord className="h-4 w-4" /> {t('discord')}
                </a>
                {/* --- AUTH BUTTON LOGIC --- */}
                <div className="mt-auto pt-4 border-t">
                  {renderAuthButton()}
                </div>
                {/* --- END AUTH BUTTON LOGIC --- */}
                {/* --- "WHAT'S NEW" BUTTON --- */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={openWhatsNew}
                  className="relative p-2 w-full"
                  aria-label={'whats new'}
                >
                  <Gift className="h-5 w-5" /> Updates
                  {!hasSeenLatest && (
                    <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
                    </span>
                  )}
                </Button>
                {/* --- END "WHAT'S NEW" BUTTON --- */}

                <Navigation />
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </header>
      <AuthPopup isOpen={isPopupOpen} onClose={() => setIsPopupOpen(false)} />
      {/* Add the modal to the component's return statement */}
      <WhatsNewModal isOpen={isWhatsNewOpen} onClose={() => setIsWhatsNewOpen(false)} />
    </>
  );
}

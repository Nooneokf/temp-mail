// components/app-header.tsx
"use client";

import { useTranslations } from 'next-intl';
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { Moon, Sun, Menu as MenuIconLucide, X as CloseIcon, Gift, Crown } from "lucide-react";
import Link from 'next/link';
import { FaDiscord, FaGithub, FaPatreon } from "react-icons/fa";
import { useState, useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import Navigation from "./Navigation";
import { motion, AnimatePresence } from "framer-motion";
import { AuthPopup } from './AuthPopup';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuItem, DropdownMenuContent, DropdownMenuSeparator } from './ui/dropdown-menu';
import { LATEST_CHANGELOG_VERSION } from "@/lib/changelog"; // <-- Import latest version
import { WhatsNewModal } from "./WhatsNewModal"; // <-- Import the modal
import { signOut } from 'next-auth/react';
import { Session } from 'next-auth';


export function AppHeader({initialSession}: {initialSession: Session; }) {
  const t = useTranslations('AppHeader');
  const { theme, setTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const session = initialSession
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
      return <div className="h-10 w-10 bg-muted rounded-full animate-pulse"></div>;
    }
    if (status === 'authenticated' && session?.user) {
      // @ts-ignore - Assuming 'plan' is a custom property on the session user object
      const userPlan = session.user?.plan || 'Free';
      const isPro = userPlan === 'Pro';

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
              <div className={`relative h-full w-full rounded-full border-2 ${isPro ? 'border-yellow-400' : 'border-white'}`}>
                {session.user.image ? (
                  <Image
                    src={session.user.image}
                    alt={session.user.name || 'User avatar'}
                    layout="fill"
                    objectFit="cover"
                    className="rounded-full"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full w-full bg-muted rounded-full text-muted-foreground">
                    {session.user.name?.charAt(0).toUpperCase()}
                  </div>
                )}
                {isPro && (
                  <div className="absolute -top-1 -right-1 bg-background rounded-full p-0.5">
                     <Crown className="h-4 w-4 text-yellow-400" />
                  </div>
                )}
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64" align="end" forceMount>
            <div className="flex flex-col items-center justify-center pt-4 pb-2">
              <div className="relative h-16 w-16 mb-2">
                <div className={`relative h-full w-full rounded-full border-2 ${isPro ? 'border-yellow-400' : 'border-white'}`}>
                  {session.user.image ? (
                    <Image
                      src={session.user.image}
                      alt={session.user.name || 'User avatar'}
                      layout="fill"
                      objectFit="cover"
                      className="rounded-full"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full w-full bg-muted rounded-full text-muted-foreground">
                      {session.user.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  {isPro && (
                     <div className="absolute -top-1 -right-1 bg-background rounded-full p-0.5">
                        <Crown className="h-5 w-5 text-yellow-400" />
                     </div>
                  )}
                </div>
                <div className="absolute -bottom-2 w-full flex justify-center">
                  <div className="rounded-full bg-secondary px-2 py-0.5 text-xs font-semibold text-secondary-foreground shadow">
                    {userPlan} Plan
                  </div>
                </div>
              </div>
              <div className="text-center mt-3">
                <p className="text-sm font-medium truncate">{session.user.name}</p>
                <p className="text-xs text-muted-foreground truncate">{session.user.email}</p>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard">Dashboard</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a href="https://whatsyour.info/billing" target="_blank" rel="noopener noreferrer">Billing</a>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a href="https://whatsyour.info/profile" target="_blank" rel="noopener noreferrer">WYI Profile</a>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {!isPro && (
              <div className="p-1">
                 <Button asChild className="w-full" size="sm">
                    <Link href="/pricing">Upgrade to Pro</Link>
                 </Button>
              </div>
            )}
            <DropdownMenuItem onClick={() => signOut()}>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }
    return <Button onClick={() => setIsPopupOpen(true)} className='md:p-4 p-2'>Login</Button>;
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
            <span className="text-base hidden xs:block sm:text-lg md:text-xl font-bold whitespace-nowrap">
              FreeCustom.Email
            </span>
            <span className="text-base block xs:hidden font-bold whitespace-nowrap">
              FC.E
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-4">
            <Navigation />
            {renderAuthButton()}
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
            {renderAuthButton()}
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

                <Button
                  variant="ghost"
                  onClick={openWhatsNew}
                  className="relative p-2 w-full justify-start gap-2"
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
                <Navigation />
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </header>
      <AuthPopup isOpen={isPopupOpen} onClose={() => setIsPopupOpen(false)} />
      <WhatsNewModal isOpen={isWhatsNewOpen} onClose={() => setIsWhatsNewOpen(false)} />
    </>
  );
}
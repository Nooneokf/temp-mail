"use client"

import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"
import Link from "next/link"
import { FaGithub } from "react-icons/fa"
import { Menu } from "lucide-react"
import { useState } from "react"

export function AppHeader() {
  const { theme, setTheme } = useTheme()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="border-b max-w-[100vw]">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2" aria-label="Home">
          <span className="bg-white rounded-full">
            <img
              src="/logo.png"
              alt="Temp Mail"
              className="h-8 w-8 sm:h-10 sm:w-10"
              loading="lazy"
            />
          </span>
          <span className="text-base sm:text-lg md:text-xl font-bold whitespace-nowrap">
            FREE TEMPMAIL
          </span>
        </Link>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
          <Button variant="outline" className="text-sm px-4 py-2" asChild>
            <a
              href="https://rapidapi.com/dishis-technologies-maildrop/api/temp-mail-maildrop1"
              target="_blank"
              rel="noopener noreferrer"
              className="whitespace-nowrap"
              aria-label="View API documentation"
            >
              API
            </a>
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="p-2"
            asChild
          >
            <a
              href="https://github.com/DishIs/temp-mail"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View GitHub repository"
            >
              <FaGithub className="h-5 w-5" />
            </a>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2"
            aria-label="Toggle theme"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2"
            aria-label="Toggle theme"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2"
            aria-label="Toggle mobile menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {menuOpen && (
        <div className="md:hidden px-4 pb-4 flex flex-col gap-3 bg-white dark:bg-black border-t">
          <Link href="/pricing" className="text-sm hover:underline" aria-label="View Pricing">
            Pricing
          </Link>
          <a
            href="https://rapidapi.com/dishis-technologies-maildrop/api/temp-mail-maildrop1"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm hover:underline"
            aria-label="View API documentation"
          >
            API
          </a>
          <a
            href="https://github.com/DishIs/temp-mail"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm hover:underline flex items-center gap-1"
            aria-label="View GitHub repository"
          >
            <FaGithub className="h-4 w-4" /> GitHub
          </a>
        </div>
      )}
    </header>
  )
}

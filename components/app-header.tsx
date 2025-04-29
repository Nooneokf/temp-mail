"use client"

import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import { Moon, Sun } from 'lucide-react'
import Link from "next/link"
import { FaGithub } from "react-icons/fa"

export function AppHeader() {
  const { theme, setTheme } = useTheme()

  return (
    <header className="border-b max-w-[100vw]">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href={"/"} className="flex items-center gap-2">
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
        
        <div className="flex items-center gap-3 sm:gap-5">
          <Button
            variant="outline"
            className="text-xs sm:text-sm px-4 py-2 sm:px-6 sm:py-3"
          >
            <a
              href="https://rapidapi.com/dishis-technologies-maildrop/api/temp-mail-maildrop1"
              title="Build your own app or website and use it with the free plan"
              className="whitespace-nowrap"
            >
              API
            </a>
          </Button>
          <Link
            href="/pricing"
            className="text-xs sm:text-sm text-gray-600 hover:text-blue-600 whitespace-nowrap px-4 py-2 sm:px-6 sm:py-3"
          >
            Pricing
          </Link>
          <Button
            variant={"outline"}
            className="text-xs sm:text-sm px-4 py-2 sm:px-6 sm:py-3"
          >
            <a
              title="Build your own temp mail website like this one."
              href="https://github.com/DishIs/temp-mail"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center"
            >
              <FaGithub className="h-4 w-4 sm:h-5 sm:w-5" />
            </a>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-3 sm:p-4"
          >
            <Sun className="h-[1rem] w-[1rem] sm:h-[1.2rem] sm:w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1rem] w-[1rem] sm:h-[1.2rem] sm:w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
      </div>
    </header>
  )
}

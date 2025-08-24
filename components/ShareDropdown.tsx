// components/ShareDropdown.tsx

"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Share, Link as LinkIcon } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner"; // Using sonner for notifications, see step 3

// Recommended: using react-icons for brand logos
import { FaTwitter, FaFacebook, FaLinkedin, FaReddit, FaWhatsapp, FaTelegramPlane, FaEnvelope, FaGithub } from "react-icons/fa";
import Image from "next/image";

const shareUrl = "https://tempmail.encorebot.me";
const shareText = "Create your temporary email address today! Check out Temp-Mail";

// 1. Define your sharing platforms
const sharePlatforms = [
  {
    name: "Twitter",
    Icon: FaTwitter,
    createUrl: (url: string, text: string) => `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
  },
  {
    name: "Facebook",
    Icon: FaFacebook,
    createUrl: (url: string) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    name: "LinkedIn",
    Icon: FaLinkedin,
    createUrl: (url: string, text: string) => `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(text)}`,
  },
  {
    name: "Reddit",
    Icon: FaReddit,
    createUrl: (url: string, text: string) => `https://www.reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(text)}`,
  },
  {
    name: "WhatsApp",
    Icon: FaWhatsapp,
    createUrl: (url: string, text: string) => `https://api.whatsapp.com/send?text=${encodeURIComponent(text + " " + url)}`,
  },
  {
    name: "Telegram",
    Icon: FaTelegramPlane,
    createUrl: (url: string, text: string) => `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
  },
  {
    name: "Email",
    Icon: FaEnvelope,
    createUrl: (url: string, text: string) => `mailto:?subject=${encodeURIComponent(text)}&body=${encodeURIComponent("Check this out: " + url)}`,
  },
];

// 2. Define your review platforms
const reviewPlatforms = [
  {
    name: "Product Hunt",
    href: "https://www.producthunt.com/products/temp-mail",
    logo: "/product-hunt.svg",
  },
  {
    name: "Trustpilot",
    href: "https://www.trustpilot.com/review/tempmail.encorebot.me",
    logo: "/trustpilot.svg",
  },
  {
    name: "G2",
    href: "https://www.g2.com/products/temp-mail/reviews",
    logo: "/g2.svg",
  },
  {
    name: "AlternativeTo",
    href: "https://alternativeto.net/software/temp-mail/about",
    logo: "/alternative-to.svg",
  },
  {
    name: "About Team",
    href: "https://tempmail.encorebot.me/about",
    logo: <FaGithub className="w-4 h-4" />,
  },
];


export function ShareDropdown() {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    // You can add a toast notification here to inform the user
    toast.success("Link copied to clipboard!");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary" size="icon" title="Share this page" aria-label="Share this page">
          <Share className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Share via</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="grid grid-cols-3 gap-3 p-2">
          {sharePlatforms.map(({ name, Icon, createUrl }) => (
            <DropdownMenuItem key={name} asChild className="p-0 cursor-pointer">
              <Link
                href={createUrl(shareUrl, shareText)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center gap-1 p-2 rounded-md hover:bg-muted"
                title={`Share on ${name}`}
              >
                <Icon className="h-6 w-6" />
                <span className="text-xs">{name}</span>
              </Link>
            </DropdownMenuItem>
          ))}
        </div>
        <DropdownMenuItem onSelect={copyToClipboard} className="cursor-pointer">
          <LinkIcon className="mr-2 h-4 w-4" />
          <span>Copy Link</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Review us on</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="flex items-center justify-around p-2">
          {reviewPlatforms.map((platform) => (
            <Button
              key={platform.name}
              variant="ghost" // Use ghost for a cleaner look
              size="icon"
              asChild
              title={`${platform.name} review`}
              aria-label={`${platform.name} review`}
            >
              <Link
                href={platform.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Image
                  src={platform.logo}
                  alt={platform.name}
                  width={24} // Slightly larger for better visibility
                  height={24}
                  className={platform.name === "AlternativeTo" ? "light:fill-black" : ""}
                />
              </Link>
            </Button>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
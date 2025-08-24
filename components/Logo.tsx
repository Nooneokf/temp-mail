
"use client";

import { motion } from "framer-motion";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  animated?: boolean;
}

export function Logo({ className = "", size = "md", animated = true }: LogoProps) {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-12 h-12"
  };

  const LogoSvg = animated ? motion.svg : "svg";
  const LogoPath = animated ? motion.path : "path";

  return (
    <LogoSvg
      className={`${sizeClasses[size]} ${className}`}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...(animated && {
        initial: { scale: 0.8, opacity: 0 },
        animate: { scale: 1, opacity: 1 },
        transition: { duration: 0.5, ease: "easeOut" }
      })}
    >
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
        <linearGradient id="logoGradientHover" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#7C3AED" />
        </linearGradient>
      </defs>
      
      {/* Background Circle */}
      <LogoPath
        d="M20 36C29.9411 36 38 27.9411 38 18C38 8.05887 29.9411 0 20 0C10.0589 0 2 8.05887 2 18C2 27.9411 10.0589 36 20 36Z"
        fill="url(#logoGradient)"
        {...(animated && {
          whileHover: { fill: "url(#logoGradientHover)" },
          transition: { duration: 0.2 }
        })}
      />
      
      {/* Email Icon */}
      <LogoPath
        d="M8 12L20 20L32 12"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        {...(animated && {
          initial: { pathLength: 0 },
          animate: { pathLength: 1 },
          transition: { duration: 1, delay: 0.3 }
        })}
      />
      <LogoPath
        d="M8 12H32V26C32 27.1046 31.1046 28 30 28H10C8.89543 28 8 27.1046 8 26V12Z"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        {...(animated && {
          initial: { pathLength: 0 },
          animate: { pathLength: 1 },
          transition: { duration: 1, delay: 0.1 }
        })}
      />
      
      {/* Timer indicator */}
      <LogoPath
        d="M26 8C27.1046 8 28 7.10457 28 6C28 4.89543 27.1046 4 26 4C24.8954 4 24 4.89543 24 6C24 7.10457 24.8954 8 26 8Z"
        fill="white"
        {...(animated && {
          initial: { scale: 0 },
          animate: { scale: 1 },
          transition: { duration: 0.3, delay: 0.8 }
        })}
      />
    </LogoSvg>
  );
}

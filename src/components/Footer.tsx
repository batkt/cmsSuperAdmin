'use client'

import Link from 'next/link'

import { bgMap } from '../engine/Tokens'

// Footer Component - CMS Renderer Specification
// Based on FOOTER.md specification

export interface FooterLinkMap {
  [key: string]: string
}

export interface FooterProps {
  // Required
  title: string
  copyright: string

  // Optional
  bg?: string
  footerLinks?: FooterLinkMap

  // Note: button prop exists in schema but is not rendered currently

  // Additional
  className?: string
  id?: string
}

// Theme classes mapping for fallback and background
const themeToBgMap: Record<string, string> = {
  light: 'slate50',
  dark: 'slate900',
  primary: 'primary',
  secondary: 'slate100'
}

const bgTextClasses: Record<string, { text: string; subtitle: string; border: string }> = {
  slate50: {
    text: 'text-gray-900',
    subtitle: 'text-gray-500',
    border: 'border-gray-200',
  },
  slate900: {
    text: 'text-white',
    subtitle: 'text-gray-400',
    border: 'border-gray-800',
  },
  primary: {
    text: 'text-white',
    subtitle: 'text-blue-200',
    border: 'border-blue-500',
  },
  slate100: {
    text: 'text-gray-900',
    subtitle: 'text-gray-600',
    border: 'border-gray-500',
  },
  white: {
    text: 'text-gray-900',
    subtitle: 'text-gray-500',
    border: 'border-gray-200',
  }
}

export default function Footer({
  title,
  copyright,
  bg = 'slate900',
  footerLinks,
  className = '',
  id,
}: FooterProps) {
  const resolvedBg = typeof bgMap[bg] !== 'undefined' ? bg : (themeToBgMap[bg] || 'slate900')
  const bgClass = bgMap[resolvedBg] || bgMap.slate900
  const themeStyle = bgTextClasses[resolvedBg] || bgTextClasses.slate900

  return (
    <footer
      id={id}
      className={`border-t ${bgClass} ${themeStyle.border} ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
          {/* Left: Brand and Copyright */}
          <div className="flex flex-col gap-2">
            <h3 className={`text-lg font-semibold ${themeStyle.text}`}>
              {title}
            </h3>
            <p className={`text-sm ${themeStyle.subtitle}`}>
              {copyright}
            </p>
          </div>

          {/* Right: Links */}
          {footerLinks && Object.keys(footerLinks).length > 0 && (
            <nav className="flex flex-wrap gap-x-6 gap-y-2">
              {Object.entries(footerLinks).map(([key, label]) => (
                <Link
                  key={key}
                  href={`/${key}`}
                  className={`text-sm hover:opacity-80 transition-opacity ${themeStyle.text}`}
                >
                  {label}
                </Link>
              ))}
            </nav>
          )}
        </div>
      </div>
    </footer>
  )
}

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import Button, { ButtonProps } from './Button'

// Header Component - CMS Renderer Specification
// Based on HEADER.md specification

export type HeaderTheme = 'light' | 'dark' | 'primary' | 'secondary'

export interface HeaderLink {
  href: string
  label: string
  isExternal?: boolean
}

export interface HeaderProps {
  // Required
  title: string

  // Optional
  theme?: HeaderTheme
  links?: HeaderLink[]
  button?: ButtonProps

  // Additional
  className?: string
  id?: string
}

// Theme classes mapping
const themeClasses: Record<HeaderTheme, { bg: string; text: string; border: string }> = {
  light: {
    bg: 'bg-white',
    text: 'text-gray-900',
    border: 'border-gray-200',
  },
  dark: {
    bg: 'bg-gray-900',
    text: 'text-white',
    border: 'border-gray-700',
  },
  primary: {
    bg: 'bg-blue-600',
    text: 'text-white',
    border: 'border-blue-500',
  },
  secondary: {
    bg: 'bg-gray-600',
    text: 'text-white',
    border: 'border-gray-500',
  },
}

export default function Header({
  title,
  theme = 'light',
  links = [],
  button,
  className = '',
  id,
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const themeStyle = themeClasses[theme]

  return (
    <header
      id={id}
      className={`sticky top-0 z-50 border-b ${themeStyle.bg} ${themeStyle.border} ${themeStyle.text} ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Title */}
          <Link href="/" className={`text-xl font-bold ${themeStyle.text} hover:opacity-80 transition-opacity`}>
            {title}
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {links.map((link, index) => (
              <Link
                key={index}
                href={link.href}
                target={link.isExternal ? '_blank' : undefined}
                rel={link.isExternal ? 'noopener noreferrer' : undefined}
                className={`text-sm font-medium hover:opacity-80 transition-opacity ${themeStyle.text}`}
              >
                {link.label}
              </Link>
            ))}

            {/* CTA Button */}
            {button && (
              <Button {...button} />
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-black/10 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className={`md:hidden py-4 border-t ${themeStyle.border}`}>
            <nav className="flex flex-col gap-4">
              {links.map((link, index) => (
                <Link
                  key={index}
                  href={link.href}
                  target={link.isExternal ? '_blank' : undefined}
                  rel={link.isExternal ? 'noopener noreferrer' : undefined}
                  className={`text-sm font-medium hover:opacity-80 transition-opacity ${themeStyle.text}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}

              {/* CTA Button - Mobile */}
              {button && (
                <div className="pt-2">
                  <Button {...button} fullWidth />
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import Button, { ButtonProps } from './Button'

import { bgMap } from '../engine/Tokens'

// Header Component - CMS Renderer Specification
// Based on HEADER.md specification

export interface HeaderLink {
  href: string
  label: string
  isExternal?: boolean
}

export interface HeaderProps {
  // Required
  title: string

  // Optional
  bg?: string
  links?: HeaderLink[]
  button?: ButtonProps

  // Additional
  className?: string
  id?: string
}

// Theme classes mapping for fallback and border/text
const themeToBgMap: Record<string, string> = {
  light: 'white',
  dark: 'slate900',
  primary: 'primary',
  secondary: 'slate100'
}

const themeClasses: Record<string, { text: string; border: string }> = {
  white: {
    text: 'text-gray-900',
    border: 'border-gray-200',
  },
  slate900: {
    text: 'text-white',
    border: 'border-gray-700',
  },
  primary: {
    text: 'text-white',
    border: 'border-blue-500',
  },
  slate100: {
    text: 'text-gray-900',
    border: 'border-gray-500',
  },
}

export default function Header({
  title,
  bg = 'white',
  links = [],
  button,
  className = '',
  id,
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const resolvedBg = typeof bgMap[bg] !== 'undefined' ? bg : (themeToBgMap[bg] || 'white')
  const bgClass = bgMap[resolvedBg] || bgMap.white
  const themeStyle = themeClasses[resolvedBg] || themeClasses.white

  return (
    <header
      id={id}
      className={`sticky top-0 z-50 border-b ${bgClass} ${themeStyle.border} ${themeStyle.text} ${className}`}
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

'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'

// Pagination Component - CMS Renderer Specification
// Based on PAGINATION.md specification

export type PaginationTheme = 'light' | 'dark' | 'primary' | 'secondary'

export interface PaginationPage {
  route: string
  title: string
}

export interface PaginationProps {
  theme?: PaginationTheme
  pages?: PaginationPage[]
  currentRoute?: string
  className?: string
}

// Theme classes mapping
const themeClasses: Record<PaginationTheme, { bg: string; text: string; active: string; inactive: string; border: string; disabled: string }> = {
  light: {
    bg: 'bg-white',
    text: 'text-gray-900',
    active: 'bg-blue-600 text-white',
    inactive: 'bg-white text-gray-700 hover:bg-gray-100',
    border: 'border-gray-300',
    disabled: 'text-gray-400 cursor-not-allowed',
  },
  dark: {
    bg: 'bg-gray-800',
    text: 'text-white',
    active: 'bg-blue-500 text-white',
    inactive: 'bg-gray-700 text-gray-300 hover:bg-gray-600',
    border: 'border-gray-600',
    disabled: 'text-gray-600 cursor-not-allowed',
  },
  primary: {
    bg: 'bg-blue-600',
    text: 'text-white',
    active: 'bg-white text-blue-600',
    inactive: 'bg-blue-500 text-blue-100 hover:bg-blue-400',
    border: 'border-blue-400',
    disabled: 'text-blue-300 cursor-not-allowed',
  },
  secondary: {
    bg: 'bg-gray-600',
    text: 'text-white',
    active: 'bg-white text-gray-600',
    inactive: 'bg-gray-500 text-gray-200 hover:bg-gray-400',
    border: 'border-gray-400',
    disabled: 'text-gray-300 cursor-not-allowed',
  },
}

// Extract page number from title
function getPageNumber(title: string, route: string): string {
  // Home page check
  if (title === 'Home' || route === '/') {
    return '1'
  }
  
  // Try to extract number from title
  const match = title.match(/(\d+)/)
  if (match) {
    return match[1]
  }
  
  return '?'
}

export default function Pagination({
  theme = 'light',
  pages = [],
  currentRoute = '/',
  className = '',
}: PaginationProps) {
  const themeStyle = themeClasses[theme]
  
  // Find current page index
  const currentIndex = pages.findIndex(p => p.route === currentRoute)
  const hasPages = pages.length > 0
  
  // Compute prev and next pages
  const prevPage = currentIndex > 0 ? pages[currentIndex - 1] : null
  const nextPage = currentIndex >= 0 && currentIndex < pages.length - 1 ? pages[currentIndex + 1] : null
  
  // Get page label (number or ?)
  const getPageLabel = (page: PaginationPage) => getPageNumber(page.title, page.route)
  
  return (
    <nav className={`flex items-center justify-center gap-2 py-6 ${themeStyle.bg} ${className}`}>
      {/* Previous Button */}
      {prevPage ? (
        <Link
          href={prevPage.route}
          className={`flex items-center px-3 py-2 rounded-lg border ${themeStyle.border} ${themeStyle.inactive} transition-colors`}
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          Prev
        </Link>
      ) : (
        <span className={`flex items-center px-3 py-2 rounded-lg border ${themeStyle.border} ${themeStyle.disabled}`}>
          <ChevronLeft className="w-5 h-5 mr-1" />
          Prev
        </span>
      )}
      
      {/* Page Numbers */}
      <div className="flex items-center gap-1">
        {pages.map((page, index) => {
          const isActive = page.route === currentRoute
          const label = getPageLabel(page)
          
          return (
            <Link
              key={page.route}
              href={page.route}
              className={`
                w-10 h-10 flex items-center justify-center rounded-lg border ${themeStyle.border}
                font-medium transition-colors
                ${isActive ? themeStyle.active : themeStyle.inactive}
              `}
              aria-current={isActive ? 'page' : undefined}
            >
              {label}
            </Link>
          )
        })}
      </div>
      
      {/* Next Button */}
      {nextPage ? (
        <Link
          href={nextPage.route}
          className={`flex items-center px-3 py-2 rounded-lg border ${themeStyle.border} ${themeStyle.inactive} transition-colors`}
        >
          Next
          <ChevronRight className="w-5 h-5 ml-1" />
        </Link>
      ) : (
        <span className={`flex items-center px-3 py-2 rounded-lg border ${themeStyle.border} ${themeStyle.disabled}`}>
          Next
          <ChevronRight className="w-5 h-5 ml-1" />
        </span>
      )}
    </nav>
  )
}

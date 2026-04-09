'use client'

import React from 'react'

// Container Component - CMS Renderer Specification
// Based on CONTAINER.md specification

export type ContainerMaxWidth = 'sm' | 'md' | 'lg' | 'xl' | 'full'
export type ContainerPadding = 'none' | 'sm' | 'md' | 'lg' | 'xl'
export type ContainerTheme = 'light' | 'dark' | 'primary' | 'secondary'

export interface ContainerProps {
  // Layout options
  maxWidth?: ContainerMaxWidth
  padding?: ContainerPadding
  theme?: ContainerTheme

  // Children - for slot-based rendering
  children?: React.ReactNode

  // Additional
  className?: string
  id?: string
}

// Max-width classes mapping
const maxWidthClasses: Record<ContainerMaxWidth, string> = {
  sm: 'max-w-2xl',
  md: 'max-w-4xl',
  lg: 'max-w-6xl',
  xl: 'max-w-7xl',
  full: 'max-w-full',
}

// Padding classes mapping
const paddingClasses: Record<ContainerPadding, string> = {
  none: 'py-0 px-0',
  sm: 'py-4 px-4 sm:px-6',
  md: 'py-8 px-4 sm:px-6 lg:px-8',
  lg: 'py-12 px-4 sm:px-6 lg:px-8',
  xl: 'py-16 px-4 sm:px-6 lg:px-8 xl:px-12',
}

// Theme classes mapping
const themeClasses: Record<ContainerTheme, string> = {
  light: 'bg-white',
  dark: 'bg-gray-900',
  primary: 'bg-blue-600',
  secondary: 'bg-gray-600',
}

export default function Container({
  maxWidth = 'xl',
  padding = 'lg',
  theme = 'light',
  children,
  className = '',
  id,
}: ContainerProps) {
  return (
    <section
      id={id}
      className={`${themeClasses[theme]} ${className}`}
    >
      <div className={`${maxWidthClasses[maxWidth]} mx-auto ${paddingClasses[padding]}`}>
        {children ? (
          children
        ) : (
          <div className={`text-sm italic ${theme === 'light' ? 'text-gray-400' : 'text-white/50'}`}>
            Container slot - empty
          </div>
        )}
      </div>
    </section>
  )
}

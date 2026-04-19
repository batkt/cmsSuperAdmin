'use client'

import React from 'react'

import { bgMap } from '../engine/Tokens'

// Container Component - CMS Renderer Specification
// Based on CONTAINER.md specification

export type ContainerMaxWidth = 'sm' | 'md' | 'lg' | 'xl' | 'full'
export type ContainerPadding = 'none' | 'sm' | 'md' | 'lg' | 'xl'

export interface ContainerProps {
  // Layout options
  maxWidth?: ContainerMaxWidth
  padding?: ContainerPadding
  bg?: string

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

// Theme classes mapping for fallback
const themeToBgMap: Record<string, string> = {
  light: 'white',
  dark: 'slate900',
  primary: 'primary',
  secondary: 'slate100'
}

export default function Container({
  maxWidth = 'xl',
  padding = 'lg',
  bg = 'white',
  children,
  className = '',
  id,
}: ContainerProps) {
  const resolvedBg = typeof bgMap[bg] !== 'undefined' ? bg : (themeToBgMap[bg] || 'white')
  const bgClass = bgMap[resolvedBg] || bgMap.white

  return (
    <section
      id={id}
      className={`${bgClass} ${className}`}
    >
      <div className={`${maxWidthClasses[maxWidth]} mx-auto ${paddingClasses[padding]}`}>
        {children ? (
          children
        ) : (
          <div className={`text-sm italic ${resolvedBg === 'white' ? 'text-gray-400' : 'text-white/50'}`}>
            Container slot - empty
          </div>
        )}
      </div>
    </section>
  )
}

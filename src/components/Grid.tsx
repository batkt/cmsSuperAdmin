'use client'

import React from 'react'

// Grid Component - CMS Renderer Specification
// Based on GRID.md specification

export type GridGap = 'none' | 'sm' | 'md' | 'lg' | 'xl'
export type GridTheme = 'light' | 'dark' | 'primary' | 'secondary'

export interface GridProps {
  // Layout options
  columns?: number // 1-12, default 3
  gap?: GridGap
  theme?: GridTheme

  // Runtime prop for auto-fill mode
  minItemWidth?: string // e.g., "250px"

  // Children - for slot-based rendering
  children?: React.ReactNode

  // Additional
  className?: string
  id?: string
}

// Gap classes mapping
const gapClasses: Record<GridGap, string> = {
  none: 'gap-0',
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
  xl: 'gap-8',
}

// Theme classes mapping
const themeClasses: Record<GridTheme, string> = {
  light: 'bg-white',
  dark: 'bg-gray-900',
  primary: 'bg-blue-600',
  secondary: 'bg-gray-600',
}

export default function Grid({
  columns = 3,
  gap = 'md',
  theme = 'light',
  minItemWidth,
  children,
  className = '',
  id,
}: GridProps) {
  // Validate columns range
  const validColumns = Math.max(1, Math.min(12, columns))

  // Build grid style
  const gridStyle: React.CSSProperties = minItemWidth
    ? {
        gridTemplateColumns: `repeat(auto-fill, minmax(${minItemWidth}, 1fr))`,
      }
    : {
        gridTemplateColumns: `repeat(${validColumns}, minmax(0, 1fr))`,
      }

  return (
    <section
      id={id}
      className={`${themeClasses[theme]} ${className}`}
    >
      <div
        className={`grid ${gapClasses[gap]}`}
        style={gridStyle}
      >
        {children ? (
          children
        ) : (
          <div className={`col-span-full text-sm italic ${theme === 'light' ? 'text-gray-400' : 'text-white/50'}`}>
            Grid items slot - empty
          </div>
        )}
      </div>
    </section>
  )
}

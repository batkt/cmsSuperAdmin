'use client'

import React from 'react'

// Card Component - CMS Renderer Specification
// Based on CARD.md specification

export type CardShadow = 'none' | 'sm' | 'md' | 'lg'
export type CardPadding = 'none' | 'sm' | 'md' | 'lg'
export type CardTheme = 'light' | 'dark' | 'primary' | 'secondary'

export interface CardProps {
  // Content options
  title?: string
  subtitle?: string

  // Style options
  border?: boolean
  shadow?: CardShadow
  padding?: CardPadding
  theme?: CardTheme

  // Slots - for slot-based rendering
  headerSlot?: React.ReactNode
  contentSlot?: React.ReactNode
  footerSlot?: React.ReactNode

  // Additional
  className?: string
  id?: string
}

// Shadow classes mapping
const shadowClasses: Record<CardShadow, string> = {
  none: '',
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
}

// Padding classes mapping
const paddingClasses: Record<CardPadding, string> = {
  none: 'p-0',
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-8',
}

// Theme classes mapping
const themeClasses: Record<CardTheme, { bg: string; text: string; subtitle: string; border: string }> = {
  light: {
    bg: 'bg-white',
    text: 'text-gray-900',
    subtitle: 'text-gray-500',
    border: 'border-gray-200',
  },
  dark: {
    bg: 'bg-gray-800',
    text: 'text-white',
    subtitle: 'text-gray-400',
    border: 'border-gray-700',
  },
  primary: {
    bg: 'bg-blue-600',
    text: 'text-white',
    subtitle: 'text-blue-100',
    border: 'border-blue-500',
  },
  secondary: {
    bg: 'bg-gray-600',
    text: 'text-white',
    subtitle: 'text-gray-200',
    border: 'border-gray-500',
  },
}

export default function Card({
  title,
  subtitle,
  border = true,
  shadow = 'md',
  padding = 'md',
  theme = 'light',
  headerSlot,
  contentSlot,
  footerSlot,
  className = '',
  id,
}: CardProps) {
  const themeStyle = themeClasses[theme]

  // Determine if we have a custom header slot or use default title/subtitle
  const hasHeaderSlot = !!headerSlot
  const hasTitle = !!title
  const showDefaultHeader = !hasHeaderSlot && hasTitle

  return (
    <div
      id={id}
      className={`
        rounded-xl overflow-hidden
        ${themeStyle.bg}
        ${border ? `border ${themeStyle.border}` : ''}
        ${shadowClasses[shadow]}
        ${className}
      `}
    >
      {/* Header */}
      {(hasHeaderSlot || showDefaultHeader) && (
        <div className={`${paddingClasses[padding]} ${border ? `border-b ${themeStyle.border}` : ''}`}>
          {hasHeaderSlot ? (
            headerSlot
          ) : showDefaultHeader ? (
            <div>
              <h3 className={`text-lg font-semibold ${themeStyle.text}`}>
                {title}
              </h3>
              {subtitle && (
                <p className={`text-sm mt-1 ${themeStyle.subtitle}`}>
                  {subtitle}
                </p>
              )}
            </div>
          ) : null}
        </div>
      )}

      {/* Content */}
      <div className={paddingClasses[padding]}>
        {contentSlot ? (
          contentSlot
        ) : (
          <div className={`text-sm italic ${themeStyle.subtitle}`}>
            Content slot - empty
          </div>
        )}
      </div>

      {/* Footer */}
      {footerSlot && (
        <div className={`${paddingClasses[padding]} ${border ? `border-t ${themeStyle.border}` : ''}`}>
          {footerSlot}
        </div>
      )}
    </div>
  )
}

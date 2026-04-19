'use client'

import Button, { ButtonProps } from './Button'

// Hero Component - CMS Renderer Specification
// Based on HERO.md specification

export type HeroAlign = 'left' | 'center' | 'right'
export type HeroTheme = 'light' | 'dark' | 'primary' | 'secondary'
import { bgMap, alignMap, spacingMap } from '../engine/Tokens'

export interface HeroImage {
  url: string
  alt?: string
}

export interface HeroProps {
  // Required
  title: string

  // Optional
  subtitle?: string
  align?: string
  bg?: string
  padding?: string
  buttons?: ButtonProps[]
  images?: HeroImage[]

  // Additional
  className?: string
  id?: string
}

// Map custom Hero themes to Tokens bg if needed, or rely on Token's colors directly.
// For backwards compatibility, we'll map dark to slate900 and light to white, primary to primary
const themeToBgMap: Record<string, string> = {
  light: 'white',
  dark: 'slate900',
  primary: 'primary',
  secondary: 'slate100'
}

// Text color mappings based on bg token
const bgTextClasses: Record<string, { text: string; subtitle: string }> = {
  white: {
    text: 'text-gray-900',
    subtitle: 'text-gray-600',
  },
  slate900: {
    text: 'text-white',
    subtitle: 'text-gray-300',
  },
  primary: {
    text: 'text-white',
    subtitle: 'text-blue-100',
  },
  slate100: {
    text: 'text-gray-900',
    subtitle: 'text-gray-600',
  },
}

// Alignment classes
const alignClasses: Record<HeroAlign, { container: string; text: string; buttons: string; images: string }> = {
  left: {
    container: 'items-start',
    text: 'text-left',
    buttons: 'justify-start',
    images: 'justify-start',
  },
  center: {
    container: 'items-center',
    text: 'text-center',
    buttons: 'justify-center',
    images: 'justify-center',
  },
  right: {
    container: 'items-end',
    text: 'text-right',
    buttons: 'justify-end',
    images: 'justify-end',
  },
}

export default function Hero({
  title,
  subtitle,
  align = 'center',
  bg = 'white',
  padding = 'lg',
  buttons,
  images,
  className = '',
  id,
}: HeroProps) {
  // Handle backwards compatibility for theme
  const resolvedBg = typeof bgMap[bg] !== 'undefined' ? bg : (themeToBgMap[bg] || 'white')
  const bgClass = bgMap[resolvedBg] || bgMap.white
  const textStyle = bgTextClasses[resolvedBg] || bgTextClasses.white
  
  const alignStyleMap: Record<string, { container: string; buttons: string; images: string }> = {
    left: {
      container: 'items-start',
      buttons: 'justify-start',
      images: 'justify-start',
    },
    center: {
      container: 'items-center',
      buttons: 'justify-center',
      images: 'justify-center',
    },
    right: {
      container: 'items-end',
      buttons: 'justify-end',
      images: 'justify-end',
    },
  }
  
  const alignSpecificStyle = alignStyleMap[align] || alignStyleMap.center
  const textJustify = alignMap[align] || alignMap.center
  const spacingClass = padding && padding !== 'none' ? `py-[${spacingMap[padding] || '0'}]` : 'py-16 lg:py-24'

  return (
    <section
      id={id}
      className={`${spacingClass} ${bgClass} ${className}`}
    >
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col ${alignSpecificStyle.container}`}>
        {/* Title */}
        <h1 className={`text-4xl md:text-5xl lg:text-6xl font-bold ${textStyle.text} ${textJustify}`}>
          {title}
        </h1>

        {/* Subtitle */}
        {subtitle && (
          <p className={`mt-4 text-lg md:text-xl max-w-3xl ${textStyle.subtitle} ${textJustify}`}>
            {subtitle}
          </p>
        )}

        {/* Buttons */}
        {buttons && buttons.length > 0 && (
          <div className={`mt-8 flex flex-wrap gap-4 ${alignSpecificStyle.buttons}`}>
            {buttons.map((btn, index) => (
              <Button key={index} {...btn} />
            ))}
          </div>
        )}

        {/* Images */}
        {images && images.length > 0 && (
          <div className={`mt-12 w-full flex flex-wrap gap-6 ${alignSpecificStyle.images}`}>
            {images.map((image, index) => (
              <div
                key={index}
                className="relative w-full sm:w-80 md:w-96 aspect-video rounded-xl overflow-hidden shadow-lg group"
              >
                <img
                  src={image.url}
                  alt={image.alt || ''}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

'use client'

import Button, { ButtonProps } from './Button'

// Hero Component - CMS Renderer Specification
// Based on HERO.md specification

export type HeroAlign = 'left' | 'center' | 'right'
export type HeroTheme = 'light' | 'dark' | 'primary' | 'secondary'
export type HeroSpacing = 'none' | 'sm' | 'md' | 'lg' | 'xl'

export interface HeroImage {
  url: string
  alt?: string
}

export interface HeroProps {
  // Required
  title: string

  // Optional
  subtitle?: string
  align?: HeroAlign
  theme?: HeroTheme
  spacing?: HeroSpacing
  buttons?: ButtonProps[]
  images?: HeroImage[]

  // Additional
  className?: string
  id?: string
}

// Theme classes mapping
const themeClasses: Record<HeroTheme, { bg: string; text: string; subtitle: string }> = {
  light: {
    bg: 'bg-white',
    text: 'text-gray-900',
    subtitle: 'text-gray-600',
  },
  dark: {
    bg: 'bg-gray-900',
    text: 'text-white',
    subtitle: 'text-gray-300',
  },
  primary: {
    bg: 'bg-blue-600',
    text: 'text-white',
    subtitle: 'text-blue-100',
  },
  secondary: {
    bg: 'bg-gray-600',
    text: 'text-white',
    subtitle: 'text-gray-200',
  },
}

// Spacing classes mapping
const spacingClasses: Record<HeroSpacing, string> = {
  none: 'py-0',
  sm: 'py-8',
  md: 'py-12',
  lg: 'py-16 lg:py-24',
  xl: 'py-20 lg:py-32',
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
  theme = 'light',
  spacing = 'lg',
  buttons,
  images,
  className = '',
  id,
}: HeroProps) {
  const themeStyle = themeClasses[theme]
  const alignStyle = alignClasses[align]

  return (
    <section
      id={id}
      className={`${spacingClasses[spacing]} ${themeStyle.bg} ${className}`}
    >
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col ${alignStyle.container}`}>
        {/* Title */}
        <h1 className={`text-4xl md:text-5xl lg:text-6xl font-bold ${themeStyle.text} ${alignStyle.text}`}>
          {title}
        </h1>

        {/* Subtitle */}
        {subtitle && (
          <p className={`mt-4 text-lg md:text-xl max-w-3xl ${themeStyle.subtitle} ${alignStyle.text}`}>
            {subtitle}
          </p>
        )}

        {/* Buttons */}
        {buttons && buttons.length > 0 && (
          <div className={`mt-8 flex flex-wrap gap-4 ${alignStyle.buttons}`}>
            {buttons.map((btn, index) => (
              <Button key={index} {...btn} />
            ))}
          </div>
        )}

        {/* Images */}
        {images && images.length > 0 && (
          <div className={`mt-12 w-full flex flex-wrap gap-6 ${alignStyle.images}`}>
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

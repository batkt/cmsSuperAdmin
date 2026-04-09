'use client'

import Button, { ButtonProps } from './Button'

// About Component - CMS Renderer Specification
// Based on ABOUT.md specification

export type AboutAlign = 'left' | 'center' | 'right'
export type AboutTheme = 'light' | 'dark' | 'primary' | 'secondary'

export interface AboutImage {
  url: string
  alt?: string
}

export interface AboutProps {
  // Required
  description: string

  // Optional
  title?: string
  align?: AboutAlign
  theme?: AboutTheme
  images?: AboutImage[]
  button?: ButtonProps

  // Additional
  className?: string
  id?: string
}

// Theme classes mapping
const themeClasses: Record<AboutTheme, { bg: string; text: string; subtitle: string }> = {
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

// Alignment classes
const alignClasses: Record<AboutAlign, { container: string; text: string; gallery: string }> = {
  left: {
    container: 'items-start',
    text: 'text-left',
    gallery: 'justify-start',
  },
  center: {
    container: 'items-center',
    text: 'text-center',
    gallery: 'justify-center',
  },
  right: {
    container: 'items-end',
    text: 'text-right',
    gallery: 'justify-end',
  },
}

export default function About({
  description,
  title,
  align = 'left',
  theme = 'light',
  images,
  button,
  className = '',
  id,
}: AboutProps) {
  const themeStyle = themeClasses[theme]
  const alignStyle = alignClasses[align]

  return (
    <section
      id={id}
      className={`py-16 lg:py-24 ${themeStyle.bg} ${className}`}
    >
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col ${alignStyle.container}`}>
        {/* Content */}
        <div className={`max-w-3xl ${alignStyle.text}`}>
          {title && (
            <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${themeStyle.text}`}>
              {title}
            </h2>
          )}
          <p className={`text-lg leading-relaxed ${themeStyle.subtitle}`}>
            {description}
          </p>
        </div>

        {/* Image Gallery */}
        {images && images.length > 0 && (
          <div className={`mt-12 w-full flex flex-wrap gap-4 ${alignStyle.gallery}`}>
            {images.map((image, index) => (
              <div
                key={index}
                className="relative w-full sm:w-64 aspect-square rounded-lg overflow-hidden group"
              >
                <img
                  src={image.url}
                  alt={image.alt || ''}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

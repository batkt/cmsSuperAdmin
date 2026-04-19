'use client'

import Button, { ButtonProps } from './Button'

import { bgMap, alignMap, spacingMap } from '../engine/Tokens'

// About Component - CMS Renderer Specification
// Based on ABOUT.md specification

export interface AboutImage {
  url: string
  alt?: string
}

export interface AboutProps {
  // Required
  description: string

  // Optional
  title?: string
  align?: string
  bg?: string
  padding?: string
  images?: AboutImage[]
  button?: ButtonProps

  // Additional
  className?: string
  id?: string
}

// Theme classes mapping for fallback and background
const themeToBgMap: Record<string, string> = {
  light: 'white',
  dark: 'slate900',
  primary: 'primary',
  secondary: 'slate100'
}

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

export default function About({
  description,
  title,
  align = 'left',
  bg = 'white',
  padding = 'lg',
  images,
  button,
  className = '',
  id,
}: AboutProps) {
  const resolvedBg = typeof bgMap[bg] !== 'undefined' ? bg : (themeToBgMap[bg] || 'white')
  const bgClass = bgMap[resolvedBg] || bgMap.white
  const textStyle = bgTextClasses[resolvedBg] || bgTextClasses.white
  
  const alignStyleMap: Record<string, { container: string; gallery: string }> = {
    left: {
      container: 'items-start',
      gallery: 'justify-start',
    },
    center: {
      container: 'items-center',
      gallery: 'justify-center',
    },
    right: {
      container: 'items-end',
      gallery: 'justify-end',
    },
  }
  
  const alignSpecificStyle = alignStyleMap[align] || alignStyleMap.left
  const textJustify = alignMap[align] || alignMap.left
  const spacingClass = padding && padding !== 'none' ? `py-[${spacingMap[padding] || '0'}]` : 'py-16 lg:py-24'

  return (
    <section
      id={id}
      className={`${spacingClass} ${bgClass} ${className}`}
    >
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col ${alignSpecificStyle.container}`}>
        {/* Content */}
        <div className={`max-w-3xl ${textJustify}`}>
          {title && (
            <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${textStyle.text}`}>
              {title}
            </h2>
          )}
          <p className={`text-lg leading-relaxed ${textStyle.subtitle}`}>
            {description}
          </p>
        </div>

        {/* Image Gallery */}
        {images && images.length > 0 && (
          <div className={`mt-12 w-full flex flex-wrap gap-4 ${alignSpecificStyle.gallery}`}>
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

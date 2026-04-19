import React from 'react'
import { bgMap, spacingMap, alignMap } from '../../engine/Tokens'

export interface CardProps {
  bg?: string
  padding?: string
  align?: string
  border?: boolean
  shadow?: boolean
  children?: React.ReactNode
  className?: string
  id?: string
}

export default function Card({
  bg = 'white',
  padding = 'md',
  align = 'left',
  border = true,
  shadow = true,
  children,
  className = '',
  id,
}: CardProps) {
  const bgClass = bgMap[bg] || bgMap.white
  const paddingClass = padding !== 'none' ? `p-[${spacingMap[padding] || '1rem'}]` : ''
  const alignClass = alignMap[align] || alignMap.left
  const borderClass = border ? 'border border-gray-200 rounded-xl' : 'rounded-xl'
  const shadowClass = shadow ? 'shadow-md' : ''

  return (
    <div
      id={id}
      className={`overflow-hidden ${bgClass} ${paddingClass} ${alignClass} ${borderClass} ${shadowClass} ${className}`}
    >
      {children}
    </div>
  )
}

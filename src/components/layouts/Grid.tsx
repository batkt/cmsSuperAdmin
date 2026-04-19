import React from 'react'
import { bgMap, spacingMap } from '../../engine/Tokens'

export interface GridProps {
  columns?: 1 | 2 | 3 | 4 | 5 | 6
  gap?: string // based on spacingMap keys
  bg?: string
  padding?: string
  children?: React.ReactNode
  className?: string
  id?: string
}

export default function Grid({
  columns = 3,
  gap = '4',
  bg = 'transparent',
  padding = 'none',
  children,
  className = '',
  id,
}: GridProps) {
  const bgClass = bgMap[bg] || bgMap.transparent
  const paddingClass = padding !== 'none' ? `p-[${spacingMap[padding] || '0'}]` : ''
  const gapClass = gap !== 'none' ? `gap-[${spacingMap[gap] || '1rem'}]` : 'gap-4'

  const gridColsClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5',
    6: 'grid-cols-2 md:grid-cols-4 lg:grid-cols-6',
  }[columns]

  return (
    <div
      id={id}
      className={`grid ${gridColsClass} ${gapClass} ${bgClass} ${paddingClass} ${className}`}
    >
      {children}
    </div>
  )
}

import React from 'react'
import { bgMap, spacingMap, alignMap } from '../../engine/Tokens'

export interface TwoColumnProps {
  ratio?: '1:1' | '1:2' | '2:1' | '1:3' | '3:1'
  bg?: string
  padding?: string
  align?: string
  gap?: string
  leftContent?: React.ReactNode
  rightContent?: React.ReactNode
  className?: string
  id?: string
}

export default function TwoColumn({
  ratio = '1:1',
  bg = 'white',
  padding = 'lg',
  align = 'center',
  gap = '8',
  leftContent,
  rightContent,
  className = '',
  id,
}: TwoColumnProps) {
  const bgClass = bgMap[bg] || bgMap.white
  const paddingClass = padding !== 'none' ? `py-[${spacingMap[padding] || '0'}]` : ''
  const gapClass = gap !== 'none' ? `gap-[${spacingMap[gap] || '2rem'}]` : 'gap-8'
  const alignClass = alignMap[align] || alignMap.center

  const ratioClasses = {
    '1:1': 'md:grid-cols-2',
    '1:2': 'md:grid-cols-[1fr_2fr]',
    '2:1': 'md:grid-cols-[2fr_1fr]',
    '1:3': 'md:grid-cols-[1fr_3fr]',
    '3:1': 'md:grid-cols-[3fr_1fr]',
  }[ratio]

  return (
    <section
      id={id}
      className={`${paddingClass} ${bgClass} ${className}`}
    >
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`}>
        <div className={`grid grid-cols-1 ${ratioClasses} ${gapClass} items-center`}>
          <div className={`${alignClass}`}>{leftContent}</div>
          <div className={`${alignClass}`}>{rightContent}</div>
        </div>
      </div>
    </section>
  )
}

'use client'

import { useState, useCallback, memo } from 'react'
import { GripVertical, Maximize2, X, Type, Image as ImageIcon, Square, Copy } from 'lucide-react'

export interface SectionType {
  id: string
  type: 'text' | 'image' | 'button' | 'container'
  position: { x: number; y: number }
  size: { width: number; height: number }
  content?: string
  style?: Record<string, any>
}

interface DraggableSectionProps {
  section: SectionType
  onUpdate: (id: string, updates: Partial<SectionType>) => void
  onDelete: (id: string) => void
  onDuplicate?: (section: SectionType) => void
  containerRef?: React.RefObject<HTMLDivElement>
  isPreview?: boolean
}

function DraggableSection({ 
  section, 
  onUpdate, 
  onDelete, 
  onDuplicate,
  containerRef,
  isPreview = false 
}: DraggableSectionProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [showControls, setShowControls] = useState(false)

  const handleDragStart = useCallback((e: React.MouseEvent) => {
    if (isPreview) return
    e.preventDefault()
    e.stopPropagation()
    
    setIsDragging(true)
    const startX = e.clientX
    const startY = e.clientY
    const startPosX = section.position.x
    const startPosY = section.position.y

    const handleMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX
      const deltaY = moveEvent.clientY - startY
      
      onUpdate(section.id, {
        position: {
          x: Math.max(0, startPosX + deltaX),
          y: Math.max(0, startPosY + deltaY)
        }
      })
    }

    const handleEnd = () => {
      setIsDragging(false)
      document.removeEventListener('mousemove', handleMove)
      document.removeEventListener('mouseup', handleEnd)
    }

    document.addEventListener('mousemove', handleMove)
    document.addEventListener('mouseup', handleEnd)
  }, [isPreview, section.id, section.position.x, section.position.y, onUpdate])

  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    if (isPreview) return
    e.preventDefault()
    e.stopPropagation()
    
    setIsResizing(true)
    const startX = e.clientX
    const startY = e.clientY
    const startWidth = section.size.width
    const startHeight = section.size.height

    const handleMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX
      const deltaY = moveEvent.clientY - startY
      
      onUpdate(section.id, {
        size: {
          width: Math.max(50, startWidth + deltaX),
          height: Math.max(30, startHeight + deltaY)
        }
      })
    }

    const handleEnd = () => {
      setIsResizing(false)
      document.removeEventListener('mousemove', handleMove)
      document.removeEventListener('mouseup', handleEnd)
    }

    document.addEventListener('mousemove', handleMove)
    document.addEventListener('mouseup', handleEnd)
  }, [isPreview, section.id, section.size.width, section.size.height, onUpdate])

  const getSectionIcon = () => {
    switch (section.type) {
      case 'text': return <Type className="w-4 h-4" />
      case 'image': return <ImageIcon className="w-4 h-4" />
      case 'button': return <Square className="w-4 h-4" />
      default: return <Square className="w-4 h-4" />
    }
  }

  const getSectionLabel = () => {
    switch (section.type) {
      case 'text': return 'Текст хэсэг'
      case 'image': return 'Зураг'
      case 'button': return 'Товч'
      default: return 'Хэсэг'
    }
  }

  const getSectionStyle = () => {
    const baseStyle: React.CSSProperties = {
      position: 'absolute',
      left: section.position.x,
      top: section.position.y,
      width: section.size.width,
      height: section.size.height,
      cursor: isDragging ? 'grabbing' : isPreview ? 'default' : 'grab',
    }

    switch (section.type) {
      case 'text':
        return {
          ...baseStyle,
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          border: '2px dashed #3b82f6',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '14px',
          color: '#3b82f6',
        }
      case 'image':
        return {
          ...baseStyle,
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          border: '2px dashed #10b981',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '14px',
          color: '#10b981',
        }
      case 'button':
        return {
          ...baseStyle,
          backgroundColor: 'rgba(139, 92, 246, 0.1)',
          border: '2px dashed #8b5cf6',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '14px',
          color: '#8b5cf6',
        }
      default:
        return {
          ...baseStyle,
          backgroundColor: 'rgba(156, 163, 175, 0.1)',
          border: '2px dashed #9ca3af',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '14px',
          color: '#6b7280',
        }
    }
  }

  return (
    <div
      style={getSectionStyle()}
      className={`group ${isDragging ? 'z-50' : 'z-10'} ${isResizing ? 'ring-2 ring-emerald-500' : ''}`}
      onMouseDown={handleDragStart}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Section Content */}
      <div className="flex flex-col items-center gap-1">
        {getSectionIcon()}
        <span className="text-xs font-medium">{getSectionLabel()}</span>
        <span className="text-[10px] opacity-60">
          {Math.round(section.size.width)}×{Math.round(section.size.height)}
        </span>
      </div>

      {/* Controls - Only show on hover and not in preview mode */}
      {!isPreview && showControls && (
        <>
          {/* Drag Handle */}
          <div 
            className="absolute -top-3 -left-3 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center cursor-move shadow-md"
            onMouseDown={handleDragStart}
          >
            <GripVertical className="w-3 h-3" />
          </div>

          {/* Resize Handle */}
          <div
            className="absolute -bottom-3 -right-3 w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center cursor-se-resize shadow-md"
            onMouseDown={handleResizeStart}
          >
            <Maximize2 className="w-3 h-3" />
          </div>

          {/* Duplicate Button */}
          {onDuplicate && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDuplicate(section)
              }}
              className="absolute -bottom-3 -left-3 w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center shadow-md hover:bg-purple-600"
              title="Хуулбарлах"
            >
              <Copy className="w-3 h-3" />
            </button>
          )}

          {/* Delete Button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete(section.id)
            }}
            className="absolute -top-3 -right-3 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-md hover:bg-red-600"
            title="Устгах"
          >
            <X className="w-3 h-3" />
          </button>

          {/* Position/Size Info */}
          {(isDragging || isResizing) && (
            <div className="absolute -top-8 left-0 bg-black/70 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap">
              X:{Math.round(section.position.x)} Y:{Math.round(section.position.y)} | 
              W:{Math.round(section.size.width)} H:{Math.round(section.size.height)}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default memo(DraggableSection, (prev, next) => {
  // Only re-render if section data actually changed
  return prev.section.id === next.section.id &&
    prev.section.position.x === next.section.position.x &&
    prev.section.position.y === next.section.position.y &&
    prev.section.size.width === next.section.size.width &&
    prev.section.size.height === next.section.size.height &&
    prev.section.type === next.section.type
})

// Component Section Container
interface SectionContainerProps {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}

export function SectionContainer({ children, className = '', style }: SectionContainerProps) {
  return (
    <div 
      className={`relative min-h-[300px] w-full bg-white rounded-xl border-2 border-dashed border-gray-300 p-4 ${className}`}
      style={style}
    >
      {children}
    </div>
  )
}

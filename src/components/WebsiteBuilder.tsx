'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Plus, X, Edit3, Check, FileText, Trash2, GripVertical, Palette, Image, Type, LayoutGrid, CreditCard, Monitor, Square, Columns, Grid3X3, Video, GripHorizontal, Maximize2 } from 'lucide-react'

// Color Palette - Tailwind CSS inspired
const colorPalette = {
  // Slate (Grays)
  slate: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },
  // Blue
  blue: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
  // Red
  red: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },
  // Green
  green: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },
  // Purple
  purple: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#a855f7',
    600: '#9333ea',
    700: '#7c3aed',
    800: '#6b21a8',
    900: '#581c87',
  },
  // Orange
  orange: {
    50: '#fff7ed',
    100: '#ffedd5',
    200: '#fed7aa',
    300: '#fdba74',
    400: '#fb923c',
    500: '#f97316',
    600: '#ea580c',
    700: '#c2410c',
    800: '#9a3412',
    900: '#7c2d12',
  },
  // Yellow
  yellow: {
    50: '#fefce8',
    100: '#fef9c3',
    200: '#fef08a',
    300: '#fde047',
    400: '#facc15',
    500: '#eab308',
    600: '#ca8a04',
    700: '#a16207',
    800: '#854d0e',
    900: '#713f12',
  },
  // Pink
  pink: {
    50: '#fdf2f8',
    100: '#fce7f3',
    200: '#fbcfe8',
    300: '#f9a8d4',
    400: '#f472b6',
    500: '#ec4899',
    600: '#db2777',
    700: '#be185d',
    800: '#9d174d',
    900: '#831843',
  },
  // Indigo
  indigo: {
    50: '#eef2ff',
    100: '#e0e7ff',
    200: '#c7d2fe',
    300: '#a5b4fc',
    400: '#818cf8',
    500: '#6366f1',
    600: '#4f46e5',
    700: '#4338ca',
    800: '#3730a3',
    900: '#312e81',
  },
  // Teal
  teal: {
    50: '#f0fdfa',
    100: '#ccfbf1',
    200: '#99f6e4',
    300: '#5eead4',
    400: '#2dd4bf',
    500: '#14b8a6',
    600: '#0d9488',
    700: '#0f766e',
    800: '#115e59',
    900: '#134e4a',
  },
  // Cyan
  cyan: {
    50: '#ecfeff',
    100: '#cffafe',
    200: '#a5f3fc',
    300: '#67e8f9',
    400: '#22d3ee',
    500: '#06b6d4',
    600: '#0891b2',
    700: '#0e7490',
    800: '#155e75',
    900: '#164e63',
  },
  // Emerald
  emerald: {
    50: '#ecfdf5',
    100: '#d1fae5',
    200: '#a7f3d0',
    300: '#6ee7b7',
    400: '#34d399',
    500: '#10b981',
    600: '#059669',
    700: '#047857',
    800: '#065f46',
    900: '#064e3b',
  },
  // Black & White
  white: '#ffffff',
  black: '#000000',
}

// Helper to flatten palette for color picker
const flatPalette: Record<string, string> = {}
Object.entries(colorPalette).forEach(([colorName, shades]) => {
  if (typeof shades === 'object') {
    Object.entries(shades).forEach(([shade, hex]) => {
      flatPalette[`${colorName}-${shade}`] = hex as string
    })
  } else {
    flatPalette[colorName] = shades
  }
})

// Common color presets for quick selection
const quickColors = [
  'white', 'black',
  'slate-50', 'slate-100', 'slate-200', 'slate-300', 'slate-400', 'slate-500', 'slate-600', 'slate-700', 'slate-800', 'slate-900',
  'blue-50', 'blue-100', 'blue-200', 'blue-300', 'blue-400', 'blue-500', 'blue-600', 'blue-700', 'blue-800', 'blue-900',
  'red-50', 'red-100', 'red-200', 'red-300', 'red-400', 'red-500', 'red-600', 'red-700', 'red-800', 'red-900',
  'green-50', 'green-100', 'green-200', 'green-300', 'green-400', 'green-500', 'green-600', 'green-700', 'green-800', 'green-900',
  'purple-50', 'purple-100', 'purple-200', 'purple-300', 'purple-400', 'purple-500', 'purple-600', 'purple-700', 'purple-800', 'purple-900',
  'orange-50', 'orange-100', 'orange-200', 'orange-300', 'orange-400', 'orange-500', 'orange-600', 'orange-700', 'orange-800', 'orange-900',
  'yellow-50', 'yellow-100', 'yellow-200', 'yellow-300', 'yellow-400', 'yellow-500', 'yellow-600', 'yellow-700', 'yellow-800', 'yellow-900',
  'pink-50', 'pink-100', 'pink-200', 'pink-300', 'pink-400', 'pink-500', 'pink-600', 'pink-700', 'pink-800', 'pink-900',
  'indigo-50', 'indigo-100', 'indigo-200', 'indigo-300', 'indigo-400', 'indigo-500', 'indigo-600', 'indigo-700', 'indigo-800', 'indigo-900',
  'teal-50', 'teal-100', 'teal-200', 'teal-300', 'teal-400', 'teal-500', 'teal-600', 'teal-700', 'teal-800', 'teal-900',
]

const getColorValue = (colorName: string): string => {
  if (colorName.startsWith('#')) return colorName
  return flatPalette[colorName] || colorName
}

interface ComponentStyles {
  backgroundColor: string
  textColor: string
  padding: number
  margin: number
  borderRadius: number
  buttonBackgroundColor: string
  buttonTextColor: string
  linkColor: string
  borderColor: string
  headingColor: string
  // Grid layout options
  gridColumns?: number
  gridGap?: number
  // Card styles
  cardBackgroundColor?: string
  cardBorderColor?: string
  cardBorderRadius?: number
  // Animation
  animation?: string
  // Resizable
  width?: string
  height?: string
  minHeight?: string
  maxWidth?: string
}

interface ComponentImage {
  id: string
  url: string
  alt: string
  isGif?: boolean
  position?: { x: number; y: number }
  size?: { width: number; height: number }
}

interface ComponentContent {
  title?: string
  subtitle?: string
  description?: string
  buttonText?: string
  services?: string[]
  contactInfo?: {
    email?: string
    phone?: string
    address?: string
  }
  navLinks?: {
    home?: string
    about?: string
    services?: string
    contact?: string
  }
  footerLinks?: {
    privacy?: string
    terms?: string
    contact?: string
  }
  copyright?: string
  images?: ComponentImage[]
  // Card content
  cards?: Array<{
    id: string
    title: string
    description: string
    imageUrl?: string
    buttonText?: string
  }>
  // Text block
  text?: string
  // Video/GIF
  videoUrl?: string
  // Grid items
  gridItems?: Array<{
    id: string
    content: string
    span?: number
    imageUrl?: string
    videoUrl?: string
  }>
  // Logo
  logoUrl?: string
  logoPosition?: { x: number; y: number }
  // Background image for component
  backgroundImage?: string
}

interface Component {
  id: string
  type: 'home' | 'about' | 'service' | 'contact' | 'header' | 'footer' | 'card' | 'text' | 'gif' | 'grid' | 'image'
  content: ComponentContent
  styles: ComponentStyles
}

interface Page {
  id: string
  name: string
  path: string
  components: Component[]
  // Page background options
  backgroundImage?: string
  backgroundVideo?: string
  backgroundSize?: 'cover' | 'contain' | 'half'
  backgroundPosition?: string
  backgroundRepeat?: string
  backgroundAttachment?: 'scroll' | 'fixed'
}

interface DraggableComponentProps {
  component: Component
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  isSelected: boolean
  onSelect: (id: string) => void
  isDarkMode: boolean
}

const defaultStyles: ComponentStyles = {
  backgroundColor: 'white',
  textColor: 'slate-700',
  padding: 32,
  margin: 0,
  borderRadius: 8,
  buttonBackgroundColor: 'blue-500',
  buttonTextColor: 'white',
  linkColor: 'blue-500',
  borderColor: 'slate-200',
  headingColor: 'slate-800',
}

const defaultNavLinks = {
  home: 'Нүүр',
  about: 'Бидний тухай',
  services: 'Үйлчилгээ',
  contact: 'Холбогдох',
}

const defaultFooterLinks = {
  privacy: 'Нууцлалын бодлого',
  terms: 'Үйлчилгээний нөхцөл',
  contact: 'Холбогдох',
}

const availableComponents = [
  { type: 'header', label: 'Толгой хэсэг', icon: Monitor },
  { type: 'home', label: 'Нүүр хэсэг', icon: Square },
  { type: 'about', label: 'Бидний тухай', icon: Type },
  { type: 'service', label: 'Үйлчилгээ', icon: LayoutGrid },
  { type: 'contact', label: 'Холбогдох', icon: CreditCard },
  { type: 'footer', label: 'Хөл хэсэг', icon: Monitor },
  { type: 'card', label: 'Карт', icon: CreditCard },
  { type: 'text', label: 'Текст', icon: Type },
  { type: 'grid', label: 'Grid', icon: Grid3X3 },
]

function DraggableComponent({ 
  component, 
  onEdit, 
  onDelete, 
  isSelected, 
  onSelect,
  isDarkMode
}: DraggableComponentProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: component.id })

  // Debug: Log when component changes
  useEffect(() => {
    console.log('DraggableComponent received new component:', component.id, component.type, 'images:', component.content.images)
  }, [component])

  // Resize state
  const [isResizing, setIsResizing] = useState(false)
  const [currentHeight, setCurrentHeight] = useState(component.styles.height || 'auto')

  // Update currentHeight when component.styles.height changes
  useEffect(() => {
    setCurrentHeight(component.styles.height || 'auto')
  }, [component.styles.height])

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsResizing(true)
    
    const startY = e.clientY
    const startHeight = parseInt(currentHeight as string) || 200
    
    const handleResizeMove = (moveEvent: MouseEvent) => {
      const deltaY = moveEvent.clientY - startY
      const newHeight = Math.max(100, startHeight + deltaY)
      setCurrentHeight(`${newHeight}px`)
    }
    
    const handleResizeEnd = () => {
      setIsResizing(false)
      // Update the component height
      const finalHeight = currentHeight
      // This will be handled by the parent component
      document.removeEventListener('mousemove', handleResizeMove)
      document.removeEventListener('mouseup', handleResizeEnd)
    }
    
    document.addEventListener('mousemove', handleResizeMove)
    document.addEventListener('mouseup', handleResizeEnd)
  }

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    marginBottom: `${component.styles.margin}px`,
  }

  const componentStyle = {
    backgroundColor: component.content.backgroundImage ? 'transparent' : getColorValue(component.styles.backgroundColor),
    backgroundImage: component.content.backgroundImage ? `url(${component.content.backgroundImage})` : undefined,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    color: getColorValue(component.styles.textColor),
    padding: `${component.styles.padding}px`,
    borderRadius: `${component.styles.borderRadius}px`,
    width: component.styles.width || '100%',
    height: isResizing ? currentHeight : (component.styles.height || 'auto'),
    minHeight: component.styles.minHeight || 'auto',
    maxWidth: component.styles.maxWidth || 'none',
  }

  const buttonStyle = {
    backgroundColor: getColorValue(component.styles.buttonBackgroundColor),
    color: getColorValue(component.styles.buttonTextColor),
  }

  const linkStyle = {
    color: getColorValue(component.styles.linkColor),
  }

  const headingStyle = {
    color: getColorValue(component.styles.headingColor),
  }

  const renderComponent = () => {
    console.log('renderComponent called for type:', component.type, 'with images:', component.content.images)
    switch (component.type) {
      case 'home':
        const [homeImageStates, setHomeImageStates] = useState<Record<string, {
          position: { x: number; y: number }
          size: { width: number; height: number }
          isDragging: boolean
          isResizing: boolean
        }>>(() => {
          const initial: Record<string, any> = {}
          component.content.images?.forEach(img => {
            initial[img.id] = {
              position: img.position || { x: 20 + (component.content.images?.indexOf(img) || 0) * 220, y: 20 },
              size: img.size || { width: 200, height: 150 },
              isDragging: false,
              isResizing: false
            }
          })
          return initial
        })

        const handleHomeImageDelete = (imageId: string) => {
          const updatedImages = component.content.images?.filter(img => img.id !== imageId) || []
          setHomeImageStates(prev => {
            const newState = { ...prev }
            delete newState[imageId]
            return newState
          })
        }

        const handleHomeImageDragStart = (e: React.MouseEvent, imageId: string) => {
          e.preventDefault()
          e.stopPropagation()
          
          setHomeImageStates(prev => ({
            ...prev,
            [imageId]: { ...prev[imageId], isDragging: true }
          }))
          
          const startX = e.clientX
          const startY = e.clientY
          const startImgX = homeImageStates[imageId]?.position.x || 20
          const startImgY = homeImageStates[imageId]?.position.y || 20
          
          const handleDragMove = (moveEvent: MouseEvent) => {
            const deltaX = moveEvent.clientX - startX
            const deltaY = moveEvent.clientY - startY
            
            setHomeImageStates(prev => ({
              ...prev,
              [imageId]: {
                ...prev[imageId],
                position: {
                  x: Math.max(0, Math.min(startImgX + deltaX, 800)),
                  y: Math.max(0, Math.min(startImgY + deltaY, 500))
                }
              }
            }))
          }
          
          const handleDragEnd = () => {
            setHomeImageStates(prev => ({
              ...prev,
              [imageId]: { ...prev[imageId], isDragging: false }
            }))
            document.removeEventListener('mousemove', handleDragMove)
            document.removeEventListener('mouseup', handleDragEnd)
          }
          
          document.addEventListener('mousemove', handleDragMove)
          document.addEventListener('mouseup', handleDragEnd)
        }

        const handleHomeImageResizeStart = (e: React.MouseEvent, imageId: string) => {
          e.preventDefault()
          e.stopPropagation()
          
          setHomeImageStates(prev => ({
            ...prev,
            [imageId]: { ...prev[imageId], isResizing: true }
          }))
          
          const startX = e.clientX
          const startY = e.clientY
          const startWidth = homeImageStates[imageId]?.size.width || 200
          const startHeight = homeImageStates[imageId]?.size.height || 150
          
          const handleResizeMove = (moveEvent: MouseEvent) => {
            const deltaX = moveEvent.clientX - startX
            const deltaY = moveEvent.clientY - startY
            
            setHomeImageStates(prev => ({
              ...prev,
              [imageId]: {
                ...prev[imageId],
                size: {
                  width: Math.max(50, startWidth + deltaX),
                  height: Math.max(50, startHeight + deltaY)
                }
              }
            }))
          }
          
          const handleResizeEnd = () => {
            setHomeImageStates(prev => ({
              ...prev,
              [imageId]: { ...prev[imageId], isResizing: false }
            }))
            document.removeEventListener('mousemove', handleResizeMove)
            document.removeEventListener('mouseup', handleResizeEnd)
          }
          
          document.addEventListener('mousemove', handleResizeMove)
          document.addEventListener('mouseup', handleResizeEnd)
        }
        
        return (
          <div style={componentStyle} className="relative min-h-[300px]">
            <h1 className="text-4xl font-bold mb-4" style={headingStyle}>
              {component.content.title || 'Тавтай морил'}</h1>
            <p className="text-xl mb-6">{component.content.subtitle || 'Таны аялал эндээс эхэлнэ'}</p>
            
            {/* Draggable and Resizable Images */}
            {component.content.images?.map((img: ComponentImage) => {
              const state = homeImageStates[img.id] || {}
              const position = state.position || { x: 20, y: 20 }
              const size = state.size || { width: 200, height: 150 }
              const isDragging = state.isDragging || false
              const isResizing = state.isResizing || false
              
              return (
                <div
                  key={img.id}
                  className={`absolute group ${isDragging ? 'z-50' : 'z-10'}`}
                  style={{
                    left: position.x,
                    top: position.y,
                    width: size.width,
                    height: size.height,
                  }}
                >
                  {/* Image */}
                  <img
                    src={img.url}
                    alt={img.alt}
                    className={`w-full h-full object-cover rounded-lg shadow-lg ${
                      isDragging ? 'ring-2 ring-blue-500' : ''
                    } ${isResizing ? 'ring-2 ring-green-500' : ''}`}
                    onMouseDown={(e) => handleHomeImageDragStart(e, img.id)}
                  />
                  
                  {/* Drag Handle Indicator */}
                  <div 
                    className="absolute top-2 left-2 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center cursor-move opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                    onMouseDown={(e) => handleHomeImageDragStart(e, img.id)}
                  >
                    <GripVertical className="w-4 h-4" />
                  </div>
                  
                  {/* Resize Handle */}
                  <div
                    className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center cursor-se-resize opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                    onMouseDown={(e) => handleHomeImageResizeStart(e, img.id)}
                  >
                    <Maximize2 className="w-4 h-4" />
                  </div>
                  
                  {/* Delete Button */}
                  <button
                    onClick={() => handleHomeImageDelete(img.id)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-red-600 z-50"
                    title="Устгах"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  
                  {/* Position/Size Info */}
                  {(isDragging || isResizing) && (
                    <div className="absolute -top-8 left-0 bg-black/70 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                      X: {Math.round(position.x)}, Y: {Math.round(position.y)} | 
                      W: {Math.round(size.width)}, H: {Math.round(size.height)}
                    </div>
                  )}
                </div>
              )
            })}
            
            <button className="px-6 py-3 rounded-lg font-semibold transition-colors" style={buttonStyle}>
              {component.content.buttonText || 'Эхлэх'}
            </button>
          </div>
        )
      case 'about':
        return (
          <div style={componentStyle}>
            <h2 className="text-3xl font-bold mb-4" style={headingStyle}>
              {component.content.title || 'Бидний тухай'}</h2>
            {component.content.images && component.content.images.length > 0 && (
              <div className="flex flex-wrap gap-4 mb-6">
                {component.content.images.map((img: ComponentImage) => (
                  <img key={img.id} src={img.url} alt={img.alt} className="w-32 h-32 object-cover rounded-lg" />
                ))}
              </div>
            )}
            <p className="text-lg leading-relaxed">{component.content.description || 'Бид өндөр чанартай үйлчилгээ үзүүлэхээр зорьж ажилладаг.'}</p>
          </div>
        )
      case 'service':
        return (
          <div style={componentStyle}>
            <h2 className="text-3xl font-bold mb-6 text-center" style={headingStyle}>
              {component.content.title || 'Манай үйлчилгээ'}</h2>
            {component.content.images && component.content.images.length > 0 && (
              <div className="mb-6">
                <img src={component.content.images[0].url} alt={component.content.images[0].alt} className="w-full h-64 object-cover rounded-lg" />
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {(component.content.services || ['Вэб хөгжүүлэлт', 'Дизайн', 'Зөвлөгөө']).map((service: string, index: number) => (
                <div key={index} className="p-6 rounded-lg border-2" style={{ borderColor: getColorValue(component.styles.borderColor) }}>
                  <h3 className="text-xl font-semibold mb-2" style={headingStyle}>{service}</h3>
                  <p>Мэргэжлийн {service.toLowerCase()} үйлчилгээ.</p>
                  <button className="mt-4 px-4 py-2 rounded text-sm font-medium" style={buttonStyle}>
                    Дэлгэрэнгүй
                  </button>
                </div>
              ))}
            </div>
          </div>
        )
      case 'contact':
        return (
          <div style={componentStyle}>
            <h2 className="text-3xl font-bold mb-6" style={headingStyle}>
              {component.content.title || 'Холбогдох'}</h2>
            {component.content.images && component.content.images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {component.content.images.map((img: ComponentImage) => (
                  <img key={img.id} src={img.url} alt={img.alt} className="w-full h-32 object-cover rounded-lg" />
                ))}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-4" style={headingStyle}>Холбоо барих</h3>
                <div className="space-y-3">
                  <p>Имэйл: {component.content.contactInfo?.email || 'contact@example.com'}</p>
                  <p>Утас: {component.content.contactInfo?.phone || '+1 (555) 123-4567'}</p>
                  <p>Хаяг: {component.content.contactInfo?.address || '123 Бизнес гудамж'}</p>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-4" style={headingStyle}>Мессеж илгээх</h3>
                <div className="space-y-4">
                  <input type="text" placeholder="Таны нэр" className="w-full p-3 rounded border" style={{ borderColor: getColorValue(component.styles.borderColor) }} />
                  <input type="email" placeholder="Имэйл хаяг" className="w-full p-3 rounded border" style={{ borderColor: getColorValue(component.styles.borderColor) }} />
                  <textarea placeholder="Таны мессеж" rows={4} className="w-full p-3 rounded border" style={{ borderColor: getColorValue(component.styles.borderColor) }} />
                  <button className="w-full py-3 rounded-lg font-semibold" style={buttonStyle}>
                    {component.content.buttonText || 'Илгээх'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      case 'header':
        const [logoPosition, setLogoPosition] = useState(component.content.logoPosition || { x: 20, y: 20 })
        const [isDraggingLogo, setIsDraggingLogo] = useState(false)
        
        const handleLogoDragStart = (e: React.MouseEvent) => {
          e.preventDefault()
          e.stopPropagation()
          setIsDraggingLogo(true)
          
          const startX = e.clientX
          const startY = e.clientY
          const startLogoX = logoPosition.x
          const startLogoY = logoPosition.y
          
          const handleDragMove = (moveEvent: MouseEvent) => {
            const deltaX = moveEvent.clientX - startX
            const deltaY = moveEvent.clientY - startY
            
            setLogoPosition({
              x: Math.max(0, Math.min(startLogoX + deltaX, 300)),
              y: Math.max(0, Math.min(startLogoY + deltaY, 100))
            })
          }
          
          const handleDragEnd = () => {
            setIsDraggingLogo(false)
            document.removeEventListener('mousemove', handleDragMove)
            document.removeEventListener('mouseup', handleDragEnd)
          }
          
          document.addEventListener('mousemove', handleDragMove)
          document.addEventListener('mouseup', handleDragEnd)
        }
        
        return (
          <div style={componentStyle} className="relative">
            {/* Draggable Logo */}
            {component.content.logoUrl && (
              <div
                className="absolute cursor-move z-10"
                style={{
                  left: logoPosition.x,
                  top: logoPosition.y,
                }}
                onMouseDown={handleLogoDragStart}
              >
                <img 
                  src={component.content.logoUrl} 
                  alt="Logo" 
                  className={`w-12 h-12 object-contain rounded ${isDraggingLogo ? 'ring-2 ring-blue-500' : ''}`}
                />
                {isDraggingLogo && (
                  <span className="absolute -bottom-5 left-0 text-xs text-blue-500 whitespace-nowrap">
                    X: {Math.round(logoPosition.x)}, Y: {Math.round(logoPosition.y)}
                  </span>
                )}
              </div>
            )}
            
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold" style={headingStyle}>{component.content.title || 'Таны брэнд'}</h1>
              <nav className="space-x-6">
                <a href="#home" className="hover:opacity-80" style={linkStyle}>{component.content.navLinks?.home || 'Нүүр'}</a>
                <a href="#about" className="hover:opacity-80" style={linkStyle}>{component.content.navLinks?.about || 'Бидний тухай'}</a>
                <a href="#services" className="hover:opacity-80" style={linkStyle}>{component.content.navLinks?.services || 'Үйлчилгээ'}</a>
                <a href="#contact" className="hover:opacity-80" style={linkStyle}>{component.content.navLinks?.contact || 'Холбогдох'}</a>
              </nav>
            </div>
          </div>
        )
      case 'footer':
        return (
          <div style={componentStyle}>
            <div className="text-center">
              <p className="mb-2">{component.content.copyright || `© 2026${component.content.title || 'Таны компани'}. Бүх эрх хуулиар хамгаалагдсан.`}</p>
              <div className="space-x-4">
                <a href="#" className="hover:opacity-80" style={linkStyle}>{component.content.footerLinks?.privacy || 'Нууцлалын бодлого'}</a>
                <a href="#" className="hover:opacity-80" style={linkStyle}>{component.content.footerLinks?.terms || 'Үйлчилгээний нөхцөл'}</a>
                <a href="#" className="hover:opacity-80" style={linkStyle}>{component.content.footerLinks?.contact || 'Холбогдох'}</a>
              </div>
            </div>
          </div>
        )
      case 'card':
        const cardBg = getColorValue(component.styles.cardBackgroundColor || 'white')
        const cardBorder = getColorValue(component.styles.cardBorderColor || 'slate-200')
        return (
          <div style={componentStyle}>
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${component.styles.gridColumns || 3}, 1fr)`, gap: `${component.styles.gridGap || 16}px` }}>
              {(component.content.cards || [
                { id: '1', title: 'Карт 1', description: 'Энэ бол жишээ карт' },
                { id: '2', title: 'Карт 2', description: 'Тайлбар энд байна' },
                { id: '3', title: 'Карт 3', description: 'Нэмэлт мэдээлэл' },
              ]).map((card) => (
                <div key={card.id} className="p-4 rounded-lg border-2" style={{ backgroundColor: cardBg, borderColor: cardBorder, borderRadius: `${component.styles.cardBorderRadius || 8}px` }}>
                  {card.imageUrl && <img src={card.imageUrl} alt={card.title} className="w-full h-32 object-cover rounded mb-3" />}
                  <h3 className="font-bold mb-2" style={headingStyle}>{card.title}</h3>
                  <p className="text-sm">{card.description}</p>
                  {card.buttonText && <button className="mt-3 px-3 py-1 text-sm rounded" style={buttonStyle}>{card.buttonText}</button>}
                </div>
              ))}
            </div>
          </div>
        )
      case 'text':
        const [imageStates, setImageStates] = useState<Record<string, {
          position: { x: number; y: number }
          size: { width: number; height: number }
          isDragging: boolean
          isResizing: boolean
        }>>(() => {
          const initial: Record<string, any> = {}
          component.content.images?.forEach(img => {
            initial[img.id] = {
              position: img.position || { x: 20, y: 20 },
              size: img.size || { width: 200, height: 150 },
              isDragging: false,
              isResizing: false
            }
          })
          return initial
        })

        const handleImageDelete = (imageId: string) => {
          // Update component content to remove the image
          const updatedImages = component.content.images?.filter(img => img.id !== imageId) || []
          // This would need to be passed to parent - for now we update local state
          setImageStates(prev => {
            const newState = { ...prev }
            delete newState[imageId]
            return newState
          })
        }

        const handleImageDragStart = (e: React.MouseEvent, imageId: string) => {
          e.preventDefault()
          e.stopPropagation()
          
          setImageStates(prev => ({
            ...prev,
            [imageId]: { ...prev[imageId], isDragging: true }
          }))
          
          const startX = e.clientX
          const startY = e.clientY
          const startImgX = imageStates[imageId]?.position.x || 20
          const startImgY = imageStates[imageId]?.position.y || 20
          
          const handleDragMove = (moveEvent: MouseEvent) => {
            const deltaX = moveEvent.clientX - startX
            const deltaY = moveEvent.clientY - startY
            
            setImageStates(prev => ({
              ...prev,
              [imageId]: {
                ...prev[imageId],
                position: {
                  x: Math.max(0, Math.min(startImgX + deltaX, 600)),
                  y: Math.max(0, Math.min(startImgY + deltaY, 400))
                }
              }
            }))
          }
          
          const handleDragEnd = () => {
            setImageStates(prev => ({
              ...prev,
              [imageId]: { ...prev[imageId], isDragging: false }
            }))
            document.removeEventListener('mousemove', handleDragMove)
            document.removeEventListener('mouseup', handleDragEnd)
          }
          
          document.addEventListener('mousemove', handleDragMove)
          document.addEventListener('mouseup', handleDragEnd)
        }

        const handleImageResizeStart = (e: React.MouseEvent, imageId: string) => {
          e.preventDefault()
          e.stopPropagation()
          
          setImageStates(prev => ({
            ...prev,
            [imageId]: { ...prev[imageId], isResizing: true }
          }))
          
          const startX = e.clientX
          const startY = e.clientY
          const startWidth = imageStates[imageId]?.size.width || 200
          const startHeight = imageStates[imageId]?.size.height || 150
          
          const handleResizeMove = (moveEvent: MouseEvent) => {
            const deltaX = moveEvent.clientX - startX
            const deltaY = moveEvent.clientY - startY
            
            setImageStates(prev => ({
              ...prev,
              [imageId]: {
                ...prev[imageId],
                size: {
                  width: Math.max(50, startWidth + deltaX),
                  height: Math.max(50, startHeight + deltaY)
                }
              }
            }))
          }
          
          const handleResizeEnd = () => {
            setImageStates(prev => ({
              ...prev,
              [imageId]: { ...prev[imageId], isResizing: false }
            }))
            document.removeEventListener('mousemove', handleResizeMove)
            document.removeEventListener('mouseup', handleResizeEnd)
          }
          
          document.addEventListener('mousemove', handleResizeMove)
          document.addEventListener('mouseup', handleResizeEnd)
        }
        
        return (
          <div style={componentStyle} className="relative min-h-[300px]">
            <div 
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: component.content.text || '<p>Энд текст оруулна уу...</p>' }}
            />
            
            {/* Draggable and Resizable Images */}
            {component.content.images?.map((img: ComponentImage) => {
              const state = imageStates[img.id] || {
                position: { x: 20, y: 20 },
                size: { width: 200, height: 150 },
                isDragging: false,
                isResizing: false
              }
              
              return (
                <div
                  key={img.id}
                  className={`absolute group ${state.isDragging ? 'z-50' : 'z-10'}`}
                  style={{
                    left: state.position.x,
                    top: state.position.y,
                    width: state.size.width,
                    height: state.size.height,
                  }}
                >
                  {/* Image */}
                  <img
                    src={img.url}
                    alt={img.alt}
                    className={`w-full h-full object-cover rounded-lg shadow-lg ${
                      state.isDragging ? 'ring-2 ring-blue-500' : ''
                    } ${state.isResizing ? 'ring-2 ring-green-500' : ''}`}
                    onMouseDown={(e) => handleImageDragStart(e, img.id)}
                  />
                  
                  {/* Drag Handle Indicator */}
                  <div 
                    className="absolute top-2 left-2 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center cursor-move opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                    onMouseDown={(e) => handleImageDragStart(e, img.id)}
                  >
                    <GripVertical className="w-4 h-4" />
                  </div>
                  
                  {/* Resize Handle */}
                  <div
                    className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center cursor-se-resize opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                    onMouseDown={(e) => handleImageResizeStart(e, img.id)}
                  >
                    <Maximize2 className="w-4 h-4" />
                  </div>
                  
                  {/* Delete Button */}
                  <button
                    onClick={() => handleImageDelete(img.id)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-red-600 z-50"
                    title="Устгах"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  
                  {/* Position/Size Info */}
                  {(state.isDragging || state.isResizing) && (
                    <div className="absolute -top-8 left-0 bg-black/70 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                      X: {Math.round(state.position.x)}, Y: {Math.round(state.position.y)} | 
                      W: {Math.round(state.size.width)}, H: {Math.round(state.size.height)}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )
      case 'gif':
        const [isMuted, setIsMuted] = useState(true)
        
        // Helper to extract YouTube video ID
        const getYouTubeId = (url: string) => {
          const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
          const match = url.match(regExp)
          return (match && match[2].length === 11) ? match[2] : null
        }

        const videoId = component.content.videoUrl ? getYouTubeId(component.content.videoUrl) : null
        
        return (
          <div style={componentStyle}>
            {videoId ? (
              <div className="w-full relative" style={{ paddingBottom: '56.25%', height: 0 }}>
                <iframe
                  src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=${isMuted ? 1 : 0}&loop=1&playlist=${videoId}&controls=0`}
                  className="absolute top-0 left-0 w-full h-full rounded-lg"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="absolute bottom-4 right-4 px-3 py-1 bg-black/70 text-white rounded text-xs z-10 hover:bg-black/90"
                >
                  {isMuted ? '🔇 Дуугүй' : '🔊 Дуутай'}
                </button>
              </div>
            ) : component.content.videoUrl?.match(/\.(gif|mp4|webm|mov)$/i) ? (
              <div className="w-full flex justify-center">
                {component.content.videoUrl.match(/\.gif$/i) ? (
                  <img 
                    src={component.content.videoUrl} 
                    alt="GIF" 
                    className="max-w-full h-auto rounded-lg"
                    style={{ maxHeight: '400px' }}
                  />
                ) : (
                  <video
                    src={component.content.videoUrl}
                    autoPlay
                    muted={isMuted}
                    loop
                    playsInline
                    className="max-w-full h-auto rounded-lg"
                    style={{ maxHeight: '400px' }}
                    controls={false}
                  />
                )}
              </div>
            ) : component.content.images && component.content.images.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {component.content.images.map((img: ComponentImage) => (
                  <div key={img.id} className="relative">
                    <img 
                      src={img.url} 
                      alt={img.alt} 
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    {img.isGif && <span className="absolute top-2 right-2 px-2 py-1 bg-black text-white text-xs rounded">GIF</span>}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-8 border-2 border-dashed rounded-lg">
                <Video className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="mb-2">GIF, видео эсвэл YouTube URL нэмнэ үү</p>
                <p className="text-xs opacity-60">Жишээ: https://youtube.com/watch?v=...</p>
              </div>
            )}
          </div>
        )
      case 'grid':
        const [gridItems, setGridItems] = useState(component.content.gridItems || Array.from({ length: 4 }, (_, i) => ({ id: String(i), content: `Нүд ${i + 1}`, span: 1, imageUrl: '', videoUrl: '' })))
        const [editingGridItemId, setEditingGridItemId] = useState<string | null>(null)
        const [activeGridItemId, setActiveGridItemId] = useState<string | null>(null)
        const [isGridItemImageModalOpen, setIsGridItemImageModalOpen] = useState(false)
        const [gridItemImagePreview, setGridItemImagePreview] = useState<string | null>(null)
        const [gridItemImageUrl, setGridItemImageUrl] = useState('')
        const [draggingItem, setDraggingItem] = useState<string | null>(null)
        const [resizingItem, setResizingItem] = useState<string | null>(null)
        
        const handleGridItemImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
          const file = e.target.files?.[0]
          if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
              setGridItemImagePreview(reader.result as string)
            }
            reader.readAsDataURL(file)
          }
        }

        const openGridItemImageModal = (itemId: string) => {
          setActiveGridItemId(itemId)
          const item = gridItems.find(i => i.id === itemId)
          setGridItemImageUrl(item?.imageUrl || '')
          setGridItemImagePreview(item?.imageUrl || null)
          setIsGridItemImageModalOpen(true)
        }

        const closeGridItemImageModal = () => {
          setIsGridItemImageModalOpen(false)
          setGridItemImagePreview(null)
          setGridItemImageUrl('')
          setActiveGridItemId(null)
        }

        const saveGridItemImage = () => {
          if (activeGridItemId && (gridItemImagePreview || gridItemImageUrl.trim())) {
            const imageUrl = gridItemImagePreview || gridItemImageUrl
            const updatedItems = gridItems.map(item => 
              item.id === activeGridItemId ? { ...item, imageUrl } : item
            )
            setGridItems(updatedItems)
            closeGridItemImageModal()
          }
        }

        const removeGridItemImage = (itemId: string) => {
          const updatedItems = gridItems.map(item => 
            item.id === itemId ? { ...item, imageUrl: '' } : item
          )
          setGridItems(updatedItems)
        }

        const updateGridItem = (itemId: string, newContent: string) => {
          const updatedItems = gridItems.map(item => 
            item.id === itemId ? { ...item, content: newContent } : item
          )
          setGridItems(updatedItems)
        }

        const updateGridItemSpan = (itemId: string, newSpan: number) => {
          const maxSpan = component.styles.gridColumns || 4
          const updatedItems = gridItems.map(item => 
            item.id === itemId ? { ...item, span: Math.max(1, Math.min(newSpan, maxSpan)) } : item
          )
          setGridItems(updatedItems)
        }

        const deleteGridItem = (itemId: string) => {
          const updatedItems = gridItems.filter(item => item.id !== itemId)
          setGridItems(updatedItems)
        }

        const moveGridItem = (fromIndex: number, toIndex: number) => {
          if (toIndex < 0 || toIndex >= gridItems.length) return
          const items = [...gridItems]
          const [movedItem] = items.splice(fromIndex, 1)
          items.splice(toIndex, 0, movedItem)
          setGridItems(items)
        }

        // Drag handlers for reordering
        const handleItemDragStart = (e: React.MouseEvent, itemId: string) => {
          e.preventDefault()
          e.stopPropagation()
          setDraggingItem(itemId)
          
          const startX = e.clientX
          const itemIndex = gridItems.findIndex(item => item.id === itemId)
          
          const handleDragMove = (moveEvent: MouseEvent) => {
            const deltaX = moveEvent.clientX - startX
            const itemWidth = 100 // approximate width
            const moveSlots = Math.round(deltaX / itemWidth)
            
            if (moveSlots !== 0) {
              const newIndex = itemIndex + moveSlots
              if (newIndex >= 0 && newIndex < gridItems.length && newIndex !== itemIndex) {
                moveGridItem(itemIndex, newIndex)
              }
            }
          }
          
          const handleDragEnd = () => {
            setDraggingItem(null)
            document.removeEventListener('mousemove', handleDragMove)
            document.removeEventListener('mouseup', handleDragEnd)
          }
          
          document.addEventListener('mousemove', handleDragMove)
          document.addEventListener('mouseup', handleDragEnd)
        }

        // Resize handlers for span adjustment
        const handleItemResizeStart = (e: React.MouseEvent, itemId: string, currentSpan: number) => {
          e.preventDefault()
          e.stopPropagation()
          setResizingItem(itemId)
          
          const startX = e.clientX
          const maxSpan = component.styles.gridColumns || 4
          
          const handleResizeMove = (moveEvent: MouseEvent) => {
            const deltaX = moveEvent.clientX - startX
            const colWidth = 100 // approximate column width
            const spanChange = Math.round(deltaX / colWidth)
            const newSpan = Math.max(1, Math.min(currentSpan + spanChange, maxSpan))
            
            if (newSpan !== currentSpan) {
              updateGridItemSpan(itemId, newSpan)
            }
          }
          
          const handleResizeEnd = () => {
            setResizingItem(null)
            document.removeEventListener('mousemove', handleResizeMove)
            document.removeEventListener('mouseup', handleResizeEnd)
          }
          
          document.addEventListener('mousemove', handleResizeMove)
          document.addEventListener('mouseup', handleResizeEnd)
        }
        
        return (
          <div style={componentStyle}>
            <div 
              className="grid"
              style={{ 
                gridTemplateColumns: `repeat(${component.styles.gridColumns || 4}, 1fr)`,
                gap: `${component.styles.gridGap || 16}px`
              }}
            >
              {gridItems.map((item: { id: string; content: string; span?: number; imageUrl?: string; videoUrl?: string }, index: number) => (
                <div 
                  key={item.id} 
                  className={`group relative p-4 rounded-lg border-2 flex flex-col items-center justify-center min-h-[100px] transition-colors ${
                    draggingItem === item.id ? 'opacity-50 cursor-grabbing' : 'hover:border-blue-400'
                  } ${resizingItem === item.id ? 'ring-2 ring-blue-500' : ''}`}
                  style={{ 
                    borderColor: getColorValue(component.styles.borderColor),
                    gridColumn: item.span ? `span ${item.span}` : 'span 1',
                    backgroundColor: getColorValue(component.styles.cardBackgroundColor || component.styles.backgroundColor),
                    cursor: draggingItem === item.id ? 'grabbing' : 'grab'
                  }}
                  onMouseDown={(e) => handleItemDragStart(e, item.id)}
                >
                  {/* Resize handle on right border */}
                  <div
                    className="absolute right-0 top-1/2 transform -translate-y-1/2 w-2 h-8 bg-blue-500 rounded opacity-0 group-hover:opacity-100 transition-opacity cursor-ew-resize hover:bg-blue-600 z-20"
                    onMouseDown={(e) => handleItemResizeStart(e, item.id, item.span || 1)}
                    title="Чирж өргөтгөх/багасгах"
                  />

                  {/* Grid item controls - simplified, just edit and delete */}
                  <div className="absolute -top-2 -right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    {/* Edit */}
                    <button 
                      onClick={(e) => {
                        e.stopPropagation()
                        setEditingGridItemId(item.id)
                      }}
                      className="w-6 h-6 bg-green-500 text-white rounded-full text-xs hover:bg-green-600 flex items-center justify-center"
                      title="Засах"
                    >
                      ✎
                    </button>
                    {/* Delete */}
                    <button 
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteGridItem(item.id)
                      }}
                      className="w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600 flex items-center justify-center"
                      title="Устгах"
                    >
                      ×
                    </button>
                  </div>

                  {/* Grid item content */}
                  {editingGridItemId === item.id ? (
                    <div className="w-full space-y-2" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="text"
                        value={item.content}
                        onChange={(e) => updateGridItem(item.id, e.target.value)}
                        onBlur={() => setEditingGridItemId(null)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') setEditingGridItemId(null)
                        }}
                        className="w-full px-2 py-1 text-center border rounded text-sm"
                        style={{ 
                          backgroundColor: isDarkMode ? '#374151' : 'white',
                          color: isDarkMode ? 'white' : 'black',
                          borderColor: getColorValue(component.styles.borderColor)
                        }}
                        autoFocus
                      />
                      
                      {/* Image Upload Button */}
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => openGridItemImageModal(item.id)}
                          className={`flex-1 flex items-center justify-center space-x-1 px-2 py-1 text-xs border rounded transition-colors ${
                            isDarkMode 
                              ? 'border-gray-600 hover:bg-gray-700 text-gray-300' 
                              : 'border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <Image className="w-3 h-3" />
                          <span>{item.imageUrl ? 'Зураг өөрчлөх' : 'Зураг нэмэх'}</span>
                        </button>
                        {item.imageUrl && (
                          <button
                            onClick={() => removeGridItemImage(item.id)}
                            className="w-6 h-6 bg-red-500 text-white rounded text-xs hover:bg-red-600 flex items-center justify-center"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                      
                      {/* Image Preview */}
                      {item.imageUrl && (
                        <div className="mt-1">
                          <img src={item.imageUrl} alt="Preview" className="w-full h-16 object-cover rounded" />
                        </div>
                      )}
                      
                      {/* Video URL Input */}
                      <div className="flex items-center space-x-1">
                        <Video className="w-3 h-3 text-gray-400" />
                        <input
                          type="text"
                          value={item.videoUrl || ''}
                          onChange={(e) => {
                            const updatedItems = gridItems.map(gridItem => 
                              gridItem.id === item.id ? { ...gridItem, videoUrl: e.target.value } : gridItem
                            )
                            setGridItems(updatedItems)
                          }}
                          placeholder="Видео URL (YouTube)"
                          className="flex-1 px-2 py-1 text-xs border rounded"
                          style={{ 
                            backgroundColor: isDarkMode ? '#374151' : 'white',
                            color: isDarkMode ? 'white' : 'black',
                            borderColor: getColorValue(component.styles.borderColor)
                          }}
                        />
                      </div>
                      
                      <p className="text-xs mt-1 opacity-70">Enter дарж хадгална</p>
                    </div>
                  ) : (
                    <div 
                      className="text-center w-full"
                      onClick={() => setEditingGridItemId(item.id)}
                    >
                      <p className="font-medium">{item.content}</p>
                      {item.span && item.span > 1 && (
                        <span className="text-xs opacity-60">(Span: {item.span})</span>
                      )}
                      
                      {/* Display Image under text */}
                      {item.imageUrl && (
                        <div className="mt-2 w-full">
                          <img 
                            src={item.imageUrl} 
                            alt={item.content} 
                            className="w-full h-20 object-cover rounded"
                          />
                        </div>
                      )}
                      
                      {/* Display Video under text */}
                      {item.videoUrl && (
                        <div className="mt-2 w-full">
                          {item.videoUrl.includes('youtube') || item.videoUrl.includes('youtu.be') ? (
                            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                              <iframe
                                src={`https://www.youtube.com/embed/${(() => {
                                  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
                                  const match = item.videoUrl?.match(regExp)
                                  return (match && match[2].length === 11) ? match[2] : ''
                                })()}`}
                                className="absolute top-0 left-0 w-full h-full rounded"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              />
                            </div>
                          ) : (
                            <video
                              src={item.videoUrl}
                              controls
                              className="w-full h-20 object-cover rounded"
                            />
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {/* Grid Item Image Upload Modal */}
            {isGridItemImageModalOpen && createPortal(
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" style={{ zIndex: 2147483647 }}>
                <div className={`w-full max-w-md rounded-lg p-6 shadow-2xl ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`} style={{ maxHeight: '90vh', overflow: 'auto' }}>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className={`font-semibold text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Зураг нэмэх</h3>
                    <button onClick={closeGridItemImageModal} className="text-gray-500 hover:text-gray-700">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    {/* File Upload Area */}
                    <div 
                      className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                        isDarkMode 
                          ? 'border-gray-600 hover:border-gray-500' 
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      onClick={() => document.getElementById('grid-item-file-upload')?.click()}
                    >
                      <input
                        id="grid-item-file-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleGridItemImageUpload}
                        className="hidden"
                      />
                      {gridItemImagePreview ? (
                        <img src={gridItemImagePreview} alt="Preview" className="max-h-32 mx-auto rounded" />
                      ) : (
                        <>
                          <Image className="w-12 h-12 mx-auto mb-2 opacity-50" />
                          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Файл сонгох эсвэл энд чирнэ үү
                          </p>
                          <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                            JPG, PNG, GIF дэмжигдэнэ
                          </p>
                        </>
                      )}
                    </div>

                    {/* Or Divider */}
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className={`w-full border-t ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`} />
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className={`px-2 ${isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-white text-gray-500'}`}>эсвэл</span>
                      </div>
                    </div>

                    {/* URL Input */}
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Зургийн URL
                      </label>
                      <input 
                        type="text" 
                        value={gridItemImageUrl} 
                        onChange={(e) => setGridItemImageUrl(e.target.value)} 
                        className={`w-full px-3 py-2 border rounded-lg text-sm ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-2 pt-2">
                      <button 
                        onClick={closeGridItemImageModal}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium ${isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                      >
                        Болих
                      </button>
                      <button 
                        onClick={saveGridItemImage}
                        disabled={!gridItemImageUrl.trim() && !gridItemImagePreview}
                        className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Нэмэх
                      </button>
                    </div>
                  </div>
                </div>
              </div>,
              document.body
            )}
          </div>
        )
      case 'image':
        return (
          <div style={componentStyle}>
            {component.content.images && component.content.images.length > 0 ? (
              <div className={`grid gap-4 ${component.content.images.length === 1 ? 'grid-cols-1' : component.content.images.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
                {component.content.images.map((img: ComponentImage) => (
                  <img 
                    key={img.id} 
                    src={img.url} 
                    alt={img.alt} 
                    className="w-full h-64 object-cover rounded-lg"
                  />
                ))}
              </div>
            ) : (
              <div className="text-center p-8 border-2 border-dashed rounded-lg">
                <Image className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Зураг нэмнэ үү</p>
              </div>
            )}
          </div>
        )
      default:
        return <div style={componentStyle}><p>{component.type} component</p></div>
    }
  }

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`group relative ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
      onClick={() => onSelect(component.id)}
    >
      <div className={`border-2 rounded-lg p-2 transition-colors ${isSelected ? 'border-blue-500' : 'border-dashed border-gray-300 hover:border-blue-400'} relative`}>
        <div className="flex justify-between items-start mb-2 opacity-0 group-hover:opacity-100 transition-opacity absolute -top-3 -right-3 z-10 space-x-1">
          <button {...attributes} {...listeners} className="p-2 bg-white shadow-md hover:bg-gray-100 rounded-full text-xs font-bold">
            <GripVertical className="w-4 h-4" />
          </button>
          <button onClick={() => onEdit(component.id)} className="p-2 bg-white shadow-md hover:bg-gray-100 rounded-full text-xs font-bold">
            <Edit3 className="w-4 h-4" />
          </button>
          <button onClick={() => onDelete(component.id)} className="p-2 bg-white shadow-md hover:bg-red-100 rounded-full text-red-600 text-xs font-bold">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
        {renderComponent()}
        
        {/* Blue resize handle for height */}
        <div
          onMouseDown={handleResizeStart}
          className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-2 bg-blue-500 rounded-full cursor-ns-resize opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-600 z-20"
          title="Чирж өндрийг өөрчлөх"
        />
      </div>
    </div>
  )
}

interface WebsiteBuilderProps {
  websiteName: string
  isDarkMode: boolean
  template?: any
}

export default function WebsiteBuilder({ websiteName, isDarkMode, template }: WebsiteBuilderProps) {
  const [pages, setPages] = useState<Page[]>([
    {
      id: 'home',
      name: 'Home',
      path: '/',
      components: [
        { id: '1', type: 'header', content: { title: websiteName, navLinks: { ...defaultNavLinks } }, styles: { ...defaultStyles, backgroundColor: 'slate-800', textColor: 'white', linkColor: 'white' } },
        { id: '2', type: 'home', content: { title: 'Манай вэбсайтад тавтай морил', subtitle: 'Гайхалтай дижитал туршлага бүтээе', buttonText: 'Эхлэх', images: [] }, styles: { ...defaultStyles, backgroundColor: 'blue-500', textColor: 'white', headingColor: 'white', padding: 64 } },
        { id: '3', type: 'footer', content: { title: websiteName, copyright: `© 2026${websiteName}. Бүх эрх хуулиар хамгаалагдсан.`, footerLinks: { ...defaultFooterLinks } }, styles: { ...defaultStyles, backgroundColor: 'slate-800', textColor: 'white', linkColor: 'slate-400' } },
      ]
    }
  ])
  
  const [activePageId, setActivePageId] = useState<string>('home')
  const [activeId, setActiveId] = useState<string | null>(null)
  const [editingComponent, setEditingComponent] = useState<Component | null>(null)
  const [originalComponent, setOriginalComponent] = useState<Component | null>(null)
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null)
  const [newImageUrl, setNewImageUrl] = useState('')
  const [newImageAlt, setNewImageAlt] = useState('')
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isAddingPage, setIsAddingPage] = useState(false)
  const [newPageName, setNewPageName] = useState('')
  const [editingPageId, setEditingPageId] = useState<string | null>(null)
  const [editingPageName, setEditingPageName] = useState('')
  const [draggedImageId, setDraggedImageId] = useState<string | null>(null)
  const [isBgImageModalOpen, setIsBgImageModalOpen] = useState(false)
  const [newBgImageUrl, setNewBgImageUrl] = useState('')
  const [bgImagePreview, setBgImagePreview] = useState<string | null>(null)

  const activePage = pages.find(p => p.id === activePageId) || pages[0]

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  useEffect(() => {
    if (template && template.components) {
      // Load template components into the home page
      const newComponents = template.components.map((comp: any, index: number) => ({
        ...comp,
        id: (Date.now() + index).toString(),
        content: {
          ...comp.content,
          // Update title in header and footer with websiteName
          ...(comp.type === 'header' && { title: websiteName }),
          ...(comp.type === 'footer' && { title: websiteName, copyright: `© 2026${websiteName}. Бүх эрх хуулиар хамгаалагдсан.` }),
        }
      }))
      
      setPages(prev => prev.map(page => 
        page.id === activePageId 
          ? { ...page, components: newComponents }
          : page
      ))
    }
  }, [template])

  function handleDragStart(event: any) {
    setActiveId(event.active.id)
  }

  function handleDragEnd(event: any) {
    const { active, over } = event
    if (active.id !== over?.id && over) {
      setPages(prev => prev.map(page => {
        if (page.id !== activePageId) return page
        const oldIndex = page.components.findIndex((item) => item.id === active.id)
        const newIndex = page.components.findIndex((item) => item.id === over.id)
        return { ...page, components: arrayMove(page.components, oldIndex, newIndex) }
      }))
    }
    setActiveId(null)
  }

  const addComponent = (type: string) => {
    const newComponent: Component = {
      id: Date.now().toString(),
      type: type as Component['type'],
      content: { images: [] },
      styles: { ...defaultStyles }
    }
    setPages(prev => prev.map(page => 
      page.id === activePageId 
        ? { ...page, components: [...page.components, newComponent] }
        : page
    ))
  }

  const deleteComponent = (id: string) => {
    setPages(prev => prev.map(page => 
      page.id === activePageId 
        ? { ...page, components: page.components.filter(comp => comp.id !== id) }
        : page
    ))
    if (selectedComponentId === id) setSelectedComponentId(null)
  }

  const editComponent = (id: string) => {
    const component = activePage.components.find(c => c.id === id)
    if (component) {
      const componentCopy = { ...component }
      setEditingComponent(componentCopy)
      setOriginalComponent(componentCopy)
      setSelectedComponentId(id)
    }
  }

  const cancelComponentEdit = () => {
    if (originalComponent && editingComponent) {
      // Revert to original
      setPages(prev => prev.map(page => 
        page.id === activePageId 
          ? { ...page, components: page.components.map(comp => comp.id === originalComponent.id ? originalComponent : comp) }
          : page
      ))
    }
    setEditingComponent(null)
    setOriginalComponent(null)
    setNewImageUrl('')
    setNewImageAlt('')
  }

  const closeEditPanel = () => {
    setEditingComponent(null)
    setOriginalComponent(null)
    setNewImageUrl('')
    setNewImageAlt('')
  }

  const saveComponentEdit = () => {
    // Changes are already applied in real-time, just close the panel
    setEditingComponent(null)
    setOriginalComponent(null)
    setNewImageUrl('')
    setNewImageAlt('')
  }

  const updateComponentStyle = (key: keyof ComponentStyles, value: any) => {
    if (editingComponent) {
      const updated = { ...editingComponent, styles: { ...editingComponent.styles, [key]: value } }
      setEditingComponent(updated)
      // Apply immediately
      setPages(prev => prev.map(page => 
        page.id === activePageId 
          ? { ...page, components: page.components.map(comp => comp.id === updated.id ? updated : comp) }
          : page
      ))
    }
  }

  const updateComponentContent = (key: string, value: any) => {
    if (editingComponent) {
      const updated = { ...editingComponent, content: { ...editingComponent.content, [key]: value } }
      setEditingComponent(updated)
      // Apply immediately
      setPages(prev => prev.map(page => 
        page.id === activePageId 
          ? { ...page, components: page.components.map(comp => comp.id === updated.id ? updated : comp) }
          : page
      ))
    }
  }

  const updateNavLink = (key: string, value: string) => {
    if (editingComponent) {
      const updated = { ...editingComponent, content: { ...editingComponent.content, navLinks: { ...editingComponent.content.navLinks, [key]: value } } }
      setEditingComponent(updated)
      // Apply immediately
      setPages(prev => prev.map(page => 
        page.id === activePageId 
          ? { ...page, components: page.components.map(comp => comp.id === updated.id ? updated : comp) }
          : page
      ))
    }
  }

  const updateFooterLink = (key: string, value: string) => {
    if (editingComponent) {
      const updated = { ...editingComponent, content: { ...editingComponent.content, footerLinks: { ...editingComponent.content.footerLinks, [key]: value } } }
      setEditingComponent(updated)
      // Apply immediately
      setPages(prev => prev.map(page => 
        page.id === activePageId 
          ? { ...page, components: page.components.map(comp => comp.id === updated.id ? updated : comp) }
          : page
      ))
    }
  }

  const updateContactInfo = (key: string, value: string) => {
    if (editingComponent) {
      const updated = { ...editingComponent, content: { ...editingComponent.content, contactInfo: { ...editingComponent.content.contactInfo, [key]: value } } }
      setEditingComponent(updated)
      // Apply immediately
      setPages(prev => prev.map(page => 
        page.id === activePageId 
          ? { ...page, components: page.components.map(comp => comp.id === updated.id ? updated : comp) }
          : page
      ))
    }
  }

  const addImage = () => {
    console.log('addImage called', { newImageUrl, imagePreview, editingComponent })
    if (editingComponent && (newImageUrl.trim() || imagePreview)) {
      const imageUrl = imagePreview || newImageUrl
      const newImage: ComponentImage = { id: Date.now().toString(), url: imageUrl, alt: newImageAlt || 'Image' }
      console.log('Creating new image:', newImage)
      const updated = { ...editingComponent, content: { ...editingComponent.content, images: [...(editingComponent.content.images || []), newImage] } }
      console.log('Updated component:', updated)
      setEditingComponent(updated)
      setNewImageUrl('')
      setNewImageAlt('')
      setImagePreview(null)
      setUploadedFile(null)
      setIsImageModalOpen(false)
      // Apply immediately
      setPages(prev => {
        const newPages = prev.map(page => 
          page.id === activePageId 
            ? { ...page, components: page.components.map(comp => comp.id === updated.id ? updated : comp) }
            : page
        )
        console.log('Updated pages:', newPages)
        return newPages
      })
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploadedFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const closeImageModal = () => {
    setIsImageModalOpen(false)
    setImagePreview(null)
    setUploadedFile(null)
    setNewImageUrl('')
    setNewImageAlt('')
  }

  const removeImage = (imageId: string) => {
    if (editingComponent) {
      const updated = { ...editingComponent, content: { ...editingComponent.content, images: editingComponent.content.images?.filter(img => img.id !== imageId) || [] } }
      setEditingComponent(updated)
      // Apply immediately
      setPages(prev => prev.map(page => 
        page.id === activePageId 
          ? { ...page, components: page.components.map(comp => comp.id === updated.id ? updated : comp) }
          : page
      ))
    }
  }

  const handleImageDragStart = (imageId: string) => {
    setDraggedImageId(imageId)
  }

  const handleImageDragOver = (e: React.DragEvent, targetImageId: string) => {
    e.preventDefault()
    if (!draggedImageId || draggedImageId === targetImageId || !editingComponent) return
    
    const images = editingComponent.content.images || []
    const dragIndex = images.findIndex(img => img.id === draggedImageId)
    const targetIndex = images.findIndex(img => img.id === targetImageId)
    
    if (dragIndex === -1 || targetIndex === -1) return
    
    // Reorder images
    const newImages = [...images]
    const [removed] = newImages.splice(dragIndex, 1)
    newImages.splice(targetIndex, 0, removed)
    
    const updated = { ...editingComponent, content: { ...editingComponent.content, images: newImages } }
    setEditingComponent(updated)
    setPages(prev => prev.map(page => 
      page.id === activePageId 
        ? { ...page, components: page.components.map(comp => comp.id === updated.id ? updated : comp) }
        : page
    ))
  }

  const handleImageDragEnd = () => {
    setDraggedImageId(null)
  }

  const handleBgFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setBgImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const addBackgroundImage = () => {
    if (bgImagePreview || newBgImageUrl.trim()) {
      const imageUrl = bgImagePreview || newBgImageUrl
      setPages(prev => prev.map(page => 
        page.id === activePageId 
          ? { ...page, backgroundImage: imageUrl }
          : page
      ))
      setNewBgImageUrl('')
      setBgImagePreview(null)
      setIsBgImageModalOpen(false)
    }
  }

  const closeBgImageModal = () => {
    setIsBgImageModalOpen(false)
    setNewBgImageUrl('')
    setBgImagePreview(null)
  }

  const addService = () => {
    if (editingComponent) {
      const services = [...(editingComponent.content.services || []), `Service ${(editingComponent.content.services?.length || 0) + 1}`]
      const updated = { ...editingComponent, content: { ...editingComponent.content, services } }
      setEditingComponent(updated)
      // Apply immediately
      setPages(prev => prev.map(page => 
        page.id === activePageId 
          ? { ...page, components: page.components.map(comp => comp.id === updated.id ? updated : comp) }
          : page
      ))
    }
  }

  const updateService = (index: number, value: string) => {
    if (editingComponent) {
      const services = [...(editingComponent.content.services || [])]
      services[index] = value
      const updated = { ...editingComponent, content: { ...editingComponent.content, services } }
      setEditingComponent(updated)
      // Apply immediately
      setPages(prev => prev.map(page => 
        page.id === activePageId 
          ? { ...page, components: page.components.map(comp => comp.id === updated.id ? updated : comp) }
          : page
      ))
    }
  }

  const removeService = (index: number) => {
    if (editingComponent) {
      const services = [...(editingComponent.content.services || [])]
      services.splice(index, 1)
      const updated = { ...editingComponent, content: { ...editingComponent.content, services } }
      setEditingComponent(updated)
      // Apply immediately
      setPages(prev => prev.map(page => 
        page.id === activePageId 
          ? { ...page, components: page.components.map(comp => comp.id === updated.id ? updated : comp) }
          : page
      ))
    }
  }

  const addPage = () => {
    if (newPageName.trim()) {
      const newPage: Page = {
        id: Date.now().toString(),
        name: newPageName,
        path: `/${newPageName.toLowerCase().replace(/\s+/g, '-')}`,
        components: [
          { id: Date.now().toString() + '1', type: 'header', content: { title: websiteName, navLinks: { ...defaultNavLinks } }, styles: { ...defaultStyles, backgroundColor: 'slate-800', textColor: 'white', linkColor: 'white' } },
          { id: Date.now().toString() + '2', type: 'home', content: { title: `${newPageName} хуудсанд тавтай морил`, subtitle: 'Хуудасын тайлбар энд байна', buttonText: 'Эхлэх', images: [] }, styles: { ...defaultStyles, backgroundColor: 'blue-500', textColor: 'white', headingColor: 'white', padding: 64 } },
          { id: Date.now().toString() + '3', type: 'footer', content: { title: websiteName, copyright: `© 2026${websiteName}. Бүх эрх хуулиар хамгаалагдсан.`, footerLinks: { ...defaultFooterLinks } }, styles: { ...defaultStyles, backgroundColor: 'slate-800', textColor: 'white', linkColor: 'slate-400' } },
        ]
      }
      setPages([...pages, newPage])
      setActivePageId(newPage.id)
      setNewPageName('')
      setIsAddingPage(false)
    }
  }

  const deletePage = (pageId: string) => {
    if (pages.length > 1) {
      const newPages = pages.filter(p => p.id !== pageId)
      setPages(newPages)
      if (activePageId === pageId) {
        setActivePageId(newPages[0].id)
      }
    }
  }

  const updatePageName = (pageId: string) => {
    if (editingPageName.trim()) {
      setPages(prev => prev.map(page => 
        page.id === pageId ? { ...page, name: editingPageName, path: `/${editingPageName.toLowerCase().replace(/\s+/g, '-')}` } : page
      ))
      setEditingPageId(null)
      setEditingPageName('')
    }
  }

  const ColorPicker = ({ label, value, onChange }: { label: string; value: string; onChange: (val: string) => void }) => {
    const [isOpen, setIsOpen] = useState(false)
    
    // Color palettes based on the user's image - organized in color groups
    const colorGroups = [
      {
        name: 'Үндсэн',
        colors: ['#1a1a2e', '#16213e', '#0f3460', '#e94560', '#533483', '#f39422', '#16c79a', '#ef476f']
      },
      {
        name: 'Улаан тонууд',
        colors: ['#2d0000', '#5c0000', '#8b0000', '#ba0000', '#e60000', '#ff3333', '#ff6666', '#ff9999', '#ffcccc']
      },
      {
        name: 'Хөх тонууд',
        colors: ['#000a2d', '#001a5c', '#002a8b', '#003aba', '#004ae6', '#3377ff', '#6699ff', '#99bbff', '#ccddff']
      },
      {
        name: 'Ногоон тонууд',
        colors: ['#002d00', '#005c00', '#008b00', '#00ba00', '#00e600', '#33ff33', '#66ff66', '#99ff99', '#ccffcc']
      },
      {
        name: 'Шар / Улбар шар',
        colors: ['#2d1a00', '#5c3300', '#8b4d00', '#ba6600', '#e68000', '#ff9933', '#ffb366', '#ffcc99', '#ffe5cc']
      },
      {
        name: 'Ягаан / Нил',
        colors: ['#2d002d', '#5c005c', '#8b008b', '#ba00ba', '#e600e6', '#ff33ff', '#ff66ff', '#ff99ff', '#ffccff']
      },
      {
        name: 'Бор / Торгон',
        colors: ['#2d1f1f', '#5c3d3d', '#8b5c5c', '#ba7a7a', '#e69999', '#ffb3b3', '#ffcccc', '#ffe5e5']
      },
      {
        name: 'Саарал / Хар',
        colors: ['#000000', '#1a1a1a', '#333333', '#4d4d4d', '#666666', '#808080', '#999999', '#b3b3b3', '#cccccc', '#e6e6e6', '#ffffff']
      }
    ]

    const selectedColor = getColorValue(value)
    
    return (
      <div className="relative">
        <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{label}</label>
        <div className="space-y-2">
          {/* Selected color display */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center justify-center w-full p-2 border rounded-lg hover:bg-gray-50 transition-colors"
            style={{ borderColor: isDarkMode ? '#4a5568' : '#e2e8f0' }}
          >
            <div 
              className="w-10 h-10 rounded-lg border-2 border-gray-300 shadow-sm"
              style={{ backgroundColor: selectedColor }}
            />
          </button>

          {/* Color palette */}
          {isOpen && (
            <div 
              className={`absolute z-50 w-80 max-h-96 overflow-y-auto rounded-lg border shadow-xl p-3 ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'}`}
              style={{ top: '100%', left: 0, marginTop: '4px' }}
            >
              {/* Custom hex input */}
              <div className="mb-3 flex items-center space-x-2">
                <span className="text-xs">Hex:</span>
                <input
                  type="text"
                  value={value.startsWith('#') ? value : ''}
                  onChange={(e) => {
                    const hex = e.target.value
                    if (/^#[0-9A-Fa-f]{0,6}$/.test(hex)) {
                      onChange(hex)
                    }
                  }}
                  placeholder="#000000"
                  className="flex-1 px-2 py-1 text-xs border rounded bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              {/* Quick colors */}
              <div className="mb-3">
                <span className="text-xs font-medium block mb-2 text-gray-500 dark:text-gray-400">Хурдан сонголт</span>
                <div className="flex gap-1 flex-wrap">
                  {['transparent', 'white', 'black', '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e'].map((color) => (
                    <button
                      key={color}
                      onClick={() => {
                        onChange(color)
                        setIsOpen(false)
                      }}
                      className={`w-6 h-6 rounded transition-all hover:scale-110 ${value === color ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
                      style={{ 
                        backgroundColor: color === 'transparent' ? 'white' : getColorValue(color),
                        backgroundImage: color === 'transparent' ? 'linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc), linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc)' : undefined,
                        backgroundSize: color === 'transparent' ? '8px 8px' : undefined,
                        backgroundPosition: color === 'transparent' ? '0 0, 4px 4px' : undefined,
                        border: color === 'transparent' ? '1px solid #999' : undefined
                      }}
                      title={color}
                    />
                  ))}
                </div>
              </div>

              {/* Color groups */}
              {colorGroups.map((group) => (
                <div key={group.name} className="mb-3">
                  <span className="text-xs font-medium block mb-2 text-gray-500 dark:text-gray-400">{group.name}</span>
                  <div className="flex gap-1 flex-wrap">
                    {group.colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => {
                          onChange(color)
                          setIsOpen(false)
                        }}
                        className={`w-7 h-7 rounded transition-all hover:scale-110 ${value === color ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              ))}

              {/* Close button */}
              <button
                onClick={() => setIsOpen(false)}
                className="w-full py-2 mt-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Хаах
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Вэбсайт угсрах</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-300">Хуудас бүтээхийн тулд бүрдлүүдийг чирнэ үү</p>
        </div>
        <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
          Хадгалах
        </button>
      </div>

      {/* Page Management */}
      <div className="mb-6 p-4 rounded-lg border bg-white dark:bg-gray-800 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Хуудсууд</h3>
          <button onClick={() => setIsAddingPage(true)} className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
            + Хуудас нэмэх
          </button>
        </div>
        
        {isAddingPage && (
          <div className="flex items-center space-x-2 mb-4">
            <input
              type="text"
              value={newPageName}
              onChange={(e) => setNewPageName(e.target.value)}
              placeholder="Хуудасын нэр"
              className={`flex-1 px-3 py-2 border rounded-lg text-sm ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
              onKeyDown={(e) => e.key === 'Enter' && addPage()}
              autoFocus
            />
            <button onClick={addPage} className="p-2 text-green-600 hover:bg-green-50 rounded"><Check className="w-4 h-4" /></button>
            <button onClick={() => { setIsAddingPage(false); setNewPageName(''); }} className="p-2 text-red-600 hover:bg-red-50 rounded"><X className="w-4 h-4" /></button>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {pages.map((page) => (
            <div key={page.id} className={`flex items-center space-x-2 px-3 py-2 rounded-lg border ${
              activePageId === page.id ? 'bg-blue-50 border-blue-500 text-blue-700' : isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-300' : 'bg-gray-100 border-gray-300 text-gray-700'
            }`}>
              {editingPageId === page.id ? (
                <>
                  <input type="text" value={editingPageName} onChange={(e) => setEditingPageName(e.target.value)} className="w-20 px-2 py-1 text-sm border rounded" onKeyDown={(e) => e.key === 'Enter' && updatePageName(page.id)} autoFocus />
                  <button onClick={() => updatePageName(page.id)} className="text-green-600"><Check className="w-3 h-3" /></button>
                  <button onClick={() => { setEditingPageId(null); setEditingPageName(''); }} className="text-red-600"><X className="w-3 h-3" /></button>
                </>
              ) : (
                <>
                  <button onClick={() => setActivePageId(page.id)} className="flex items-center space-x-1">
                    <FileText className="w-4 h-4" />
                    <span className="text-sm font-medium">{page.name}</span>
                  </button>
                  <button onClick={() => { setEditingPageId(page.id); setEditingPageName(page.name); }} className="text-gray-400 hover:text-gray-600"><Edit3 className="w-3 h-3" /></button>
                  {pages.length > 1 && <button onClick={() => deletePage(page.id)} className="text-red-400 hover:text-red-600"><Trash2 className="w-3 h-3" /></button>}
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-4 xl:gap-8">
        {/* Components Panel - Hidden on mobile, visible on xl screens */}
        <div className="hidden xl:block w-80 flex-shrink-0">
          <div className={`rounded-lg shadow-sm border p-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
            <h3 className={`font-semibold text-lg mb-4 ${isDarkMode ? 'text-white' : ''}`}>Бүрдлүүд</h3>
            <div className="space-y-2">
              {availableComponents.map((comp) => (
                <button
                  key={comp.type}
                  onClick={() => addComponent(comp.type)}
                  className={`w-full flex items-center justify-between p-3 border rounded-lg transition-colors text-left ${isDarkMode ? 'border-gray-600 hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-50'}`}
                >
                  <span className="font-medium">{comp.label}</span>
                  <Plus className="w-4 h-4 text-gray-400" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile Components Toggle */}
        <div className="xl:hidden">
          <div className={`rounded-lg shadow-sm border p-4 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
            <div className="flex justify-between items-center mb-3">
              <h3 className={`font-semibold ${isDarkMode ? 'text-white' : ''}`}>Бүрдлүүд</h3>
              <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Бүрдэл сонгоно уу</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {availableComponents.slice(0, 6).map((comp) => (
                <button
                  key={comp.type}
                  onClick={() => addComponent(comp.type)}
                  className={`px-3 py-2 text-sm border rounded-lg transition-colors ${isDarkMode ? 'border-gray-600 hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-50'}`}
                >
                  {comp.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Preview Area */}
        <div className="flex-1 min-w-0">
          <div 
            className={`rounded-lg shadow-sm border p-4 sm:p-6 lg:p-8 ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white'} relative overflow-hidden`}
            style={{
              backgroundImage: activePage.backgroundImage ? `url(${activePage.backgroundImage})` : undefined,
              backgroundSize: activePage.backgroundSize === 'half' ? '50% 100%' : activePage.backgroundSize || 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: activePage.backgroundSize === 'half' ? 'no-repeat' : (activePage.backgroundRepeat || 'no-repeat'),
              backgroundAttachment: activePage.backgroundAttachment || 'scroll',
            }}
          >
            {/* Background Video */}
            {activePage.backgroundVideo && (
              <div className="absolute inset-0 z-0 overflow-hidden">
                {/* Dark overlay for text readability */}
                <div className="absolute inset-0 bg-black/40 z-10" />
                
                {(activePage.backgroundVideo.includes('youtube') || activePage.backgroundVideo.includes('youtu.be')) ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${(() => {
                      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
                      const match = activePage.backgroundVideo?.match(regExp)
                      return (match && match[2].length === 11) ? match[2] : ''
                    })()}?autoplay=1&mute=1&loop=1&controls=0&playlist=${(() => {
                      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
                      const match = activePage.backgroundVideo?.match(regExp)
                      return (match && match[2].length === 11) ? match[2] : ''
                    })()}&start=0&enablejsapi=0&rel=0&modestbranding=1&playsinline=1`}
                    className="absolute top-1/2 left-1/2 w-[100vw] h-[100vh] -translate-x-1/2 -translate-y-1/2 scale-125"
                    style={{ 
                      pointerEvents: 'none',
                      minWidth: '100%',
                      minHeight: '100%'
                    }}
                    allow="autoplay; encrypted-media"
                    frameBorder="0"
                  />
                ) : (
                  <video
                    src={activePage.backgroundVideo}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="absolute top-1/2 left-1/2 w-full h-full -translate-x-1/2 -translate-y-1/2 object-cover"
                    style={{ minWidth: '100%', minHeight: '100%' }}
                  />
                )}
              </div>
            )}
            
            <div className="max-w-full sm:max-w-2xl lg:max-w-4xl mx-auto relative z-10">
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                <SortableContext items={activePage.components} strategy={verticalListSortingStrategy}>
                  {activePage.components.map((component) => (
                    <DraggableComponent
                      key={component.id}
                      component={component}
                      onEdit={editComponent}
                      onDelete={deleteComponent}
                      isSelected={selectedComponentId === component.id}
                      onSelect={setSelectedComponentId}
                      isDarkMode={isDarkMode}
                    />
                  ))}
                </SortableContext>
                <DragOverlay>
                  {activeId ? (
                    <div className="opacity-50">
                      <DraggableComponent
                        component={activePage.components.find(c => c.id === activeId)!}
                        onEdit={() => {}}
                        onDelete={() => {}}
                        isSelected={false}
                        onSelect={() => {}}
                        isDarkMode={isDarkMode}
                      />
                    </div>
                  ) : null}
                </DragOverlay>
              </DndContext>

              {activePage.components.length === 0 && (
                <div className={`text-center py-12 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  <p className="text-lg mb-4">Бүрдэл алга</p>
                  <p>Эхлэхийн тулд зүүн талаас бүрдэл нэмнэ үү</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Edit Panel - Full width on mobile, fixed width on larger screens */}
        {editingComponent && (
          <div className="w-full xl:w-96 flex-shrink-0 order-first xl:order-last">
            <div className={`rounded-lg shadow-sm border p-4 sm:p-6 max-h-[80vh] xl:max-h-[90vh] overflow-y-auto ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className={`font-semibold text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Засварлах {editingComponent.type}</h3>
                <div className="flex space-x-2">
                  <button 
                    onClick={cancelComponentEdit} 
                    className={`px-3 py-1 rounded text-sm font-medium ${isDarkMode ? 'bg-red-900 text-red-200 hover:bg-red-800' : 'bg-red-100 text-red-600 hover:bg-red-200'}`}
                  >
                    Болих
                  </button>
                  <button 
                    onClick={saveComponentEdit} 
                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700"
                  >
                    Хадгалах
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Гарчиг</label>
                  <input type="text" value={editingComponent.content.title || ''} onChange={(e) => updateComponentContent('title', e.target.value)} className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`} placeholder={`${editingComponent.type} гарчиг`} />
                </div>

                {editingComponent.type === 'home' && (
                  <>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Дэд гарчиг</label>
                      <input type="text" value={editingComponent.content.subtitle || ''} onChange={(e) => updateComponentContent('subtitle', e.target.value)} className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`} placeholder="Дэд гарчиг оруулах" />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Товчны текст</label>
                      <input type="text" value={editingComponent.content.buttonText || ''} onChange={(e) => updateComponentContent('buttonText', e.target.value)} className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`} placeholder="Товчны текст оруулах" />
                    </div>
                  </>
                )}

                {editingComponent.type === 'about' && (
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Тайлбар</label>
                    <textarea value={editingComponent.content.description || ''} onChange={(e) => updateComponentContent('description', e.target.value)} rows={4} className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`} placeholder="Тайлбар оруулах" />
                  </div>
                )}

                {editingComponent.type === 'service' && (
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Үйлчилгээнүүд</label>
                    <div className="space-y-2">
                      {(editingComponent.content.services || []).map((service: string, index: number) => (
                        <div key={index} className="flex items-center space-x-2">
                          <input type="text" value={service} onChange={(e) => updateService(index, e.target.value)} className={`flex-1 px-3 py-2 border rounded-lg text-sm ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`} placeholder={`Үйлчилгээ ${index + 1}`} />
                          <button onClick={() => removeService(index)} className="px-2 py-1 text-red-600 hover:bg-red-50 rounded">×</button>
                        </div>
                      ))}
                      <button onClick={addService} className={`w-full py-2 border-2 border-dashed rounded-lg text-sm ${isDarkMode ? 'border-gray-600 text-gray-400 hover:border-gray-500' : 'border-gray-300 text-gray-500 hover:border-gray-400'}`}>+ Үйлчилгээ нэмэх</button>
                    </div>
                  </div>
                )}

                {editingComponent.type === 'contact' && (
                  <>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Товчны текст</label>
                      <input type="text" value={editingComponent.content.buttonText || ''} onChange={(e) => updateComponentContent('buttonText', e.target.value)} className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`} placeholder="Товчны текст оруулах" />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Имэйл</label>
                      <input type="text" value={editingComponent.content.contactInfo?.email || ''} onChange={(e) => updateContactInfo('email', e.target.value)} className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`} placeholder="Имэйл хаяг" />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Утас</label>
                      <input type="text" value={editingComponent.content.contactInfo?.phone || ''} onChange={(e) => updateContactInfo('phone', e.target.value)} className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`} placeholder="Утасны дугаар" />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Хаяг</label>
                      <input type="text" value={editingComponent.content.contactInfo?.address || ''} onChange={(e) => updateContactInfo('address', e.target.value)} className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`} placeholder="Хаяг" />
                    </div>
                  </>
                )}

                {editingComponent.type === 'header' && (
                  <>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Лого URL</label>
                      <input 
                        type="text" 
                        value={editingComponent.content.logoUrl || ''} 
                        onChange={(e) => updateComponentContent('logoUrl', e.target.value)} 
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`} 
                        placeholder="https://example.com/logo.png" 
                      />
                      <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Лого нэмсэн дээр зүүн дээд буланд чирж байрлалаа өөрчилж болно</p>
                    </div>
                    {editingComponent.content.logoUrl && (
                      <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                        <p className={`text-xs mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Одоогийн байрлал:</p>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                          X: {editingComponent.content.logoPosition?.x || 20}px, Y: {editingComponent.content.logoPosition?.y || 20}px
                        </p>
                      </div>
                    )}
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Нүүр холбоос</label>
                      <input type="text" value={editingComponent.content.navLinks?.home || ''} onChange={(e) => updateNavLink('home', e.target.value)} className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`} placeholder="Нүүр" />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Бидний тухай холбоос</label>
                      <input type="text" value={editingComponent.content.navLinks?.about || ''} onChange={(e) => updateNavLink('about', e.target.value)} className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`} placeholder="Бидний тухай" />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Үйлчилгээ холбоос</label>
                      <input type="text" value={editingComponent.content.navLinks?.services || ''} onChange={(e) => updateNavLink('services', e.target.value)} className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`} placeholder="Үйлчилгээ" />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Холбогдох холбоос</label>
                      <input type="text" value={editingComponent.content.navLinks?.contact || ''} onChange={(e) => updateNavLink('contact', e.target.value)} className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`} placeholder="Холбогдох" />
                    </div>
                  </>
                )}

                {editingComponent.type === 'footer' && (
                  <>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Зохиогчийн эрх</label>
                      <input type="text" value={editingComponent.content.copyright || ''} onChange={(e) => updateComponentContent('copyright', e.target.value)} className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`} placeholder="© 2026Таны компани" />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Нууцлал холбоос</label>
                      <input type="text" value={editingComponent.content.footerLinks?.privacy || ''} onChange={(e) => updateFooterLink('privacy', e.target.value)} className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`} placeholder="Нууцлалын бодлого" />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Нөхцөл холбоос</label>
                      <input type="text" value={editingComponent.content.footerLinks?.terms || ''} onChange={(e) => updateFooterLink('terms', e.target.value)} className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`} placeholder="Үйлчилгээний нөхцөл" />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Холбогдох холбоос</label>
                      <input type="text" value={editingComponent.content.footerLinks?.contact || ''} onChange={(e) => updateFooterLink('contact', e.target.value)} className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`} placeholder="Холбогдох" />
                    </div>
                  </>
                )}

                {editingComponent.type === 'card' && (
                  <>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Grid багана</label>
                      <input type="range" min="1" max="6" value={editingComponent.styles.gridColumns || 3} onChange={(e) => updateComponentStyle('gridColumns', parseInt(e.target.value))} className="w-full" />
                      <span className="text-xs">{editingComponent.styles.gridColumns || 3} багана</span>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Grid зай</label>
                      <input type="range" min="0" max="50" value={editingComponent.styles.gridGap || 16} onChange={(e) => updateComponentStyle('gridGap', parseInt(e.target.value))} className="w-full" />
                      <span className="text-xs">{editingComponent.styles.gridGap || 16}px</span>
                    </div>
                  </>
                )}

                {editingComponent.type === 'text' && (
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>HTML Текст</label>
                    <textarea value={editingComponent.content.text || ''} onChange={(e) => updateComponentContent('text', e.target.value)} rows={8} className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`} placeholder="<p>Текст энд...</p>" />
                    <p className="text-xs mt-1 opacity-70">HTML хэлбэрээр оруулна уу</p>
                  </div>
                )}

                {editingComponent.type === 'gif' && (
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Видео / GIF URL</label>
                    <input 
                      type="text" 
                      value={editingComponent.content.videoUrl || ''} 
                      onChange={(e) => updateComponentContent('videoUrl', e.target.value)} 
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`} 
                      placeholder="YouTube URL, GIF, MP4, WebM..." 
                    />
                    <p className="text-xs mt-1 opacity-70">YouTube, GIF, MP4, WebM дэмжигдэнэ</p>
                  </div>
                )}

                {editingComponent.type === 'grid' && (
                  <>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Grid багана</label>
                      <input type="range" min="1" max="12" value={editingComponent.styles.gridColumns || 4} onChange={(e) => updateComponentStyle('gridColumns', parseInt(e.target.value))} className="w-full" />
                      <span className="text-xs">{editingComponent.styles.gridColumns || 4} багана</span>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Grid зай</label>
                      <input type="range" min="0" max="50" value={editingComponent.styles.gridGap || 16} onChange={(e) => updateComponentStyle('gridGap', parseInt(e.target.value))} className="w-full" />
                      <span className="text-xs">{editingComponent.styles.gridGap || 16}px</span>
                    </div>
                  </>
                )}

                <hr className={isDarkMode ? 'border-gray-600' : 'border-gray-200'} />

                <h4 className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>Зурагууд</h4>
                
                {/* Add Image Button */}
                <button 
                  onClick={() => setIsImageModalOpen(true)}
                  className={`w-full py-3 rounded-lg text-sm font-medium border-2 border-dashed transition-colors ${
                    isDarkMode 
                      ? 'border-gray-600 text-gray-300 hover:border-blue-500 hover:text-blue-400' 
                      : 'border-gray-300 text-gray-600 hover:border-blue-500 hover:text-blue-500'
                  }`}
                >
                  <Image className="w-5 h-5 mx-auto mb-1" />
                  Зураг нэмэх
                </button>

                {/* Image List - Draggable */}
                {editingComponent.content.images && editingComponent.content.images.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-3">
                    {editingComponent.content.images.map((img: ComponentImage, index: number) => (
                      <div 
                        key={img.id} 
                        draggable
                        onDragStart={() => handleImageDragStart(img.id)}
                        onDragOver={(e) => handleImageDragOver(e, img.id)}
                        onDragEnd={handleImageDragEnd}
                        className={`relative group cursor-move rounded-lg overflow-hidden border-2 transition-all ${
                          draggedImageId === img.id 
                            ? 'opacity-50 border-blue-500' 
                            : 'border-transparent hover:border-blue-400'
                        }`}
                      >
                        {/* Drag Handle */}
                        <div className="absolute top-1 left-1 z-10 bg-black/50 rounded p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <GripHorizontal className="w-3 h-3 text-white" />
                        </div>
                        {/* Order Number */}
                        <div className="absolute top-1 right-1 z-10 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                          {index + 1}
                        </div>
                        <img src={img.url} alt={img.alt} className="w-full h-16 object-cover" />
                        <button 
                          onClick={() => removeImage(img.id)} 
                          className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Image Upload Modal - Rendered outside stacking context */}
                {isImageModalOpen && createPortal(
                  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" style={{ zIndex: 2147483647 }}>
                    <div className={`w-full max-w-md rounded-lg p-6 shadow-2xl ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`} style={{ maxHeight: '90vh', overflow: 'auto' }}>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className={`font-semibold text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Зураг нэмэх</h3>
                        <button onClick={closeImageModal} className="text-gray-500 hover:text-gray-700">
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="space-y-4">
                        {/* File Upload Area */}
                        <div 
                          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                            isDarkMode 
                              ? 'border-gray-600 hover:border-gray-500' 
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                          onClick={() => document.getElementById('file-upload')?.click()}
                        >
                          <input
                            id="file-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                          {imagePreview ? (
                            <img src={imagePreview} alt="Preview" className="max-h-32 mx-auto rounded" />
                          ) : (
                            <>
                              <Image className="w-12 h-12 mx-auto mb-2 opacity-50" />
                              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                Файл сонгох эсвэл энд чирнэ үү
                              </p>
                              <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                JPG, PNG, GIF дэмжигдэнэ
                              </p>
                            </>
                          )}
                        </div>

                        {/* Or Divider */}
                        <div className="relative">
                          <div className="absolute inset-0 flex items-center">
                            <div className={`w-full border-t ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`} />
                          </div>
                          <div className="relative flex justify-center text-sm">
                            <span className={`px-2 ${isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-white text-gray-500'}`}>эсвэл</span>
                          </div>
                        </div>

                        {/* URL Input */}
                        <div>
                          <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Зургийн URL
                          </label>
                          <input 
                            type="text" 
                            value={newImageUrl} 
                            onChange={(e) => setNewImageUrl(e.target.value)} 
                            className={`w-full px-3 py-2 border rounded-lg text-sm ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                            placeholder="https://example.com/image.jpg"
                          />
                        </div>

                        {/* Alt Text */}
                        <div>
                          <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Зургийн тайлбар (alt)
                          </label>
                          <input 
                            type="text" 
                            value={newImageAlt} 
                            onChange={(e) => setNewImageAlt(e.target.value)} 
                            className={`w-full px-3 py-2 border rounded-lg text-sm ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                            placeholder="Зургийн тайлбар"
                          />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex space-x-2 pt-2">
                          <button 
                            onClick={closeImageModal}
                            className={`flex-1 py-2 rounded-lg text-sm font-medium ${isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                          >
                            Болих
                          </button>
                          <button 
                            onClick={addImage}
                            disabled={!newImageUrl.trim() && !imagePreview}
                            className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Нэмэх
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>,
                  document.body
                )}

                <hr className={isDarkMode ? 'border-gray-600' : 'border-gray-200'} />

                <h4 className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>Видео</h4>
                
                {/* Video URL Input */}
                <div className="space-y-3">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Видео URL (YouTube, MP4, WebM)
                    </label>
                    <input 
                      type="text" 
                      value={editingComponent.content.videoUrl || ''} 
                      onChange={(e) => updateComponentContent('videoUrl', e.target.value)} 
                      className={`w-full px-3 py-2 border rounded-lg text-sm ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                      placeholder="https://youtube.com/watch?v=... эсвэл видео файлын URL"
                    />
                  </div>
                  
                  {editingComponent.content.videoUrl && (
                    <div className="relative rounded-lg overflow-hidden bg-black aspect-video">
                      {editingComponent.content.videoUrl.includes('youtube') || editingComponent.content.videoUrl.includes('youtu.be') ? (
                        <iframe
                          src={`https://www.youtube.com/embed/${(() => {
                            const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
                            const match = editingComponent.content.videoUrl?.match(regExp)
                            return (match && match[2].length === 11) ? match[2] : ''
                          })()}`}
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      ) : (
                        <video
                          src={editingComponent.content.videoUrl}
                          controls
                          className="w-full h-full object-contain"
                        />
                      )}
                      <button 
                        onClick={() => updateComponentContent('videoUrl', '')}
                        className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>

                <hr className={isDarkMode ? 'border-gray-600' : 'border-gray-200'} />

                <h4 className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>Өнгө</h4>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    ['Арын өнгө', 'backgroundColor'],
                    ['Текст өнгө', 'textColor'],
                    ['Гарчиг өнгө', 'headingColor'],
                    ['Товчны дэвсгэр', 'buttonBackgroundColor'],
                    ['Товчны текст', 'buttonTextColor'],
                    ['Холбоос өнгө', 'linkColor'],
                    ['Хүрээний өнгө', 'borderColor'],
                  ].map(([label, key]) => (
                    <ColorPicker
                      key={key as string}
                      label={label as string}
                      value={editingComponent.styles[key as keyof ComponentStyles] as string}
                      onChange={(val) => updateComponentStyle(key as keyof ComponentStyles, val)}
                    />
                  ))}
                </div>

                <hr className={isDarkMode ? 'border-gray-600' : 'border-gray-200'} />

                <h4 className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>Зай</h4>
                {[
                  ['Дотор зай', 'padding', 100],
                  ['Гадаад зай', 'margin', 50],
                  ['Хүрээний радиус', 'borderRadius', 30],
                ].map(([label, key, max]) => (
                  <div key={key as string}>
                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {label}: {editingComponent.styles[key as keyof ComponentStyles]}px
                    </label>
                    <input type="range" min="0" max={max} value={editingComponent.styles[key as keyof ComponentStyles] as number} onChange={(e) => updateComponentStyle(key as keyof ComponentStyles, parseInt(e.target.value))} className="w-full" />
                  </div>
                ))}

                <hr className={isDarkMode ? 'border-gray-600' : 'border-gray-200'} />

                <h4 className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>Хэмжээ (Resize)</h4>
                <div className="space-y-3">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Өргөн</label>
                    <select
                      value={editingComponent.styles.width || '100%'}
                      onChange={(e) => updateComponentStyle('width', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg text-sm ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                    >
                      <option value="100%">100% (Бүтэн)</option>
                      <option value="75%">75%</option>
                      <option value="50%">50% (Хагас)</option>
                      <option value="33%">33%</option>
                      <option value="25%">25%</option>
                      <option value="auto">Авто</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Өндөр</label>
                    <select
                      value={editingComponent.styles.height || 'auto'}
                      onChange={(e) => updateComponentStyle('height', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg text-sm ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                    >
                      <option value="auto">Авто</option>
                      <option value="200px">200px</option>
                      <option value="300px">300px</option>
                      <option value="400px">400px</option>
                      <option value="500px">500px</option>
                      <option value="600px">600px</option>
                      <option value="100vh">100% viewport</option>
                      <option value="50vh">50% viewport</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Хамгийн бага өндөр</label>
                    <input
                      type="text"
                      value={editingComponent.styles.minHeight || ''}
                      onChange={(e) => updateComponentStyle('minHeight', e.target.value)}
                      placeholder="Жишээ: 200px"
                      className={`w-full px-3 py-2 border rounded-lg text-sm ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Хамгийн их өргөн</label>
                    <input
                      type="text"
                      value={editingComponent.styles.maxWidth || ''}
                      onChange={(e) => updateComponentStyle('maxWidth', e.target.value)}
                      placeholder="Жишээ: 1200px"
                      className={`w-full px-3 py-2 border rounded-lg text-sm ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                    />
                  </div>
                </div>

                <hr className={isDarkMode ? 'border-gray-600' : 'border-gray-200'} />

                <h4 className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>Хуудасын дэвсгэр</h4>
                <div className="space-y-3">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Арын зураг</label>
                    
                    {/* Add Background Image Button */}
                    <button 
                      onClick={() => setIsBgImageModalOpen(true)}
                      className={`w-full py-3 rounded-lg text-sm font-medium border-2 border-dashed transition-colors ${
                        isDarkMode 
                          ? 'border-gray-600 text-gray-300 hover:border-blue-500 hover:text-blue-400' 
                          : 'border-gray-300 text-gray-600 hover:border-blue-500 hover:text-blue-500'
                      }`}
                    >
                      <Image className="w-5 h-5 mx-auto mb-1" />
                      {activePage.backgroundImage ? 'Арын зураг өөрчлөх' : 'Арын зураг нэмэх'}
                    </button>
                    
                    {/* Background Image Preview */}
                    {activePage.backgroundImage && (
                      <div className="mt-2 relative rounded-lg overflow-hidden">
                        <img src={activePage.backgroundImage} alt="Background" className="w-full h-24 object-cover" />
                        <button 
                          onClick={() => setPages(prev => prev.map(page => page.id === activePageId ? { ...page, backgroundImage: undefined } : page))}
                          className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {/* Background Image Modal */}
                  {isBgImageModalOpen && createPortal(
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" style={{ zIndex: 2147483647 }}>
                      <div className={`w-full max-w-md rounded-lg p-6 shadow-2xl ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`} style={{ maxHeight: '90vh', overflow: 'auto' }}>
                        <div className="flex justify-between items-center mb-4">
                          <h3 className={`font-semibold text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Арын зураг нэмэх</h3>
                          <button onClick={closeBgImageModal} className="text-gray-500 hover:text-gray-700">
                            <X className="w-5 h-5" />
                          </button>
                        </div>

                        <div className="space-y-4">
                          {/* File Upload Area */}
                          <div 
                            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                              isDarkMode 
                                ? 'border-gray-600 hover:border-gray-500' 
                                : 'border-gray-300 hover:border-gray-400'
                            }`}
                            onClick={() => document.getElementById('bg-file-upload')?.click()}
                          >
                            <input
                              id="bg-file-upload"
                              type="file"
                              accept="image/*"
                              onChange={handleBgFileUpload}
                              className="hidden"
                            />
                            {bgImagePreview ? (
                              <img src={bgImagePreview} alt="Preview" className="max-h-32 mx-auto rounded" />
                            ) : (
                              <>
                                <Image className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                  Файл сонгох эсвэл энд чирнэ үү
                                </p>
                                <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                  JPG, PNG дэмжигдэнэ
                                </p>
                              </>
                            )}
                          </div>

                          {/* Or Divider */}
                          <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                              <div className={`w-full border-t ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`} />
                            </div>
                            <div className="relative flex justify-center text-sm">
                              <span className={`px-2 ${isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-white text-gray-500'}`}>эсвэл</span>
                            </div>
                          </div>

                          {/* URL Input */}
                          <div>
                            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              Зургийн URL
                            </label>
                            <input 
                              type="text" 
                              value={newBgImageUrl} 
                              onChange={(e) => setNewBgImageUrl(e.target.value)} 
                              className={`w-full px-3 py-2 border rounded-lg text-sm ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                              placeholder="https://example.com/background.jpg"
                            />
                          </div>

                          {/* Action Buttons */}
                          <div className="flex space-x-2 pt-2">
                            <button 
                              onClick={closeBgImageModal}
                              className={`flex-1 py-2 rounded-lg text-sm font-medium ${isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                            >
                              Болих
                            </button>
                            <button 
                              onClick={addBackgroundImage}
                              disabled={!newBgImageUrl.trim() && !bgImagePreview}
                              className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Нэмэх
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>,
                    document.body
                  )}

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Арын видео URL (YouTube)</label>
                    <input
                      type="text"
                      value={activePage.backgroundVideo || ''}
                      onChange={(e) => {
                        const newBgVideo = e.target.value
                        setPages(prev => prev.map(page => 
                          page.id === activePageId 
                            ? { ...page, backgroundVideo: newBgVideo }
                            : page
                        ))
                      }}
                      placeholder="https://youtube.com/watch?v=..."
                      className={`w-full px-3 py-2 border rounded-lg text-sm ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Арын хэмжээ</label>
                    <select
                      value={activePage.backgroundSize || 'cover'}
                      onChange={(e) => {
                        const newSize = e.target.value as 'cover' | 'contain' | 'half'
                        setPages(prev => prev.map(page => 
                          page.id === activePageId 
                            ? { ...page, backgroundSize: newSize }
                            : page
                        ))
                      }}
                      className={`w-full px-3 py-2 border rounded-lg text-sm ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                    >
                      <option value="cover">Бүтэн хаах (Cover)</option>
                      <option value="contain">Багтаах (Contain)</option>
                      <option value="half">Хагас хуудас (Half)</option>
                    </select>
                  </div>
                  
                </div>

                <div className="flex space-x-2 pt-4">
                  <button 
                    onClick={cancelComponentEdit} 
                    className={`flex-1 py-2 rounded-lg font-medium ${isDarkMode ? 'bg-red-900 text-red-200 hover:bg-red-800' : 'bg-red-100 text-red-600 hover:bg-red-200'}`}
                  >
                    Болих
                  </button>
                  <button 
                    onClick={saveComponentEdit} 
                    className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Хадгалах
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

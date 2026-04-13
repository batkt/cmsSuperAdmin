'use client'

import { useState, useEffect, useRef } from 'react'
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
import {
  Plus, Trash2, GripVertical, Type, LayoutGrid, CreditCard, Monitor, Square,
  ArrowUp, Grid3X3, Briefcase, MessageSquare, X, Check, Edit3, FileText,
  Maximize2, ChevronDown, ChevronRight, Terminal, Search, MoreHorizontal,
  Image as ImageIcon, GripHorizontal, Video as VideoIcon, Newspaper, Home,
  CheckCircle2, Loader2,
} from 'lucide-react'
import { CMSAPI } from '@/lib/cms-api'
import { componentApi, projectApi } from '@/lib/api-service'
import DraggableSection, { SectionContainer, SectionType } from './DraggableSection'

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
  buttonLink?: string
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
  // Draggable sections for visual editing
  sections?: Array<{
    id: string
    type: 'text' | 'image' | 'button' | 'container'
    position: { x: number; y: number }
    size: { width: number; height: number }
    content?: string
    style?: Record<string, any>
  }>
  // Logo
  logoUrl?: string
  logoPosition?: { x: number; y: number }
  // Background image for component
  backgroundImage?: string
  // News items
  newsItems?: Array<{
    id: string
    title: string
    excerpt: string
    date: string
    category: string
    imageUrl?: string
  }>
  // Rental items
  rentalItems?: Array<{
    id: string
    title: string
    location: string
    price: number
    priceType: 'monthly' | 'daily'
    bedrooms: number
    area: number
    imageUrl?: string
  }>
  // Job items
  jobItems?: Array<{
    id: string
    title: string
    company: string
    location: string
    salaryMin: number
    salaryMax: number
    type: 'full-time' | 'part-time' | 'contract'
    category: string
  }>
}

interface Component {
  id: string
  type: string
  content: ComponentContent
  styles: ComponentStyles
  _isExisting?: boolean
}

interface Page {
  id: string
  name: string
  path: string
  components: Component[]
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
  onUpdateContent?: (id: string, key: string, value: any) => void
  onUpdateStyle?: (id: string, key: string, value: any) => void
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

const availableComponents = [
  { type: 'header', label: 'Толгой хэсэг', icon: Monitor },
  { type: 'hero', label: 'Нүүр хэсэг (Hero)', icon: Square },
  { type: 'about', label: 'Бидний тухай', icon: Type },
  { type: 'service', label: 'Үйлчилгээ', icon: LayoutGrid },
  { type: 'contact', label: 'Холбогдох', icon: CreditCard },
  { type: 'footer', label: 'Хөл хэсэг', icon: Monitor },
  { type: 'card', label: 'Карт', icon: CreditCard },
  { type: 'text', label: 'Текст', icon: Type },
  { type: 'grid', label: 'Grid', icon: Grid3X3 },
  { type: 'news', label: 'Мэдээ мэдээлэл', icon: Newspaper },
  { type: 'rental', label: 'Борлуулалтын зар', icon: Home },
  { type: 'jobs', label: 'Ажлын зар', icon: Briefcase },
  { type: 'contactform', label: 'Холбоо барих форм', icon: CreditCard },
  { type: 'chatbot', label: 'Чатбот', icon: MessageSquare },
]

function DraggableComponent({
  component,
  onEdit,
  onDelete,
  onUpdateContent,
  onUpdateStyle,
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

  const [isResizing, setIsResizing] = useState(false)
  const [currentHeight, setCurrentHeight] = useState(component.styles.height || 'auto')
  const heightRef = useRef(currentHeight)

  useEffect(() => {
    const newHeight = component.styles.height || 'auto'
    setCurrentHeight(newHeight)
    heightRef.current = newHeight
  }, [component.styles.height])

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsResizing(true)

    const startY = e.clientY
    const startHeight = parseInt(heightRef.current as string) || 200
    let finalHeight = startHeight

    const handleResizeMove = (moveEvent: MouseEvent) => {
      const deltaY = moveEvent.clientY - startY
      finalHeight = Math.max(100, startHeight + deltaY)
      setCurrentHeight(`${finalHeight}px`)
    }

    const handleResizeEnd = () => {
      setIsResizing(false)
      heightRef.current = `${finalHeight}px`
      if (onUpdateStyle) {
        onUpdateStyle(component.id, 'height', `${finalHeight}px`)
      }
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
    overflow: 'hidden',
    boxSizing: 'border-box' as const,
  }

  const buttonStyle = {
    backgroundColor: getColorValue(component.styles.buttonBackgroundColor),
    color: getColorValue(component.styles.buttonTextColor),
  }

  const linkStyle = { color: getColorValue(component.styles.linkColor) }
  const headingStyle = { color: getColorValue(component.styles.headingColor) }

  const renderComponent = () => {
    // We use DraggableSection for components that have sections
    if (component.content.sections) {
      const sections = component.content.sections

      const handleSectionUpdate = (id: string, updates: Partial<SectionType>) => {
        if (onUpdateContent) {
          const updatedSections = sections.map(s => s.id === id ? { ...s, ...updates } : s)
          onUpdateContent(component.id, 'sections', updatedSections)
        }
      }

      const handleSectionDelete = (id: string) => {
        if (onUpdateContent) {
          const updatedSections = sections.filter(s => s.id !== id)
          onUpdateContent(component.id, 'sections', updatedSections)
        }
      }

      const handleSectionDuplicate = (section: SectionType) => {
        if (onUpdateContent) {
          const newSection = {
            ...section,
            id: Date.now().toString(),
            position: { x: section.position.x + 20, y: section.position.y + 20 }
          }
          onUpdateContent(component.id, 'sections', [...sections, newSection])
        }
      }

      const handleAddSection = (sectionType: 'text' | 'image' | 'button') => {
        if (onUpdateContent) {
          const newSection: SectionType = {
            id: Date.now().toString(),
            type: sectionType,
            position: { x: 50, y: 50 },
            size: { width: sectionType === 'button' ? 120 : 200, height: sectionType === 'button' ? 45 : sectionType === 'text' ? 60 : 150 }
          }
          onUpdateContent(component.id, 'sections', [...sections, newSection])
        }
      }

      return (
        <SectionContainer style={componentStyle}>
          {sections.map((section) => (
            <DraggableSection
              key={section.id}
              section={section}
              onUpdate={handleSectionUpdate}
              onDelete={handleSectionDelete}
              onDuplicate={handleSectionDuplicate}
            />
          ))}
          <div className="absolute bottom-4 left-4 flex gap-2 flex-wrap opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => handleAddSection('text')} className="px-3 py-1.5 bg-blue-500 text-white text-xs rounded-lg hover:bg-blue-600 flex items-center gap-1"><Type className="w-3 h-3" />Текст</button>
            <button onClick={() => handleAddSection('image')} className="px-3 py-1.5 bg-emerald-500 text-white text-xs rounded-lg hover:bg-emerald-600 flex items-center gap-1"><ImageIcon className="w-3 h-3" />Зураг</button>
            <button onClick={() => handleAddSection('button')} className="px-3 py-1.5 bg-purple-500 text-white text-xs rounded-lg hover:bg-purple-600 flex items-center gap-1"><Square className="w-3 h-3" />Товч</button>
          </div>
        </SectionContainer>
      )
    }

    // Fallback for legacy components (cards, news, etc.)
    switch (component.type) {
      case 'card':
        return (
          <div style={componentStyle}>
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" style={{ gap: '16px' }}>
                {(component.content.cards || []).map((card) => (
                  <div key={card.id} className="p-4 rounded-lg border-2" style={{ backgroundColor: 'white', borderColor: '#eee' }}>
                    {card.imageUrl && <img src={card.imageUrl} alt={card.title} className="w-full h-32 object-cover rounded mb-3" />}
                    <h3 className="font-bold mb-2" style={headingStyle}>{card.title}</h3>
                    <p className="text-sm text-gray-600">{card.description}</p>
                  </div>
                ))}
              </div>
          </div>
        )
      case 'chatbot':
         return (
           <div style={componentStyle} className="flex flex-col items-center justify-center border-2 border-dashed border-blue-200 rounded-xl bg-blue-50/30">
             <MessageSquare className="w-8 h-8 text-blue-400 mb-2" />
             <p className="text-blue-600 font-medium">Чатбот</p>
             <p className="text-blue-400 text-xs text-center px-4">Вэбсайтын доор байрлах чатын товчлуур</p>
           </div>
         )
      default:
        return (
          <div style={componentStyle} className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl py-12">
            <LayoutGrid className="w-8 h-8 text-slate-300 mb-2" />
            <p className="text-slate-400 text-sm">{component.type.toUpperCase()} хэсэг</p>
            <p className="text-slate-300 text-xs">Тохиргоо оруулахыг хүлээнэ үү</p>
          </div>
        )
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
      onClick={() => onSelect(component.id)}
    >
      <div className={`border-2 rounded-lg transition-colors overflow-hidden ${isSelected ? 'border-blue-500 shadow-lg' : 'border-dashed border-gray-300 hover:border-blue-400'} relative`}
        style={{
          height: component.styles.height || 'auto',
          minHeight: component.styles.minHeight || 'auto'
        }}
      >
        <div className="flex justify-between items-start mb-2 opacity-0 group-hover:opacity-100 transition-opacity absolute -top-3 -right-3 z-50 space-x-1">
          <button {...attributes} {...listeners} className="p-2 bg-white shadow-md hover:bg-gray-100 rounded-full text-xs font-bold border border-gray-100">
            <GripVertical className="w-4 h-4 text-gray-600" />
          </button>
          <button onClick={() => onDelete(component.id)} className="p-2 bg-white shadow-md hover:bg-red-50 rounded-full text-red-600 text-xs font-bold border border-gray-100">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
        
        {renderComponent()}

        {/* Height Resize Handle */}
        <div
          onMouseDown={handleResizeStart}
          className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-1.5 bg-blue-500/20 rounded-full cursor-ns-resize opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-500 z-50"
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
  apiUrl: string
  token: string
  initialProjectName?: string
}

export default function WebsiteBuilder({ websiteName, isDarkMode, template, apiUrl, token, initialProjectName }: WebsiteBuilderProps) {
  const [pages, setPages] = useState<Page[]>([])
  const [activePageId, setActivePageId] = useState<string>('home')
  const [activeId, setActiveId] = useState<string | null>(null)
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null)
  
  const [projectName, setProjectName] = useState(initialProjectName || 'Нийтлэх')
  const [isAddingPage, setIsAddingPage] = useState(false)
  const [newPageName, setNewPageName] = useState('')
  const [editingPageId, setEditingPageId] = useState<string | null>(null)
  const [editingPageName, setEditingPageName] = useState('')
  
  const [isSaving, setIsSaving] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [publishStatus, setPublishStatus] = useState<{ url?: string, port?: number, message?: string } | null>(null)
  const [logs, setLogs] = useState<string[]>([])
  const [showLogs, setShowLogs] = useState(false)
  
  const [isBgImageModalOpen, setIsBgImageModalOpen] = useState(false)
  const [newBgImageUrl, setNewBgImageUrl] = useState('')
  const [bgImagePreview, setBgImagePreview] = useState<string | null>(null)
  
  const [editingComponent, setEditingComponent] = useState<Component | null>(null)
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)
  const [newImageUrl, setNewImageUrl] = useState('')
  const [newImageAlt, setNewImageAlt] = useState('')
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const logsEndRef = useRef<HTMLDivElement>(null)
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const activePage = pages.find(p => p.id === activePageId) || pages[0] || {
    id: 'home',
    name: 'Home',
    path: '/',
    components: []
  }

  // --- Helper Functions (Defined before usage in useEffect) ---

  const createTemplateComponent = (type: string): Component => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 5)
    
    // Default base structure
    const base: Component = {
      id,
      type,
      content: { sections: [] },
      styles: { ...defaultStyles }
    }

    // Draggable Template Configurations
    switch (type) {
      case 'header':
        base.styles = { ...base.styles, height: '80px', backgroundColor: 'white' }
        base.content.sections = [
          { id: 'h1', type: 'image', position: { x: 20, y: 15 }, size: { width: 50, height: 50 } },
          { id: 'h2', type: 'text', position: { x: 80, y: 25 }, size: { width: 200, height: 30 }, content: websiteName }
        ]
        break
      case 'hero':
        base.styles = { ...base.styles, height: '500px', backgroundColor: 'slate-900', textColor: 'white' }
        base.content.sections = [
          { id: 'he1', type: 'text', position: { x: 100, y: 150 }, size: { width: 600, height: 60 }, content: `Welcome to ${websiteName}` },
          { id: 'he2', type: 'text', position: { x: 100, y: 220 }, size: { width: 500, height: 40 }, content: 'Start building something amazing today with our interactive editor.' },
          { id: 'he3', type: 'button', position: { x: 100, y: 300 }, size: { width: 160, height: 50 }, content: 'Get Started' }
        ]
        break
      case 'about':
        base.styles = { ...base.styles, height: '450px', backgroundColor: 'white' }
        base.content.sections = [
          { id: 'a1', type: 'text', position: { x: 500, y: 100 }, size: { width: 450, height: 50 }, content: 'ABOUT OUR COMPANY' },
          { id: 'a2', type: 'text', position: { x: 500, y: 160 }, size: { width: 450, height: 150 }, content: 'We are dedicated to providing the best web solutions for your business growth and online presence.' },
          { id: 'a3', type: 'image', position: { x: 50, y: 50 }, size: { width: 400, height: 350 } }
        ]
        break
      case 'service':
        base.styles = { ...base.styles, height: '400px', backgroundColor: 'slate-50' }
        base.content.sections = [
          { id: 's1', type: 'text', position: { x: 350, y: 40 }, size: { width: 300, height: 40 }, content: 'OUR SERVICES' },
          { id: 's2', type: 'image', position: { x: 100, y: 120 }, size: { width: 250, height: 180 } },
          { id: 's3', type: 'image', position: { x: 375, y: 120 }, size: { width: 250, height: 180 } },
          { id: 's4', type: 'image', position: { x: 650, y: 120 }, size: { width: 250, height: 180 } }
        ]
        break
      case 'contact':
        base.styles = { ...base.styles, height: '500px', backgroundColor: 'white' }
        base.content.sections = [
          { id: 'c1', type: 'text', position: { x: 80, y: 100 }, size: { width: 350, height: 40 }, content: 'CONTACT US' },
          { id: 'c2', type: 'text', position: { x: 80, y: 160 }, size: { width: 350, height: 60 }, content: 'Feel free to reach out for consultations.' },
          { id: 'c3', type: 'text', position: { x: 80, y: 240 }, size: { width: 250, height: 30 }, content: 'Email: support@example.mn' },
          { id: 'c4', type: 'text', position: { x: 80, y: 280 }, size: { width: 250, height: 30 }, content: 'Phone: +976 7000 1111' },
          { id: 'c5', type: 'image', position: { x: 500, y: 50 }, size: { width: 450, height: 350 } }
        ]
        break
      case 'footer':
        base.styles = { ...base.styles, height: '200px', backgroundColor: 'slate-900', textColor: 'slate-400' }
        base.content.sections = [
          { id: 'f1', type: 'text', position: { x: 50, y: 50 }, size: { width: 150, height: 30 }, content: websiteName },
          { id: 'f2', type: 'text', position: { x: 50, y: 100 }, size: { width: 300, height: 40 }, content: `© 2026 ${websiteName}. All rights reserved.` }
        ]
        break
      case 'news':
        base.styles = { ...base.styles, height: '400px', backgroundColor: 'white' }
        base.content.sections = [
          { id: 'n1', type: 'text', position: { x: 350, y: 30 }, size: { width: 300, height: 40 }, content: 'LATEST NEWS' },
          { id: 'n2', type: 'image', position: { x: 50, y: 100 }, size: { width: 280, height: 180 } },
          { id: 'n3', type: 'text', position: { x: 50, y: 290 }, size: { width: 280, height: 50 }, content: 'Important update from the company' },
          { id: 'n4', type: 'image', position: { x: 360, y: 100 }, size: { width: 280, height: 180 } },
          { id: 'n5', type: 'text', position: { x: 360, y: 290 }, size: { width: 280, height: 50 }, content: 'New features released in v2.0' },
          { id: 'n6', type: 'image', position: { x: 670, y: 100 }, size: { width: 280, height: 180 } },
          { id: 'n7', type: 'text', position: { x: 670, y: 290 }, size: { width: 280, height: 50 }, content: 'Community highlight: Builders of the month' }
        ]
        break
      case 'rental':
        base.styles = { ...base.styles, height: '550px', backgroundColor: 'slate-50' }
        base.content.sections = [
          { id: 'r1', type: 'text', position: { x: 350, y: 30 }, size: { width: 300, height: 40 }, content: 'FEATURED PROPERTIES' },
          { id: 'r2', type: 'image', position: { x: 80, y: 100 }, size: { width: 400, height: 300 } },
          { id: 'r3', type: 'text', position: { x: 520, y: 100 }, size: { width: 400, height: 40 }, content: 'Luxury 3BR Apartment in Ulaanbaatar' },
          { id: 'r4', type: 'text', position: { x: 520, y: 150 }, size: { width: 400, height: 100 }, content: 'Modern living at its best. Close to schools, parks, and downtown.' },
          { id: 'r5', type: 'text', position: { x: 520, y: 260 }, size: { width: 200, height: 30 }, content: 'Price: ₮2,500,000 / month' },
          { id: 'r6', type: 'button', position: { x: 520, y: 320 }, size: { width: 150, height: 45 }, content: 'View Details' }
        ]
        break
      case 'jobs':
        base.styles = { ...base.styles, height: '600px', backgroundColor: 'white' }
        base.content.sections = [
          { id: 'j1', type: 'text', position: { x: 350, y: 30 }, size: { width: 300, height: 40 }, content: 'OPEN POSITIONS' },
          { id: 'j2', type: 'text', position: { x: 100, y: 100 }, size: { width: 800, height: 80 }, content: 'Software Engineer - Full Stack (Remote)' },
          { id: 'j3', type: 'button', position: { x: 800, y: 115 }, size: { width: 100, height: 40 }, content: 'Apply' },
          { id: 'j4', type: 'text', position: { x: 100, y: 200 }, size: { width: 800, height: 80 }, content: 'Product Designer (UI/UX) - Junior/Mid' },
          { id: 'j5', type: 'button', position: { x: 800, y: 215 }, size: { width: 100, height: 40 }, content: 'Apply' },
          { id: 'j6', type: 'text', position: { x: 100, y: 300 }, size: { width: 800, height: 80 }, content: 'Marketing Specialist - Growth' },
          { id: 'j7', type: 'button', position: { x: 800, y: 315 }, size: { width: 100, height: 40 }, content: 'Apply' }
        ]
        break
      default:
        // Minimal defaults for other types
        base.styles = { ...base.styles, height: '200px', backgroundColor: 'white' }
        base.content.sections = [
          { id: 'd1', type: 'text', position: { x: 50, y: 50 }, size: { width: 400, height: 100 }, content: `New ${type} component` }
        ]
        break
    }
    
    return base
  }

  const addComponent = (type: string) => {
    const newComp = createTemplateComponent(type)
    setPages(prev => prev.map(page => {
      if (page.id !== activePageId) return page
      return { ...page, components: [...page.components, newComp] }
    }))
    setSelectedComponentId(newComp.id)
  }

  const addPage = (id?: string, name?: string, path?: string, withDefaultContent = false) => {
    const pageId = id || Date.now().toString()
    const pageName = name || newPageName
    const pagePath = path || (pageName ? `/${pageName.toLowerCase().replace(/\s+/g, '-')}` : '/')

    if (!pageName && !id) return

    let pageComponents: Component[] = []
    if (withDefaultContent) {
      pageComponents = [
        createTemplateComponent('header'),
        createTemplateComponent('hero'),
        createTemplateComponent('footer')
      ]
    }

    const newPage: Page = {
      id: pageId,
      name: pageName || 'Home',
      path: pagePath,
      components: pageComponents
    }

    setPages(prev => [...prev, newPage])
    setActivePageId(newPage.id)
    setNewPageName('')
    setIsAddingPage(false)
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

  const loadExistingProject = async (name: string) => {
    try {
      const response = await fetch(`/api/proxy/api/v2/core/components?projectId=${encodeURIComponent(name)}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) throw new Error('Load failed')

      const data = await response.json()
      const rawComponents = data.data?.components || []

      if (rawComponents.length === 0) {
        addPage('home', 'Home', '/', true)
        return
      }

      const pagesMap = new Map<string, Page>()
      rawComponents.forEach((comp: any) => {
        const route = comp.pageRoute || '/'
        const pageId = route.replace(/\//g, '') || 'home'
        
        if (!pagesMap.has(route)) {
          pagesMap.set(route, {
            id: pageId,
            name: route === '/' ? 'Home' : route.replace(/\//g, '').charAt(0).toUpperCase() + route.slice(1),
            path: route,
            components: []
          })
        }
        
        const page = pagesMap.get(route)!
        page.components.push({
          id: comp.instanceId || Math.random().toString(),
          type: comp.componentType?.toLowerCase() || 'home',
          content: comp.props || {},
          styles: comp.content?.styles || defaultStyles,
          _isExisting: true
        })
      })

      const loadedPages = Array.from(pagesMap.values())
      setPages(loadedPages)
      setActivePageId(loadedPages[0]?.id || 'home')
    } catch (err) {
      console.error('Load Error:', err)
      addPage('home', 'Home', '/', true)
    }
  }

  const loadTemplate = (data: any) => {
    if (data?.pages) {
      setPages(data.pages)
      setActivePageId(data.pages[0]?.id || 'home')
    }
  }

  useEffect(() => {
    if (template) {
      loadTemplate(template)
    } else if (initialProjectName) {
      loadExistingProject(initialProjectName)
    } else {
      addPage('home', 'Home', '/', true)
    }
  }, [template, initialProjectName])

  // --- Handlers ---

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

  const handleUpdateContent = (compId: string, key: string, value: any) => {
    setPages(prev => prev.map(page => ({
      ...page,
      components: page.components.map(c => c.id === compId ? { ...c, content: { ...c.content, [key]: value } } : c)
    })))
  }

  const handleUpdateStyle = (compId: string, key: string, value: any) => {
    setPages(prev => prev.map(page => ({
      ...page,
      components: page.components.map(c => c.id === compId ? { ...c, styles: { ...c.styles, [key]: value } } : c)
    })))
  }

  const deleteComponent = (id: string) => {
    setPages(prev => prev.map(page => ({
      ...page,
      components: page.components.filter(c => c.id !== id)
    })))
    if (selectedComponentId === id) setSelectedComponentId(null)
  }

  const editComponent = (id: string) => {
    const comp = activePage.components.find(c => c.id === id)
    if (comp) setEditingComponent({ ...comp })
  }

  const saveComponentEdit = () => {
    if (editingComponent) {
      setPages(prev => prev.map(page => ({
        ...page,
        components: page.components.map(c => c.id === editingComponent.id ? editingComponent : c)
      })))
      setEditingComponent(null)
    }
  }

  const updateComponentContent = (key: string, value: any) => {
    if (editingComponent) {
      setEditingComponent({ ...editingComponent, content: { ...editingComponent.content, [key]: value } })
    }
  }

  const updateComponentStyle = (key: string, value: any) => {
    if (editingComponent) {
      setEditingComponent({ ...editingComponent, styles: { ...editingComponent.styles, [key]: value } })
    }
  }

  const handleSave = async () => {
    if (isSaving) return
    setIsSaving(true)
    try {
      const cleanProjectName = projectName.trim()
      if (!cleanProjectName) return alert('Project name required')

      // 1. Save all component instances
      const instances = pages.flatMap(page => 
        page.components.map((comp, idx) => ({
          instanceId: comp.id,
          componentType: comp.type,
          pageRoute: page.path,
          order: idx,
          props: comp.content,
          content: { styles: comp.styles },
          _isExisting: comp._isExisting
        }))
      )

      await Promise.all(instances.map(instance => {
        if (instance._isExisting) {
          return componentApi.patch(cleanProjectName, instance.instanceId, instance)
        }
        return componentApi.create(cleanProjectName, instance)
      }))

      // 2. Save the overall Design structure
      const design = {
        projectName: cleanProjectName,
        domain: `${cleanProjectName.toLowerCase().replace(/\s+/g, '-')}.localhost`,
        theme: {
          primaryColor: getColorValue(defaultStyles.buttonBackgroundColor) || '#2563eb',
          secondaryColor: getColorValue(colorPalette.slate[900]) || '#0f172a',
          fontFamily: 'Inter',
          darkMode: isDarkMode,
          customTokens: {
            heroBackground: 'linear-gradient(135deg,#0f172a,#1e3a8a)',
            buttonRadius: '14px',
            cardShadow: '0 20px 45px rgba(2,6,23,0.18)'
          }
        },
        pages: pages.map(page => ({
          route: page.path,
          title: page.name,
          description: page.name === 'Home' ? 'Landing and conversion' : 'Page content',
          components: page.components.map((comp, idx) => ({
            type: comp.type.charAt(0).toUpperCase() + comp.type.slice(1),
            props: { ...comp.content, styles: comp.styles },
            order: idx
          }))
        }))
      }

      await CMSAPI.Design.saveDesign(design)

      // Mark all as existing after successful save
      setPages(prev => prev.map(p => ({
        ...p,
        components: p.components.map(c => ({ ...c, _isExisting: true }))
      })))

      alert('Амжилттай хадгалагдлаа!')
    } catch (err) {
      console.error(err)
      alert('Хадгалахад алдаа гарлаа: ' + (err as Error).message)
    } finally {
      setIsSaving(false)
    }
  }

  const handlePublish = async () => {
    if (isPublishing) return
    if (!confirm('Нийтлэх үү?')) return
    
    setIsPublishing(true)
    try {
      const cleanName = projectName.trim()
      if (!cleanName) return alert('Project name required')

      const data = await CMSAPI.Project.generateSite(cleanName)
      if (data.success) {
        setPublishStatus({ url: data.url, port: data.port })
        alert('Амжилттай нийтлэгдлээ!')
      } else {
        alert('Нийтлэхэд алдаа гарлаа: ' + (data.message || 'Unknown error'))
      }
    } catch (err) {
      console.error(err)
      alert('Нийтлэхэд алдаа гарлаа: ' + (err as Error).message)
    } finally {
      setIsPublishing(false)
    }
  }

  // Color Picker Helper Component
  const ColorPicker = ({ label, value, onChange }: any) => (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] font-medium text-slate-500 uppercase">{label}</label>
      <div className="flex gap-2 items-center">
        <input 
          type="color" 
          value={getColorValue(value)} 
          onChange={e => onChange(e.target.value)}
          className="w-8 h-8 rounded p-0 border-0 cursor-pointer overflow-hidden" 
        />
        <input 
          type="text" 
          value={value} 
          onChange={e => onChange(e.target.value)}
          className="flex-1 text-xs p-1.5 border rounded bg-slate-50 outline-none focus:border-blue-400"
        />
      </div>
    </div>
  )

  const dm = isDarkMode

  return (
    <div className={`p-4 flex flex-col h-full min-h-screen ${dm ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* Top Toolbar */}
      <div className={`flex items-center gap-4 px-6 py-3 shrink-0 rounded-2xl mb-4 shadow-sm ${dm ? 'bg-slate-900 border border-slate-800' : 'bg-white border border-slate-200'}`}>
        <div className="flex items-center gap-2 mr-4">
          <LayoutGrid className="w-5 h-5 text-blue-500" />
          <input 
            value={projectName} 
            onChange={e => setProjectName(e.target.value)}
            className="bg-transparent font-bold border-none focus:ring-0 w-32"
          />
        </div>

        {/* Pages */}
        <div className="flex items-center gap-1 flex-1 overflow-x-auto">
          {pages.map(p => (
            <button 
              key={p.id}
              onClick={() => setActivePageId(p.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${activePageId === p.id 
                ? 'bg-blue-500 text-white' 
                : dm ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-600'}`}
            >
              {p.name}
            </button>
          ))}
          <button onClick={() => setIsAddingPage(true)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400">
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={handleSave} 
            disabled={isSaving}
            className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-xs font-bold hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 flex items-center gap-2"
          >
            {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
            Хадгалах
          </button>
          <button 
            onClick={handlePublish} 
            disabled={isPublishing || isSaving} 
            className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/20 flex items-center gap-2"
          >
            {isPublishing ? <Loader2 className="w-3 h-3 animate-spin" /> : <ArrowUp className="w-3 h-3" />}
            Нийтлэх
          </button>
        </div>
      </div>

      <div className="flex flex-1 gap-4 overflow-hidden">
        
        {/* Left: Palette */}
        <aside className={`w-64 shrink-0 rounded-2xl flex flex-col p-4 shadow-sm ${dm ? 'bg-slate-900 border border-slate-800' : 'bg-white border border-slate-200'}`}>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Бүрэлдэхүүн хэсэг</p>
          <div className="grid grid-cols-1 gap-2">
            {availableComponents.map(c => (
              <button 
                key={c.type}
                onClick={() => addComponent(c.type)}
                className={`flex items-center gap-3 p-3 rounded-xl text-sm font-medium transition-all ${dm ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-50 text-slate-600 border border-transparent hover:border-slate-100'}`}
              >
                <c.icon className="w-4 h-4 text-slate-400" />
                {c.label}
              </button>
            ))}
          </div>
        </aside>

        {/* Center: Canvas */}
        <main className="flex-1 overflow-auto rounded-3xl bg-white shadow-2xl shadow-indigo-500/5 relative group p-8">
           <div className="max-w-5xl mx-auto min-h-full">
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                <SortableContext items={activePage.components} strategy={verticalListSortingStrategy}>
                  {activePage.components.map(comp => (
                    <DraggableComponent 
                      key={comp.id}
                      component={comp}
                      onEdit={editComponent}
                      onDelete={deleteComponent}
                      onUpdateContent={handleUpdateContent}
                      onUpdateStyle={handleUpdateStyle}
                      isSelected={selectedComponentId === comp.id}
                      onSelect={setSelectedComponentId}
                      isDarkMode={isDarkMode}
                    />
                  ))}
                </SortableContext>
              </DndContext>
              
              {activePage.components.length === 0 && (
                <div className="flex flex-col items-center justify-center py-32 text-slate-300">
                  <Monitor className="w-12 h-12 mb-4 opacity-20" />
                  <p className="font-medium">Хоосон байна</p>
                  <p className="text-xs">Зүүн талаас хэсэг нэмж эхэлнэ үү</p>
                </div>
              )}
           </div>
        </main>

        {/* Right: Editor */}
        {editingComponent && (
          <aside className={`w-80 shrink-0 rounded-2xl flex flex-col shadow-sm overflow-hidden ${dm ? 'bg-slate-900 border border-slate-800' : 'bg-white border border-slate-200'}`}>
             <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <p className="font-bold text-sm">Тохиргоо</p>
                <button onClick={() => setEditingComponent(null)} className="p-1 hover:bg-slate-100 rounded-lg"><X className="w-4 h-4" /></button>
             </div>
             
             <div className="flex-1 overflow-y-auto p-5 space-y-6">
                <div>
                   <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Загвар</label>
                   <div className="space-y-4">
                      <ColorPicker label="Дэвсгэр өнгө" value={editingComponent.styles.backgroundColor} onChange={(v: string) => updateComponentStyle('backgroundColor', v)} />
                      <ColorPicker label="Текст өнгө" value={editingComponent.styles.textColor} onChange={(v: string) => updateComponentStyle('textColor', v)} />
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-500">Дотор зай</label>
                          <input type="number" value={editingComponent.styles.padding} onChange={e => updateComponentStyle('padding', parseInt(e.target.value))} className="w-full text-xs p-2 border rounded" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-500">Булцгар</label>
                          <input type="number" value={editingComponent.styles.borderRadius} onChange={e => updateComponentStyle('borderRadius', parseInt(e.target.value))} className="w-full text-xs p-2 border rounded" />
                        </div>
                      </div>
                   </div>
                </div>
             </div>
             
             <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex gap-2">
                <button onClick={() => setEditingComponent(null)} className="flex-1 py-1.5 text-xs font-medium border rounded-lg hover:bg-white">Болих</button>
                <button onClick={saveComponentEdit} className="flex-1 py-1.5 text-xs font-bold bg-blue-600 text-white rounded-lg shadow-md shadow-blue-500/20">Хадгалах</button>
             </div>
          </aside>
        )}

      </div>

      {/* Page Modal */}
      {isAddingPage && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
           <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
              <p className="font-bold mb-4">Шинэ хуудас</p>
              <input 
                autoFocus
                value={newPageName}
                onChange={e => setNewPageName(e.target.value)}
                placeholder="Хуудасны нэр"
                className="w-full p-3 border rounded-xl mb-4 text-sm"
              />
              <div className="flex gap-2">
                <button onClick={() => setIsAddingPage(false)} className="flex-1 py-2 text-sm font-medium border rounded-xl">Болих</button>
                <button onClick={() => addPage()} className="flex-1 py-2 text-sm font-bold bg-blue-600 text-white rounded-xl">Үүсгэх</button>
              </div>
           </div>
        </div>
      )}

      {/* Publishing Glass Overlay */}
      {isPublishing && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-md z-[200] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className={`p-8 rounded-3xl shadow-2xl text-center max-w-sm w-full border ${dm ? 'bg-slate-900/80 border-slate-700' : 'bg-white/80 border-white/50'}`}>
            <div className="relative mb-6 mx-auto w-20 h-20">
              <div className="absolute inset-0 rounded-full border-4 border-blue-500/20" />
              <div className="absolute inset-0 rounded-full border-4 border-t-blue-500 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <ArrowUp className="w-8 h-8 text-blue-500 animate-pulse" />
              </div>
            </div>
            <h3 className={`text-xl font-bold mb-2 ${dm ? 'text-white' : 'text-slate-900'}`}>Нийтлэж байна...</h3>
            <p className={`text-sm ${dm ? 'text-slate-400' : 'text-slate-500'}`}>
              Таны вэбсайтыг бэлтгэж, серверт байршуулж байна. Түр хүлээнэ үү.
            </p>
            <div className="mt-8 flex justify-center gap-1">
              {[0, 1, 2].map(i => (
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

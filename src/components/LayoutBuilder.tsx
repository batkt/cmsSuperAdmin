'use client'

import { useState, useCallback } from 'react'
import { 
  LayoutTemplate, Square, Columns, Grid3X3, CreditCard, 
  ArrowUp, ArrowDown, Trash2, Copy, Save, Loader2, Monitor,
  PanelTop, PanelBottom, AlignCenterVertical, AlignHorizontalSpaceAround
} from 'lucide-react'
import { componentApi } from '@/lib/api-service'

// Layout Component Types (like Odoo website builder)
type ComponentType = 
  | 'header' 
  | 'footer' 
  | 'main' 
  | 'article' 
  | 'section' 
  | 'card' 
  | 'grid' 
  | 'twocolumn' 
  | 'container'

interface LayoutComponent {
  id: string
  type: ComponentType
  name: string
  styles: {
    backgroundColor?: string
    padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
    margin?: 'none' | 'sm' | 'md' | 'lg'
    minHeight?: string
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  }
  children?: string[] // nested component IDs
}

interface LayoutBuilderProps {
  projectName: string
  isDarkMode: boolean
  apiUrl: string
  token: string
}

// Component definitions with Mongolian labels
const COMPONENT_TYPES: { type: ComponentType; label: string; icon: any; description: string }[] = [
  { type: 'header', label: 'Толгой', icon: PanelTop, description: 'Вэб хуудсын толгой хэсэг' },
  { type: 'footer', label: 'Хөл', icon: PanelBottom, description: 'Вэб хуудсын хөл хэсэг' },
  { type: 'main', label: 'Үндсэн', icon: Monitor, description: 'Үндсэн агуулгын хэсэг' },
  { type: 'section', label: 'Хэсэг', icon: Square, description: 'Тусгаарлагдсан хэсэг' },
  { type: 'article', label: 'Мэдээ', icon: AlignCenterVertical, description: 'Мэдээний хэсэг' },
  { type: 'card', label: 'Карт', icon: CreditCard, description: 'Карт бүрдэл' },
  { type: 'grid', label: 'Сүлжээ', icon: Grid3X3, description: 'Сүлжээ байрлал' },
  { type: 'twocolumn', label: '2 Багана', icon: Columns, description: 'Хоёр багана' },
  { type: 'container', label: 'Багтаамж', icon: AlignHorizontalSpaceAround, description: 'Багтаамжтай хэсэг' },
]

const COLORS = [
  { name: 'Цагаан', value: '#ffffff', class: 'bg-white' },
  { name: 'Хар', value: '#000000', class: 'bg-black' },
  { name: 'Саарал', value: '#6b7280', class: 'bg-gray-500' },
  { name: 'Улаан', value: '#ef4444', class: 'bg-red-500' },
  { name: 'Улбар шар', value: '#f97316', class: 'bg-orange-500' },
  { name: 'Шар', value: '#eab308', class: 'bg-yellow-500' },
  { name: 'Ногоон', value: '#22c55e', class: 'bg-green-500' },
  { name: 'Хѳх', value: '#3b82f6', class: 'bg-blue-500' },
  { name: 'Хѳѳх', value: '#8b5cf6', class: 'bg-violet-500' },
  { name: 'Ягаан', value: '#ec4899', class: 'bg-pink-500' },
  { name: 'Бараан', value: '#1e293b', class: 'bg-slate-800' },
  { name: 'Хѳлѳг', value: 'transparent', class: 'bg-transparent border-2 border-dashed border-gray-400' },
]

const PADDING_OPTIONS = [
  { value: 'none', label: 'Үгүй', class: 'p-0' },
  { value: 'sm', label: 'Бага', class: 'p-4' },
  { value: 'md', label: 'Дунд', class: 'p-8' },
  { value: 'lg', label: 'Их', class: 'p-12' },
  { value: 'xl', label: 'Маш их', class: 'p-16' },
] as const

const MAX_WIDTH_OPTIONS = [
  { value: 'sm', label: 'Бага', class: 'max-w-2xl' },
  { value: 'md', label: 'Дунд', class: 'max-w-4xl' },
  { value: 'lg', label: 'Их', class: 'max-w-6xl' },
  { value: 'xl', label: 'Маш их', class: 'max-w-7xl' },
  { value: 'full', label: 'Бүтэн', class: 'max-w-full' },
] as const

export default function LayoutBuilder({ projectName, isDarkMode, apiUrl, token }: LayoutBuilderProps) {
  const [components, setComponents] = useState<LayoutComponent[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)

  const selectedComponent = components.find(c => c.id === selectedId)

  // Add new component
  const addComponent = (type: ComponentType) => {
    const newComponent: LayoutComponent = {
      id: Date.now().toString(),
      type,
      name: COMPONENT_TYPES.find(c => c.type === type)?.label || type,
      styles: {
        backgroundColor: 'transparent',
        padding: 'md',
        margin: 'none',
        minHeight: 'auto',
        maxWidth: 'full',
      },
      children: [],
    }
    setComponents([...components, newComponent])
    setSelectedId(newComponent.id)
  }

  // Delete component
  const deleteComponent = (id: string) => {
    setComponents(components.filter(c => c.id !== id))
    if (selectedId === id) setSelectedId(null)
  }

  // Duplicate component
  const duplicateComponent = (component: LayoutComponent) => {
    const newComponent: LayoutComponent = {
      ...component,
      id: Date.now().toString(),
      name: `${component.name} (Хуулбар)`,
    }
    setComponents([...components, newComponent])
    setSelectedId(newComponent.id)
  }

  // Update component style
  const updateStyle = (id: string, key: keyof LayoutComponent['styles'], value: any) => {
    setComponents(components.map(c => 
      c.id === id 
        ? { ...c, styles: { ...c.styles, [key]: value } }
        : c
    ))
  }

  // Move component up/down
  const moveComponent = (id: string, direction: 'up' | 'down') => {
    const index = components.findIndex(c => c.id === id)
    if (index === -1) return
    
    const newComponents = [...components]
    if (direction === 'up' && index > 0) {
      [newComponents[index], newComponents[index - 1]] = [newComponents[index - 1], newComponents[index]]
    } else if (direction === 'down' && index < newComponents.length - 1) {
      [newComponents[index], newComponents[index + 1]] = [newComponents[index + 1], newComponents[index]]
    }
    setComponents(newComponents)
  }

  // Save to API
  const saveToAPI = async () => {
    setIsSaving(true)
    try {
      // Convert layout to component format
      const layoutData = components.map((comp, index) => ({
        componentType: comp.type,
        pageRoute: '/',
        order: index,
        props: {
          ...comp.styles,
        },
      }))
      
      // Save each component
      for (const data of layoutData) {
        await componentApi.create(projectName, data)
      }
      
      alert('Бүтэц хадгалагдлаа!')
    } catch (err: any) {
      alert('Алдаа: ' + err.message)
    } finally {
      setIsSaving(false)
    }
  }

  // Get visual representation for component type
  const getComponentVisual = (component: LayoutComponent) => {
    const baseClasses = `relative border-2 border-dashed rounded-lg transition-all cursor-pointer hover:border-blue-400 ${
      selectedId === component.id ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-gray-400'
    }`
    
    const paddingClass = PADDING_OPTIONS.find(p => p.value === component.styles.padding)?.class || 'p-8'
    const maxWidthClass = MAX_WIDTH_OPTIONS.find(m => m.value === component.styles.maxWidth)?.class || 'max-w-full'
    
    const visualContent = () => {
      switch (component.type) {
        case 'header':
          return (
            <div className={`${baseClasses} bg-gradient-to-r from-blue-600 to-blue-700 text-white`}>
              <div className={`${paddingClass} ${maxWidthClass} mx-auto`}>
                <div className="h-12 bg-white/20 rounded-lg" />
              </div>
            </div>
          )
        case 'footer':
          return (
            <div className={`${baseClasses} bg-gradient-to-r from-gray-700 to-gray-800 text-white`}>
              <div className={`${paddingClass} ${maxWidthClass} mx-auto`}>
                <div className="h-8 bg-white/10 rounded-lg" />
              </div>
            </div>
          )
        case 'main':
          return (
            <div className={`${baseClasses} bg-white`}>
              <div className={`${paddingClass} ${maxWidthClass} mx-auto`}>
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-32 bg-gray-100 rounded" />
                </div>
              </div>
            </div>
          )
        case 'section':
          return (
            <div className={`${baseClasses}`} style={{ backgroundColor: component.styles.backgroundColor || 'transparent' }}>
              <div className={`${paddingClass} ${maxWidthClass} mx-auto`}>
                <div className="h-20 bg-gray-200/50 rounded" />
              </div>
            </div>
          )
        case 'article':
          return (
            <div className={`${baseClasses} bg-white`}>
              <div className={`${paddingClass} ${maxWidthClass} mx-auto`}>
                <div className="space-y-3">
                  <div className="h-6 bg-gray-300 rounded w-1/3" />
                  <div className="h-4 bg-gray-200 rounded" />
                  <div className="h-4 bg-gray-200 rounded w-5/6" />
                </div>
              </div>
            </div>
          )
        case 'card':
          return (
            <div className={`${baseClasses} bg-white shadow-lg`}>
              <div className={paddingClass}>
                <div className="h-32 bg-gray-100 rounded mb-3" />
                <div className="h-4 bg-gray-300 rounded w-2/3 mb-2" />
                <div className="h-3 bg-gray-200 rounded" />
              </div>
            </div>
          )
        case 'grid':
          return (
            <div className={`${baseClasses} bg-gray-50`}>
              <div className={`${paddingClass} ${maxWidthClass} mx-auto`}>
                <div className="grid grid-cols-3 gap-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-24 bg-white rounded shadow-sm" />
                  ))}
                </div>
              </div>
            </div>
          )
        case 'twocolumn':
          return (
            <div className={`${baseClasses} bg-gray-50`}>
              <div className={`${paddingClass} ${maxWidthClass} mx-auto`}>
                <div className="grid grid-cols-2 gap-6">
                  <div className="h-32 bg-white rounded shadow-sm" />
                  <div className="h-32 bg-white rounded shadow-sm" />
                </div>
              </div>
            </div>
          )
        case 'container':
          return (
            <div className={`${baseClasses}`} style={{ backgroundColor: component.styles.backgroundColor || '#f9fafb' }}>
              <div className={`${paddingClass} ${maxWidthClass} mx-auto border-2 border-dashed border-gray-300 rounded`}>
                <div className="h-16 flex items-center justify-center text-gray-400 text-sm">
                  Багтаамж
                </div>
              </div>
            </div>
          )
        default:
          return (
            <div className={`${baseClasses} bg-gray-100 p-8`}>
              <div className="h-20 bg-white rounded" />
            </div>
          )
      }
    }

    return (
      <div 
        onClick={() => setSelectedId(component.id)}
        className="relative group"
      >
        {visualContent()}
        
        {/* Component label */}
        <div className="absolute -top-3 left-4 px-2 py-1 bg-emerald-600 text-white text-xs rounded font-medium">
          {component.name}
        </div>
        
        {/* Quick actions on hover */}
        <div className="absolute -right-2 top-1/2 -translate-y-1/2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => { e.stopPropagation(); moveComponent(component.id, 'up') }}
            disabled={components.indexOf(component) === 0}
            className="p-1.5 bg-white rounded shadow hover:bg-gray-100 disabled:opacity-30"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); moveComponent(component.id, 'down') }}
            disabled={components.indexOf(component) === components.length - 1}
            className="p-1.5 bg-white rounded shadow hover:bg-gray-100 disabled:opacity-30"
          >
            <ArrowDown className="w-4 h-4" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`h-screen flex ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gradient-to-br from-gray-400 via-slate-700 to-emerald-950 text-gray-900'}`}>
      {/* Left Sidebar - Component Tools */}
      <div className={`w-72 flex-shrink-0 border-r ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white/90 backdrop-blur border-white/20'} flex flex-col`}>
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Вэб Бүтэц</h2>
          <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-700'}`}>Төсөл: {projectName}</p>
        </div>

        {/* Add Components */}
        <div className="p-4 flex-1 overflow-y-auto">
          <h3 className={`text-xs font-semibold uppercase tracking-wider mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Компонент нэмэх
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {COMPONENT_TYPES.map(({ type, label, icon: Icon, description }) => (
              <button
                key={type}
                onClick={() => addComponent(type)}
                title={description}
                className={`p-3 rounded-lg flex flex-col items-center gap-2 transition-colors ${
                  isDarkMode 
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                    : 'bg-white/90 hover:bg-white text-gray-800 border border-gray-200'
                }`}
              >
                <Icon className="w-6 h-6" />
                <span className="text-xs font-medium">{label}</span>
              </button>
            ))}
          </div>

          {/* Style Controls - Only when component selected */}
          {selectedComponent && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className={`text-xs font-semibold uppercase tracking-wider mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Загвар тохируулах
              </h3>
              
              {/* Background Color */}
              <div className="mb-4">
                <label className={`block text-xs mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Дэвсгэр өнгө</label>
                <div className="grid grid-cols-6 gap-1">
                  {COLORS.map(color => (
                    <button
                      key={color.value}
                      onClick={() => updateStyle(selectedComponent.id, 'backgroundColor', color.value)}
                      title={color.name}
                      className={`w-8 h-8 rounded border-2 ${
                        selectedComponent.styles.backgroundColor === color.value ? 'border-emerald-500 ring-2 ring-emerald-300' : 'border-transparent'
                      } ${color.class}`}
                    />
                  ))}
                </div>
              </div>

              {/* Padding */}
              <div className="mb-4">
                <label className={`block text-xs mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Доторлогоо</label>
                <div className="flex gap-1">
                  {PADDING_OPTIONS.map(pad => (
                    <button
                      key={pad.value}
                      onClick={() => updateStyle(selectedComponent.id, 'padding', pad.value)}
                      className={`flex-1 py-2 text-xs rounded ${
                        selectedComponent.styles.padding === pad.value
                          ? 'bg-emerald-600 text-white'
                          : isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-white/80 text-gray-700'
                      }`}
                    >
                      {pad.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Max Width */}
              <div className="mb-4">
                <label className={`block text-xs mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Хамгийн их өргөн</label>
                <div className="grid grid-cols-3 gap-1">
                  {MAX_WIDTH_OPTIONS.map(width => (
                    <button
                      key={width.value}
                      onClick={() => updateStyle(selectedComponent.id, 'maxWidth', width.value)}
                      className={`py-2 text-xs rounded ${
                        selectedComponent.styles.maxWidth === width.value
                          ? 'bg-emerald-600 text-white'
                          : isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-white/80 text-gray-700'
                      }`}
                    >
                      {width.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => duplicateComponent(selectedComponent)}
                  className={`flex-1 py-2 rounded-lg text-sm flex items-center justify-center gap-2 ${
                    isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  }`}
                >
                  <Copy className="w-4 h-4" />
                  Хуулбарлах
                </button>
                <button
                  onClick={() => deleteComponent(selectedComponent.id)}
                  className="flex-1 py-2 rounded-lg text-sm bg-red-100 hover:bg-red-200 text-red-600 flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Устгах
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={saveToAPI}
            disabled={isSaving || components.length === 0}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-600/50 text-white rounded-lg font-medium flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Хадгалж байна...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Бүтэц хадгалах
              </>
            )}
          </button>
          <p className={`text-xs mt-2 text-center ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            {components.length} компонент
          </p>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 p-6 overflow-auto">
        <div className={`min-h-full rounded-xl shadow-lg overflow-hidden ${
          isDarkMode ? 'bg-gray-950' : 'bg-white/90 backdrop-blur'
        }`}>
          {/* Canvas Header */}
          <div className={`px-4 py-3 border-b flex items-center justify-between ${
            isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white/80 backdrop-blur border-gray-200'
          }`}>
            <h3 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Хуудас бүтэц</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPreviewMode(!previewMode)}
                className={`px-3 py-1.5 text-sm rounded-lg ${
                  previewMode 
                    ? 'bg-emerald-600 text-white' 
                    : isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                }`}
              >
                {previewMode ? 'Засах' : 'Урьдчилан харах'}
              </button>
            </div>
          </div>

          {/* Components List */}
          <div className="p-6 space-y-4">
            {components.length === 0 ? (
              <div className="text-center py-20">
                <LayoutTemplate className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-700' : 'text-gray-300'}`} />
                <p className={`${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                  Зүүн талаас компонент сонгон вэб бүтэцээ эхлүүлнэ үү
                </p>
              </div>
            ) : (
              components.map(component => (
                <div key={component.id} className="relative">
                  {getComponentVisual(component)}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

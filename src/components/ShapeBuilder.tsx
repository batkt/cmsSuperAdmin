'use client'

import { useState, useRef, useCallback } from 'react'
import { 
  Square, Circle, Image as ImageIcon, Box, Trash2, 
  Move, Palette, Layers, Save, Loader2, Copy
} from 'lucide-react'
import { componentApi } from '@/lib/api-service'

// Shape Types
interface Shape {
  id: string
  type: 'rectangle' | 'circle' | 'image' | 'container'
  x: number
  y: number
  width: number
  height: number
  rotation: number
  styles: {
    backgroundColor?: string
    borderColor?: string
    borderWidth?: number
    borderRadius?: number
    opacity?: number
    backgroundImage?: string
    backgroundSize?: 'cover' | 'contain' | 'auto'
  }
  zIndex: number
}

interface ShapeBuilderProps {
  projectName: string
  isDarkMode: boolean
  apiUrl: string
  token: string
}

// Available shape types to add
const SHAPE_TYPES = [
  { type: 'rectangle', label: 'Rectangle', icon: Square },
  { type: 'circle', label: 'Circle', icon: Circle },
  { type: 'image', label: 'Image', icon: ImageIcon },
  { type: 'container', label: 'Container', icon: Box },
] as const

// Color palette
const COLORS = [
  '#000000', '#ffffff', '#ef4444', '#f97316', '#f59e0b', '#84cc16',
  '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6',
  '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#78716c', '#94a3b8'
]

export default function ShapeBuilder({ projectName, isDarkMode, apiUrl, token }: ShapeBuilderProps) {
  const [shapes, setShapes] = useState<Shape[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [isSaving, setIsSaving] = useState(false)
  const canvasRef = useRef<HTMLDivElement>(null)

  const selectedShape = shapes.find(s => s.id === selectedId)

  // Add new shape
  const addShape = (type: Shape['type']) => {
    const newShape: Shape = {
      id: Date.now().toString(),
      type,
      x: 50 + (shapes.length * 20),
      y: 50 + (shapes.length * 20),
      width: type === 'circle' ? 100 : 200,
      height: type === 'circle' ? 100 : 150,
      rotation: 0,
      styles: {
        backgroundColor: type === 'image' ? 'transparent' : '#3b82f6',
        borderColor: '#000000',
        borderWidth: 0,
        borderRadius: type === 'circle' ? 50 : 0,
        opacity: 1,
        backgroundSize: 'cover',
      },
      zIndex: shapes.length,
    }
    setShapes([...shapes, newShape])
    setSelectedId(newShape.id)
  }

  // Delete shape
  const deleteShape = (id: string) => {
    setShapes(shapes.filter(s => s.id !== id))
    if (selectedId === id) setSelectedId(null)
  }

  // Duplicate shape
  const duplicateShape = (shape: Shape) => {
    const newShape: Shape = {
      ...shape,
      id: Date.now().toString(),
      x: shape.x + 20,
      y: shape.y + 20,
      zIndex: shapes.length,
    }
    setShapes([...shapes, newShape])
    setSelectedId(newShape.id)
  }

  // Update shape style
  const updateShapeStyle = (id: string, key: keyof Shape['styles'], value: any) => {
    setShapes(shapes.map(s => 
      s.id === id 
        ? { ...s, styles: { ...s.styles, [key]: value } }
        : s
    ))
  }

  // Update shape dimensions
  const updateShapeSize = (id: string, width: number, height: number) => {
    setShapes(shapes.map(s => 
      s.id === id ? { ...s, width, height } : s
    ))
  }

  // Update shape position
  const updateShapePosition = (id: string, x: number, y: number) => {
    setShapes(shapes.map(s => 
      s.id === id ? { ...s, x, y } : s
    ))
  }

  // Update rotation
  const updateRotation = (id: string, rotation: number) => {
    setShapes(shapes.map(s => 
      s.id === id ? { ...s, rotation } : s
    ))
  }

  // Bring to front / send to back
  const changeZIndex = (id: string, direction: 'up' | 'down') => {
    const shape = shapes.find(s => s.id === id)
    if (!shape) return
    
    const newZIndex = direction === 'up' 
      ? Math.max(...shapes.map(s => s.zIndex)) + 1
      : Math.min(...shapes.map(s => s.zIndex)) - 1
    
    setShapes(shapes.map(s => 
      s.id === id ? { ...s, zIndex: newZIndex } : s
    ))
  }

  // Save to API
  const saveToAPI = async () => {
    setIsSaving(true)
    try {
      // Convert shapes to component format
      const componentData = {
        componentType: 'ShapeLayout',
        pageRoute: '/',
        props: {
          shapeCount: shapes.length,
        },
        content: {
          shapes: shapes.map(s => ({
            id: s.id,
            type: s.type,
            position: { x: s.x, y: s.y },
            size: { width: s.width, height: s.height },
            rotation: s.rotation,
            styles: s.styles,
            zIndex: s.zIndex,
          })),
        },
      }
      
      await componentApi.create(projectName, componentData)
      alert('Shapes saved successfully!')
    } catch (err: any) {
      alert('Error saving: ' + err.message)
    } finally {
      setIsSaving(false)
    }
  }

  // Mouse handlers for dragging
  const handleMouseDown = (e: React.MouseEvent, shape: Shape) => {
    e.stopPropagation()
    setSelectedId(shape.id)
    setIsDragging(true)
    setDragOffset({
      x: e.clientX - shape.x,
      y: e.clientY - shape.y,
    })
  }

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !selectedId || !canvasRef.current) return
    
    const canvas = canvasRef.current.getBoundingClientRect()
    const x = Math.max(0, Math.min(e.clientX - canvas.left - dragOffset.x + canvas.left, canvas.width - 50))
    const y = Math.max(0, Math.min(e.clientY - canvas.top - dragOffset.y + canvas.top, canvas.height - 50))
    
    updateShapePosition(selectedId, x, y)
  }, [isDragging, selectedId, dragOffset])

  const handleMouseUp = () => {
    setIsDragging(false)
    setIsResizing(false)
  }

  return (
    <div className={`h-screen flex ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      {/* Left Sidebar - Shape Tools */}
      <div className={`w-64 flex-shrink-0 border-r ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Shape Builder</h2>
          <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Project: {projectName}</p>
        </div>

        {/* Add Shapes */}
        <div className="p-4">
          <h3 className={`text-xs font-semibold uppercase tracking-wider mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Add Shapes
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {SHAPE_TYPES.map(({ type, label, icon: Icon }) => (
              <button
                key={type}
                onClick={() => addShape(type)}
                className={`p-3 rounded-lg flex flex-col items-center gap-2 transition-colors ${
                  isDarkMode 
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                <Icon className="w-6 h-6" />
                <span className="text-xs">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Style Controls - Only when shape selected */}
        {selectedShape && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <h3 className={`text-xs font-semibold uppercase tracking-wider mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              <Palette className="w-4 h-4 inline mr-1" />
              Style
            </h3>
            
            {/* Background Color */}
            <div className="mb-4">
              <label className={`block text-xs mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Background</label>
              <div className="flex flex-wrap gap-1">
                {COLORS.map(color => (
                  <button
                    key={color}
                    onClick={() => updateShapeStyle(selectedShape.id, 'backgroundColor', color)}
                    className={`w-6 h-6 rounded border-2 ${
                      selectedShape.styles.backgroundColor === color ? 'border-blue-500' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Border Color */}
            <div className="mb-4">
              <label className={`block text-xs mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Border</label>
              <div className="flex flex-wrap gap-1 mb-2">
                {COLORS.map(color => (
                  <button
                    key={color}
                    onClick={() => updateShapeStyle(selectedShape.id, 'borderColor', color)}
                    className={`w-5 h-5 rounded border-2 ${
                      selectedShape.styles.borderColor === color ? 'border-blue-500' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <input
                type="range"
                min="0"
                max="10"
                value={selectedShape.styles.borderWidth || 0}
                onChange={(e) => updateShapeStyle(selectedShape.id, 'borderWidth', parseInt(e.target.value))}
                className="w-full"
              />
              <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                Width: {selectedShape.styles.borderWidth || 0}px
              </span>
            </div>

            {/* Opacity */}
            <div className="mb-4">
              <label className={`block text-xs mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Opacity</label>
              <input
                type="range"
                min="0"
                max="100"
                value={(selectedShape.styles.opacity || 1) * 100}
                onChange={(e) => updateShapeStyle(selectedShape.id, 'opacity', parseInt(e.target.value) / 100)}
                className="w-full"
              />
            </div>

            {/* Rotation */}
            <div className="mb-4">
              <label className={`block text-xs mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Rotation</label>
              <input
                type="range"
                min="-180"
                max="180"
                value={selectedShape.rotation}
                onChange={(e) => updateRotation(selectedShape.id, parseInt(e.target.value))}
                className="w-full"
              />
              <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                {selectedShape.rotation}°
              </span>
            </div>

            {/* Size */}
            <div className="mb-4">
              <label className={`block text-xs mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Size</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={selectedShape.width}
                  onChange={(e) => updateShapeSize(selectedShape.id, parseInt(e.target.value), selectedShape.height)}
                  className={`w-20 px-2 py-1 text-sm rounded border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  placeholder="W"
                />
                <span className="self-center text-gray-500">×</span>
                <input
                  type="number"
                  value={selectedShape.height}
                  onChange={(e) => updateShapeSize(selectedShape.id, selectedShape.width, parseInt(e.target.value))}
                  className={`w-20 px-2 py-1 text-sm rounded border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  placeholder="H"
                />
              </div>
            </div>

            {/* Layer Controls */}
            <div className="mb-4">
              <label className={`block text-xs mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Layer</label>
              <div className="flex gap-2">
                <button
                  onClick={() => changeZIndex(selectedShape.id, 'up')}
                  className={`px-3 py-1 text-sm rounded ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
                >
                  Front
                </button>
                <button
                  onClick={() => changeZIndex(selectedShape.id, 'down')}
                  className={`px-3 py-1 text-sm rounded ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
                >
                  Back
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => duplicateShape(selectedShape)}
                className={`flex-1 py-2 rounded-lg text-sm flex items-center justify-center gap-2 ${
                  isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                <Copy className="w-4 h-4" />
                Duplicate
              </button>
              <button
                onClick={() => deleteShape(selectedShape.id)}
                className="flex-1 py-2 rounded-lg text-sm bg-red-100 hover:bg-red-200 text-red-600 flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 mt-auto">
          <button
            onClick={saveToAPI}
            disabled={isSaving}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white rounded-lg font-medium flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Layout
              </>
            )}
          </button>
          <p className={`text-xs mt-2 text-center ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            {shapes.length} shapes
          </p>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 p-8 overflow-auto">
        <div
          ref={canvasRef}
          className={`relative w-full h-full min-h-[600px] rounded-xl shadow-inner overflow-hidden ${
            isDarkMode ? 'bg-gray-950' : 'bg-white'
          }`}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onClick={() => setSelectedId(null)}
        >
          {/* Grid Pattern */}
          <div 
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `
                linear-gradient(to right, ${isDarkMode ? '#fff' : '#000'} 1px, transparent 1px),
                linear-gradient(to bottom, ${isDarkMode ? '#fff' : '#000'} 1px, transparent 1px)
              `,
              backgroundSize: '20px 20px',
            }}
          />

          {/* Shapes */}
          {shapes.sort((a, b) => a.zIndex - b.zIndex).map((shape) => (
            <div
              key={shape.id}
              onMouseDown={(e) => handleMouseDown(e, shape)}
              className={`absolute cursor-move transition-shadow ${
                selectedId === shape.id ? 'ring-2 ring-blue-500 shadow-lg' : ''
              }`}
              style={{
                left: shape.x,
                top: shape.y,
                width: shape.width,
                height: shape.height,
                zIndex: shape.zIndex,
                transform: `rotate(${shape.rotation}deg)`,
                backgroundColor: shape.styles.backgroundColor,
                borderColor: shape.styles.borderColor,
                borderWidth: `${shape.styles.borderWidth}px`,
                borderStyle: 'solid',
                borderRadius: shape.type === 'circle' ? '50%' : `${shape.styles.borderRadius || 0}px`,
                opacity: shape.styles.opacity,
                backgroundImage: shape.styles.backgroundImage ? `url(${shape.styles.backgroundImage})` : undefined,
                backgroundSize: shape.styles.backgroundSize,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
              }}
            >
              {/* Selection indicator */}
              {selectedId === shape.id && (
                <div className="absolute -top-6 left-0 flex items-center gap-1">
                  <div className="px-2 py-1 bg-blue-500 text-white text-xs rounded">
                    {shape.type}
                  </div>
                  <Move className="w-3 h-3 text-blue-500" />
                </div>
              )}
              
              {/* Image upload placeholder */}
              {shape.type === 'image' && !shape.styles.backgroundImage && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-gray-400" />
                </div>
              )}
            </div>
          ))}

          {/* Empty state */}
          {shapes.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <Layers className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-700' : 'text-gray-200'}`} />
                <p className={`${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  Click a shape tool on the left to start building
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

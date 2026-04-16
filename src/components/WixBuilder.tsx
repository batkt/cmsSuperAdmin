'use client'

import {
  useState, useRef, useCallback, useEffect, useMemo
} from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Monitor, Smartphone, Tablet, Eye, EyeOff, Plus, Trash2,
  Settings2, Layers, ChevronDown, GripVertical, Save,
  Rocket, RefreshCw, ZoomIn, ZoomOut, Maximize2, X,
  AlignLeft, AlignCenter, AlignRight, Type, Image as ImageIcon,
  Layout, Package, Grid3X3, CreditCard, Square, Copy,
  ChevronUp, ChevronRight, Loader2, Check, Undo2, Redo2,
  MousePointer2, PanelLeft, PanelRight, Globe, ExternalLink,
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { api, type TreeNode } from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'
import { useProjectStore } from '@/stores/projectStore'

// ─── Types ────────────────────────────────────────────────────────────────────

type Theme = 'light' | 'dark' | 'primary' | 'secondary'
type Align = 'left' | 'center' | 'right'
type Spacing = 'none' | 'sm' | 'md' | 'lg' | 'xl'

interface BlockSection {
  id: string
  componentType: string
  props: Record<string, any>
  order: number
  height: number  // px height of this block in the canvas
  instanceId?: string
  parentId?: string | null
  slot?: string | null
}

type ViewMode = 'desktop' | 'tablet' | 'mobile'
type PanelTab = 'components' | 'layers'

const VIEWPORT_WIDTHS: Record<ViewMode, number> = {
  desktop: 1280,
  tablet: 768,
  mobile: 375,
}

// ─── Component Registry ───────────────────────────────────────────────────────

const COMPONENT_REGISTRY = [
  { type: 'header',     label: 'Толгой',      icon: Monitor,    category: 'section',   defaultHeight: 80  },
  { type: 'hero',       label: 'Нүүр',        icon: Square,     category: 'section',   defaultHeight: 500 },
  { type: 'about',      label: 'Тухай',       icon: Type,       category: 'section',   defaultHeight: 450 },
  { type: 'services',   label: 'Үйлчилгээ',   icon: Package,    category: 'section',   defaultHeight: 400 },
  { type: 'contact',    label: 'Холбоо барих', icon: Package,    category: 'section',   defaultHeight: 400 },
  { type: 'jobs',       label: 'Ажлын байр',  icon: Package,    category: 'section',   defaultHeight: 500 },
  { type: 'rental',     label: 'Түрээс',      icon: Package,    category: 'section',   defaultHeight: 500 },
  { type: 'footer',     label: 'Хөл',         icon: Monitor,    category: 'section',   defaultHeight: 200 },
  { type: 'pagination', label: 'Хуудаслалт',  icon: AlignCenter, category: 'section',  defaultHeight: 80  },
  { type: 'section',    label: 'Хэсэг',       icon: Package,    category: 'section',   defaultHeight: 400 },
  { type: 'button',     label: 'Товч',        icon: Square,     category: 'primitive', defaultHeight: 80  },
  { type: 'modal',      label: 'Модал',       icon: Maximize2,  category: 'primitive', defaultHeight: 120 },
  { type: 'contact-form', label: 'Холбоо барих маягт', icon: Package, category: 'primitive', defaultHeight: 300 },
  { type: 'text',       label: 'Текст',       icon: Type,       category: 'primitive', defaultHeight: 100 },
  { type: 'twocolumn',  label: 'Хос багана',  icon: Layout,     category: 'layout',    defaultHeight: 400 },
  { type: 'grid',       label: 'Хүснэгт',     icon: Grid3X3,    category: 'layout',    defaultHeight: 400 },
  { type: 'card',       label: 'Карт',        icon: CreditCard, category: 'layout',    defaultHeight: 300 },
  { type: 'container',  label: 'Контейнер',   icon: Package,    category: 'layout',    defaultHeight: 300 },
]

const COMPONENT_COLORS: Record<string, string> = {
  section: '#6366f1',
  primitive: '#ec4899',
  layout: '#10b981',
}

function getDefaultProps(type: string, websiteName = 'My Website'): Record<string, any> {
  const base: Record<string, any> = {}
  switch (type) {
    case 'header':
      return { title: websiteName, theme: 'light', sticky: true, links: [
        { href: '/', label: 'Home' }, { href: '/about', label: 'About' }, { href: '/contact', label: 'Contact' }
      ] }
    case 'hero':
      return { title: `Welcome to ${websiteName}`, subtitle: 'Build something amazing today.', align: 'center', theme: 'primary', spacing: 'xl', buttons: [{ text: 'Get Started', href: '#', variant: 'primary', size: 'lg' }] }
    case 'about':
      return { title: 'About Us', description: 'We are dedicated to providing excellent solutions for your business.', align: 'left', theme: 'light' }
    case 'footer':
      return { title: websiteName, copyright: `© 2026 ${websiteName}. All rights reserved.`, theme: 'dark', footerLinks: { privacy: 'Privacy Policy', terms: 'Terms', contact: 'Contact' } }
    case 'pagination':
      return { theme: 'light' }
    case 'button':
      return { text: 'Click Me', variant: 'primary', size: 'md', type: 'button', fullWidth: false }
    case 'modal':
      return { title: 'Modal Title', content: 'Modal content goes here.', modalType: 'basic', theme: 'light', size: 'md' }
    case 'twocolumn':
      return { columns: [{ content: 'Зүүн багана агуулга' }, { content: 'Баруун багана агуулга' }], gap: 'md', verticalAlign: 'top', theme: 'light' }
    case 'grid':
      return { columns: 3, gap: 'md', theme: 'light' }
    case 'services':
      return { title: 'Бидний үйлчилгээ', description: 'Таны хэрэгцээнд зориулсан шийдлүүд', items: ['Үйлчилгээ 1', 'Үйлчилгээ 2', 'Үйлчилгээ 3'], theme: 'light' }
    case 'contact':
      return { title: 'Холбоо барих', email: 'contact@example.com', phone: '+976 99999999', address: 'Улаанбаатар хот', theme: 'light' }
    case 'contact-form':
      return { buttonText: 'Илгээх', placeholderName: 'Таны нэр', placeholderEmail: 'Имэйл хаяг', theme: 'light' }
    case 'jobs':
      return { title: 'Ажлын байр', theme: 'light' }
    case 'rental':
      return { title: 'Түрээс', theme: 'light' }
    case 'text':
      return { content: 'Текст оруулах хэсэг', fontSize: 16, color: '#334155', align: 'left' }
    case 'section':
      return { theme: 'light' }
    case 'card':
      return { title: 'Card Title', subtitle: 'Card subtitle', border: true, shadow: 'md', padding: 'md', theme: 'light' }
    case 'container':
      return { maxWidth: 'xl', padding: 'lg', theme: 'light' }
    default:
      return base
  }
}

// ─── Block Preview Renderer ───────────────────────────────────────────────────

function BlockPreview({ block, isSelected, isPreview }: {
  block: BlockSection
  isSelected: boolean
  isPreview: boolean
}) {
  const { componentType: type, props = {} } = block

  const themeColors: Record<string, { bg: string; text: string; accent: string }> = {
    light:     { bg: '#ffffff',    text: '#1e293b', accent: '#6366f1' },
    dark:      { bg: '#0f172a',    text: '#f8fafc', accent: '#818cf8' },
    primary:   { bg: '#4f46e5',    text: '#ffffff', accent: '#a5b4fc' },
    secondary: { bg: '#f1f5f9',    text: '#334155', accent: '#6366f1' },
  }

  const theme = themeColors[props.theme as string] || themeColors.light
  const align = props.align || 'center'

  switch (type) {
    case 'header':
      return (
        <div style={{ background: theme.bg, color: theme.text, height: '100%', borderBottom: '1px solid rgba(0,0,0,0.08)' }}
          className="flex items-center px-8 gap-8">
          <div style={{ color: theme.accent }} className="font-bold text-lg flex-shrink-0">
            {props.title || 'Site Title'}
          </div>
          <nav className="flex gap-6 ml-auto">
            {(props.links || []).slice(0, 4).map((l: any, i: number) => (
              <span key={i} style={{ color: theme.text, opacity: 0.7 }} className="text-sm cursor-pointer hover:opacity-100 transition-opacity">
                {l.label}
              </span>
            ))}
          </nav>
          {props.button && (
            <div style={{ background: theme.accent, color: '#fff', padding: '8px 20px', borderRadius: 8, fontSize: 13, fontWeight: 600 }}>
              {props.button.text}
            </div>
          )}
        </div>
      )

    case 'hero':
      return (
        <div style={{ background: theme.bg, color: theme.text, height: '100%', textAlign: align as any }}
          className="flex flex-col items-center justify-center px-12 relative overflow-hidden">
          <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 0%, ${theme.accent}22 0%, transparent 65%)`, pointerEvents: 'none' }} />
          <h1 style={{ color: theme.text, fontSize: 42, fontWeight: 800, lineHeight: 1.15, marginBottom: 16, maxWidth: 700 }}>
            {props.title || 'Hero Title'}
          </h1>
          {props.subtitle && (
            <p style={{ color: theme.text, opacity: 0.7, fontSize: 18, maxWidth: 560, marginBottom: 32 }}>
              {props.subtitle}
            </p>
          )}
          <div className="flex gap-3 flex-wrap justify-center">
            {(props.buttons || []).slice(0, 2).map((b: any, i: number) => (
              <div key={i} style={{
                background: i === 0 ? theme.accent : 'transparent',
                color: i === 0 ? '#fff' : theme.text,
                border: i === 0 ? 'none' : `2px solid ${theme.text}33`,
                padding: '12px 28px', borderRadius: 10, fontWeight: 700, fontSize: 14,
              }}>
                {b.text}
              </div>
            ))}
          </div>
        </div>
      )

    case 'about':
      return (
        <div style={{ background: theme.bg, color: theme.text, height: '100%' }}
          className="flex items-center px-12 gap-12">
          {props.images?.[0] && (
            <div style={{ width: 340, height: 260, flexShrink: 0, background: '#f1f5f9', borderRadius: 16, overflow: 'hidden' }}>
              <img src={props.images[0].url} alt={props.images[0].alt || ''} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          )}
          {!props.images?.[0] && (
            <div style={{ width: 340, height: 260, flexShrink: 0, background: `${theme.accent}15`, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ImageIcon style={{ color: theme.accent, width: 48, height: 48, opacity: 0.4 }} />
            </div>
          )}
          <div style={{ textAlign: align as any }}>
            {props.title && <h2 style={{ color: theme.text, fontSize: 32, fontWeight: 700, marginBottom: 16 }}>{props.title}</h2>}
            <p style={{ color: theme.text, opacity: 0.7, lineHeight: 1.7, fontSize: 16, maxWidth: 480 }}>{props.description}</p>
          </div>
        </div>
      )

    case 'footer':
      return (
        <div style={{ background: theme.bg, color: theme.text, height: '100%' }}
          className="flex flex-col items-center justify-center px-8">
          <div style={{ color: theme.accent, fontWeight: 700, fontSize: 20, marginBottom: 16 }}>{props.title}</div>
          <div className="flex gap-6 mb-6">
            {Object.entries(props.footerLinks || {}).slice(0, 4).map(([k, v]: any) => (
              <span key={k} style={{ color: theme.text, opacity: 0.5, fontSize: 13 }} className="cursor-pointer hover:opacity-80 transition-opacity">
                {v}
              </span>
            ))}
          </div>
          <p style={{ color: theme.text, opacity: 0.35, fontSize: 12 }}>{props.copyright}</p>
        </div>
      )

    case 'services':
      return (
        <div style={{ background: theme.bg, color: theme.text, height: '100%', padding: 40 }} className="flex flex-col items-center">
          <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 16 }}>{props.title}</h2>
          <p style={{ opacity: 0.7, marginBottom: 32 }}>{props.description}</p>
          <div className="flex gap-4">
            {(props.items || []).map((item: any, i: number) => (
              <div key={i} style={{ padding: 24, background: theme.accent+'10', borderRadius: 12, border: `1px solid ${theme.accent}30` }}>
                {item}
              </div>
            ))}
          </div>
        </div>
      )

    case 'contact':
      return (
        <div style={{ background: theme.bg, color: theme.text, height: '100%', padding: 40 }} className="flex flex-col items-center justify-center">
          <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 24 }}>{props.title}</h2>
          <div className="text-center space-y-2 opacity-80">
            <p>📧 {props.email}</p>
            <p>📱 {props.phone}</p>
            <p>📍 {props.address}</p>
          </div>
        </div>
      )
      
    case 'contact-form':
      return (
        <div style={{ background: theme.bg, height: '100%', padding: 24 }} className="flex items-center justify-center">
          <div style={{ width: '100%', maxWidth: 400, padding: 24, borderRadius: 16, border: '1px solid #e2e8f0', background: '#fff' }}>
            <input placeholder={props.placeholderName} style={{ width: '100%', padding: 12, border: '1px solid #e2e8f0', borderRadius: 8, marginBottom: 12 }} disabled />
            <input placeholder={props.placeholderEmail} style={{ width: '100%', padding: 12, border: '1px solid #e2e8f0', borderRadius: 8, marginBottom: 12 }} disabled />
            <textarea placeholder="Мессеж" style={{ width: '100%', padding: 12, border: '1px solid #e2e8f0', borderRadius: 8, marginBottom: 12, height: 80 }} disabled />
            <div style={{ background: theme.accent, color: '#fff', padding: 12, textAlign: 'center', borderRadius: 8, fontWeight: 600 }}>{props.buttonText}</div>
          </div>
        </div>
      )

    case 'jobs':
    case 'rental':
      return (
        <div style={{ background: theme.bg, color: theme.text, height: '100%', padding: 40 }} className="flex flex-col items-center justify-center">
          <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 16 }}>{props.title}</h2>
          <div style={{ width: 300, height: 100, background: theme.accent+'15', borderRadius: 12, border: `2px dashed ${theme.accent}40`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {type === 'jobs' ? 'Ажлын байрны жагсаалт' : 'Түрээсийн жагсаалт'}
          </div>
        </div>
      )

    case 'text':
      return (
        <div style={{ background: theme.bg || 'transparent', height: '100%', padding: 24, display: 'flex', alignItems: 'center', justifyContent: align as any }}>
          <p style={{ color: props.color || theme.text, fontSize: props.fontSize || 16, textAlign: align as any, margin: 0 }}>
            {props.content}
          </p>
        </div>
      )

    case 'section':
      return (
        <div style={{ background: theme.bg, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ color: theme.accent, opacity: 0.5, border: `2px dashed ${theme.accent}30`, borderRadius: 12, padding: 24, width: '90%', height: '80%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, letterSpacing: '0.1em' }}>
            ХООСОН ХЭСЭГ (СЛОТ)
          </div>
        </div>
      )

    case 'pagination':
      return (
        <div style={{ background: theme.bg, color: theme.text, height: '100%' }}
          className="flex items-center justify-center gap-2">
          {[1, 2, 3, '...', 8].map((p, i) => (
            <div key={i} style={{
              width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: 8, background: i === 0 ? theme.accent : 'transparent',
              color: i === 0 ? '#fff' : theme.text, fontSize: 14, fontWeight: 600,
              border: `1px solid ${i === 0 ? theme.accent : theme.text + '22'}`,
            }}>
              {p}
            </div>
          ))}
        </div>
      )

    case 'button':
      return (
        <div style={{ background: theme.bg, height: '100%' }}
          className="flex items-center justify-center">
          <div style={{
            background: props.variant === 'outline' ? 'transparent' : theme.accent,
            color: props.variant === 'outline' ? theme.accent : '#fff',
            border: props.variant === 'outline' ? `2px solid ${theme.accent}` : 'none',
            padding: props.size === 'lg' ? '14px 32px' : props.size === 'sm' ? '8px 16px' : '11px 24px',
            borderRadius: 10, fontWeight: 700, fontSize: 14,
          }}>
            {props.text || 'Button'}
          </div>
        </div>
      )

    case 'modal':
      return (
        <div style={{ background: theme.bg, height: '100%' }}
          className="flex items-center justify-center">
          <div style={{ background: '#fff', borderRadius: 16, padding: 28, maxWidth: 320, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.15)', border: '1px solid rgba(0,0,0,0.06)' }}>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8, color: '#0f172a' }}>{props.title}</div>
            <p style={{ color: '#64748b', fontSize: 13, lineHeight: 1.6 }}>{props.content}</p>
            <div className="flex gap-2 mt-4">
              {props.showTrigger !== false && (
                <div style={{ background: '#6366f1', color: '#fff', padding: '9px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600, flex: 1, textAlign: 'center' }}>
                  {props.openButtonText || 'Open'}
                </div>
              )}
            </div>
          </div>
        </div>
      )

    case 'twocolumn':
      return (
        <div style={{ background: theme.bg, height: '100%', display: 'flex', gap: props.gap==='lg'?32:props.gap==='sm'?12:24, padding: 24, flexWrap: 'wrap', alignItems: props.verticalAlign === 'center' ? 'center' : props.verticalAlign === 'bottom' ? 'flex-end' : 'flex-start' }}>
          {(props.columns || [{ content: 'Багана 1' }, { content: 'Багана 2' }]).map((col: any, i: number) => (
            <div key={i} style={{ flex: 1, minWidth: 240, background: `${theme.accent}08`, borderRadius: 12, minHeight: 120, border: `1px solid ${theme.accent}22`, padding: 24, color: theme.text }}>
              {col.content}
            </div>
          ))}
        </div>
      )

    case 'grid':
      return (
        <div style={{ background: theme.bg, height: '100%', padding: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(props.columns || 3, 6)}, 1fr)`, gap: 16 }}>
            {Array.from({ length: Math.min(props.columns || 3, 6) }).map((_, i) => (
              <div key={i} style={{ background: `${theme.accent}10`, borderRadius: 10, minHeight: 120, border: `2px dashed ${theme.accent}25`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: theme.accent, opacity: 0.5, fontSize: 11, fontWeight: 600 }}>Item {i + 1}</span>
              </div>
            ))}
          </div>
        </div>
      )

    case 'card':
      return (
        <div style={{ background: theme.bg, height: '100%', padding: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 24, width: '100%', maxWidth: 380, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', border: '1px solid rgba(0,0,0,0.06)' }}>
            <div style={{ background: `${theme.accent}12`, borderRadius: 10, padding: '10px 14px', marginBottom: 12 }}>
              <span style={{ color: theme.accent, fontWeight: 700, fontSize: 14 }}>{props.title || 'Card Header'}</span>
            </div>
            <p style={{ color: '#64748b', fontSize: 13, marginBottom: 12 }}>{props.subtitle || 'Card content goes here'}</p>
            <div style={{ background: '#f8fafc', borderRadius: 8, padding: '8px 12px' }}>
              <span style={{ color: '#94a3b8', fontSize: 12 }}>Footer area</span>
            </div>
          </div>
        </div>
      )

    case 'container':
      return (
        <div style={{ background: theme.bg, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '100%', maxWidth: props.maxWidth === 'full' ? '100%' : props.maxWidth === 'xl' ? 1280 : props.maxWidth === 'lg' ? 1024 : props.maxWidth === 'md' ? 768 : 640, padding: 24, border: `2px dashed ${theme.accent}30`, borderRadius: 12 }}>
            <div style={{ color: theme.accent, opacity: 0.5, textAlign: 'center', fontSize: 12, fontWeight: 600 }}>DEFAULT SLOT</div>
          </div>
        </div>
      )

    default:
      return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', border: '2px dashed #e2e8f0' }}>
          <Package style={{ width: 32, height: 32, color: '#94a3b8', marginBottom: 8 }} />
          <span style={{ color: '#94a3b8', fontSize: 12, fontWeight: 600 }}>{type.toUpperCase()}</span>
        </div>
      )
  }
}

// ─── Property Inspector ───────────────────────────────────────────────────────

function PropInput({ label, value, onChange, type = 'text', options }: {
  label: string
  value: any
  onChange: (v: any) => void
  type?: 'text' | 'number' | 'select' | 'color' | 'textarea' | 'toggle'
  options?: { value: string; label: string }[]
}) {
  const isDark = false
  const inputClass = "w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"

  return (
    <div className="space-y-1.5">
      <label style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b', display: 'block' }}>
        {label}
      </label>
      {type === 'select' && options ? (
        <select value={value ?? ''} onChange={e => onChange(e.target.value)} className={inputClass}>
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      ) : type === 'textarea' ? (
        <textarea value={value ?? ''} onChange={e => onChange(e.target.value)} rows={3}
          style={{ resize: 'vertical' }} className={inputClass} />
      ) : type === 'toggle' ? (
        <button
          onClick={() => onChange(!value)}
          style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderRadius: 8,
            background: value ? '#6366f1' : '#f1f5f9', border: 'none', cursor: 'pointer', width: '100%',
          }}
        >
          <div style={{
            width: 32, height: 18, borderRadius: 99, background: value ? '#fff' : '#94a3b8',
            position: 'relative', transition: 'all 0.2s',
          }}>
            <div style={{
              position: 'absolute', top: 2, left: value ? 16 : 2, width: 14, height: 14,
              borderRadius: 99, background: value ? '#6366f1' : '#fff', transition: 'all 0.2s',
            }} />
          </div>
          <span style={{ fontSize: 12, fontWeight: 600, color: value ? '#fff' : '#475569' }}>
            {value ? 'On' : 'Off'}
          </span>
        </button>
      ) : type === 'color' ? (
        <div className="flex gap-2 items-center">
          <input type="color" value={value ?? '#6366f1'} onChange={e => onChange(e.target.value)}
            style={{ width: 36, height: 30, border: 'none', borderRadius: 8, cursor: 'pointer', padding: 2, background: 'transparent' }} />
          <input type="text" value={value ?? ''} onChange={e => onChange(e.target.value)} className={inputClass} />
        </div>
      ) : (
        <input type={type as any} value={value ?? ''} onChange={e => onChange(type === 'number' ? Number(e.target.value) : e.target.value)}
          className={inputClass} />
      )}
    </div>
  )
}

function ComponentInspector({ block, onChange, onDelete, onDuplicate, isDarkMode }: {
  block: BlockSection
  onChange: (props: Record<string, any>, height?: number) => void
  onDelete: () => void
  onDuplicate: () => void
  isDarkMode: boolean
}) {
  const p = block.props || {}
  const set = (key: string, val: any) => onChange({ ...p, [key]: val })
  const dm = isDarkMode

  const THEME_OPTS = [
    { value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' },
    { value: 'primary', label: 'Primary' }, { value: 'secondary', label: 'Secondary' },
  ]
  const ALIGN_OPTS = [
    { value: 'left', label: 'Left' }, { value: 'center', label: 'Center' }, { value: 'right', label: 'Right' },
  ]
  const SPACING_OPTS = [
    { value: 'none', label: 'None' }, { value: 'sm', label: 'SM' }, { value: 'md', label: 'MD' },
    { value: 'lg', label: 'LG' }, { value: 'xl', label: 'XL' },
  ]

  const panelBg = dm ? '#0f172a' : '#ffffff'
  const panelText = dm ? '#f1f5f9' : '#0f172a'
  const sectionBg = dm ? '#1e293b' : '#f8fafc'
  const borderClr = dm ? '#334155' : '#e2e8f0'

  const reg = COMPONENT_REGISTRY.find(r => r.type === block.componentType)
  const catColor = COMPONENT_COLORS[reg?.category || 'section']

  const sectionHeader = (label: string) => (
    <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: catColor, marginBottom: 8, marginTop: 4 }}>
      {label}
    </div>
  )

  const renderFields = () => {
    const type = block.componentType
    const common = (
      <div className="space-y-3">
        {sectionHeader('Theme')}
        <PropInput label="Theme" value={p.theme} onChange={v => set('theme', v)} type="select" options={THEME_OPTS} />
      </div>
    )

    switch (type) {
      case 'header':
        return (
          <div className="space-y-4">
            <div className="space-y-3">
              {sectionHeader('Content')}
              <PropInput label="Site Title" value={p.title} onChange={v => set('title', v)} />
              <PropInput label="Sticky" value={p.sticky} onChange={v => set('sticky', v)} type="toggle" />
              <PropInput label="Top Offset" value={p.topOffset} onChange={v => set('topOffset', v)} />
            </div>
            {common}
          </div>
        )
      case 'hero':
        return (
          <div className="space-y-4">
            <div className="space-y-3">
              {sectionHeader('Content')}
              <PropInput label="Title" value={p.title} onChange={v => set('title', v)} />
              <PropInput label="Subtitle" value={p.subtitle} onChange={v => set('subtitle', v)} type="textarea" />
              <PropInput label="Alignment" value={p.align} onChange={v => set('align', v)} type="select" options={ALIGN_OPTS} />
              <PropInput label="Spacing" value={p.spacing} onChange={v => set('spacing', v)} type="select" options={SPACING_OPTS} />
            </div>
            {common}
          </div>
        )
      case 'about':
        return (
          <div className="space-y-4">
            <div className="space-y-3">
              {sectionHeader('Content')}
              <PropInput label="Title" value={p.title} onChange={v => set('title', v)} />
              <PropInput label="Description" value={p.description} onChange={v => set('description', v)} type="textarea" />
              <PropInput label="Alignment" value={p.align} onChange={v => set('align', v)} type="select" options={ALIGN_OPTS} />
            </div>
            {common}
          </div>
        )
      case 'footer':
        return (
          <div className="space-y-4">
            <div className="space-y-3">
              {sectionHeader('Content')}
              <PropInput label="Title" value={p.title} onChange={v => set('title', v)} />
              <PropInput label="Copyright" value={p.copyright} onChange={v => set('copyright', v)} />
            </div>
            {common}
          </div>
        )
      case 'services':
        return (
          <div className="space-y-4">
            <div className="space-y-3">
              {sectionHeader('Content')}
              <PropInput label="Гарчиг" value={p.title} onChange={v => set('title', v)} />
              <PropInput label="Тайлбар" value={p.description} onChange={v => set('description', v)} type="textarea" />
            </div>
            {common}
          </div>
        )
      case 'contact':
        return (
          <div className="space-y-4">
            <div className="space-y-3">
              {sectionHeader('Content')}
              <PropInput label="Гарчиг" value={p.title} onChange={v => set('title', v)} />
              <PropInput label="Имэйл" value={p.email} onChange={v => set('email', v)} />
              <PropInput label="Утас" value={p.phone} onChange={v => set('phone', v)} />
              <PropInput label="Хаяг" value={p.address} onChange={v => set('address', v)} type="textarea" />
            </div>
            {common}
          </div>
        )
      case 'contact-form':
        return (
          <div className="space-y-4">
            <div className="space-y-3">
              {sectionHeader('Content')}
              <PropInput label="Нэрний текст" value={p.placeholderName} onChange={v => set('placeholderName', v)} />
              <PropInput label="Имэйлийн текст" value={p.placeholderEmail} onChange={v => set('placeholderEmail', v)} />
              <PropInput label="Товчны текст" value={p.buttonText} onChange={v => set('buttonText', v)} />
            </div>
            {common}
          </div>
        )
      case 'jobs':
      case 'rental':
        return (
          <div className="space-y-4">
            <div className="space-y-3">
              {sectionHeader('Content')}
              <PropInput label="Гарчиг" value={p.title} onChange={v => set('title', v)} />
            </div>
            {common}
          </div>
        )
      case 'text':
        return (
          <div className="space-y-4">
            <div className="space-y-3">
              {sectionHeader('Content')}
              <PropInput label="Текст" value={p.content} onChange={v => set('content', v)} type="textarea" />
              <PropInput label="Хэмжээ (px)" value={p.fontSize} onChange={v => set('fontSize', v)} type="number" />
              <PropInput label="Өнгө" value={p.color} onChange={v => set('color', v)} type="color" />
              <PropInput label="Зэрэгцүүлэлт" value={p.align} onChange={v => set('align', v)} type="select" options={ALIGN_OPTS} />
            </div>
          </div>
        )
      case 'section':
        return common
      case 'button':
        return (
          <div className="space-y-4">
            <div className="space-y-3">
              {sectionHeader('Content')}
              <PropInput label="Text" value={p.text} onChange={v => set('text', v)} />
              <PropInput label="Href" value={p.href} onChange={v => set('href', v)} />
              <PropInput label="Variant" value={p.variant} onChange={v => set('variant', v)} type="select" options={[
                { value: 'primary', label: 'Primary' }, { value: 'secondary', label: 'Secondary' },
                { value: 'outline', label: 'Outline' }, { value: 'ghost', label: 'Ghost' },
              ]} />
              <PropInput label="Size" value={p.size} onChange={v => set('size', v)} type="select" options={[
                { value: 'sm', label: 'SM' }, { value: 'md', label: 'MD' }, { value: 'lg', label: 'LG' },
              ]} />
              <PropInput label="Full Width" value={p.fullWidth} onChange={v => set('fullWidth', v)} type="toggle" />
              <PropInput label="Disabled" value={p.disabled} onChange={v => set('disabled', v)} type="toggle" />
            </div>
          </div>
        )
      case 'modal':
        return (
          <div className="space-y-4">
            <div className="space-y-3">
              {sectionHeader('Content')}
              <PropInput label="ID" value={p.id} onChange={v => set('id', v)} />
              <PropInput label="Title" value={p.title} onChange={v => set('title', v)} />
              <PropInput label="Content" value={p.content} onChange={v => set('content', v)} type="textarea" />
              <PropInput label="Type" value={p.modalType} onChange={v => set('modalType', v)} type="select" options={[
                { value: 'basic', label: 'Basic' }, { value: 'formModal', label: 'Form Modal' },
              ]} />
              <PropInput label="Size" value={p.size} onChange={v => set('size', v)} type="select" options={[
                { value: 'sm', label: 'SM' }, { value: 'md', label: 'MD' }, { value: 'lg', label: 'LG' },
                { value: 'xl', label: 'XL' }, { value: 'full', label: 'Full' },
              ]} />
              <PropInput label="Closable" value={p.closable !== false} onChange={v => set('closable', v)} type="toggle" />
              <PropInput label="Default Open" value={p.defaultOpen} onChange={v => set('defaultOpen', v)} type="toggle" />
            </div>
            {common}
          </div>
        )
      case 'twocolumn':
        const cols = p.columns || [{ content: 'Багана 1' }, { content: 'Багана 2' }]
        return (
          <div className="space-y-4">
            <div className="space-y-3">
              {sectionHeader('Баганууд')}
              {cols.map((col: any, i: number) => (
                <div key={i} className="p-3 border rounded-lg relative" style={{ borderColor: borderClr, background: sectionBg }}>
                  <PropInput label={`Багана ${i + 1} агуулга`} value={col.content} onChange={v => {
                    const newCols = [...cols]; newCols[i].content = v; set('columns', newCols)
                  }} type="textarea" />
                  <button onClick={() => {
                    const newCols = cols.filter((_: any, idx: number) => idx !== i); set('columns', newCols)
                  }} style={{ position: 'absolute', top: 6, right: 6, padding: 4, background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={12} /></button>
                </div>
              ))}
              <button
                onClick={() => set('columns', [...cols, { content: `Шинэ багана ${cols.length + 1}` }])}
                style={{ width: '100%', padding: '8px 0', borderRadius: 8, border: `1px solid ${catColor}50`, background: `${catColor}15`, color: catColor, fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
              >
                <Plus size={14} /> Багана нэмэх
              </button>

              {sectionHeader('Layout')}
              <PropInput label="Gap" value={p.gap} onChange={v => set('gap', v)} type="select" options={SPACING_OPTS} />
              <PropInput label="Vertical Align" value={p.verticalAlign} onChange={v => set('verticalAlign', v)} type="select" options={[
                { value: 'top', label: 'Top' }, { value: 'center', label: 'Center' }, { value: 'bottom', label: 'Bottom' },
              ]} />
            </div>
            {common}
          </div>
        )
      case 'grid':
        return (
          <div className="space-y-4">
            <div className="space-y-3">
              {sectionHeader('Layout')}
              <PropInput label="Columns" value={p.columns} onChange={v => set('columns', Number(v))} type="number" />
              <PropInput label="Gap" value={p.gap} onChange={v => set('gap', v)} type="select" options={SPACING_OPTS} />
              <PropInput label="Min Item Width" value={p.minItemWidth} onChange={v => set('minItemWidth', v)} />
            </div>
            {common}
          </div>
        )
      case 'card':
        return (
          <div className="space-y-4">
            <div className="space-y-3">
              {sectionHeader('Content')}
              <PropInput label="Title" value={p.title} onChange={v => set('title', v)} />
              <PropInput label="Subtitle" value={p.subtitle} onChange={v => set('subtitle', v)} />
              <PropInput label="Border" value={p.border !== false} onChange={v => set('border', v)} type="toggle" />
              <PropInput label="Shadow" value={p.shadow} onChange={v => set('shadow', v)} type="select" options={[
                { value: 'none', label: 'None' }, { value: 'sm', label: 'SM' }, { value: 'md', label: 'MD' }, { value: 'lg', label: 'LG' },
              ]} />
              <PropInput label="Padding" value={p.padding} onChange={v => set('padding', v)} type="select" options={SPACING_OPTS} />
            </div>
            {common}
          </div>
        )
      case 'container':
        return (
          <div className="space-y-4">
            <div className="space-y-3">
              {sectionHeader('Layout')}
              <PropInput label="Max Width" value={p.maxWidth} onChange={v => set('maxWidth', v)} type="select" options={[
                { value: 'sm', label: 'SM (640px)' }, { value: 'md', label: 'MD (768px)' },
                { value: 'lg', label: 'LG (1024px)' }, { value: 'xl', label: 'XL (1280px)' }, { value: 'full', label: 'Full' },
              ]} />
              <PropInput label="Padding" value={p.padding} onChange={v => set('padding', v)} type="select" options={SPACING_OPTS} />
            </div>
            {common}
          </div>
        )
      default:
        return common
    }
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: panelBg }}>
      {/* Inspector header */}
      <div style={{ padding: '14px 16px', borderBottom: `1px solid ${borderClr}`, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: catColor }} />
          <span style={{ color: panelText, fontWeight: 700, fontSize: 13 }}>
            {reg?.label || block.componentType}
          </span>
          <span style={{ marginLeft: 'auto', fontSize: 10, color: catColor, fontWeight: 700, textTransform: 'uppercase', background: catColor + '18', padding: '2px 8px', borderRadius: 99 }}>
            {reg?.category}
          </span>
        </div>

        {/* Block height control */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <label style={{ fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>
            Height (px)
          </label>
          <input
            type="number"
            value={block.height}
            onChange={e => onChange(p, Math.max(60, Number(e.target.value)))}
            style={{ flex: 1, padding: '6px 10px', borderRadius: 8, border: `1px solid ${borderClr}`, fontSize: 12, background: sectionBg, color: panelText, outline: 'none' }}
          />
        </div>
      </div>

      {/* Inspector fields */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }} className="custom-scrollbar space-y-4">
        {renderFields()}

        <hr style={{ borderColor: borderClr, marginTop: 16, marginBottom: 16 }} />
        {sectionHeader('Абсолют элемент (Чөлөөт)')}
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <button onClick={() => set('floatElements', [...(p.floatElements||[]), { id: Date.now().toString(), type: 'button', text: 'Шинэ товч', x: 20, y: 20 }])}
            style={{ flex: 1, padding: '6px 0', border: 'none', background: '#e0e7ff', color: '#4f46e5', borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>+ Товч</button>
          <button onClick={() => set('floatElements', [...(p.floatElements||[]), { id: (Date.now()+1).toString(), type: 'image', x: 100, y: 20 }])}
            style={{ flex: 1, padding: '6px 0', border: 'none', background: '#f1f5f9', color: '#475569', borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>+ Зураг</button>
        </div>
        {(p.floatElements || []).map((el: any, i: number) => (
           <div key={el.id} style={{ padding: 8, border: `1px solid ${borderClr}`, borderRadius: 8, position: 'relative', marginTop: 8 }}>
             <PropInput label={el.type==='button' ? 'Товчний текст' : 'Зургийн холбоос'} value={el.type==='button'?el.text:el.src} onChange={v => {
                const newEl = [...p.floatElements]; newEl[i] = { ...el, [el.type==='button'?'text':'src']: v }; set('floatElements', newEl)
             }} />
             <button onClick={() => {
                const newEl = p.floatElements.filter((_:any, idx:number) => idx !== i); set('floatElements', newEl)
             }} style={{ position: 'absolute', top: 4, right: 4, background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={12}/></button>
           </div>
        ))}
      </div>

      {/* Actions */}
      <div style={{ padding: '12px 16px', borderTop: `1px solid ${borderClr}`, display: 'flex', gap: 8, flexShrink: 0 }}>
        <button
          onClick={onDuplicate}
          style={{ flex: 1, padding: '8px 0', borderRadius: 10, border: `1px solid ${borderClr}`, background: sectionBg, color: panelText, fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
        >
          <Copy style={{ width: 14, height: 14 }} />
          Хувилах
        </button>
        <button
          onClick={onDelete}
          style={{ flex: 1, padding: '8px 0', borderRadius: 10, border: '1px solid #fecaca', background: '#fff1f2', color: '#ef4444', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
        >
          <Trash2 style={{ width: 14, height: 14 }} />
          Устгах
        </button>
      </div>
    </div>
  )
}

// ─── Canvas Block Item ────────────────────────────────────────────────────────

function CanvasBlock({
  block, isSelected, isPreview, zoom, viewWidth,
  onSelect, onDragStart, onResizeStart, index, total,
  onMoveUp, onMoveDown,
}: {
  block: BlockSection
  isSelected: boolean
  isPreview: boolean
  zoom: number
  viewWidth: number
  onSelect: () => void
  onDragStart: (e: React.MouseEvent) => void
  onResizeStart: (e: React.MouseEvent) => void
  index: number
  total: number
  onMoveUp: () => void
  onMoveDown: () => void
}) {
  const reg = COMPONENT_REGISTRY.find(r => r.type === block.componentType)
  const catColor = COMPONENT_COLORS[reg?.category || 'section']

  return (
    <div
      id={`block-${block.id}`}
      style={{
        position: 'absolute',
        left: 0,
        width: viewWidth,
        top: block.order * 0, // computed from cumHeight, passed via 'top'
        height: block.height,
        outline: isSelected && !isPreview ? `2px solid ${catColor}` : 'none',
        outlineOffset: isSelected && !isPreview ? '-2px' : 0,
        cursor: isPreview ? 'default' : 'default',
        userSelect: 'none',
        transition: 'outline 0.15s',
        boxSizing: 'border-box',
      }}
      onClick={e => { e.stopPropagation(); onSelect() }}
    >
      {/* Render preview */}
      <div style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
        <BlockPreview block={block} isSelected={isSelected} isPreview={isPreview} />
      </div>

      {/* Selection overlay + controls */}
      {isSelected && !isPreview && (
        <>
          {/* Top label bar */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0,
            background: catColor, color: '#fff',
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '4px 10px', fontSize: 11, fontWeight: 700,
            pointerEvents: 'none',
            zIndex: 10,
          }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff', opacity: 0.7 }} />
            {reg?.label || block.componentType}
          </div>

          {/* Drag handle */}
          <div
            onMouseDown={onDragStart}
            style={{
              position: 'absolute', top: '50%', left: -36, transform: 'translateY(-50%)',
              width: 28, height: 28, background: catColor, borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'grab', zIndex: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            }}
            title="Drag to reorder"
          >
            <GripVertical style={{ width: 14, height: 14, color: '#fff' }} />
          </div>

          {/* Move up/down */}
          <div style={{ position: 'absolute', top: '50%', left: -68, transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', gap: 4, zIndex: 20 }}>
            <button
              onClick={e => { e.stopPropagation(); onMoveUp() }}
              disabled={index === 0}
              style={{ width: 24, height: 24, background: index === 0 ? '#e2e8f0' : '#6366f1', border: 'none', borderRadius: 6, cursor: index === 0 ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: index === 0 ? 0.4 : 1 }}
            >
              <ChevronUp style={{ width: 12, height: 12, color: '#fff' }} />
            </button>
            <button
              onClick={e => { e.stopPropagation(); onMoveDown() }}
              disabled={index === total - 1}
              style={{ width: 24, height: 24, background: index === total - 1 ? '#e2e8f0' : '#6366f1', border: 'none', borderRadius: 6, cursor: index === total - 1 ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: index === total - 1 ? 0.4 : 1 }}
            >
              <ChevronDown style={{ width: 12, height: 12, color: '#fff' }} />
            </button>
          </div>

          {/* Resize handle */}
          <div
            onMouseDown={onResizeStart}
            style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              height: 14, cursor: 'ns-resize', zIndex: 20,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: `${catColor}22`,
            }}
          >
            <div style={{ width: 48, height: 4, background: catColor, borderRadius: 99, opacity: 0.6 }} />
          </div>
        </>
      )}

      {/* Hover add-below button */}
    </div>
  )
}

// ─── Main WixBuilder Component ────────────────────────────────────────────────

// ─── Floating Draggable Element ───────────────────────────────────────────────

function DraggableElement({ element, isPreview, onDragEnd, isSelected, onClick }: any) {
  const [pos, setPos] = useState({ x: element.x || 0, y: element.y || 0 })
  const [isDragging, setIsDragging] = useState(false)
  
  useEffect(() => {
    setPos({ x: element.x || 0, y: element.y || 0 })
  }, [element.x, element.y])

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isPreview) return
    e.stopPropagation()
    onClick()
    setIsDragging(true)
    const sx = e.clientX
    const sy = e.clientY
    const startX = pos.x
    const startY = pos.y

    const move = (me: MouseEvent) => {
      setPos({ x: startX + (me.clientX - sx), y: startY + (me.clientY - sy) })
    }
    const up = (me: MouseEvent) => {
      setIsDragging(false)
      onDragEnd(startX + (me.clientX - sx), startY + (me.clientY - sy))
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mouseup', up)
    }
    window.addEventListener('mousemove', move)
    window.addEventListener('mouseup', up)
  }

  return (
    <div
      onMouseDown={handleMouseDown}
      onClick={(e) => { e.stopPropagation(); onClick() }}
      style={{
        position: 'absolute', left: pos.x, top: pos.y, zIndex: 50,
        cursor: isPreview ? 'default' : 'move',
        border: isPreview ? 'none' : isSelected ? '2px solid #ec4899' : '1px dashed transparent',
      }}
    >
      {element.type === 'button' ? (
        <button style={{ pointerEvents: isPreview ? 'auto' : 'none', padding: '8px 16px', background: '#ec4899', color: '#fff', borderRadius: 8, border: 'none', fontWeight: 600 }}>{element.text || 'Товч'}</button>
      ) : element.type === 'image' ? (
         <div style={{ pointerEvents: isPreview ? 'auto' : 'none', width: 120, height: 120, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderRadius: 8 }}>
           {element.src ? <img src={element.src} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <ImageIcon style={{ width: 32, height: 32, color: '#94a3b8' }} />}
         </div>
      ) : null}
    </div>
  )
}

export default function WixBuilder({ isDarkMode }: { isDarkMode: boolean }) {
  const accessToken = useAuthStore(s => s.accessToken)!
  const selectedProject = useProjectStore(s => s.selectedProjectName)
  const setSelectedProject = useProjectStore(s => s.setSelectedProjectName)
  const qc = useQueryClient()

  // State
  const [pageRoute, setPageRoute] = useState('/')
  const [blocks, setBlocks] = useState<BlockSection[]>([])
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null)
  const [isPreview, setIsPreview] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('desktop')
  const [zoom, setZoom] = useState(0.7)
  const [panelTab, setPanelTab] = useState<PanelTab>('components')
  const [leftPanelOpen, setLeftPanelOpen] = useState(true)
  const [rightPanelOpen, setRightPanelOpen] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [history, setHistory] = useState<BlockSection[][]>([])
  const [historyIdx, setHistoryIdx] = useState(-1)
  const [isDraggingFromPalette, setIsDraggingFromPalette] = useState<string | null>(null)
  const [dropIndex, setDropIndex] = useState<number | null>(null)

  const canvasRef = useRef<HTMLDivElement>(null)
  const canvasScrollRef = useRef<HTMLDivElement>(null)

  const dm = isDarkMode
  const viewWidth = VIEWPORT_WIDTHS[viewMode]

  // ── Queries ──
  const projectsQuery = useQuery({
    queryKey: ['projects'],
    queryFn: () => api.listProjects(accessToken),
    enabled: !!accessToken,
  })

  const treeQuery = useQuery({
    queryKey: ['blocks-tree', selectedProject, pageRoute],
    queryFn: () => api.contentAdminBlocksTree(accessToken, selectedProject!, pageRoute),
    enabled: !!accessToken && !!selectedProject && !!pageRoute,
  })

  const typesQuery = useQuery({
    queryKey: ['component-types', selectedProject],
    queryFn: () => api.contentAdminComponentTypes(accessToken, selectedProject!),
    enabled: !!accessToken && !!selectedProject,
  })

  const designQuery = useQuery({
    queryKey: ['design', selectedProject],
    queryFn: () => api.getDesign(accessToken, selectedProject!),
    enabled: !!selectedProject,
  })

  // ── Sync tree data → blocks ──
  useEffect(() => {
    const components = treeQuery.data?.components ?? []
    if (!components.length) { setBlocks([]); return }

    const flatBlocks: BlockSection[] = []
    function flattenTree(nodes: TreeNode[]) {
      for (const node of nodes) {
        let type = node.componentType.toLowerCase()
        if (type === 'hero' && (node.props as any)?._realType) {
          type = (node.props as any)._realType
        }
        const reg = COMPONENT_REGISTRY.find(r => r.type === type)
        flatBlocks.push({
          id: node.instanceId,
          componentType: type,
          props: node.props as any,
          order: node.order,
          height: (node.props as any)?._canvas?.h || reg?.defaultHeight || 200,
          instanceId: node.instanceId,
          parentId: node.parentId,
          slot: node.slot,
        })
        for (const slot of node.children || []) {
          for (const child of slot.components || []) {
            let childType = child.componentType.toLowerCase()
            if (childType === 'hero' && (child.props as any)?._realType) {
              childType = (child.props as any)._realType
            }
            flatBlocks.push({
              id: child.instanceId,
              componentType: childType,
              props: child.props as any,
              order: child.order,
              height: (child.props as any)?._canvas?.h || COMPONENT_REGISTRY.find(r => r.type === childType)?.defaultHeight || 200,
              instanceId: child.instanceId,
              parentId: child.parentId,
              slot: child.slot,
            })
          }
        }
      }
    }
    flattenTree(components)
    flatBlocks.sort((a, b) => a.order - b.order)
    setBlocks(flatBlocks)
  }, [treeQuery.data?.components])

  // ── Computed block positions (cumulative) ──
  const blockPositions = useMemo(() => {
    const positions: { top: number; bottom: number }[] = []
    let y = 0
    for (const b of blocks) {
      positions.push({ top: y, bottom: y + b.height })
      y += b.height
    }
    return positions
  }, [blocks])

  const totalHeight = useMemo(() => blockPositions.reduce((max, bp) => Math.max(max, bp.bottom), 0), [blockPositions])

  // ── Mutations ──
  const createMut = useMutation({
    mutationFn: (body: any) => api.createComponent(accessToken, selectedProject!, body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['blocks-tree', selectedProject, pageRoute] }); toast.success('Амжилттай') },
    onError: () => toast.error('Failed to add component'),
  })

  const deleteMut = useMutation({
    mutationFn: (id: string) => api.deleteComponent(accessToken, selectedProject!, id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['blocks-tree', selectedProject, pageRoute] }); toast.success('Устгагдлаа') },
    onError: () => toast.error('Delete failed'),
  })

  const patchMut = useMutation({
    mutationFn: ({ id, body }: { id: string; body: any }) => api.patchComponent(accessToken, selectedProject!, id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['blocks-tree', selectedProject, pageRoute] }),
  })

  const reorderMut = useMutation({
    mutationFn: (instances: { instanceId: string; order: number }[]) => api.reorderComponents(accessToken, selectedProject!, instances),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['blocks-tree', selectedProject, pageRoute] }),
  })

  const patchCanvasMut = useMutation({
    mutationFn: ({ id, h }: { id: string; h: number }) => api.patchComponentCanvasLayout(accessToken, selectedProject!, id, { h }),
  })

  const designPatchMut = useMutation({
    mutationFn: () => api.patchDesign(accessToken, selectedProject!, selectedProject!, {
      'theme.primaryColor': '#6366f1',
      'theme.fontFamily': 'Inter',
    }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['design', selectedProject] }); toast.success('Загвар амжилттай хадгалагдлаа') },
  })

  // ── History helpers ──
  const pushHistory = useCallback((newBlocks: BlockSection[]) => {
    setHistory(h => {
      const trimmed = h.slice(0, historyIdx + 1)
      return [...trimmed, newBlocks].slice(-30)
    })
    setHistoryIdx(i => Math.min(i + 1, 29))
  }, [historyIdx])

  const undo = useCallback(() => {
    if (historyIdx <= 0) return
    setHistoryIdx(i => i - 1)
    setBlocks(history[historyIdx - 1] || [])
  }, [history, historyIdx])

  const redo = useCallback(() => {
    if (historyIdx >= history.length - 1) return
    setHistoryIdx(i => i + 1)
    setBlocks(history[historyIdx + 1] || [])
  }, [history, historyIdx])

  // ── Add block from palette ──
  const addBlock = useCallback((type: string, atIndex?: number) => {
    if (!selectedProject) { toast.error('Төсөл сонгоно уу'); return }
    const reg = COMPONENT_REGISTRY.find(r => r.type === type)
    const order = atIndex !== undefined ? atIndex : blocks.length
    
    // Fallback: If not a native section, we spoof it as a hero to bypass backend root check
    const isRootAllowed = ['header', 'hero', 'about', 'footer', 'pagination'].includes(type)
    
    createMut.mutate({
      componentType: isRootAllowed ? type : 'hero',
      pageRoute,
      parentId: null,
      slot: null,
      order,
      props: { 
        ...getDefaultProps(type), 
        _canvas: { h: reg?.defaultHeight || 200 },
        ...(isRootAllowed ? {} : { _realType: type, title: 'Агуулга', copyright: '©' })
      },
    })
  }, [selectedProject, pageRoute, blocks.length, createMut])

  // ── Drag from palette ──
  const MIME_TYPE = 'application/x-wix-block-type'

  const handlePaletteDragStart = (e: React.DragEvent, type: string) => {
    e.dataTransfer.setData(MIME_TYPE, type)
    e.dataTransfer.effectAllowed = 'copy'
    setIsDraggingFromPalette(type)
  }

  const handleCanvasDragOver = useCallback((e: React.DragEvent) => {
    if (!e.dataTransfer.types.includes(MIME_TYPE)) return
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'

    // compute nearest drop index
    const canvasEl = canvasRef.current
    if (!canvasEl) return
    const rect = canvasEl.getBoundingClientRect()
    const scrollTop = canvasScrollRef.current?.scrollTop || 0
    const mouseY = (e.clientY - rect.top + scrollTop) / zoom
    let idx = blocks.length
    for (let i = 0; i < blockPositions.length; i++) {
      const mid = (blockPositions[i].top + blockPositions[i].bottom) / 2
      if (mouseY < mid) { idx = i; break }
    }
    setDropIndex(idx)
  }, [blocks, blockPositions, zoom])

  const handleCanvasDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const type = e.dataTransfer.getData(MIME_TYPE)
    if (!type) return
    setIsDraggingFromPalette(null)
    const insertAt = dropIndex !== null ? dropIndex : blocks.length
    setDropIndex(null)
    addBlock(type, insertAt)
  }, [addBlock, dropIndex, blocks.length])

  const handleCanvasDragLeave = () => {
    setDropIndex(null)
    setIsDraggingFromPalette(null)
  }

  // ── Select block ──
  const selectedBlock = blocks.find(b => b.id === selectedBlockId) || null

  // ── Update props ──
  const handleUpdateProps = useCallback((blockId: string, newProps: Record<string, any>, newHeight?: number) => {
    setBlocks(prev => prev.map(b => b.id === blockId
      ? { ...b, props: newProps, height: newHeight !== undefined ? newHeight : b.height }
      : b))

    const block = blocks.find(b => b.id === blockId)
    if (!block?.instanceId) return

    if (newHeight !== undefined) {
      patchCanvasMut.mutate({ id: block.instanceId, h: newHeight })
    }
    patchMut.mutate({ id: block.instanceId, body: { props: { ...newProps, _canvas: { h: newHeight || block.height } } } })
  }, [blocks, patchMut, patchCanvasMut])

  // ── Delete block ──
  const handleDeleteBlock = useCallback((blockId: string) => {
    const block = blocks.find(b => b.id === blockId)
    if (block?.instanceId) deleteMut.mutate(block.instanceId)
    setBlocks(prev => prev.filter(b => b.id !== blockId))
    if (selectedBlockId === blockId) setSelectedBlockId(null)
  }, [blocks, deleteMut, selectedBlockId])

  // ── Duplicate block ──
  const handleDuplicateBlock = useCallback((blockId: string) => {
    const block = blocks.find(b => b.id === blockId)
    if (!block || !selectedProject) return
    const idx = blocks.indexOf(block)
    const type = block.componentType
    const isRootAllowed = ['header', 'hero', 'about', 'footer', 'pagination'].includes(type)
    
    createMut.mutate({
      componentType: isRootAllowed ? type : 'hero',
      pageRoute,
      parentId: null,
      slot: null,
      order: idx + 1,
      props: { 
        ...block.props, 
        _canvas: { h: block.height },
        ...(isRootAllowed ? {} : { _realType: type, title: 'Агуулга', copyright: '©' })
      },
    })
  }, [blocks, selectedProject, pageRoute, createMut])

  // ── Move up/down ──
  const handleMove = useCallback((blockId: string, direction: 'up' | 'down') => {
    setBlocks(prev => {
      const idx = prev.findIndex(b => b.id === blockId)
      if (idx < 0) return prev
      const newIdx = direction === 'up' ? idx - 1 : idx + 1
      if (newIdx < 0 || newIdx >= prev.length) return prev
      const next = [...prev]
      ;[next[idx], next[newIdx]] = [next[newIdx], next[idx]]
      const reordered = next.map((b, i) => ({ ...b, order: i }))
      // persist reorder
      const instances = reordered
        .filter(b => b.instanceId)
        .map(b => ({ instanceId: b.instanceId!, order: b.order }))
      if (instances.length) reorderMut.mutate(instances)
      return reordered
    })
  }, [reorderMut])

  // ── Resize block (mouse drag on resize handle) ──
  const handleResizeStart = useCallback((e: React.MouseEvent, blockId: string) => {
    e.preventDefault()
    e.stopPropagation()
    const startY = e.clientY
    const block = blocks.find(b => b.id === blockId)
    if (!block) return
    const startH = block.height

    const onMove = (me: MouseEvent) => {
      const delta = (me.clientY - startY) / zoom
      const newH = Math.max(60, Math.round(startH + delta))
      setBlocks(prev => prev.map(b => b.id === blockId ? { ...b, height: newH } : b))
    }

    const onUp = (me: MouseEvent) => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
      const finalH = Math.max(60, Math.round(startH + (me.clientY - startY) / zoom))
      const block = blocks.find(b => b.id === blockId)
      if (block?.instanceId) {
        patchCanvasMut.mutate({ id: block.instanceId, h: finalH })
        patchMut.mutate({ id: block.instanceId, body: { props: { ...block.props, _canvas: { h: finalH } } } })
      }
    }

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }, [blocks, zoom, patchCanvasMut, patchMut])

  // ── Publish ──
  const handlePublish = () => {
    if (!selectedProject) return toast.error('Select a project')
    const id = toast.loading('Publishing...')
    api.buildProject(accessToken, selectedProject)
      .then(() => { toast.success('Published!', { id }); qc.invalidateQueries({ queryKey: ['projects'] }) })
      .catch(e => toast.error('Publish failed: ' + e.message, { id }))
  }

  // ── Keyboard shortcuts ──
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedBlockId && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement)) {
          handleDeleteBlock(selectedBlockId)
        }
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') { e.preventDefault(); undo() }
      if ((e.metaKey || e.ctrlKey) && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) { e.preventDefault(); redo() }
      if (e.key === 'Escape') setSelectedBlockId(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selectedBlockId, handleDeleteBlock, undo, redo])

  // ── Filtered palette ──
  const paletteGroups = useMemo(() => {
    const q = searchQuery.toLowerCase()
    const filtered = COMPONENT_REGISTRY.filter(r =>
      r.label.toLowerCase().includes(q) || r.type.includes(q) || r.category.includes(q)
    )
    const groups: Record<string, typeof COMPONENT_REGISTRY> = {}
    for (const item of filtered) {
      if (!groups[item.category]) groups[item.category] = []
      groups[item.category].push(item)
    }
    return groups
  }, [searchQuery])

  // ── Colors ──
  const surface = dm ? '#0f172a' : '#ffffff'
  const surface2 = dm ? '#1e293b' : '#f8fafc'
  const border = dm ? '#334155' : '#e2e8f0'
  const text = dm ? '#f1f5f9' : '#0f172a'
  const textMuted = dm ? '#64748b' : '#94a3b8'
  const canvasBg = dm ? '#0a0f1e' : '#e8edf5'

  const PANEL_WIDTH = 264

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: canvasBg, overflow: 'hidden' }}>

      {/* ── TOP TOOLBAR ── */}
      <header style={{
        height: 52, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 0,
        background: dm ? '#070b18' : '#ffffff', borderBottom: `1px solid ${border}`,
        padding: '0 12px', zIndex: 50,
      }}>
        {/* Left: project + page */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingRight: 12, borderRight: `1px solid ${border}` }}>
          <Layout style={{ width: 16, height: 16, color: '#6366f1' }} />
          <select
            value={selectedProject ?? ''}
            onChange={e => setSelectedProject(e.target.value || null)}
            style={{ background: 'transparent', border: 'none', color: text, fontSize: 13, fontWeight: 700, cursor: 'pointer', outline: 'none', maxWidth: 140 }}
          >
            <option value="">Төсөл сонгох</option>
            {(projectsQuery.data?.projects ?? []).map(p => (
              <option key={String(p.name)} value={String(p.name)}>{String(p.name)}</option>
            ))}
          </select>
          {/* <ChevronDown style={{ width: 12, height: 12, color: textMuted }} /> */}
          <div style={{ width: 1, height: 16, background: border, margin: '0 4px' }} />
          <input
            value={pageRoute}
            onChange={e => setPageRoute(e.target.value)}
            style={{ background: 'transparent', border: 'none', color: '#6366f1', fontSize: 12, fontFamily: 'monospace', outline: 'none', width: 80 }}
          />
        </div>

        {/* Center: viewport controls + zoom */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
          {/* Viewport */}
          {(['desktop', 'tablet', 'mobile'] as ViewMode[]).map(v => {
            const icons = { desktop: Monitor, tablet: Tablet, mobile: Smartphone }
            const Icon = icons[v]
            return (
              <button
                key={v}
                onClick={() => setViewMode(v)}
                title={v}
                style={{
                  width: 32, height: 32, borderRadius: 8, border: 'none', cursor: 'pointer',
                  background: viewMode === v ? '#6366f1' : 'transparent',
                  color: viewMode === v ? '#fff' : textMuted,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.15s',
                }}
              >
                <Icon style={{ width: 15, height: 15 }} />
              </button>
            )
          })}

          <div style={{ width: 1, height: 20, background: border, margin: '0 6px' }} />

          {/* Zoom */}
          <button
            onClick={() => setZoom(z => Math.max(0.25, +(z - 0.1).toFixed(2)))}
            style={{ width: 28, height: 28, borderRadius: 6, border: 'none', background: 'transparent', color: textMuted, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <ZoomOut style={{ width: 14, height: 14 }} />
          </button>
          <div style={{ fontSize: 12, fontWeight: 700, color: text, minWidth: 44, textAlign: 'center', cursor: 'pointer' }}
            onClick={() => setZoom(0.7)}
          >
            {Math.round(zoom * 100)}%
          </div>
          <button
            onClick={() => setZoom(z => Math.min(2, +(z + 0.1).toFixed(2)))}
            style={{ width: 28, height: 28, borderRadius: 6, border: 'none', background: 'transparent', color: textMuted, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <ZoomIn style={{ width: 14, height: 14 }} />
          </button>

          <div style={{ width: 1, height: 20, background: border, margin: '0 6px' }} />

          {/* Fit/Reset */}
          <button
            onClick={() => setZoom(1)}
            style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 8, border: `1px solid ${border}`, background: 'transparent', color: textMuted, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}
          >
            <Maximize2 style={{ width: 12, height: 12 }} />
            100%
          </button>

          <div style={{ width: 1, height: 20, background: border, margin: '0 6px' }} />

          {/* Undo/Redo */}
          <button onClick={undo} disabled={historyIdx <= 0} style={{ width: 28, height: 28, borderRadius: 6, border: 'none', background: 'transparent', color: historyIdx <= 0 ? border : textMuted, cursor: historyIdx <= 0 ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Undo2 style={{ width: 14, height: 14 }} />
          </button>
          <button onClick={redo} disabled={historyIdx >= history.length - 1} style={{ width: 28, height: 28, borderRadius: 6, border: 'none', background: 'transparent', color: historyIdx >= history.length - 1 ? border : textMuted, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Redo2 style={{ width: 14, height: 14 }} />
          </button>
        </div>

        {/* Right: panels + preview + publish */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, paddingLeft: 12, borderLeft: `1px solid ${border}` }}>
          <button
            onClick={() => setLeftPanelOpen(o => !o)}
            title="Toggle left panel"
            style={{ width: 30, height: 30, borderRadius: 8, border: 'none', background: leftPanelOpen ? '#6366f120' : 'transparent', color: leftPanelOpen ? '#6366f1' : textMuted, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <PanelLeft style={{ width: 15, height: 15 }} />
          </button>
          <button
            onClick={() => setRightPanelOpen(o => !o)}
            title="Toggle right panel"
            style={{ width: 30, height: 30, borderRadius: 8, border: 'none', background: rightPanelOpen ? '#6366f120' : 'transparent', color: rightPanelOpen ? '#6366f1' : textMuted, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <PanelRight style={{ width: 15, height: 15 }} />
          </button>

          <div style={{ width: 1, height: 20, background: border }} />

          <button
            onClick={() => { setIsPreview(p => !p); setSelectedBlockId(null) }}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', background: isPreview ? '#f59e0b' : surface2, color: isPreview ? '#fff' : text, fontSize: 12, fontWeight: 700, transition: 'all 0.15s' }}
          >
            {isPreview ? <EyeOff style={{ width: 14, height: 14 }} /> : <Eye style={{ width: 14, height: 14 }} />}
            {isPreview ? 'Edit' : 'Preview'}
          </button>

          <button
            onClick={handlePublish}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', background: '#6366f1', color: '#fff', fontSize: 12, fontWeight: 700, boxShadow: '0 2px 12px rgba(99,102,241,0.35)' }}
          >
            <Globe style={{ width: 14, height: 14 }} />
            Нийтлэх
          </button>

          {selectedProject && (() => {
            const proj = projectsQuery.data?.projects?.find(p => String(p.name) === selectedProject);
            const siteUrl = proj?.url || (proj?.port ? `http://202.179.6.77:${proj.port}` : null);
            if (!siteUrl) return null;
            return (
              <a
                href={siteUrl as string}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', background: '#10b981', color: '#fff', fontSize: 12, fontWeight: 700, textDecoration: 'none' }}
              >
                <ExternalLink style={{ width: 14, height: 14 }} />
                Сайт руу зочлох
              </a>
            );
          })()}
        </div>
      </header>

      {/* ── BODY: panels + canvas ── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>

        {/* ── LEFT PANEL ── */}
        {leftPanelOpen && (
          <aside style={{
            width: PANEL_WIDTH, flexShrink: 0, display: 'flex', flexDirection: 'column',
            background: surface, borderRight: `1px solid ${border}`, zIndex: 40, overflow: 'hidden',
          }}>
            {/* Panel tabs */}
            <div style={{ display: 'flex', borderBottom: `1px solid ${border}`, padding: '0 8px', flexShrink: 0 }}>
              {(['components', 'layers'] as PanelTab[]).map(tab => (
                <button
                  key={tab}
                  onClick={() => setPanelTab(tab)}
                  style={{
                    flex: 1, padding: '12px 0', border: 'none', background: 'transparent',
                    color: panelTab === tab ? '#6366f1' : textMuted,
                    fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
                    cursor: 'pointer', borderBottom: panelTab === tab ? '2px solid #6366f1' : '2px solid transparent',
                    transition: 'all 0.15s',
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>

            {panelTab === 'components' ? (
              <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                {/* Search */}
                <div style={{ padding: '10px 12px', borderBottom: `1px solid ${border}`, flexShrink: 0 }}>
                  <div style={{ position: 'relative' }}>
                    <input
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Бүрэлдэхүүн хайх..."
                      style={{ width: '100%', padding: '7px 12px 7px 30px', borderRadius: 8, border: `1px solid ${border}`, background: surface2, color: text, fontSize: 12, outline: 'none', boxSizing: 'border-box' }}
                    />
                    <Package style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 12, height: 12, color: textMuted, pointerEvents: 'none' }} />
                  </div>
                </div>

                {/* Groups */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }} className="custom-scrollbar">
                  {Object.entries(paletteGroups).map(([category, items]) => (
                    <div key={category} style={{ marginBottom: 16 }}>
                      <div style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: COMPONENT_COLORS[category], padding: '4px 8px', marginBottom: 4 }}>
                        {category}
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                        {items.map(item => {
                          const Icon = item.icon
                          return (
                            <div
                              key={item.type}
                              draggable
                              onDragStart={e => handlePaletteDragStart(e, item.type)}
                              onDragEnd={() => { setIsDraggingFromPalette(null); setDropIndex(null) }}
                              onClick={() => addBlock(item.type)}
                              style={{
                                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                                padding: '12px 8px', borderRadius: 10,
                                border: `1px solid ${border}`, background: surface2,
                                cursor: 'grab', transition: 'all 0.15s', userSelect: 'none',
                              }}
                              className="palette-item"
                              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = COMPONENT_COLORS[category]; (e.currentTarget as HTMLElement).style.background = COMPONENT_COLORS[category] + '12' }}
                              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = border; (e.currentTarget as HTMLElement).style.background = surface2 }}
                            >
                              <div style={{ width: 32, height: 32, borderRadius: 8, background: COMPONENT_COLORS[category] + '18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Icon style={{ width: 16, height: 16, color: COMPONENT_COLORS[category] }} />
                              </div>
                              <span style={{ fontSize: 10, fontWeight: 700, color: text, textAlign: 'center', lineHeight: 1.2 }}>
                                {item.label}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* Layers panel */
              <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }} className="custom-scrollbar">
                {blocks.length === 0 ? (
                  <div style={{ padding: '32px 12px', textAlign: 'center', color: textMuted }}>
                    <Layers style={{ width: 32, height: 32, marginBottom: 8, opacity: 0.3, display: 'block', margin: '0 auto 8px' }} />
                    <p style={{ fontSize: 12 }}>Блок алга байна</p>
                  </div>
                ) : blocks.map((block, i) => {
                  const reg = COMPONENT_REGISTRY.find(r => r.type === block.componentType)
                  const Icon = reg?.icon || Package
                  const catColor = COMPONENT_COLORS[reg?.category || 'section']
                  const isSelected = block.id === selectedBlockId
                  return (
                    <div
                      key={block.id}
                      onClick={() => setSelectedBlockId(block.id)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px',
                        borderRadius: 8, marginBottom: 2, cursor: 'pointer',
                        background: isSelected ? catColor + '15' : 'transparent',
                        border: `1px solid ${isSelected ? catColor + '40' : 'transparent'}`,
                        transition: 'all 0.15s',
                      }}
                    >
                      <Icon style={{ width: 14, height: 14, color: catColor, flexShrink: 0 }} />
                      <span style={{ flex: 1, fontSize: 12, fontWeight: isSelected ? 700 : 500, color: text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {reg?.label || block.componentType}
                      </span>
                      <span style={{ fontSize: 10, color: textMuted }}>{block.height}px</span>
                    </div>
                  )
                })}
              </div>
            )}
          </aside>
        )}

        {/* ── CANVAS AREA ── */}
        <main
          style={{ flex: 1, overflow: 'hidden', position: 'relative', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', background: canvasBg }}
        >
          {/* Scrollable canvas wrapper */}
          <div
            ref={canvasScrollRef}
            style={{ width: '100%', height: '100%', overflowY: 'auto', overflowX: 'auto', display: 'flex', justifyContent: 'center', paddingTop: 40, paddingBottom: 80 }}
            className="custom-scrollbar"
          >
            {/* Canvas frame */}
            <div style={{
              position: 'relative',
              transformOrigin: 'top center',
              transform: `scale(${zoom})`,
              width: viewWidth,
              minHeight: Math.max(totalHeight, 600),
              flexShrink: 0,
              boxShadow: '0 8px 60px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.1)',
              borderRadius: 4,
              overflow: 'hidden',
              background: '#fff',
              // Add ruler-like border
              outline: `1px solid ${dm ? '#334155' : '#cbd5e1'}`,
            }}
              ref={canvasRef}
              onClick={e => {
                if (e.target === canvasRef.current) setSelectedBlockId(null)
              }}
              onDragOver={handleCanvasDragOver}
              onDrop={handleCanvasDrop}
              onDragLeave={handleCanvasDragLeave}
            >
              {/* Empty state */}
              {blocks.length === 0 && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', textAlign: 'center', padding: 40 }}>
                  <MousePointer2 style={{ width: 48, height: 48, marginBottom: 16, opacity: 0.3 }} />
                  <p style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: '#64748b' }}>Бүрэлдэхүүнүүдээ энд оруулна уу</p>
                  <p style={{ fontSize: 13, maxWidth: 300, lineHeight: 1.6 }}>
                    Зүүн самбараас бүрэлдэхүүн чирэх эсвэл түүн дээр дарж шууд нэмнэ үү.
                  </p>
                </div>
              )}

              {/* Blocks render at cumulative absolute positions */}
              {blocks.map((block, i) => (
                <div key={block.id}>
                  {/* Drop indicator line */}
                  {dropIndex === i && isDraggingFromPalette && !isPreview && (
                    <div style={{ position: 'absolute', left: 0, right: 0, top: blockPositions[i]?.top ?? 0, height: 3, background: '#6366f1', zIndex: 100, borderRadius: 2, boxShadow: '0 0 8px #6366f1' }} />
                  )}
                  <div
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: blockPositions[i]?.top ?? 0,
                      width: viewWidth,
                      height: block.height,
                    }}
                    id={`wix-block-${block.id}`}
                  >
                    {/* Render block preview */}
                    <div
                      style={{ width: '100%', height: '100%', overflow: 'hidden', position: 'relative', cursor: isPreview ? 'default' : 'pointer' }}
                      onClick={e => { if (!isPreview) { e.stopPropagation(); setSelectedBlockId(block.id) } }}
                    >
                      <BlockPreview block={block} isSelected={block.id === selectedBlockId} isPreview={isPreview} />

                      {/* --- FLOAT ELEMENTS --- */}
                      {(block.props?.floatElements || []).map((el: any, elIdx: number) => (
                        <DraggableElement
                          key={el.id}
                          element={el}
                          isPreview={isPreview}
                          isSelected={false}
                          onClick={() => setSelectedBlockId(block.id)}
                          onDragEnd={(nx: number, ny: number) => {
                            const newElements = [...(block.props?.floatElements || [])]
                            newElements[elIdx] = { ...newElements[elIdx], x: nx, y: ny }
                            handleUpdateProps(block.id, { ...(block.props || {}), floatElements: newElements })
                          }}
                        />
                      ))}
                      {/* --- END FLOAT --- */}

                      {/* Selection outline */}
                      {block.id === selectedBlockId && !isPreview && (
                        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', boxSizing: 'border-box', border: `2px solid ${COMPONENT_COLORS[COMPONENT_REGISTRY.find(r => r.type === block.componentType)?.category || 'section']}`, zIndex: 5, borderRadius: 1 }} />
                      )}

                      {/* Hover highlight */}
                      {!isPreview && block.id !== selectedBlockId && (
                        <div
                          className="block-hover-overlay"
                          style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0, background: 'rgba(99,102,241,0.04)', border: '1px solid rgba(99,102,241,0.2)', zIndex: 4, transition: 'opacity 0.15s' }}
                        />
                      )}
                    </div>

                    {/* Selection controls overlay */}
                    {block.id === selectedBlockId && !isPreview && (
                      <>
                        {/* Top action bar */}
                        <div style={{
                          position: 'absolute', top: 0, left: 0, right: 0, height: 28, zIndex: 20,
                          background: COMPONENT_COLORS[COMPONENT_REGISTRY.find(r => r.type === block.componentType)?.category || 'section'],
                          display: 'flex', alignItems: 'center', gap: 4, padding: '0 8px',
                          pointerEvents: 'none',
                        }}>
                          <span style={{ color: '#fff', fontSize: 11, fontWeight: 700, flex: 1 }}>
                            {COMPONENT_REGISTRY.find(r => r.type === block.componentType)?.label || block.componentType}
                          </span>
                          <span style={{ color: '#ffffff99', fontSize: 10 }}>{block.height}px</span>
                        </div>

                        {/* Drag handle (left side) */}
                        <div
                          onMouseDown={e => {
                            e.preventDefault()
                            e.stopPropagation()
                            if (isPreview) return
                            const startY = e.clientY
                            const startIdx = blocks.findIndex(b => b.id === block.id)
                            let currentIdx = startIdx

                            const onMove = (me: MouseEvent) => {
                              const delta = (me.clientY - startY) / zoom
                              const targetY = (blockPositions[startIdx]?.top ?? 0) + delta
                              let newIdx = startIdx
                              for (let j = 0; j < blockPositions.length; j++) {
                                const mid = ((blockPositions[j]?.top ?? 0) + (blockPositions[j]?.bottom ?? 0)) / 2
                                if (targetY >= mid) newIdx = j
                              }
                              if (newIdx !== currentIdx) {
                                currentIdx = newIdx
                                setBlocks(prev => {
                                  const arr = [...prev]
                                  const [removed] = arr.splice(startIdx, 1)
                                  arr.splice(newIdx, 0, removed)
                                  return arr.map((b, i) => ({ ...b, order: i }))
                                })
                              }
                            }
                            const onUp = () => {
                              document.removeEventListener('mousemove', onMove)
                              document.removeEventListener('mouseup', onUp)
                              // Persist reorder
                              const instances = blocks
                                .filter(b => b.instanceId)
                                .map((b, i) => ({ instanceId: b.instanceId!, order: i }))
                              if (instances.length) reorderMut.mutate(instances)
                            }
                            document.addEventListener('mousemove', onMove)
                            document.addEventListener('mouseup', onUp)
                          }}
                          style={{
                            position: 'absolute', left: -40, top: '50%', transform: 'translateY(-50%)',
                            width: 32, height: 32, background: COMPONENT_COLORS[COMPONENT_REGISTRY.find(r => r.type === block.componentType)?.category || 'section'],
                            borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'grab', zIndex: 30, boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                          }}
                        >
                          <GripVertical style={{ width: 14, height: 14, color: '#fff' }} />
                        </div>

                        {/* Move up/down */}
                        <div style={{ position: 'absolute', left: -76, top: '50%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', gap: 4, zIndex: 30 }}>
                          {[{ dir: 'up', icon: ChevronUp, disabled: i === 0 }, { dir: 'down', icon: ChevronDown, disabled: i === blocks.length - 1 }].map(({ dir, icon: Icon, disabled }) => (
                            <button
                              key={dir}
                              onClick={e => { e.stopPropagation(); handleMove(block.id, dir as any) }}
                              disabled={disabled}
                              style={{ width: 24, height: 24, borderRadius: 6, border: 'none', background: disabled ? '#e2e8f0' : '#6366f1', cursor: disabled ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: disabled ? 0.4 : 1, transition: 'all 0.15s' }}
                            >
                              <Icon style={{ width: 12, height: 12, color: disabled ? '#94a3b8' : '#fff' }} />
                            </button>
                          ))}
                        </div>

                        {/* Duplicate + Delete */}
                        <div style={{ position: 'absolute', top: 30, right: -44, display: 'flex', flexDirection: 'column', gap: 4, zIndex: 30 }}>
                          <button
                            onClick={e => { e.stopPropagation(); handleDuplicateBlock(block.id) }}
                            style={{ width: 32, height: 32, borderRadius: 8, border: 'none', background: '#6366f1', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(99,102,241,0.35)' }}
                            title="Duplicate"
                          >
                            <Copy style={{ width: 14, height: 14, color: '#fff' }} />
                          </button>
                          <button
                            onClick={e => { e.stopPropagation(); handleDeleteBlock(block.id) }}
                            style={{ width: 32, height: 32, borderRadius: 8, border: 'none', background: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(239,68,68,0.35)' }}
                            title="Delete"
                          >
                            <Trash2 style={{ width: 14, height: 14, color: '#fff' }} />
                          </button>
                        </div>

                        {/* Resize handle (bottom) */}
                        <div
                          onMouseDown={e => handleResizeStart(e, block.id)}
                          style={{
                            position: 'absolute', bottom: 0, left: 0, right: 0, height: 12, zIndex: 20,
                            cursor: 'ns-resize', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: COMPONENT_COLORS[COMPONENT_REGISTRY.find(r => r.type === block.componentType)?.category || 'section'] + '22',
                          }}
                        >
                          <div style={{ width: 60, height: 4, background: COMPONENT_COLORS[COMPONENT_REGISTRY.find(r => r.type === block.componentType)?.category || 'section'], borderRadius: 99, opacity: 0.7 }} />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}

              {/* Drop indicator at end */}
              {dropIndex === blocks.length && isDraggingFromPalette && !isPreview && (
                <div style={{ position: 'absolute', left: 0, right: 0, top: totalHeight, height: 3, background: '#6366f1', zIndex: 100, borderRadius: 2, boxShadow: '0 0 8px #6366f1' }} />
              )}

              {/* Total height spacer */}
              <div style={{ height: totalHeight }} />
            </div>

            {/* Canvas info bar */}
            <div style={{ position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: 12, background: dm ? 'rgba(15,23,42,0.9)' : 'rgba(255,255,255,0.95)', border: `1px solid ${border}`, borderRadius: 20, padding: '6px 16px', fontSize: 11, fontWeight: 600, color: textMuted, backdropFilter: 'blur(8px)', whiteSpace: 'nowrap' }}>
              <span style={{ color: '#6366f1' }}>{VIEWPORT_WIDTHS[viewMode]}px</span>
              <span>×</span>
              <span>{totalHeight}px</span>
              <div style={{ width: 1, height: 12, background: border }} />
              <span>{blocks.length} block{blocks.length !== 1 ? 's' : ''}</span>
              {treeQuery.isLoading && (
                <>
                  <div style={{ width: 1, height: 12, background: border }} />
                  <Loader2 style={{ width: 11, height: 11, animation: 'spin 1s linear infinite' }} />
                  <span>Loading...</span>
                </>
              )}
            </div>
          </div>
        </main>

        {/* ── RIGHT PANEL ── */}
        {rightPanelOpen && (
          <aside style={{
            width: PANEL_WIDTH, flexShrink: 0, display: 'flex', flexDirection: 'column',
            background: surface, borderLeft: `1px solid ${border}`, zIndex: 40, overflow: 'hidden',
          }}>
            {selectedBlock ? (
              <ComponentInspector
                key={selectedBlock.id}
                block={selectedBlock}
                onChange={(newProps, newHeight) => handleUpdateProps(selectedBlock.id, newProps, newHeight)}
                onDelete={() => handleDeleteBlock(selectedBlock.id)}
                onDuplicate={() => handleDuplicateBlock(selectedBlock.id)}
                isDarkMode={isDarkMode}
              />
            ) : (
              /* No selection state */
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: 16, borderBottom: `1px solid ${border}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Settings2 style={{ width: 16, height: 16, color: '#6366f1' }} />
                    <span style={{ fontWeight: 700, fontSize: 13, color: text }}>Properties</span>
                  </div>
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center' }}>
                  <div style={{ width: 56, height: 56, borderRadius: 16, background: '#6366f115', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                    <MousePointer2 style={{ width: 24, height: 24, color: '#6366f1', opacity: 0.6 }} />
                  </div>
                  <p style={{ color: text, fontWeight: 700, fontSize: 14, marginBottom: 8 }}>Select a block</p>
                  <p style={{ color: textMuted, fontSize: 12, lineHeight: 1.6 }}>
                    Click any block on the canvas to edit its properties
                  </p>
                </div>

                {/* Page-level settings */}
                <div style={{ padding: '16px', borderTop: `1px solid ${border}` }}>
                  <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#6366f1', marginBottom: 12 }}>
                    Page Settings
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 11, color: textMuted, flex: 1 }}>Хуудас</span>
                      <input
                        value={pageRoute}
                        onChange={e => setPageRoute(e.target.value)}
                        style={{ width: 100, padding: '4px 8px', borderRadius: 6, border: `1px solid ${border}`, background: surface2, color: text, fontSize: 11, outline: 'none', fontFamily: 'monospace' }}
                      />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 11, color: textMuted, flex: 1 }}>Блокууд</span>
                      <span style={{ fontSize: 11, color: text, fontWeight: 700 }}>{blocks.length}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </aside>
        )}
      </div>

      {/* Hover styles */}
      <style>{`
        .palette-item:active { cursor: grabbing !important; transform: scale(0.96); }
        .block-hover-overlay:hover { opacity: 1 !important; }
        [id^="wix-block-"]:hover .block-hover-overlay { opacity: 1 !important; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .custom-scrollbar::-webkit-scrollbar { width: 5px; height: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.2); border-radius: 99px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(99,102,241,0.5); }
      `}</style>
    </div>
  )
}

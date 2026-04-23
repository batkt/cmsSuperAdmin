'use client'
import { useState } from 'react'
import { BlockSection } from './templates'
import { Plus, Trash2, ChevronDown, ChevronUp, GripVertical } from 'lucide-react'

// ─── Element types the super admin can add freely ─────────────────────────────

type ElementType = 'text' | 'button' | 'image' | 'section' | 'card' | 'input' | 'divider' | 'badge'

interface FreeElement {
  id: string
  type: ElementType
  label: string
  value?: string
  color?: string
  bg?: string
  radius?: number
  size?: number
  width?: string
  height?: number
  placeholder?: string
  align?: string
}

const ELEMENT_DEFAULTS: Record<ElementType, Partial<FreeElement>> = {
  text:    { label: 'Текст', value: 'Текст энд...', color: '#1e293b', size: 16, align: 'left' },
  button:  { label: 'Товч', value: 'Товч', color: '#ffffff', bg: '#6366f1', radius: 10, size: 14 },
  image:   { label: 'Зураг', width: '100%', height: 200 },
  section: { label: 'Секц', bg: '#f8fafc', height: 120 },
  card:    { label: 'Карт', bg: '#ffffff', radius: 12, height: 160 },
  input:   { label: 'Оруулах талбар', placeholder: 'Энд бичнэ...', bg: '#f1f5f9', radius: 8 },
  divider: { label: 'Зааглагч', color: '#e2e8f0', height: 1 },
  badge:   { label: 'Таг', value: 'Шинэ', color: '#ffffff', bg: '#6366f1', radius: 999, size: 11 },
}

const ELEMENT_ICONS: Record<ElementType, string> = {
  text: 'T', button: '⬜', image: '🖼', section: '▤',
  card: '🃏', input: '✏', divider: '─', badge: '🏷',
}

// ─── Shared UI helpers ────────────────────────────────────────────────────────

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{label}</label>
      {children}
    </div>
  )
}

function ColorInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-2">
      <input type="color" value={value || '#000000'} onChange={e => onChange(e.target.value)}
        className="w-8 h-8 rounded-lg border border-slate-200 cursor-pointer p-0.5 bg-white" />
      <input type="text" value={value || ''} onChange={e => onChange(e.target.value)}
        className="flex-1 text-xs font-mono border border-slate-200 rounded-lg px-2 py-1.5 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-indigo-400" />
    </div>
  )
}

function Slider({ label, value, min, max, step = 1, onChange }: {
  label: string; value: number; min: number; max: number; step?: number; onChange: (v: number) => void
}) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between">
        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{label}</label>
        <span className="text-[10px] font-mono text-slate-400">{value}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))} className="w-full accent-indigo-500" />
    </div>
  )
}

function Select({ value, onChange, options }: {
  value: string; onChange: (v: string) => void; options: { value: string; label: string }[]
}) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      className="w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-indigo-400">
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  )
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!checked)}
      className={`relative w-9 h-5 rounded-full transition-colors ${checked ? 'bg-indigo-500' : 'bg-slate-200'}`}>
      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${checked ? 'left-4' : 'left-0.5'}`} />
    </button>
  )
}

function SectionLabel({ title }: { title: string }) {
  return <div className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400 pt-3 pb-0.5 border-t border-slate-100 first:border-0 first:pt-0">{title}</div>
}

const FONTS = ['Inter','Outfit','Poppins','Playfair Display','DM Sans','Roboto','Montserrat','Space Grotesk','Georgia'].map(f => ({ value: f, label: f }))
const SHADOWS = [{ value: 'none', label: 'Байхгүй' },{ value: 'sm', label: 'Жижиг' },{ value: 'md', label: 'Дунд' },{ value: 'lg', label: 'Том' },{ value: 'xl', label: 'Маш том' }]

// ─── Free Elements Panel ──────────────────────────────────────────────────────

function ElementEditor({ el, onChange, onDelete, onMove, isFirst, isLast }: {
  el: FreeElement; onChange: (u: Partial<FreeElement>) => void
  onDelete: () => void; onMove: (d: 'up' | 'down') => void
  isFirst: boolean; isLast: boolean
}) {
  const [open, setOpen] = useState(false)
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 cursor-pointer" onClick={() => setOpen(v => !v)}>
        <span className="text-base leading-none">{ELEMENT_ICONS[el.type]}</span>
        <span className="text-xs font-bold text-slate-700 flex-1 truncate">{el.label}</span>
        <div className="flex items-center gap-0.5">
          <button onClick={e => { e.stopPropagation(); onMove('up') }} disabled={isFirst}
            className="p-1 hover:bg-white rounded text-slate-400 disabled:opacity-25"><ChevronUp className="w-3 h-3" /></button>
          <button onClick={e => { e.stopPropagation(); onMove('down') }} disabled={isLast}
            className="p-1 hover:bg-white rounded text-slate-400 disabled:opacity-25"><ChevronDown className="w-3 h-3" /></button>
          <button onClick={e => { e.stopPropagation(); onDelete() }}
            className="p-1 hover:bg-red-50 text-red-400 rounded"><Trash2 className="w-3 h-3" /></button>
          {open ? <ChevronUp className="w-3 h-3 text-slate-400" /> : <ChevronDown className="w-3 h-3 text-slate-400" />}
        </div>
      </div>

      {open && (
        <div className="px-3 pb-3 space-y-2.5 border-t border-slate-200 pt-2.5 bg-white">
          <Row label="Нэр">
            <input value={el.label} onChange={e => onChange({ label: e.target.value })}
              className="w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-indigo-400" />
          </Row>

          {(el.type === 'text' || el.type === 'button' || el.type === 'badge') && (
            <Row label="Утга / Текст">
              <input value={el.value || ''} onChange={e => onChange({ value: e.target.value })}
                className="w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-indigo-400" />
            </Row>
          )}

          {el.type === 'input' && (
            <Row label="Placeholder">
              <input value={el.placeholder || ''} onChange={e => onChange({ placeholder: e.target.value })}
                className="w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-indigo-400" />
            </Row>
          )}

          {(el.type === 'text' || el.type === 'button' || el.type === 'badge' || el.type === 'divider') && (
            <Row label="Өнгө"><ColorInput value={el.color || '#1e293b'} onChange={v => onChange({ color: v })} /></Row>
          )}

          {(el.type === 'button' || el.type === 'badge' || el.type === 'card' || el.type === 'section' || el.type === 'input') && (
            <Row label="Арын өнгө"><ColorInput value={el.bg || '#ffffff'} onChange={v => onChange({ bg: v })} /></Row>
          )}

          {(el.type === 'text' || el.type === 'button' || el.type === 'badge') && (
            <Slider label="Фонтын хэмжээ" value={el.size || 14} min={8} max={72} onChange={v => onChange({ size: v })} />
          )}

          {(el.type === 'button' || el.type === 'badge' || el.type === 'card' || el.type === 'section' || el.type === 'input') && (
            <Slider label="Радиус" value={el.radius ?? 8} min={0} max={64} onChange={v => onChange({ radius: v })} />
          )}

          {(el.type === 'image' || el.type === 'card' || el.type === 'section' || el.type === 'divider') && (
            <Slider label="Өндөр (px)" value={el.height ?? 100} min={1} max={800} step={4} onChange={v => onChange({ height: v })} />
          )}

          {(el.type === 'text') && (
            <Row label="Тэгшитгэл">
              <Select value={el.align || 'left'} onChange={v => onChange({ align: v })}
                options={[{ value: 'left', label: 'Зүүн' }, { value: 'center', label: 'Төв' }, { value: 'right', label: 'Баруун' }]} />
            </Row>
          )}
        </div>
      )}
    </div>
  )
}

const ELEMENT_TYPES: { type: ElementType; label: string }[] = [
  { type: 'text',    label: 'Текст' },
  { type: 'button',  label: 'Товч' },
  { type: 'input',   label: 'Оруулах' },
  { type: 'image',   label: 'Зураг' },
  { type: 'card',    label: 'Карт' },
  { type: 'section', label: 'Секц' },
  { type: 'divider', label: 'Зааглагч' },
  { type: 'badge',   label: 'Таг' },
]

function FreeElementsPanel({ elements, onChange }: { elements: FreeElement[]; onChange: (els: FreeElement[]) => void }) {
  const [showPicker, setShowPicker] = useState(false)

  const add = (type: ElementType) => {
    const el: FreeElement = { id: `el-${Date.now()}`, type, ...ELEMENT_DEFAULTS[type] as any }
    onChange([...elements, el])
    setShowPicker(false)
  }

  const update = (id: string, patch: Partial<FreeElement>) =>
    onChange(elements.map(e => e.id === id ? { ...e, ...patch } : e))

  const remove = (id: string) => onChange(elements.filter(e => e.id !== id))

  const move = (index: number, dir: 'up' | 'down') => {
    const next = [...elements]
    const si = dir === 'up' ? index - 1 : index + 1
    ;[next[index], next[si]] = [next[si], next[index]]
    onChange(next)
  }

  return (
    <div className="space-y-2">
      {elements.map((el, i) => (
        <ElementEditor key={el.id} el={el}
          onChange={p => update(el.id, p)}
          onDelete={() => remove(el.id)}
          onMove={d => move(i, d)}
          isFirst={i === 0} isLast={i === elements.length - 1} />
      ))}

      {showPicker ? (
        <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 mb-2 px-1">Элемент нэмэх</p>
          <div className="grid grid-cols-4 gap-1">
            {ELEMENT_TYPES.map(({ type, label }) => (
              <button key={type} onClick={() => add(type)}
                className="flex flex-col items-center gap-0.5 p-1.5 rounded-lg hover:bg-indigo-100 text-indigo-700 transition-colors">
                <span className="text-base leading-none">{ELEMENT_ICONS[type]}</span>
                <span className="text-[9px] font-bold">{label}</span>
              </button>
            ))}
          </div>
          <button onClick={() => setShowPicker(false)} className="mt-1.5 w-full text-[10px] text-slate-400 hover:text-slate-600">Хаах</button>
        </div>
      ) : (
        <button onClick={() => setShowPicker(true)}
          className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border-2 border-dashed border-slate-200 text-slate-400 hover:border-indigo-300 hover:text-indigo-500 text-xs font-bold transition-all">
          <Plus className="w-3.5 h-3.5" /> Элемент нэмэх
        </button>
      )}
    </div>
  )
}

// ─── Main Inspector ───────────────────────────────────────────────────────────

export function Inspector({ block, onChange }: { block: BlockSection; onChange: (p: Record<string, any>) => void }) {
  const p = block.props || {}
  const s = (k: string, v: any) => onChange({ ...p, [k]: v })
  const type = block.componentType
  const elements: FreeElement[] = p._elements || []
  const setElements = (els: FreeElement[]) => s('_elements', els)

  return (
    <div className="p-4 space-y-3 text-slate-700">
      <div className="text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100">
        {type} — Тохиргоо
      </div>

      {/* ── Colors ── */}
      <SectionLabel title="Өнгө" />
      <Row label="Арын өнгө"><ColorInput value={p.bgColor || '#ffffff'} onChange={v => s('bgColor', v)} /></Row>
      <Row label="Текстийн өнгө"><ColorInput value={p.textColor || '#1e293b'} onChange={v => s('textColor', v)} /></Row>
      <Row label="Акцент өнгө"><ColorInput value={p.accentColor || '#6366f1'} onChange={v => s('accentColor', v)} /></Row>

      {/* ── Typography ── */}
      <SectionLabel title="Бичгийн загвар" />
      <Row label="Фонт"><Select value={p.fontFamily || 'Inter'} onChange={v => s('fontFamily', v)} options={FONTS} /></Row>
      {type === 'hero' && <>
        <Slider label="Гарчгийн хэмжээ" value={p.titleSize || 48} min={24} max={96} onChange={v => s('titleSize', v)} />
        <Row label="Гарчгийн жин">
          <Select value={String(p.titleWeight || '800')} onChange={v => s('titleWeight', v)}
            options={[{ value: '400', label: 'Normal' },{ value: '600', label: 'Semibold' },{ value: '700', label: 'Bold' },{ value: '800', label: 'Extrabold' },{ value: '900', label: 'Black' }]} />
        </Row>
        <Slider label="Дэд гарчгийн хэмжээ" value={p.subtitleSize || 18} min={12} max={36} onChange={v => s('subtitleSize', v)} />
      </>}
      {['services','features','products','pricing','clients','contact','about'].includes(type) && (
        <Slider label="Гарчгийн хэмжээ" value={p.titleSize || 34} min={16} max={64} onChange={v => s('titleSize', v)} />
      )}
      <Slider label="Текстийн хэмжээ" value={p.fontSize || 16} min={10} max={32} onChange={v => s('fontSize', v)} />

      {/* ── Spacing ── */}
      <SectionLabel title="Зай" />
      <Slider label="Хэвтээ дотор зай" value={p.paddingX ?? 48} min={0} max={160} step={4} onChange={v => s('paddingX', v)} />
      <Slider label="Босоо дотор зай" value={p.paddingY ?? 60} min={0} max={200} step={4} onChange={v => s('paddingY', v)} />

      {/* ── Layout ── */}
      {(type === 'hero' || type === 'about') && <>
        <SectionLabel title="Байрлал" />
        <Row label="Тэгшитгэл">
          <Select value={p.align || 'center'} onChange={v => s('align', v)}
            options={[{ value: 'left', label: 'Зүүн' },{ value: 'center', label: 'Төв' },{ value: 'right', label: 'Баруун' }]} />
        </Row>
        <Row label="Зураг">
          <div className="flex items-center gap-2"><Toggle checked={!!p.hasImage} onChange={v => s('hasImage', v)} /><span className="text-xs text-slate-400">{p.hasImage ? 'Тийм' : 'Үгүй'}</span></div>
        </Row>
      </>}

      {['services','features','products'].includes(type) && <>
        <SectionLabel title="Загвар" />
        <Slider label="Баганын тоо" value={p.columns || 3} min={1} max={6} onChange={v => s('columns', v)} />
      </>}

      {/* ── Cards ── */}
      {['services','features','products','pricing','clients','contact','about'].includes(type) && <>
        <SectionLabel title="Карт" />
        <Row label="Картын арын өнгө"><ColorInput value={p.cardBg || '#f8fafc'} onChange={v => s('cardBg', v)} /></Row>
        <Slider label="Картын радиус" value={p.cardRadius ?? 14} min={0} max={40} onChange={v => s('cardRadius', v)} />
        <Row label="Картын сүүдэр"><Select value={p.cardShadow || 'md'} onChange={v => s('cardShadow', v)} options={SHADOWS} /></Row>
      </>}

      {/* ── Button ── */}
      {(type === 'hero' || type === 'about' || type === 'promo') && <>
        <SectionLabel title="Товч" />
        <Row label="Товчны арын өнгө"><ColorInput value={p.btnBg || p.accentColor || '#6366f1'} onChange={v => s('btnBg', v)} /></Row>
        <Row label="Товчны текст өнгө"><ColorInput value={p.btnTextColor || '#ffffff'} onChange={v => s('btnTextColor', v)} /></Row>
        <Slider label="Товчны радиус" value={p.btnRadius ?? 10} min={0} max={40} onChange={v => s('btnRadius', v)} />
        <Slider label="Хэвтээ доторх зай" value={p.btnPaddingX ?? 28} min={8} max={80} step={2} onChange={v => s('btnPaddingX', v)} />
        <Slider label="Босоо доторх зай" value={p.btnPaddingY ?? 12} min={4} max={40} step={2} onChange={v => s('btnPaddingY', v)} />
      </>}

      {/* ── Header ── */}
      {type === 'header' && <>
        <SectionLabel title="Навигаци" />
        <Row label="Sticky"><div className="flex items-center gap-2"><Toggle checked={!!p.sticky} onChange={v => s('sticky', v)} /><span className="text-xs text-slate-400">{p.sticky ? 'Тийм' : 'Үгүй'}</span></div></Row>
        <Row label="Доод шугам"><div className="flex items-center gap-2"><Toggle checked={!!p.borderBottom} onChange={v => s('borderBottom', v)} /><span className="text-xs text-slate-400">{p.borderBottom ? 'Тийм' : 'Үгүй'}</span></div></Row>
        {p.borderBottom && <Row label="Шугамын өнгө"><ColorInput value={p.borderColor || '#e2e8f0'} onChange={v => s('borderColor', v)} /></Row>}
        <Row label="Сүүдэр"><Select value={p.shadowSize || 'sm'} onChange={v => s('shadowSize', v)} options={SHADOWS} /></Row>
      </>}

      {/* ── Contact form ── */}
      {type === 'contact' && <>
        <SectionLabel title="Маягт" />
        <Row label="Маягт харуулах"><div className="flex items-center gap-2"><Toggle checked={!!p.showForm} onChange={v => s('showForm', v)} /><span className="text-xs text-slate-400">{p.showForm ? 'Тийм' : 'Үгүй'}</span></div></Row>
        {p.showForm && <Row label="Хаяг (URL)">
          <input type="text" value={p.formTarget || ''} onChange={e => s('formTarget', e.target.value)}
            placeholder="admin.zevtabs.mn"
            className="w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-indigo-400" />
        </Row>}
      </>}

      {/* ── Hero video ── */}
      {type === 'hero' && <>
        <SectionLabel title="Видео" />
        <Row label="Видео арын дэвсгэр"><div className="flex items-center gap-2"><Toggle checked={!!p.hasVideo} onChange={v => s('hasVideo', v)} /><span className="text-xs text-slate-400">{p.hasVideo ? 'Тийм' : 'Үгүй'}</span></div></Row>
        {p.hasVideo && <Slider label="Overlay тодруулга (%)" value={p.overlayOpacity ?? 50} min={0} max={95} onChange={v => s('overlayOpacity', v)} />}
      </>}

      {/* ── Animation ── */}
      <SectionLabel title="Анимейшн" />
      <Row label="Эффект">
        <Select value={p.animation || 'none'} onChange={v => s('animation', v)}
          options={[
            { value: 'none', label: 'Байхгүй' },
            { value: 'fade-in', label: 'Уусах (Fade In)' },
            { value: 'fade-in-up', label: 'Доороос уусах (Fade In Up)' },
            { value: 'slide-in-left', label: 'Зүүнээс орж ирэх (Slide Left)' },
            { value: 'slide-in-right', label: 'Баруунаас орж ирэх (Slide Right)' },
            { value: 'zoom-in', label: 'Томрох (Zoom In)' }
          ]} />
      </Row>

      {/* ── FREE ELEMENTS ── */}
      <SectionLabel title="Чөлөөт элементүүд" />
      <FreeElementsPanel elements={elements} onChange={setElements} />

      <div className="text-[10px] text-slate-400 leading-relaxed bg-slate-50 rounded-xl px-3 py-2 border border-slate-100 mt-2">
        Текст, контент болон зургийг харилцагчийн Admin CMS-ээс оруулна. Та энд зөвхөн бүтэц, загвар, өнгөний тохиргоо хийнэ.
      </div>
    </div>
  )
}

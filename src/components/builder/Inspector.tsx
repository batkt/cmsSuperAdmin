'use client'
import { useState } from 'react'
import { BlockSection, type PageDef, defaultPageDisplayName, normalizePagePath } from './templates'
import { DEFAULT_HEADER_ZONES } from './headerCanvasDefaults'
import {
  defaultBlockCanvasHeight,
  isBuilderBlockCanvasType,
  mergeBlockCanvasZones,
} from './sectionCanvasDefaults'
import { Plus, Trash2, ChevronDown, ChevronUp, GripVertical } from 'lucide-react'

// ─── Element types the super admin can add freely ─────────────────────────────

type ElementType = 'text' | 'button' | 'image' | 'section' | 'card' | 'input' | 'divider' | 'badge' | 'menu'

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
  links?: unknown
  href?: string
  isExternal?: boolean
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
  menu:    { label: 'Цэс', links: [], size: 14, align: 'center', color: '#1e293b' },
}

const ELEMENT_ICONS: Record<ElementType, string> = {
  text: 'T', button: '⬜', image: '🖼', section: '▤',
  card: '🃏', input: '✏', divider: '─', badge: '🏷', menu: '☰',
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

function Select({ value, onChange, options, disabled }: {
  value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; disabled?: boolean
}) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)} disabled={disabled}
      className="w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed">
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

function ElementEditor({ el, onChange, onDelete, onMove, isFirst, isLast, pages }: {
  el: FreeElement; onChange: (u: Partial<FreeElement>) => void
  onDelete: () => void; onMove: (d: 'up' | 'down') => void
  isFirst: boolean; isLast: boolean; pages?: PageDef[]
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

          {(el.type === 'image' || el.type === 'card' || el.type === 'section' || el.type === 'button') && (
            <Row label="Өргөн (%)">
              <Slider label="Өргөн (%)" value={parseInt((el.width || '100').replace('%', '')) || 100} min={10} max={100} step={5} onChange={v => onChange({ width: `${v}%` })} />
            </Row>
          )}

          {(el.type === 'text') && (
            <Row label="Тэгшитгэл">
              <Select value={el.align || 'left'} onChange={v => onChange({ align: v })}
                options={[{ value: 'left', label: 'Зүүн' }, { value: 'center', label: 'Төв' }, { value: 'right', label: 'Баруун' }]} />
            </Row>
          )}

          {(el.type === 'menu') && (
            <div className="pt-2 border-t border-slate-100">
              <NavLinksPanel links={el.links} onChange={v => onChange({ links: v })} pages={pages || []} />
            </div>
          )}

          {(el.type === 'button' || el.type === 'image' || el.type === 'text' || el.type === 'card' || el.type === 'badge') && (
            <>
              <div className="pt-2 mt-2 border-t border-slate-100"></div>
              <Row label="Холбоос (Link/URL)">
                <input value={el.href || ''} onChange={e => onChange({ href: e.target.value })}
                  placeholder="/about эсвэл #section-id"
                  className="w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-indigo-400" />
              </Row>
              <Row label="Шинэ таб-д нээх">
                <div className="flex items-center gap-2 mt-1">
                  <Toggle checked={!!el.isExternal} onChange={v => onChange({ isExternal: v })} />
                  <span className="text-xs text-slate-400">{el.isExternal ? 'Тийм' : 'Үгүй'}</span>
                </div>
              </Row>
            </>
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
  { type: 'menu',    label: 'Цэс' },
]

function FreeElementsPanel({ elements, onChange, pages }: { elements: FreeElement[]; onChange: (els: FreeElement[]) => void; pages?: PageDef[] }) {
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
        <ElementEditor key={el.id} el={el} pages={pages}
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

// ─── Header nav links (persisted as props.links → DB / public Header) ─────────

type NavLinkRow = { label: string; href: string; isExternal?: boolean }

const GENERIC_PAGE_NAMES = new Set(['хуудас', 'холбоос', 'link', 'page', 'menu', ''])

/** Label for a nav row after picking a project page (matches dropdown intent). */
function pageNavLabel(pg: PageDef | undefined, hrefPath: string): string {
  const route = normalizePagePath(hrefPath)
  if (!pg) return defaultPageDisplayName(route)
  const n = (pg.name || '').trim()
  if (n && !GENERIC_PAGE_NAMES.has(n.toLowerCase())) return n
  return defaultPageDisplayName(normalizePagePath(pg.path))
}

function normalizeNavLinks(raw: unknown): NavLinkRow[] {
  if (!Array.isArray(raw)) return []
  return raw.map((x: any) => ({
    label: String(x?.label ?? '').trim(),
    href: String(x?.href ?? '/').trim() || '/',
    isExternal: !!x?.isExternal,
  }))
}

function NavLinksPanel({
  links,
  onChange,
  pages,
}: {
  links: unknown
  onChange: (next: NavLinkRow[]) => void
  pages: PageDef[]
}) {
  const list = normalizeNavLinks(links)
  const push = (next: NavLinkRow[]) => onChange(next)

  const update = (i: number, patch: Partial<NavLinkRow>) => {
    const n = [...list]
    n[i] = { ...n[i], ...patch }
    push(n)
  }
  const add = () => {
    const pg = pages[0]
    if (pg) {
      const path = normalizePagePath(pg.path)
      push([...list, { label: pageNavLabel(pg, path), href: path, isExternal: false }])
    } else {
      push([...list, { label: defaultPageDisplayName('/'), href: '/', isExternal: false }])
    }
  }

  const internalPathForLink = (href: string) => {
    const h = normalizePagePath(href)
    return pages.some((pg) => normalizePagePath(pg.path) === h) ? h : ''
  }
  const remove = (i: number) => push(list.filter((_, j) => j !== i))
  const move = (i: number, dir: 'up' | 'down') => {
    const j = dir === 'up' ? i - 1 : i + 1
    if (j < 0 || j >= list.length) return
    const n = [...list]
    ;[n[i], n[j]] = [n[j], n[i]]
    push(n)
  }

  return (
    <div className="space-y-2">
      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Цэсийн холбоосууд</label>
      {list.map((link, i) => (
        <div key={i} className="rounded-lg border border-slate-200 bg-white p-2.5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[9px] font-mono text-slate-400">#{i + 1}</span>
            <div className="flex items-center gap-0.5">
              <button type="button" onClick={() => move(i, 'up')} disabled={i === 0}
                className="p-1 hover:bg-slate-100 rounded text-slate-400 disabled:opacity-25"><ChevronUp className="w-3 h-3" /></button>
              <button type="button" onClick={() => move(i, 'down')} disabled={i === list.length - 1}
                className="p-1 hover:bg-slate-100 rounded text-slate-400 disabled:opacity-25"><ChevronDown className="w-3 h-3" /></button>
              <button type="button" onClick={() => remove(i)}
                className="p-1 hover:bg-red-50 text-red-400 rounded"><Trash2 className="w-3 h-3" /></button>
            </div>
          </div>
          <Row label="Текст (цэс дээр)">
            <input type="text" value={link.label} onChange={e => update(i, { label: e.target.value })}
              placeholder="Нүүр"
              className="w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-indigo-400" />
          </Row>
          {pages.length > 0 && (
            <Row label="Төслийн хуудас">
              <select
                className="w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-400"
                value={internalPathForLink(link.href)}
                onChange={(e) => {
                  const path = e.target.value
                  if (!path) return
                  const hrefNorm = normalizePagePath(path)
                  const pg = pages.find((p) => normalizePagePath(p.path) === hrefNorm)
                  update(i, {
                    href: hrefNorm,
                    isExternal: false,
                    label: pageNavLabel(pg, hrefNorm),
                  })
                }}
              >
                <option value="">— Хуудас сонгох (нэр + зам) —</option>
                {pages.map((pg) => (
                  <option key={pg.id} value={normalizePagePath(pg.path)}>
                    {pageNavLabel(pg, pg.path)} · {normalizePagePath(pg.path)}
                  </option>
                ))}
              </select>
            </Row>
          )}
          <Row label="Хаяг (href)">
            <input type="text" value={link.href} onChange={e => update(i, { href: e.target.value })}
              placeholder="/about эсвэл https://…"
              className="w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-indigo-400" />
          </Row>
          <Row label="Гадны сайт">
            <div className="flex items-center gap-2">
              <Toggle checked={!!link.isExternal} onChange={v => update(i, { isExternal: v })} />
              <span className="text-xs text-slate-400">{link.isExternal ? 'Шинэ таб' : 'Дотоод'}</span>
            </div>
          </Row>
        </div>
      ))}
      <button type="button" onClick={add}
        className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border-2 border-dashed border-slate-200 text-slate-500 hover:border-indigo-300 hover:text-indigo-600 text-xs font-bold transition-all">
        <Plus className="w-3.5 h-3.5" /> Цэсийн зүйл нэмэх
      </button>
    </div>
  )
}

// ─── Main Inspector ───────────────────────────────────────────────────────────

export function Inspector({
  block,
  onChange,
  pages = [],
}: {
  block: BlockSection
  onChange: (p: Record<string, any>) => void
  pages?: PageDef[]
}) {
  const p = block.props || {}
  const patch = (partial: Record<string, any>) => onChange({ ...(block.props || {}), ...partial })
  const s = (k: string, v: any) => patch({ [k]: v })
  const type = block.componentType
  const elements: FreeElement[] = p._elements || []
  const setElements = (els: FreeElement[]) => patch({ _elements: els })

  return (
    <div className="p-4 space-y-3 text-slate-700">
      <div className="text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100">
        {type} — Тохиргоо
      </div>

      {type === 'header' && (
        <>
          <SectionLabel title="Толгой болон цэс" />
          <Row label="Цэсийн нийлүүлэлт">
            <div className="flex items-center gap-2">
              <Toggle
                checked={p.headerNavIndependent !== true}
                onChange={(syncAllPages) => s('headerNavIndependent', !syncAllPages)}
              />
              <span className="text-xs text-slate-500">
                {p.headerNavIndependent === true
                  ? 'Зөвхөн энэ хуудас — бусад руу тархахгүй'
                  : 'Бүх хуудсанд автомат — нэр, холбоосыг нэг дор засна'}
              </span>
            </div>
          </Row>
          <Row label="Сайтын нэр (лого текст)">
            <input
              type="text"
              value={String(p.title ?? '')}
              onChange={(e) => s('title', e.target.value)}
              placeholder="Жишээ: My Brand"
              className="w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-indigo-400"
            />
          </Row>
          <NavLinksPanel links={p.links} onChange={(links) => patch({ links })} pages={pages} />
          <Slider label="Лого текстийн хэмжээ (px)" value={p.fontSize ?? 20} min={12} max={36} step={1} onChange={v => s('fontSize', v)} />
          <Slider label="Цэсийн текстийн хэмжээ (px)" value={p.navFontSize ?? 14} min={10} max={22} step={1} onChange={v => s('navFontSize', v)} />
        </>
      )}

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
      {type !== 'header' && (
        <Slider label="Текстийн хэмжээ" value={p.fontSize || 16} min={10} max={32} onChange={v => s('fontSize', v)} />
      )}

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
        <SectionLabel title="Байрлал" />
        <p className="text-[10px] text-slate-500 leading-relaxed -mt-1 mb-1">
          Толгойд Canvas асаах/унтраах: дээд мөр — <span className="font-semibold">Загвар сонгох</span> ба харагдах хэмжээ.
        </p>
        {p.headerCanvas && (
          <>
            <Slider
              label="Canvas өндөр (px)"
              value={p.headerCanvasHeight ?? 88}
              min={48}
              max={200}
              onChange={(v) => s('headerCanvasHeight', v)}
            />
            <button
              type="button"
              onClick={() => patch({ headerZones: { ...DEFAULT_HEADER_ZONES } })}
              className="w-full text-[10px] font-bold py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600"
            >
              Байрлалыг дахин тохируулах
            </button>
            <p className="text-[9px] text-slate-400 leading-relaxed">
              Canvas идэхэд сонгосон хуудсан дээрх толгойг сонгож, зураг дээрх бүлгүүдийг чирнэ. Нийлүүлэх цэсийн &quot;мөрийн&quot; тохиргоо ашиглагдахгүй.
            </p>
          </>
        )}
        <Row label="Загвар (мөр)">
          <Select value={p.headerLayout || 'row'} onChange={v => s('headerLayout', v)} disabled={!!p.headerCanvas}
            options={[
              { value: 'row', label: 'Нэг мөр (лого + цэс + товч)' },
              { value: 'stack', label: 'Хоёр мөр (лого дээр, цэс доор)' },
            ]} />
        </Row>
        <Row label="Мөрийн дараалал (хэвтээ)">
          <Select value={p.rowJustify || 'between'} onChange={v => s('rowJustify', v)} disabled={!!p.headerCanvas}
            options={[
              { value: 'start', label: 'Эхлүүл' },
              { value: 'center', label: 'Төв' },
              { value: 'end', label: 'Дуурь' },
              { value: 'between', label: "Хооронд нь (Between)" },
              { value: 'around', label: 'Around' },
              { value: 'evenly', label: 'Тэнцүү' },
            ]} />
        </Row>
        <Row label="Босоо тэгшлэх">
          <Select value={p.rowItems || 'center'} onChange={v => s('rowItems', v)} disabled={!!p.headerCanvas}
            options={[
              { value: 'start', label: 'Дээр' },
              { value: 'center', label: 'Дунд' },
              { value: 'end', label: 'Доор' },
              { value: 'baseline', label: 'Baseline' },
              { value: 'stretch', label: 'Сунгах' },
            ]} />
        </Row>
        <Row label="Намтар эргүүл">
          <div className="flex items-center gap-2">
            <Toggle checked={!!p.rowReverse} onChange={v => s('rowReverse', v)} />
            <span className="text-xs text-slate-400">{p.rowReverse ? 'Тийм' : 'Үгүй'}</span>
          </div>
        </Row>
        {p.headerLayout === 'stack' && <>
          <Row label="Логоны байр (desktop)">
            <Select value={p.stackBrandAlign || 'center'} onChange={v => s('stackBrandAlign', v)}
              options={[
                { value: 'start', label: 'Зүүн' },
                { value: 'center', label: 'Төв' },
                { value: 'end', label: 'Баруун' },
              ]} />
          </Row>
          <Row label="Нав-ийн оруулга (2-р мөр)">
            <Select value={p.stackNavJustify || 'center'} onChange={v => s('stackNavJustify', v)}
              options={[
                { value: 'start', label: 'Зүүн' },
                { value: 'center', label: 'Төв' },
                { value: 'end', label: 'Баруун' },
                { value: 'between', label: "Хооронд" },
                { value: 'around', label: 'Around' },
                { value: 'evenly', label: 'Тэнцүү' },
              ]} />
          </Row>
        </>}
        <Row label="CTA-г цэснээс тусгаарлах (товчоо баруун танхимд)">
          <div className="flex items-center gap-2">
            <Toggle checked={p.ctaWithNav === false} onChange={v => s('ctaWithNav', v ? false : true)} />
            <span className="text-xs text-slate-400">{(p.ctaWithNav === false) ? 'Тусад нь' : 'Цэстэй хамт'}</span>
          </div>
        </Row>
        <Slider label="Үндсэн хоорондох зай (px)" value={p.contentGap ?? 0} min={0} max={48} onChange={v => s('contentGap', v || undefined)} />

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

      {isBuilderBlockCanvasType(type) && (
        <>
          <SectionLabel title="Canvas зураг" />
          <p className="text-[10px] text-slate-500 leading-relaxed -mt-1 mb-1">
            Canvas асаах/унтраах: дээд талын мөр — <span className="font-semibold">Загвар сонгох</span> ба харагдах хэмжээ.
          </p>
          {p.blockCanvas && (
            <>
              <Slider
                label="Canvas өндөр (px)"
                value={p.blockCanvasHeight ?? defaultBlockCanvasHeight(type)}
                min={120}
                max={560}
                step={4}
                onChange={(v) => s('blockCanvasHeight', v)}
              />
              <button
                type="button"
                onClick={() => patch({ blockCanvasZones: mergeBlockCanvasZones(type, {}) })}
                className="w-full text-[10px] font-bold py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600"
              >
                Байрлалыг дахин тохируулах
              </button>
            </>
          )}
        </>
      )}

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
      <FreeElementsPanel elements={elements} onChange={setElements} pages={pages} />

      <div className="text-[10px] text-slate-400 leading-relaxed bg-slate-50 rounded-xl px-3 py-2 border border-slate-100 mt-2">
        Текст, контент болон зургийг харилцагчийн Admin CMS-ээс оруулна. Та энд зөвхөн бүтэц, загвар, өнгөний тохиргоо хийнэ.
      </div>
    </div>
  )
}

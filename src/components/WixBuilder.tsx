'use client'

import { useState, useCallback, useEffect } from 'react'
import {
  Monitor, Smartphone, Tablet, Plus, Trash2,
  Settings2, Layers, ChevronDown, Save, Loader2,
  ChevronUp, MousePointer2, FileText,
  LayoutTemplate, Star,
  Image as ImageIcon, Layout, Grid3X3, CreditCard,
  ShoppingBag, Users, Phone, Home, Car, LayoutGrid,
  RefreshCw,
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useProjectStore } from '@/stores/projectStore'
import { useAuthStore } from '@/stores/authStore'
import { api } from '@/lib/api'
import { BlockSection, PageDef, DEFAULT_EMPTY_PAGES } from './builder/templates'
import { BlockPreview } from './builder/BlockPreview'
import { Inspector } from './builder/Inspector'
import { TemplateGallery } from './builder/TemplateGallery'
import type { Template } from './builder/templates'

// ─── Component Registry ────────────────────────────────────────────────────────

const COMPONENT_REGISTRY = [
  { type: 'header', label: 'Толгой', icon: Monitor, category: 'Бүтэц' },
  { type: 'footer', label: 'Хөл', icon: Monitor, category: 'Бүтэц' },
  { type: 'hero', label: 'Нүүр секц', icon: ImageIcon, category: 'Хэсэг' },
  { type: 'about', label: 'Тухай', icon: FileText, category: 'Хэсэг' },
  { type: 'services', label: 'Үйлчилгээ', icon: Star, category: 'Хэсэг' },
  { type: 'features', label: 'Онцлог', icon: Grid3X3, category: 'Хэсэг' },
  { type: 'products', label: 'Бүтээгдэхүүн', icon: ShoppingBag, category: 'Хэсэг' },
  { type: 'pricing', label: 'Үнийн санал', icon: CreditCard, category: 'Хэсэг' },
  { type: 'clients', label: 'Харилцагчид', icon: Users, category: 'Хэсэг' },
  { type: 'promo', label: 'Промо банер', icon: Layout, category: 'Хэсэг' },
  { type: 'contact', label: 'Холбоо барих', icon: Phone, category: 'Хэсэг' },
]

function getDefaultProps(type: string): Record<string, any> {
  const base = { bgColor: '#ffffff', textColor: '#1e293b', accentColor: '#6366f1', fontFamily: 'Inter', paddingX: 48, paddingY: 60 }
  switch (type) {
    case 'header': return { ...base, paddingY: 18, sticky: true, borderBottom: true, borderColor: '#e2e8f0', shadowSize: 'sm' }
    case 'hero': return { ...base, paddingY: 100, align: 'center', hasImage: false, titleSize: 52, titleWeight: '800', subtitleSize: 18, btnRadius: 12, btnPaddingX: 32, btnPaddingY: 14 }
    case 'about': return { ...base, align: 'left', hasImage: true, titleSize: 34, cardRadius: 16 }
    case 'services': return { ...base, columns: 3, titleSize: 34, cardBg: '#f8fafc', cardRadius: 16, cardShadow: 'md' }
    case 'features': return { ...base, columns: 3, titleSize: 34, cardBg: '#f8fafc', cardRadius: 16 }
    case 'products': return { ...base, columns: 3, titleSize: 34, cardBg: '#ffffff', cardRadius: 16 }
    case 'pricing': return { ...base, titleSize: 34, cardBg: '#f8fafc', cardRadius: 16 }
    case 'clients': return { ...base, titleSize: 26, cardBg: '#f1f5f9', cardRadius: 10 }
    case 'promo': return { ...base, paddingY: 72, titleSize: 36, btnRadius: 12 }
    case 'contact': return { ...base, titleSize: 34, cardBg: '#f1f5f9', cardRadius: 12, showForm: true, formTarget: 'admin.zevtabs.mn' }
    case 'footer': return { ...base, bgColor: '#0f172a', textColor: '#e2e8f0', paddingY: 48, align: 'center' }
    default: return base
  }
}

type ViewMode = 'desktop' | 'tablet' | 'mobile'
const VIEW_WIDTHS: Record<ViewMode, string> = { desktop: '100%', tablet: '768px', mobile: '390px' }

// ─── Serialise pages → flat ComponentRecord list ───────────────────────────────
function pagesToComponents(pages: PageDef[]) {
  return pages.flatMap(page =>
    page.blocks.map(block => ({
      instanceId: block.id,
      pageRoute: page.path,
      componentType: block.componentType,
      parentId: null,
      slot: null,
      order: block.order,
      props: block.props,
      // store page meta in props for easy round-trip
      _pageName: page.name,
      _pageId: page.id,
    }))
  )
}

// ─── Deserialise flat list → pages ────────────────────────────────────────────
function componentsToPages(components: any[]): PageDef[] {
  const pageMap = new Map<string, PageDef>()
  for (const c of components) {
    const path = c.pageRoute ?? '/'
    const rawId = c._pageId ?? path.replace(/\//g, '')
    const id = rawId || 'home'
    const name = c._pageName ?? path
    if (!pageMap.has(path)) pageMap.set(path, { id, name, path, blocks: [] })
    pageMap.get(path)!.blocks.push({
      id: c.instanceId,
      componentType: c.componentType,
      props: { ...(c.props as any) },
      order: c.order ?? 0,
    })
  }
  // sort blocks within each page
  const result = Array.from(pageMap.values())
  for (const pg of result) pg.blocks.sort((a: BlockSection, b: BlockSection) => a.order - b.order)
  return result
}

// ─── Main Builder ─────────────────────────────────────────────────────────────
export default function WixBuilder({ isDarkMode }: { isDarkMode?: boolean }) {
  const { selectedProjectName } = useProjectStore()
  const accessToken = useAuthStore(s => s.accessToken)

  const [pages, setPages] = useState<PageDef[]>(DEFAULT_EMPTY_PAGES)
  const [activePageId, setActivePageId] = useState('home')
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('desktop')
  const [showGallery, setShowGallery] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const activePage = pages.find(p => p.id === activePageId) ?? pages[0]
  const blocks = [...(activePage?.blocks ?? [])].sort((a, b) => a.order - b.order)
  const selectedBlock = blocks.find(b => b.id === selectedBlockId) ?? null

  // ── Load from backend on project change ──────────────────────────────────
  useEffect(() => {
    if (!selectedProjectName || !accessToken) return
    setIsLoading(true)
    api.listComponents(accessToken, selectedProjectName)
      .then(res => {
        const comps = res.components ?? []
        if (comps.length > 0) {
          const loaded = componentsToPages(comps)
          setPages(loaded)
          setActivePageId(loaded[0].id)
          setSelectedBlockId(null)
        }
      })
      .catch(() => { /* no saved design yet — start blank */ })
      .finally(() => setIsLoading(false))
  }, [selectedProjectName, accessToken])

  // ── Save to backend ───────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!selectedProjectName || !accessToken) { toast.error('Төсөл сонгоогүй байна'); return }
    setIsSaving(true)
    try {
      // 1. Delete existing components for this project
      const existing = await api.listComponents(accessToken, selectedProjectName)
      await Promise.allSettled(
        (existing.components ?? []).map(c =>
          api.deleteComponent(accessToken, selectedProjectName, c.instanceId)
        )
      )
      // 2. Re-create all blocks
      const toCreate = pagesToComponents(pages)
      await Promise.all(
        toCreate.map(c =>
          api.createComponent(accessToken, selectedProjectName, {
            instanceId: c.instanceId,
            pageRoute: c.pageRoute,
            componentType: c.componentType,
            parentId: null,
            slot: null,
            order: c.order,
            props: { ...c.props, _pageName: c._pageName, _pageId: c._pageId },
          })
        )
      )
      // 3. Save design tokens
      await api.patchDesign(accessToken, selectedProjectName, selectedProjectName, {
        pages: pages.map(p => ({ route: p.path, title: p.name })),
      })
      toast.success('Загвар амжилттай хадгалагдлаа!')
    } catch (e: any) {
      toast.error(`Хадгалахад алдаа: ${e.message}`)
    } finally {
      setIsSaving(false)
    }
  }

  // ── Page ops ──────────────────────────────────────────────────────────────
  const updatePageBlocks = useCallback((newBlocks: BlockSection[]) => {
    setPages(prev => prev.map(p => p.id === activePageId ? { ...p, blocks: newBlocks } : p))
  }, [activePageId])

  const addPage = () => {
    const id = `page-${Date.now()}`
    setPages(prev => [...prev, { id, name: 'Шинэ хуудас', path: `/${id}`, blocks: [] }])
    setActivePageId(id); setSelectedBlockId(null)
  }

  const removePage = (id: string) => {
    if (pages.length <= 1) return
    const remaining = pages.filter(p => p.id !== id)
    setPages(remaining)
    if (activePageId === id) { setActivePageId(remaining[0].id); setSelectedBlockId(null) }
  }

  // ── Block ops ─────────────────────────────────────────────────────────────
  const addBlock = (type: string) => {
    const b: BlockSection = { id: `block-${Date.now()}`, componentType: type, props: getDefaultProps(type), order: blocks.length }
    updatePageBlocks([...blocks, b]); setSelectedBlockId(b.id)
  }

  const removeBlock = (id: string) => {
    updatePageBlocks(blocks.filter(b => b.id !== id))
    if (selectedBlockId === id) setSelectedBlockId(null)
  }

  const moveBlock = (index: number, dir: 'up' | 'down') => {
    if (dir === 'up' && index === 0) return
    if (dir === 'down' && index === blocks.length - 1) return
    const nb = [...blocks]
    const si = dir === 'up' ? index - 1 : index + 1
      ;[nb[index].order, nb[si].order] = [nb[si].order, nb[index].order]
    updatePageBlocks(nb)
  }

  const updateBlockProps = (props: Record<string, any>) => {
    if (!selectedBlock) return
    updatePageBlocks(blocks.map(b => b.id === selectedBlock.id ? { ...b, props } : b))
  }

  // ── Template apply ────────────────────────────────────────────────────────
  const applyTemplate = (t: Template) => {
    const newPages = t.pages.length === 0 ? DEFAULT_EMPTY_PAGES
      : t.pages.map(pg => ({ ...pg, blocks: pg.blocks.map(b => ({ ...b })) }))
    setPages(newPages); setActivePageId(newPages[0].id); setSelectedBlockId(null); setShowGallery(false)
    toast.success(`"${t.name || 'Хоосон'}" загвар ачааллагдлаа`)
  }

  // ── Guard: no project ─────────────────────────────────────────────────────
  if (!selectedProjectName) {
    return (
      <div className={`flex h-full items-center justify-center ${isDarkMode ? 'bg-slate-900' : 'bg-slate-50'}`}>
        <div className="text-center">
          <Layers className={`w-12 h-12 mx-auto mb-4 ${isDarkMode ? 'text-slate-700' : 'text-slate-300'}`} />
          <h2 className={`text-xl font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>Төсөл сонгоогүй байна</h2>
          <p className={`mt-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Төслүүд цэснээс төслөө сонгож "Засах" дарна уу.</p>
        </div>
      </div>
    )
  }

  const catGroups = COMPONENT_REGISTRY.reduce<Record<string, typeof COMPONENT_REGISTRY>>((acc, c) => {
    ; (acc[c.category] = acc[c.category] || []).push(c); return acc
  }, {})

  return (
    <div className={`flex flex-col h-full overflow-hidden ${isDarkMode ? 'bg-slate-900 text-slate-200' : 'bg-[#f1f5f9] text-slate-900'}`}>

      {/* ── Topbar ── */}
      <div className={`h-14 flex items-center justify-between px-4 shrink-0 shadow-sm z-20 border-b ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Layers className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className={`font-bold text-sm leading-none ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{selectedProjectName}</h1>
            <p className={`text-[10px] font-semibold uppercase tracking-wider mt-0.5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Template Designer · cmsBuilder</p>
          </div>
          <div className={`h-6 w-px mx-1 ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`} />
          <button onClick={() => setShowGallery(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-bold transition-colors border border-indigo-100">
            <LayoutTemplate className="w-3.5 h-3.5" /> Загвар сонгох
          </button>
        </div>

        {/* Viewport */}
        <div className={`flex items-center gap-1 p-1 rounded-xl ${isDarkMode ? 'bg-slate-900' : 'bg-slate-100'}`}>
          {([['desktop', Monitor, 'Desktop'], ['tablet', Tablet, 'Tablet'], ['mobile', Smartphone, 'Mobile']] as const).map(([mode, Icon, label]) => (
            <button key={mode} onClick={() => setViewMode(mode as ViewMode)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${viewMode === mode
                ? (isDarkMode ? 'bg-slate-700 shadow text-white' : 'bg-white shadow text-slate-800')
                : (isDarkMode ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600')}`}>
              <Icon className="w-3.5 h-3.5" /> {label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {isLoading && <span className="flex items-center gap-1.5 text-xs text-slate-400"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Ачааллаж байна...</span>}
          <button onClick={handleSave} disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/20 hover:opacity-90 transition-all disabled:opacity-60">
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isSaving ? 'Хадгалж байна...' : 'Хадгалах'}
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">

        {/* ── Left Sidebar ── */}
        <div className={`w-60 flex flex-col shrink-0 z-10 border-r ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
          {/* Pages */}
          <div className={`p-3 shrink-0 border-b ${isDarkMode ? 'border-slate-700' : 'border-slate-100'}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Хуудсууд</span>
              <button onClick={addPage} className="p-1 hover:bg-indigo-50 text-indigo-500 rounded-lg transition-colors" title="Нэмэх">
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="space-y-0.5 max-h-48 overflow-y-auto">
              {pages.map(pg => (
                <div key={pg.id}
                  className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg cursor-pointer transition-colors group ${activePageId === pg.id
                    ? (isDarkMode ? 'bg-indigo-900/40 text-indigo-300' : 'bg-indigo-50 text-indigo-700')
                    : (isDarkMode ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-50')
                    }`}
                  onClick={() => { setActivePageId(pg.id); setSelectedBlockId(null) }}>
                  <FileText className="w-3.5 h-3.5 shrink-0" />
                  <span className="text-xs font-medium flex-1 truncate">{pg.name}</span>
                  {pages.length > 1 && (
                    <button onClick={e => { e.stopPropagation(); removePage(pg.id) }}
                      className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-red-500 transition-all">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Component palette */}
          <div className="flex-1 overflow-y-auto p-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Бүрэлдэхүүнүүд</span>
            {Object.entries(catGroups).map(([cat, comps]) => (
              <div key={cat} className="mb-3">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-300 mb-1.5 px-1">{cat}</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {comps.map(reg => {
                    const Icon = reg.icon
                    return (
                      <button key={reg.type} onClick={() => addBlock(reg.type)}
                        className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all gap-1.5 group ${isDarkMode
                          ? 'border-slate-700 bg-slate-800/50 hover:border-indigo-500 hover:bg-indigo-900/30'
                          : 'border-slate-200 bg-slate-50 hover:border-indigo-300 hover:bg-indigo-50'
                          }`}>
                        <Icon className={`w-4 h-4 transition-colors ${isDarkMode ? 'text-slate-400 group-hover:text-indigo-400' : 'text-slate-400 group-hover:text-indigo-500'}`} />
                        <span className={`text-[9px] font-bold text-center leading-tight ${isDarkMode ? 'text-slate-400 group-hover:text-indigo-300' : 'text-slate-500 group-hover:text-indigo-700'}`}>{reg.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Canvas ── */}
        <div className={`flex-1 overflow-auto p-6 relative ${isDarkMode ? 'bg-[#0f172a]' : 'bg-[#e8edf3]'}`} onClick={() => setSelectedBlockId(null)}>
          <div className="flex justify-center mb-3">
            <span className={`text-[10px] font-bold px-3 py-1 rounded-full border shadow-sm ${isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-400' : 'bg-white border-slate-200 text-slate-400'}`}>
              {viewMode === 'desktop' ? 'Компьютер — Бүтэн өргөн' : viewMode === 'tablet' ? 'Таблет — 768px' : 'Гар утас — 390px'}
            </span>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex flex-col items-center gap-3 text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin" />
                <p className="text-sm font-medium">Загвар ачааллаж байна...</p>
              </div>
            </div>
          ) : (
            <div className="mx-auto transition-all duration-300" style={{ maxWidth: VIEW_WIDTHS[viewMode] }}
              onClick={e => e.stopPropagation()}>
              <div className="bg-white min-h-[600px] shadow-xl ring-1 ring-black/5 rounded-sm overflow-hidden relative">
                {blocks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-96 text-slate-300">
                    <MousePointer2 className="w-12 h-12 mb-4 opacity-40" />
                    <p className="font-semibold text-lg text-slate-400">Хуудас хоосон байна</p>
                    <p className="text-sm mt-1 text-slate-400">Зүүнээс бүрэлдэхүүн нэмэх эсвэл загвар сонгох</p>
                    <button onClick={() => setShowGallery(true)}
                      className="mt-6 px-5 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition-all flex items-center gap-2">
                      <LayoutTemplate className="w-4 h-4" /> Загвар сонгох
                    </button>
                  </div>
                ) : (
                  blocks.map((block, i) => (
                    <div key={block.id} className="relative group"
                      onClick={e => { e.stopPropagation(); setSelectedBlockId(block.id) }}>
                      <BlockPreview block={block} isSelected={selectedBlockId === block.id} />
                      {/* Float controls */}
                      <div className={`absolute -right-10 top-1/2 -translate-y-1/2 flex-col gap-1 bg-white rounded-xl shadow-lg border border-slate-200 p-1 z-50 transition-all ${selectedBlockId === block.id ? 'flex opacity-100' : 'flex opacity-0 group-hover:opacity-100'}`}>
                        <button onClick={e => { e.stopPropagation(); moveBlock(i, 'up') }} disabled={i === 0}
                          className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 disabled:opacity-25">
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={e => { e.stopPropagation(); moveBlock(i, 'down') }} disabled={i === blocks.length - 1}
                          className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 disabled:opacity-25">
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                        <div className="h-px bg-slate-200 mx-1" />
                        <button onClick={e => { e.stopPropagation(); removeBlock(block.id) }}
                          className="p-1.5 hover:bg-red-50 text-red-400 rounded-lg">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      {/* Block label */}
                      <div className={`absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-600 text-white pointer-events-none transition-opacity ${selectedBlockId === block.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                        {COMPONENT_REGISTRY.find(r => r.type === block.componentType)?.label ?? block.componentType}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Right Sidebar: Inspector ── */}
        <div className={`w-72 flex flex-col shrink-0 z-10 border-l ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
          <div className={`h-12 border-b flex items-center px-4 shrink-0 gap-2 ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
            <Settings2 className="w-4 h-4 text-slate-400" />
            <span className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-slate-700'}`}>Загвар тохиргоо</span>
          </div>
          <div className={`flex-1 overflow-y-auto ${isDarkMode ? 'text-slate-200' : ''}`}>
            {selectedBlock ? (
              <Inspector block={selectedBlock} onChange={updateBlockProps} />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 p-8 text-center">
                <MousePointer2 className="w-8 h-8 mb-3 opacity-40" />
                <p className="text-sm font-medium text-slate-500">Canvas дээрх хэсгийг сонгоно уу</p>
                <p className="text-xs mt-1 text-slate-400">Өнгө, фонт, зай болон тохиргоог энд хийнэ</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showGallery && <TemplateGallery onSelect={applyTemplate} onClose={() => setShowGallery(false)} />}
    </div>
  )
}

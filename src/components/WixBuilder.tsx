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
import { BlockSection, PageDef, DEFAULT_EMPTY_PAGES, defaultPageDisplayName, normalizePagePath } from './builder/templates'
import { mergeHeaderZones } from './builder/headerCanvasDefaults'
import {
  defaultBlockCanvasHeight,
  isBuilderBlockCanvasType,
  mergeBlockCanvasZones,
} from './builder/sectionCanvasDefaults'
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

function uid() { return `el-${Date.now()}-${Math.random().toString(36).slice(2, 6)}` }

function getDefaultProps(type: string): Record<string, any> {
  const base = { bgColor: '#ffffff', textColor: '#1e293b', accentColor: '#6366f1', fontFamily: 'Inter', paddingX: 48, paddingY: 60 }
  switch (type) {
    case 'header': return { ...base, paddingY: 18, sticky: true, borderBottom: true, borderColor: '#e2e8f0', shadowSize: 'sm', title: 'Site', links: [], headerNavIndependent: false, fontSize: 20, navFontSize: 14, headerCanvas: false, headerCanvasHeight: 88 }
    case 'hero': return { ...base, paddingY: 100, align: 'center', hasImage: false, titleSize: 52, titleWeight: '800', subtitleSize: 18, btnRadius: 12, btnPaddingX: 32, btnPaddingY: 14, blockCanvas: false, blockCanvasHeight: defaultBlockCanvasHeight('hero'),
      _elements: [
        { id: uid(), type: 'image', label: 'Зураг', width: '100%', height: 160 },
        { id: uid(), type: 'text', label: 'Гарчиг', width: '60%', height: 36, size: 52 },
        { id: uid(), type: 'text', label: 'Дэд гарчиг', width: '80%', height: 14 },
        { id: uid(), type: 'button', label: 'Товч 1', width: '140px', height: 46 },
        { id: uid(), type: 'button', label: 'Товч 2', width: '120px', height: 46, bg: 'transparent' },
      ],
    }
    case 'about': return { ...base, align: 'left', hasImage: true, titleSize: 34, cardRadius: 16, blockCanvas: false, blockCanvasHeight: defaultBlockCanvasHeight('about'),
      _elements: [
        { id: uid(), type: 'image', label: 'Зураг', width: '45%', height: 200 },
        { id: uid(), type: 'text', label: 'Гарчиг', width: '220px', height: 28 },
        { id: uid(), type: 'text', label: 'Тайлбар 1', width: '100%', height: 11 },
        { id: uid(), type: 'text', label: 'Тайлбар 2', width: '95%', height: 11 },
        { id: uid(), type: 'text', label: 'Тайлбар 3', width: '90%', height: 11 },
        { id: uid(), type: 'text', label: 'Тайлбар 4', width: '80%', height: 11 },
      ],
    }
    case 'services': return { ...base, columns: 3, titleSize: 34, cardBg: '#f8fafc', cardRadius: 16, cardShadow: 'md', blockCanvas: false, blockCanvasHeight: defaultBlockCanvasHeight('services'),
      _elements: [
        { id: uid(), type: 'text', label: 'Гарчиг', width: '260px', height: 28 },
        { id: uid(), type: 'card', label: 'Карт 1', width: '100%', height: 120 },
        { id: uid(), type: 'card', label: 'Карт 2', width: '100%', height: 120 },
        { id: uid(), type: 'card', label: 'Карт 3', width: '100%', height: 120 },
      ],
    }
    case 'features': return { ...base, columns: 3, titleSize: 34, cardBg: '#f8fafc', cardRadius: 16, blockCanvas: false, blockCanvasHeight: defaultBlockCanvasHeight('features'),
      _elements: [
        { id: uid(), type: 'text', label: 'Гарчиг', width: '260px', height: 28 },
        { id: uid(), type: 'card', label: 'Онцлог 1', width: '100%', height: 120 },
        { id: uid(), type: 'card', label: 'Онцлог 2', width: '100%', height: 120 },
        { id: uid(), type: 'card', label: 'Онцлог 3', width: '100%', height: 120 },
      ],
    }
    case 'products': return { ...base, columns: 3, titleSize: 34, cardBg: '#ffffff', cardRadius: 16, blockCanvas: false, blockCanvasHeight: defaultBlockCanvasHeight('products'),
      _elements: [
        { id: uid(), type: 'text', label: 'Гарчиг', width: '220px', height: 28 },
        { id: uid(), type: 'card', label: 'Бүтээгдэхүүн 1', width: '100%', height: 160 },
        { id: uid(), type: 'card', label: 'Бүтээгдэхүүн 2', width: '100%', height: 160 },
        { id: uid(), type: 'card', label: 'Бүтээгдэхүүн 3', width: '100%', height: 160 },
      ],
    }
    case 'pricing': return { ...base, titleSize: 34, cardBg: '#f8fafc', cardRadius: 16, blockCanvas: false, blockCanvasHeight: defaultBlockCanvasHeight('pricing'),
      _elements: [
        { id: uid(), type: 'text', label: 'Гарчиг', width: '280px', height: 28 },
        { id: uid(), type: 'text', label: 'Дэд гарчиг', width: '400px', height: 13 },
        { id: uid(), type: 'card', label: 'Багц 1', width: '100%', height: 180 },
        { id: uid(), type: 'card', label: 'Багц 2', width: '100%', height: 180 },
        { id: uid(), type: 'card', label: 'Багц 3', width: '100%', height: 180 },
      ],
    }
    case 'clients': return { ...base, titleSize: 26, cardBg: '#f1f5f9', cardRadius: 10, blockCanvas: false, blockCanvasHeight: defaultBlockCanvasHeight('clients'),
      _elements: [
        { id: uid(), type: 'text', label: 'Гарчиг', width: '240px', height: 26 },
        { id: uid(), type: 'image', label: 'Лого 1', width: '80px', height: 40 },
        { id: uid(), type: 'image', label: 'Лого 2', width: '80px', height: 40 },
        { id: uid(), type: 'image', label: 'Лого 3', width: '80px', height: 40 },
        { id: uid(), type: 'image', label: 'Лого 4', width: '80px', height: 40 },
      ],
    }
    case 'promo': return { ...base, paddingY: 72, titleSize: 36, btnRadius: 12, blockCanvas: false, blockCanvasHeight: defaultBlockCanvasHeight('promo'),
      _elements: [
        { id: uid(), type: 'text', label: 'Гарчиг', width: '320px', height: 32 },
        { id: uid(), type: 'text', label: 'Тайлбар', width: '440px', height: 14 },
        { id: uid(), type: 'button', label: 'Товч', width: '160px', height: 48 },
      ],
    }
    case 'contact': return { ...base, titleSize: 34, cardBg: '#f1f5f9', cardRadius: 12, showForm: true, formTarget: 'admin.zevtabs.mn', blockCanvas: false, blockCanvasHeight: defaultBlockCanvasHeight('contact'),
      _elements: [
        { id: uid(), type: 'text', label: 'Гарчиг', width: '240px', height: 26 },
        { id: uid(), type: 'text', label: 'Тайлбар', width: '400px', height: 14 },
        { id: uid(), type: 'input', label: 'Нэр', width: '100%', height: 46 },
        { id: uid(), type: 'input', label: 'И-мэйл', width: '100%', height: 46 },
        { id: uid(), type: 'button', label: 'Илгээх', width: '140px', height: 46 },
      ],
    }
    case 'footer': return { ...base, bgColor: '#0f172a', textColor: '#e2e8f0', paddingY: 48, align: 'center', blockCanvas: false, blockCanvasHeight: defaultBlockCanvasHeight('footer'),
      _elements: [
        { id: uid(), type: 'text', label: 'Лого', width: '120px', height: 20 },
        { id: uid(), type: 'divider', label: 'Шугам', width: '100%', height: 1 },
        { id: uid(), type: 'text', label: 'Зохиогчийн эрх', width: '200px', height: 9 },
      ],
    }
    default: return base
  }
}

type ViewMode = 'desktop' | 'tablet' | 'mobile'
const VIEW_WIDTHS: Record<ViewMode, string> = { desktop: '100%', tablet: '768px', mobile: '390px' }

function PillToggle({ checked, onChange, ariaLabel }: { checked: boolean; onChange: (v: boolean) => void; ariaLabel: string }) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      aria-pressed={checked}
      onClick={() => onChange(!checked)}
      className={`relative w-9 h-5 shrink-0 rounded-full transition-colors ${checked ? 'bg-indigo-500' : 'bg-slate-200'}`}
    >
      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${checked ? 'left-4' : 'left-0.5'}`} />
    </button>
  )
}

function cloneNavLinks(raw: unknown): { label: string; href: string; isExternal?: boolean }[] {
  if (!Array.isArray(raw)) return []
  return raw.map((x: any) => ({
    label: String(x?.label ?? ''),
    href: String(x?.href ?? '/').trim() || '/',
    isExternal: !!x?.isExternal,
  }))
}

const GENERIC_NAV_LABELS = new Set(['хуудас', 'холбоос', 'link', 'page', 'menu', ''])

/** Prefer more links, then richer labels (not generic placeholders). */
function navLinksRichnessScore(links: ReturnType<typeof cloneNavLinks>): number {
  let score = links.length * 80
  for (const L of links) {
    const lab = String(L.label || '').trim()
    if (!lab) continue
    if (GENERIC_NAV_LABELS.has(lab.toLowerCase())) score -= 35
    else score += 30 + Math.min(lab.length, 40)
    if (!L.isExternal && /^https?:\/\//i.test(String(L.href || ''))) score -= 5
  }
  return score
}

function pickCanonicalSyncedNav(allPages: PageDef[]): { title: string; links: { label: string; href: string; isExternal?: boolean }[] } | null {
  let best: { title: string; links: ReturnType<typeof cloneNavLinks>; n: number; score: number } | null = null
  for (const pg of allPages) {
    for (const b of pg.blocks) {
      if (b.componentType !== 'header' || b.props?.headerNavIndependent === true) continue
      const links = cloneNavLinks(b.props?.links).map((L) => ({
        ...L,
        href: normalizePagePath(String(L.href || '/')),
      }))
      const n = links.length
      const score = navLinksRichnessScore(links)
      if (!best || n > best.n || (n === best.n && score > best.score)) {
        best = { title: String(b.props?.title ?? 'Site'), links, n, score }
      }
    }
  }
  if (!best) return null
  return { title: best.title, links: best.links }
}

/** Copy canonical title+links onto every synced header (fixes API/old data where each page diverged). */
function applySyncedNavCanonicalToPages(pages: PageDef[]): PageDef[] {
  const canon = pickCanonicalSyncedNav(pages)
  if (!canon) return pages
  return pages.map(page => ({
    ...page,
    blocks: page.blocks.map(b => {
      if (b.componentType !== 'header' || b.props?.headerNavIndependent === true) return b
      return {
        ...b,
        props: {
          ...b.props,
          title: canon.title,
          links: cloneNavLinks(canon.links),
        },
      }
    }),
  }))
}

// ─── Serialise pages → flat ComponentRecord list ───────────────────────────────
function pagesToComponents(pages: PageDef[]) {
  return pages.flatMap(page =>
    page.blocks.flatMap(block => {
      const { _elements, ...restProps } = block.props || {}
      
      const parentRecord = {
        instanceId: block.id,
        pageRoute: page.path,
        componentType: block.componentType,
        parentId: null,
        slot: null,
        order: block.order,
        props: { ...restProps, _pageName: page.name, _pageId: page.id },
      }

      const childRecords = (_elements || []).map((el: any, i: number) => ({
        instanceId: el.id || `free-${Date.now()}-${i}`,
        pageRoute: page.path,
        componentType: `free_${el.type}`,
        parentId: block.id,
        slot: 'free',
        order: i,
        props: { ...el, _pageName: page.name, _pageId: page.id },
      }))

      return [parentRecord, ...childRecords]
    })
  )
}

// ─── Deserialise flat list → pages ────────────────────────────────────────────
function componentsToPages(components: any[]): PageDef[] {
  const pageMap = new Map<string, PageDef>()
  const parents = components.filter(c => !c.parentId)
  const children = components.filter(c => c.parentId && c.slot === 'free')

  for (const c of parents) {
    const path = c.pageRoute ?? '/'
    const rawId = (c.props?._pageId ?? path.replace(/\//g, '')) || 'home'
    const id = rawId || 'home'
    const pageName = c.props?._pageName && String(c.props._pageName).trim()
      ? String(c.props._pageName).trim()
      : defaultPageDisplayName(path)

    if (!pageMap.has(path)) pageMap.set(path, { id, name: pageName, path, blocks: [] })

    const myChildren = children.filter(child => child.parentId === c.instanceId)
    myChildren.sort((a, b) => (a.order || 0) - (b.order || 0))
    const _elements = myChildren.map(child => {
      const { _pageName, _pageId, ...elProps } = child.props || {}
      return {
        id: child.instanceId,
        type: child.componentType.replace('free_', ''),
        ...elProps
      }
    })

    const { _pageName, _pageId, ...restProps } = c.props || {}

    pageMap.get(path)!.blocks.push({
      id: c.instanceId,
      componentType: c.componentType,
      props: { ...restProps, _elements },
      order: c.order ?? 0,
    })
  }
  // sort blocks within each page
  const result = Array.from(pageMap.values())
  for (const pg of result) pg.blocks.sort((a, b) => a.order - b.order)
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
          const loaded = applySyncedNavCanonicalToPages(componentsToPages(comps))
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
            parentId: c.parentId,
            slot: c.slot,
            order: c.order,
            props: c.props,
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
    let props = getDefaultProps(type)
    if (type === 'header') {
      const seed = pickCanonicalSyncedNav(pages)
      if (seed) props = { ...props, title: seed.title, links: cloneNavLinks(seed.links) }
    }
    const b: BlockSection = { id: `block-${Date.now()}`, componentType: type, props, order: blocks.length }
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

  const patchBlockProps = useCallback((blockId: string, patch: Record<string, any>) => {
    setPages((prev) =>
      prev.map((page) =>
        page.id === activePageId
          ? {
              ...page,
              blocks: page.blocks.map((b) =>
                b.id === blockId ? { ...b, props: { ...b.props, ...patch } } : b,
              ),
            }
          : page,
      ),
    )
  }, [activePageId])

  const updateBlockProps = (props: Record<string, any>) => {
    if (!selectedBlock) return
    const selId = selectedBlock.id
    const isHeader = selectedBlock.componentType === 'header'
    const navOwn = props.headerNavIndependent === true
    const syncNav = isHeader && !navOwn

    if (!syncNav) {
      updatePageBlocks(blocks.map(b => (b.id === selId ? { ...b, props } : b)))
      return
    }

    const linksCopy = cloneNavLinks(props.links)
    const titleCopy = String(props.title ?? 'Site')
    const fontSizeCopy = typeof props.fontSize === 'number' ? props.fontSize : Number(props.fontSize) || undefined
    const navFontSizeCopy = typeof props.navFontSize === 'number' ? props.navFontSize : Number(props.navFontSize) || undefined

    setPages(prev =>
      prev.map(page => ({
        ...page,
        blocks: page.blocks.map(b => {
          if (b.id === selId) return { ...b, props }
          if (b.componentType === 'header' && b.props?.headerNavIndependent !== true) {
            return {
              ...b,
              props: {
                ...b.props,
                title: titleCopy,
                links: cloneNavLinks(linksCopy),
                ...(fontSizeCopy != null && Number.isFinite(fontSizeCopy) ? { fontSize: fontSizeCopy } : {}),
                ...(navFontSizeCopy != null && Number.isFinite(navFontSizeCopy) ? { navFontSize: navFontSizeCopy } : {}),
              },
            }
          }
          return b
        }),
      })),
    )
  }

  // ── Template apply ────────────────────────────────────────────────────────
  const applyTemplate = (t: Template) => {
    const raw = t.pages.length === 0 ? DEFAULT_EMPTY_PAGES
      : t.pages.map(pg => ({ ...pg, blocks: pg.blocks.map(b => ({ ...b })) }))
    const newPages = applySyncedNavCanonicalToPages(raw)
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
      <div className={`h-14 flex items-center justify-between gap-3 px-4 shrink-0 shadow-sm z-20 border-b ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
        <div className="flex items-center gap-3 min-w-0 shrink-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Layers className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className={`font-bold text-sm leading-none truncate ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{selectedProjectName}</h1>
            <p className={`text-[10px] font-semibold uppercase tracking-wider mt-0.5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Template Designer · cmsBuilder</p>
          </div>
        </div>

        {/* Загвар сонгох · Canvas (header) · Desktop / Tablet / Mobile — нэг мөр */}
        <div className="flex flex-1 min-w-0 items-center justify-center gap-2 sm:gap-3 flex-wrap">
          <button onClick={() => setShowGallery(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors border shrink-0 ${isDarkMode
              ? 'bg-indigo-950/50 text-indigo-300 border-indigo-800 hover:bg-indigo-900/40'
              : 'bg-indigo-50 text-indigo-700 border-indigo-100 hover:bg-indigo-100'}`}>
            <LayoutTemplate className="w-3.5 h-3.5" /> Загвар сонгох
          </button>

          {selectedBlock &&
            (selectedBlock.componentType === 'header' || isBuilderBlockCanvasType(selectedBlock.componentType)) && (
            <>
              <div className={`h-6 w-px shrink-0 ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`} />
              <div className="flex items-center gap-1.5 shrink-0">
                <span className={`text-[10px] font-bold uppercase tracking-wide whitespace-nowrap ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>Canvas</span>
                <PillToggle
                  ariaLabel="Canvas горим (чирж байрлуулах)"
                  checked={
                    selectedBlock.componentType === 'header'
                      ? !!selectedBlock.props?.headerCanvas
                      : !!selectedBlock.props?.blockCanvas
                  }
                  onChange={(on) => {
                    const hp = selectedBlock.props || {}
                    if (selectedBlock.componentType === 'header') {
                      if (on) {
                        updateBlockProps({
                          ...hp,
                          headerCanvas: true,
                          headerCanvasHeight: hp.headerCanvasHeight ?? 88,
                          headerZones: mergeHeaderZones(hp.headerZones),
                        })
                      } else {
                        updateBlockProps({ ...hp, headerCanvas: false })
                      }
                    } else if (isBuilderBlockCanvasType(selectedBlock.componentType)) {
                      const t = selectedBlock.componentType
                      if (on) {
                        updateBlockProps({
                          ...hp,
                          blockCanvas: true,
                          blockCanvasHeight: hp.blockCanvasHeight ?? defaultBlockCanvasHeight(t),
                          blockCanvasZones: mergeBlockCanvasZones(t, hp.blockCanvasZones),
                        })
                      } else {
                        updateBlockProps({ ...hp, blockCanvas: false })
                      }
                    }
                  }}
                />
              </div>
            </>
          )}

          <div className={`h-6 w-px shrink-0 hidden sm:block ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`} />

          <div className={`flex items-center gap-1 p-1 rounded-xl shrink-0 ${isDarkMode ? 'bg-slate-900' : 'bg-slate-100'}`}>
            {([['desktop', Monitor, 'Desktop'], ['tablet', Tablet, 'Tablet'], ['mobile', Smartphone, 'Mobile']] as const).map(([mode, Icon, label]) => (
              <button key={mode} type="button" onClick={() => setViewMode(mode as ViewMode)}
                className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${viewMode === mode
                  ? (isDarkMode ? 'bg-slate-700 shadow text-white' : 'bg-white shadow text-slate-800')
                  : (isDarkMode ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600')}`}>
                <Icon className="w-3.5 h-3.5" /> {label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
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
                  <div className="flex-1 min-w-0 flex flex-col">
                    <span className="text-xs font-semibold truncate leading-tight">{pg.name}</span>
                    <span className="text-[10px] font-mono text-slate-400 truncate leading-tight" title="Зам (pageRoute)">
                      {pg.path === '' ? '/' : pg.path}
                    </span>
                  </div>
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

            {/* ── Current page blocks list ── */}
            {blocks.length > 0 && (
              <div className={`mt-4 pt-3 border-t ${isDarkMode ? 'border-slate-700' : 'border-slate-100'}`}>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Хуудасны элементүүд</span>
                <div className="space-y-1">
                  {blocks.map((block, i) => {
                    const reg = COMPONENT_REGISTRY.find(r => r.type === block.componentType)
                    const Icon = reg?.icon || LayoutGrid
                    const label = reg?.label || block.componentType
                    const isSel = selectedBlockId === block.id
                    const elCount = (block.props?._elements as any[])?.length || 0
                    return (
                      <div
                        key={block.id}
                        onClick={() => setSelectedBlockId(block.id)}
                        className={`flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-all group ${isSel
                          ? (isDarkMode ? 'bg-indigo-900/50 text-indigo-300 ring-1 ring-indigo-500/40' : 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200')
                          : (isDarkMode ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-50')
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-semibold truncate block leading-tight">{label}</span>
                          {elCount > 0 && (
                            <span className="text-[9px] text-slate-400 leading-tight">{elCount} элемент</span>
                          )}
                        </div>
                        <button
                          onClick={e => { e.stopPropagation(); removeBlock(block.id) }}
                          className={`p-1 rounded-md transition-all ${isSel
                            ? 'text-red-400 hover:bg-red-100 hover:text-red-600'
                            : 'opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500'
                          }`}
                          title="Устгах"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
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
                      <BlockPreview
                        block={block}
                        isSelected={selectedBlockId === block.id}
                        onPatchProps={(patch) => patchBlockProps(block.id, patch)}
                      />
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
                      {/* Block label + delete bar on top */}
                      <div className={`absolute top-2 left-2 right-2 flex items-center gap-2 pointer-events-none transition-opacity ${selectedBlockId === block.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                        <div className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-600 text-white shrink-0">
                          {COMPONENT_REGISTRY.find(r => r.type === block.componentType)?.label ?? block.componentType}
                        </div>
                        <div className="flex-1" />
                        {selectedBlockId === block.id && (
                          <button
                            onClick={e => { e.stopPropagation(); removeBlock(block.id) }}
                            className="pointer-events-auto flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold bg-red-500 text-white hover:bg-red-600 transition-colors shadow-sm"
                          >
                            <Trash2 className="w-3 h-3" /> Устгах
                          </button>
                        )}
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
              <Inspector block={selectedBlock} onChange={updateBlockProps} pages={pages} />
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

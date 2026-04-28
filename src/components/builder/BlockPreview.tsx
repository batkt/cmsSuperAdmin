'use client'
import { useState, useRef, useCallback, useMemo } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { BlockSection } from './templates'
import { Image as ImageIcon, Package, Copy, Trash2, MoveVertical, ArrowUp, ArrowDown, Move } from 'lucide-react'
import { HeaderCanvasPreview } from './HeaderCanvasPreview'
import { ZoneCanvasPreview } from './ZoneCanvasPreview'
import { defaultBlockCanvasHeight, isBuilderBlockCanvasType } from './sectionCanvasDefaults'
import { resolveDisplayImageUrl } from '@/lib/resolveDisplayImageUrl'

function pxFromSizeProp(v: unknown, fallback: number): number {
  if (typeof v === 'number' && Number.isFinite(v)) return v
  if (typeof v === 'string' && v.trim()) {
    const n = Number(v)
    if (Number.isFinite(n)) return n
  }
  return fallback
}

// ─── Skeleton helpers ─────────────────────────────────────────────────────────

function SkeletonLine({ w = '100%', h = 14, color = '#1e293b', mb = 0 }: {
  w?: string | number; h?: number; color?: string; mb?: number
}) {
  return <div style={{ width: w, height: h, background: color, opacity: 0.2, borderRadius: 4, marginBottom: mb }} />
}

// ─── Free elements renderer ───────────────────────────────────────────────────

interface FreeElement {
  id: string; type: string; label: string; value?: string
  color?: string; bg?: string; radius?: number; size?: number
  width?: string; height?: number; placeholder?: string; align?: string
  src?: string
  links?: unknown; href?: string; isExternal?: boolean
  x?: number; y?: number
}



function wrapLink(el: FreeElement, child: React.ReactNode) {
  if (!el.href) return child
  return (
    <a href={el.href} target={el.isExternal ? '_blank' : undefined} rel={el.isExternal ? 'noopener noreferrer' : undefined} style={{ textDecoration: 'none' }}>
      {child}
    </a>
  )
}

export function renderFreeElement(el: FreeElement, accentColor: string, textColor: string) {
  switch (el.type) {
    case 'text':
      const textH = el.height || (el.size ? el.size * 0.7 : 14)
      return wrapLink(el, 
        <div style={{
          width: el.width || '80%',
          height: textH,
          background: el.color || textColor,
          opacity: 0.2,
          borderRadius: 4,
          margin: '4px 0'
        }} />
      )

    case 'button':
      return wrapLink(el,
        <div style={{
          width: el.width || 140,
          height: el.height || 46,
          background: el.bg || accentColor,
          borderRadius: el.radius ?? 10,
          opacity: 0.9,
          display: 'inline-block'
        }} />
      )

    case 'input':
      return (
        <div style={{
          width: el.width || 200,
          height: el.height || 46,
          background: el.bg || textColor,
          opacity: 0.08,
          borderRadius: el.radius ?? 8,
          border: `1px solid ${textColor}22`,
          display: 'inline-block'
        }} />
      )

    case 'image': {
      const displaySrc = el.src ? resolveDisplayImageUrl(el.src) : ''
      if (displaySrc) {
        return wrapLink(el,
          <img
            src={displaySrc}
            alt={el.label || ''}
            referrerPolicy="no-referrer"
            style={{
              width: (el.width as string | number | undefined) || '100%',
              maxHeight: el.height || 160,
              height: 'auto',
              objectFit: 'contain',
              borderRadius: 12,
              display: 'block',
            }}
          />,
        )
      }
      return wrapLink(el,
        <div style={{
          width: el.width || '100%',
          height: el.height || 160,
          background: textColor,
          opacity: 0.06,
          borderRadius: 12,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <ImageIcon style={{ width: 36, height: 36, opacity: 0.25, color: textColor }} />
        </div>
      )
    }

    case 'card':
      return wrapLink(el,
        <div style={{
          width: el.width || '100%',
          height: el.height || 120,
          background: el.bg || '#ffffff',
          borderRadius: el.radius ?? 12,
          border: `1px solid ${textColor}15`,
          boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          opacity: 0.8,
        }}>
          <div style={{ width: '40%', height: 12, background: textColor, opacity: 0.15, borderRadius: 4 }} />
        </div>
      )

    case 'section':
      return (
        <div style={{
          width: el.width || '100%',
          height: el.height || 80,
          background: el.bg || textColor,
          opacity: 0.03,
          borderRadius: 8,
          border: `1px dashed ${textColor}33`,
        }} />
      )

    case 'divider':
      return (
        <div style={{
          width: el.width || '100%',
          height: el.height || 1,
          background: el.color || textColor,
          opacity: 0.15,
          borderRadius: 99,
          margin: '12px 0',
        }} />
      )

    case 'badge':
      return wrapLink(el,
        <div style={{ display: 'flex' }}>
          <div style={{
            width: el.width || 60,
            height: 20,
            background: el.bg || accentColor,
            borderRadius: el.radius ?? 999,
            opacity: 0.8,
            display: 'inline-block',
          }} />
        </div>
      )

    case 'menu':
      const navLinks = Array.isArray(el.links) ? el.links : []
      if (navLinks.length === 0) {
        return <span style={{ fontSize: 11, color: textColor, opacity: 0.35, fontStyle: 'italic' }}>Цэс хоосон</span>
      }
      return (
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center', justifyContent: el.align as any || 'center' }}>
          {navLinks.map((link: any, i: number) => (
            <div
              key={i}
              style={{
                width: 48,
                height: el.size ? el.size * 0.7 : 12,
                background: el.color || textColor,
                opacity: 0.2,
                borderRadius: 4,
              }}
            />
          ))}
        </div>
      )

    default:
      return null
  }
}

// ─── Interactive Free Elements Renderer ────────────────────────────────────────

function ElementToolbar({ el, index, total, onDuplicate, onDelete, onMoveUp, onMoveDown, onDragMove }: {
  el: FreeElement; index: number; total: number
  onDuplicate: () => void; onDelete: () => void
  onMoveUp: () => void; onMoveDown: () => void
  onDragMove?: (dx: number, dy: number) => void
}) {
  const btnBase: CSSProperties = {
    width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
    border: 'none', borderRadius: 6, cursor: 'pointer', transition: 'all 0.15s',
    background: 'transparent', color: '#64748b',
  }

  const dragRef = useRef(false)
  const lastPos = useRef({ x: 0, y: 0 })

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (!onDragMove) return
    e.stopPropagation(); e.preventDefault()
    dragRef.current = true
    lastPos.current = { x: e.clientX, y: e.clientY }

    const onMove = (ev: PointerEvent) => {
      if (!dragRef.current) return
      const dx = ev.clientX - lastPos.current.x
      const dy = ev.clientY - lastPos.current.y
      if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
        onDragMove(dx, dy)
        lastPos.current = { x: ev.clientX, y: ev.clientY }
      }
    }
    const onUp = () => {
      dragRef.current = false
      document.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerup', onUp)
    }
    document.addEventListener('pointermove', onMove)
    document.addEventListener('pointerup', onUp)
  }, [onDragMove])

  return (
    <div
      onClick={e => e.stopPropagation()}
      style={{
        position: 'absolute', top: -36, left: '50%', transform: 'translateX(-50%)',
        display: 'flex', gap: 2, padding: '3px 6px',
        background: '#ffffff', borderRadius: 10, boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
        border: '1px solid #e2e8f0', zIndex: 100, whiteSpace: 'nowrap',
      }}
    >
      <span style={{ fontSize: 9, fontWeight: 700, color: '#94a3b8', padding: '6px 4px 0 2px', textTransform: 'uppercase', letterSpacing: 0.5 }}>
        {el.type}
      </span>
      <button style={{ ...btnBase, cursor: 'move' }} title="Зөөх (Drag)" onPointerDown={onPointerDown}
        onMouseEnter={e => (e.currentTarget.style.background = '#f1f5f9')}
        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
        <Move style={{ width: 13, height: 13 }} />
      </button>
      <div style={{ width: 1, height: 18, background: '#e2e8f0', margin: '4px 2px' }} />
      <button style={btnBase} title="Дээш" onClick={onMoveUp} disabled={index === 0}>
        <ArrowUp style={{ width: 13, height: 13, opacity: index === 0 ? 0.25 : 1 }} />
      </button>
      <button style={btnBase} title="Доош" onClick={onMoveDown} disabled={index === total - 1}>
        <ArrowDown style={{ width: 13, height: 13, opacity: index === total - 1 ? 0.25 : 1 }} />
      </button>
      <div style={{ width: 1, height: 18, background: '#e2e8f0', margin: '4px 2px' }} />
      <button style={{ ...btnBase }} title="Хуулах" onClick={onDuplicate}
        onMouseEnter={e => (e.currentTarget.style.background = '#eef2ff')}
        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
        <Copy style={{ width: 13, height: 13 }} />
      </button>
      <button style={{ ...btnBase, color: '#ef4444' }} title="Устгах" onClick={onDelete}
        onMouseEnter={e => (e.currentTarget.style.background = '#fef2f2')}
        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
        <Trash2 style={{ width: 13, height: 13 }} />
      </button>
    </div>
  )
}

function ResizeHandle({ direction, onResizeDelta }: { direction: 'right' | 'bottom'; onResizeDelta: (delta: number) => void }) {
  const dragging = useRef(false)
  const lastPos = useRef(0)

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    e.stopPropagation(); e.preventDefault()
    dragging.current = true
    lastPos.current = direction === 'right' ? e.clientX : e.clientY

    const onMove = (ev: PointerEvent) => {
      if (!dragging.current) return
      const cur = direction === 'right' ? ev.clientX : ev.clientY
      const delta = cur - lastPos.current
      if (Math.abs(delta) > 1) {
        onResizeDelta(delta)
        lastPos.current = cur
      }
    }
    const onUp = () => {
      dragging.current = false
      document.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerup', onUp)
    }
    document.addEventListener('pointermove', onMove)
    document.addEventListener('pointerup', onUp)
  }, [direction, onResizeDelta])

  const isH = direction === 'right'
  const style: CSSProperties = isH
    ? { position: 'absolute', right: -6, top: 0, bottom: 0, width: 12, cursor: 'ew-resize', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }
    : { position: 'absolute', bottom: -6, left: 0, right: 0, height: 12, cursor: 'ns-resize', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }

  const dot: CSSProperties = isH
    ? { width: 4, height: 24, borderRadius: 3, background: '#6366f1', opacity: 0.7 }
    : { width: 24, height: 4, borderRadius: 3, background: '#6366f1', opacity: 0.7 }

  return (
    <div style={style} onPointerDown={onPointerDown}>
      <div style={dot} />
    </div>
  )
}

function InteractiveFreeElement({ el, index, total, accentColor, textColor, selectedId, onSelect, onPatch, onDuplicate, onDelete, onReorder }: {
  el: FreeElement; index: number; total: number
  accentColor: string; textColor: string
  selectedId: string | null
  onSelect: (id: string | null) => void
  onPatch: (id: string, patch: Partial<FreeElement>) => void
  onDuplicate: (id: string) => void
  onDelete: (id: string) => void
  onReorder: (from: number, to: number) => void
}) {
  const isActive = selectedId === el.id
  const wrapRef = useRef<HTMLDivElement>(null)

  // Determine if the element is naturally full-width
  const isFullWidth = el.type === 'image' || el.type === 'card' || el.type === 'section' || el.type === 'divider' || el.type === 'menu'

  // Track live sizes in refs so rapid drag deltas accumulate correctly
  const liveW = useRef(0)
  const liveH = useRef(0)
  const liveX = useRef(0)
  const liveY = useRef(0)

  // Parse stored width to pixels
  const parseW = (): number => {
    if (el.width) {
      const n = parseInt(String(el.width))
      if (n > 0) return n
    }
    return wrapRef.current?.offsetWidth || 200
  }
  const defaultH = el.type === 'image' ? 160 : el.type === 'button' ? 46 : el.type === 'input' ? 46 : el.type === 'card' ? 120 : el.type === 'section' ? 80 : 14

  const handleResizeW = useCallback((delta: number) => {
    if (liveW.current === 0) liveW.current = parseW()
    liveW.current = Math.max(30, liveW.current + delta)
    onPatch(el.id, { width: `${Math.round(liveW.current)}px` })
  }, [el.id, onPatch])

  const handleResizeH = useCallback((delta: number) => {
    if (liveH.current === 0) liveH.current = el.height ?? defaultH
    liveH.current = Math.max(16, liveH.current + delta)
    onPatch(el.id, { height: Math.round(liveH.current) })
  }, [el.id, onPatch, el.height, defaultH])

  const handleDragMove = useCallback((dx: number, dy: number) => {
    if (liveX.current === 0 && el.x === undefined) {
      liveX.current = wrapRef.current?.offsetLeft || 0
      liveY.current = wrapRef.current?.offsetTop || 0
    } else if (liveX.current === 0) {
      liveX.current = el.x || 0
      liveY.current = el.y || 0
    }
    liveX.current += dx
    liveY.current += dy
    onPatch(el.id, { x: Math.round(liveX.current), y: Math.round(liveY.current) })
  }, [el.id, onPatch, el.x, el.y])

  // Reset live refs when element is deselected
  if (!isActive) {
    liveW.current = 0
    liveH.current = 0
    liveX.current = 0
    liveY.current = 0
  }
  // Compute the wrapper width to match the element's actual width
  const computeWrapWidth = (): string | undefined => {
    const w = el.width
    if (!w) {
      // Default widths per element type
      if (el.type === 'button') return '140px'
      if (el.type === 'input') return '200px'
      if (el.type === 'badge') return '60px'
      if (el.type === 'text') return '80%'
      return undefined // full width
    }
    return String(w)
  }

  return (
    <div
      ref={wrapRef}
      onClick={e => { e.stopPropagation(); onSelect(isActive ? null : el.id) }}
      style={{
        position: (el.x !== undefined || el.y !== undefined) ? 'absolute' : 'relative',
        left: el.x,
        top: el.y,
        zIndex: (el.x !== undefined || el.y !== undefined) ? 10 : 1,
        cursor: 'pointer',
        borderRadius: 6,
        outline: isActive ? '2px solid #6366f1' : '2px solid transparent',
        outlineOffset: 3,
        transition: 'outline 0.15s',
        padding: 2,
        width: computeWrapWidth(),
      }}
    >
      {isActive && (
        <>
          <ElementToolbar
            el={el}
            index={index}
            total={total}
            onDuplicate={() => onDuplicate(el.id)}
            onDelete={() => onDelete(el.id)}
            onMoveUp={() => onReorder(index, index - 1)}
            onMoveDown={() => onReorder(index, index + 1)}
            onDragMove={handleDragMove}
          />
          <ResizeHandle direction="right" onResizeDelta={handleResizeW} />
          <ResizeHandle direction="bottom" onResizeDelta={handleResizeH} />
        </>
      )}
      {renderFreeElement(el, accentColor, textColor)}
    </div>
  )
}

function FreeElementsRenderer({ elements, accentColor, textColor, selectedId, onSelect, onPatchElements }: {
  elements: FreeElement[]; accentColor: string; textColor: string
  selectedId?: string | null
  onSelect?: (id: string | null) => void
  onPatchElements?: (newElements: FreeElement[]) => void
}) {
  if (!elements || elements.length === 0) return null

  const patchEl = (id: string, patch: Partial<FreeElement>) => {
    if (!onPatchElements) return
    onPatchElements(elements.map(e => e.id === id ? { ...e, ...patch } : e))
  }

  const duplicateEl = (id: string) => {
    if (!onPatchElements) return
    const src = elements.find(e => e.id === id)
    if (!src) return
    const clone = { ...src, id: `free-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, label: `${src.label} (хуулбар)` }
    const idx = elements.findIndex(e => e.id === id)
    const next = [...elements]
    next.splice(idx + 1, 0, clone)
    onPatchElements(next)
    onSelect?.(clone.id)
  }

  const deleteEl = (id: string) => {
    if (!onPatchElements) return
    onPatchElements(elements.filter(e => e.id !== id))
    if (selectedId === id) onSelect?.(null)
  }

  const reorderEl = (from: number, to: number) => {
    if (!onPatchElements || to < 0 || to >= elements.length) return
    const next = [...elements]
    const [moved] = next.splice(from, 1)
    next.splice(to, 0, moved)
    onPatchElements(next)
  }

  return (
    <div
      style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}
      onClick={e => { e.stopPropagation(); onSelect?.(null) }}
    >
      {elements.map((el, i) => (
        <InteractiveFreeElement
          key={el.id}
          el={el}
          index={i}
          total={elements.length}
          accentColor={accentColor}
          textColor={textColor}
          selectedId={selectedId || null}
          onSelect={onSelect || (() => {})}
          onPatch={patchEl}
          onDuplicate={duplicateEl}
          onDelete={deleteEl}
          onReorder={reorderEl}
        />
      ))}
    </div>
  )
}

// ─── BlockPreview ──────────────────────────────────────────────────────────────

export function BlockPreview({ block, isSelected, selectedElementId, onSelectElement, onPatchProps }: { 
  block: BlockSection; 
  isSelected: boolean; 
  selectedElementId?: string | null;
  onSelectElement?: (id: string | null) => void;
  onPatchProps?: (patch: Record<string, unknown>) => void 
}) {
  const { props: p = {} } = block
  const animationClass = p.animation && p.animation !== 'none' ? `animate-${p.animation}` : ''
  return (
    <div className={animationClass} style={{ width: '100%' }}>
      <BlockPreviewContent 
        block={block} 
        isSelected={isSelected} 
        selectedElementId={selectedElementId}
        onSelectElement={onSelectElement}
        onPatchProps={onPatchProps} 
      />
    </div>
  )
}

// ─── Default elements generator for blocks without _elements ────────────────

function elId() { return `el-${Date.now()}-${Math.random().toString(36).slice(2, 6)}` }

export function getDefaultElements(type: string, accent: string): FreeElement[] {
  return []
}

function BlockPreviewContent({ 
  block, 
  isSelected, 
  selectedElementId,
  onSelectElement,
  onPatchProps 
}: { 
  block: BlockSection; 
  isSelected: boolean; 
  selectedElementId?: string | null;
  onSelectElement?: (id: string | null) => void;
  onPatchProps?: (patch: Record<string, unknown>) => void 
}) {
  const { componentType: type, props: p = {} } = block
  const bg     = p.bgColor     || '#ffffff'
  const text   = p.textColor   || '#1e293b'
  const accent = p.accentColor || '#6366f1'
  const font   = p.fontFamily  || 'Inter'
  const px     = p.paddingX    ?? 48
  const py     = p.paddingY    ?? 60
  const border = isSelected ? '2px solid #6366f1' : '2px solid transparent'

  // Auto-generate default _elements for blocks that don't have them yet (memoized so IDs are stable)
  const rawElements: FreeElement[] = p._elements || []
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const defaultEls = useMemo(() => getDefaultElements(type, accent), [type, block.id])
  const elements: FreeElement[] = rawElements.length > 0 ? rawElements : defaultEls

  // If block had no _elements but we generated defaults, persist them on first interaction
  const needsSeed = rawElements.length === 0 && elements.length > 0 && type !== 'header'

  const wrapStyle: CSSProperties = {
    fontFamily: font, background: bg, color: text,
    paddingLeft: px, paddingRight: px, paddingTop: py, paddingBottom: py,
    border, transition: 'border 0.15s',
  }

  // ── Renders the free elements at the bottom of any block ──────────────────
  const handlePatchElements = useCallback((newEls: FreeElement[]) => {
    if (onPatchProps) onPatchProps({ _elements: newEls })
  }, [onPatchProps])

  // When user first interacts, seed the _elements so they persist
  const seedAndPatch = useCallback((newEls: FreeElement[]) => {
    if (onPatchProps) onPatchProps({ _elements: newEls })
  }, [onPatchProps])

  const activePatch = needsSeed
    ? (newEls: FreeElement[]) => seedAndPatch(newEls)
    : (onPatchProps ? handlePatchElements : undefined)

  const freeEls = (
    <FreeElementsRenderer 
      elements={elements} 
      accentColor={accent} 
      textColor={text} 
      selectedId={selectedElementId}
      onSelect={onSelectElement}
      onPatchElements={activePatch} 
    />
  )
  
  const freeParts: Record<string, ReactNode> = {}
  elements.forEach((el) => {
    freeParts[`free_${el.id}`] = renderFreeElement(el, accent, text)
  })

  // We no longer return early here. Base components will render their own content, 
  // and we'll append/overlay freeEls at the end of each section.

  function tryBlockCanvas(
    blockType: string,
    wrap: CSSProperties,
    zoneParts: Record<string, ReactNode>,
    after?: ReactNode,
  ): ReactNode | null {
    if (!p.blockCanvas || !isBuilderBlockCanvasType(blockType)) return null
    const minH =
      typeof p.blockCanvasHeight === 'number' && p.blockCanvasHeight > 0
        ? p.blockCanvasHeight
        : defaultBlockCanvasHeight(blockType)
    return (
      <>
        <div style={{ width: '100%' }}>
          <ZoneCanvasPreview
            componentType={blockType}
            p={p}
            wrapStyle={wrap}
            isSelected={!!isSelected}
            onPatch={onPatchProps}
            onSelectPart={onSelectElement}
            minH={minH}
            parts={{ ...zoneParts, ...freeParts }}
          />
        </div>
        {after}
      </>
    )
  }

  if (type === 'header') {
    const navLinks = Array.isArray(p.links) ? p.links : []
    const titlePx = pxFromSizeProp(p.fontSize, 20)
    const navPx = pxFromSizeProp(p.navFontSize, 14)
    const headerWrap: CSSProperties = {
      ...wrapStyle,
      paddingTop: p.paddingY ?? 18,
      paddingBottom: p.paddingY ?? 18,
    }
    if (p.headerCanvas) {
      const navEls = navLinks.length === 0 ? (
        <span style={{ fontSize: 11, color: text, opacity: 0.35, fontStyle: 'italic' }}>Цэс хоосон — Inspector-оос холбоос нэмнэ үү</span>
      ) : (
        navLinks.map((link: { label?: string; href?: string }, i: number) => (
          <span
            key={i}
            style={{
              fontSize: navPx,
              fontWeight: 600,
              color: text,
              opacity: 0.88,
              paddingBottom: 2,
              borderBottom: `2px solid ${accent}55`,
            }}
          >
            {String(link.label || link.href || 'Link')}
          </span>
        ))
      )
      const titleBlock = (
        <div
          style={{
            fontWeight: 800,
            fontSize: titlePx,
            color: text,
            letterSpacing: '-0.02em',
            maxWidth: 280,
          }}
        >
          {String(p.title || '')}
        </div>
      )
      const ctaSep = p.ctaWithNav === false
      const ctaBlock = p.button ? <div style={{ width: 90, height: 32, background: accent, borderRadius: p.btnRadius ?? 8, opacity: 0.85, flexShrink: 0 }} /> : null
      return (
        <div style={{ width: '100%' }}>
          <HeaderCanvasPreview
            p={p}
            wrapBase={headerWrap}
            borderBottom={p.borderBottom ? `1px solid ${p.borderColor || '#e2e8f0'}` : 'none'}
            isSelected={isSelected}
            onPatch={onPatchProps}
            onSelectPart={onSelectElement}
            titleBlock={titleBlock}
            navEls={navEls}
            ctaBlock={ctaBlock}
            ctaSep={ctaSep}
            hasCta={!!p.button}
            minH={typeof p.headerCanvasHeight === 'number' && p.headerCanvasHeight > 0 ? p.headerCanvasHeight : 88}
            freeParts={freeParts}
          />
        </div>
      )
    }
    const jMap: Record<string, string> = {
      start: 'flex-start', center: 'center', end: 'flex-end',
      between: 'space-between', around: 'space-around', evenly: 'space-evenly',
    }
    const iMap: Record<string, string> = {
      start: 'flex-start', center: 'center', end: 'flex-end', baseline: 'baseline', stretch: 'stretch',
    }
    const rowJust = jMap[String(p.rowJustify || 'between')] || 'space-between'
    const rowIt = iMap[String(p.rowItems || 'center')] || 'center'
    const isStack = p.headerLayout === 'stack'
    const ctaSep = p.ctaWithNav === false
    const brStack =
      p.stackBrandAlign === 'end' ? 'flex-end' : p.stackBrandAlign === 'start' ? 'flex-start' : 'center'
    const navStack = jMap[String(p.stackNavJustify || 'center')] || 'center'
    const gap = typeof p.contentGap === 'number' && p.contentGap > 0 ? p.contentGap : 8
    const navEls = navLinks.length === 0 ? (
      <span style={{ fontSize: 11, color: text, opacity: 0.35, fontStyle: 'italic' }}>Цэс хоосон — Inspector-оос холбоос нэмнэ үү</span>
    ) : (
      navLinks.map((link: { label?: string; href?: string }, i: number) => (
        <span
          key={i}
          style={{
            fontSize: navPx,
            fontWeight: 600,
            color: text,
            opacity: 0.88,
            paddingBottom: 2,
            borderBottom: `2px solid ${accent}55`,
          }}
        >
          {String(link.label || link.href || 'Link')}
        </span>
      ))
    )
    const ctaBlock = <div style={{ width: 90, height: 32, background: accent, borderRadius: p.btnRadius ?? 8, opacity: 0.85, flexShrink: 0 }} />
    const titleBlock = (
      <div
        style={{
          fontWeight: 800,
          fontSize: titlePx,
          color: text,
          letterSpacing: '-0.02em',
          maxWidth: ctaSep ? '38%' : '42%',
        }}
        title="Сайтын нэр (title) — Лого текстийн хэмжээ"
      >
        {String(p.title || '')}
      </div>
    )
    if (isStack) {
      return (
        <div
          style={{
            ...wrapStyle,
            paddingTop: p.paddingY ?? 18,
            paddingBottom: p.paddingY ?? 18,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
            borderBottom: p.borderBottom ? `1px solid ${p.borderColor || '#e2e8f0'}` : 'none',
            gap: Math.max(gap, 6),
          }}
        >
          <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', justifyContent: brStack, width: '100%' }}>{titleBlock}</div>
            <div style={{ width: 48, height: 28, borderRadius: 8, border: `1px solid ${text}30`, flexShrink: 0 }} title="Menu" />
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: p.rowReverse ? 'row-reverse' as const : 'row' as const,
              flexWrap: 'wrap' as const,
              justifyContent: navStack,
              alignItems: rowIt as 'center',
              gap,
              minHeight: 32,
            }}
          >
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', flex: ctaSep ? 1 : undefined }}>
              {navEls}
              {!ctaSep && ctaBlock}
            </div>
            {ctaSep && ctaBlock}
          </div>
          {elements.length > 0 && <div style={{ width: '100%' }}>{freeEls}</div>}
        </div>
      )
    }
    return (
      <div
        style={{
          ...wrapStyle,
          paddingTop: p.paddingY ?? 18,
          paddingBottom: p.paddingY ?? 18,
          display: 'flex',
          flexDirection: p.rowReverse ? 'row-reverse' as const : 'row' as const,
          justifyContent: rowJust as 'space-between',
          alignItems: rowIt as 'center',
          borderBottom: p.borderBottom ? `1px solid ${p.borderColor || '#e2e8f0'}` : 'none',
          flexWrap: 'wrap' as const,
          gap,
        }}
      >
        {titleBlock}
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' as const, alignItems: 'center', justifyContent: ctaSep ? 'center' as const : 'center' as const, flex: ctaSep ? 1 : undefined, minWidth: 0 }}>
          {navEls}
          {!ctaSep && ctaBlock}
        </div>
        {ctaSep && ctaBlock}
        {elements.length > 0 && <div style={{ width: '100%' }}>{freeEls}</div>}
      </div>
    )
  }

  if (type === 'hero') {
    const align = p.align || 'center'
    const flexAlign = align === 'left' ? 'flex-start' : align === 'right' ? 'flex-end' : 'center'
    const displayImg = p.imageUrl || (p.src ? resolveDisplayImageUrl(p.src) : '')
    const mediaEl = (p.hasImage || displayImg) ? (
      <div style={{ width: '100%', maxWidth: 420, height: displayImg ? 'auto' : 160, background: displayImg ? 'transparent' : text, opacity: displayImg ? 1 : 0.06, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {displayImg ? <img src={displayImg} style={{ width: '100%', borderRadius: 12 }} /> : <ImageIcon style={{ color: text, opacity: 0.25, width: 36, height: 36 }} />}
      </div>
    ) : (
      <div style={{ width: 120, height: 36, borderRadius: 8, border: `1px dashed ${text}22` }} />
    )

    const zoneParts: Record<string, ReactNode> = {
      media: mediaEl,
      title: <div style={{ fontSize: p.titleSize || 48, fontWeight: p.titleWeight || '800', color: text, maxWidth: 600 }}>{p.title || 'Гарчиг энд байна'}</div>,
      subtitle: <div style={{ fontSize: p.subtitleSize || 18, color: text, opacity: 0.7, maxWidth: 500 }}>{p.subtitle || 'Дэд гарчиг энд бичигдэнэ'}</div>,
      cta: <div style={{ width: p.btnPaddingX ? p.btnPaddingX * 4 : 140, height: p.btnPaddingY ? p.btnPaddingY * 3 : 46, background: p.btnBg || accent, borderRadius: p.btnRadius ?? 10, opacity: 0.9, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 14, fontWeight: 700 }}>{p.primaryBtnText || p.btnText || ''}</div>,
    }

    const canvas = tryBlockCanvas('hero', wrapStyle, zoneParts)
    if (canvas) return canvas

    return (
      <div style={{ ...wrapStyle, display: 'flex', flexDirection: 'column', alignItems: flexAlign, textAlign: align as any, gap: 20 }}>
        {zoneParts.title}
        {zoneParts.subtitle}
        {mediaEl}
        {(p.primaryBtnText || p.btnText) && zoneParts.cta}
        {freeEls}
      </div>
    )
  }

  if (type === 'about') {
    const align = p.align || 'left'
    const flexAlign = align === 'left' ? 'flex-start' : align === 'right' ? 'flex-end' : 'center'
    const displayImg = p.imageUrl || (p.src ? resolveDisplayImageUrl(p.src) : '')

    const zoneParts: Record<string, ReactNode> = {
      image: (
        <div style={{ width: '100%', maxWidth: 480, height: displayImg ? 'auto' : 240, background: displayImg ? 'transparent' : text, opacity: displayImg ? 1 : 0.06, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {displayImg ? <img src={displayImg} style={{ width: '100%', borderRadius: 16 }} /> : <ImageIcon style={{ color: text, opacity: 0.25, width: 48, height: 48 }} />}
        </div>
      ),
      content: (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, alignItems: flexAlign }}>
          <div style={{ fontSize: p.titleSize || 34, fontWeight: '700', color: text }}>{p.title || 'Бидний тухай'}</div>
          {p.description ? <div style={{ fontSize: 16, opacity: 0.8, lineHeight: 1.6 }}>{p.description}</div> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%' }}>
              <SkeletonLine w="100%" color={text} />
              <SkeletonLine w="95%" color={text} />
              <SkeletonLine w="90%" color={text} />
              <SkeletonLine w="40%" color={text} />
            </div>
          )}
          {(p.btnText || p.primaryBtnText) && <div style={{ width: 120, height: 40, background: accent, borderRadius: p.btnRadius ?? 8, opacity: 0.8, marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 13, fontWeight: 600 }}>{p.btnText || p.primaryBtnText}</div>}
        </div>
      )
    }

    const canvas = tryBlockCanvas('about', wrapStyle, zoneParts)
    if (canvas) return canvas

    const isLeft = align === 'left'
    return (
      <div style={{ ...wrapStyle, display: 'flex', flexDirection: isLeft ? 'row' : 'row-reverse', alignItems: 'center', gap: 40, flexWrap: 'wrap' }}>
        {zoneParts.image}
        {zoneParts.content}
        {freeEls}
      </div>
    )
  }

  if (['services', 'features', 'products', 'pricing', 'clients'].includes(type)) {
    const cols = p.columns || 3
    const cardBg = p.cardBg || (bg === '#ffffff' ? '#f8fafc' : `${bg}15`)
    const items = Array.isArray(p.items) ? p.items : []
    
    const zoneParts: Record<string, ReactNode> = {
      title: <div style={{ fontSize: p.titleSize || 34, fontWeight: '700', color: text, marginBottom: 32 }}>{p.title || (type === 'services' ? 'Үйлчилгээ' : type === 'features' ? 'Онцлог' : type === 'products' ? 'Бүтээгдэхүүн' : type === 'pricing' ? 'Үнийн санал' : 'Харилцагчид')}</div>,
      grid: (
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 20, width: '100%' }}>
          {items.length > 0 ? items.map((item, i) => (
             <div key={i} style={{ background: cardBg, borderRadius: p.cardRadius ?? 16, padding: 24, boxShadow: p.cardShadow === 'none' ? 'none' : '0 4px 12px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {item.imageUrl && <img src={item.imageUrl} style={{ width: 48, height: 48, borderRadius: 12, objectFit: 'cover' }} />}
                <div style={{ fontWeight: 700, fontSize: 18 }}>{item.title}</div>
                <div style={{ fontSize: 14, opacity: 0.7 }}>{item.description}</div>
                {item.price && <div style={{ fontWeight: 800, color: accent }}>{item.price}</div>}
             </div>
          )) : [1, 2, 3, 4, 5, 6].slice(0, Math.max(cols, 3)).map(i => (
            <div key={i} style={{ background: cardBg, borderRadius: p.cardRadius ?? 16, padding: 24, boxShadow: p.cardShadow === 'none' ? 'none' : '0 4px 12px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: accent, opacity: 0.1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Package style={{ width: 24, height: 24, color: accent }} />
              </div>
              <SkeletonLine w="70%" color={text} h={16} />
              <SkeletonLine w="100%" color={text} h={10} />
              <SkeletonLine w="90%" color={text} h={10} />
            </div>
          ))}
        </div>
      )
    }

    const canvas = tryBlockCanvas(type, wrapStyle, zoneParts)
    if (canvas) return canvas

    return (
      <div style={{ ...wrapStyle, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        {zoneParts.title}
        {zoneParts.grid}
        {freeEls}
      </div>
    )
  }

  if (type === 'promo') {
    return (
      <div style={{ ...wrapStyle, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 20 }}>
        <div style={{ fontSize: p.titleSize || 36, fontWeight: '800', color: text }}>{p.title || 'Урамшуулал ба Онцлох'}</div>
        {p.description ? <div style={{ fontSize: 18, opacity: 0.8 }}>{p.description}</div> : <SkeletonLine w="60%" color={text} />}
        {(p.btnText || p.primaryBtnText) && <div style={{ width: 160, height: 50, background: p.btnBg || accent, borderRadius: p.btnRadius ?? 12, opacity: 0.9, marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700 }}>{p.btnText || p.primaryBtnText}</div>}
        {freeEls}
      </div>
    )
  }

  if (type === 'contact') {
    const zoneParts: Record<string, ReactNode> = {
      title: <div style={{ fontSize: p.titleSize || 34, fontWeight: '700', color: text }}>{p.title || 'Холбоо барих'}</div>,
      form: (
        <div style={{ width: '100%', maxWidth: 500, background: p.cardBg || '#ffffff', borderRadius: p.cardRadius ?? 16, padding: 32, boxShadow: '0 10px 25px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ height: 42, borderRadius: 8, background: text, opacity: 0.05 }} />
          <div style={{ height: 42, borderRadius: 8, background: text, opacity: 0.05 }} />
          <div style={{ height: 100, borderRadius: 8, background: text, opacity: 0.05 }} />
          <div style={{ height: 46, borderRadius: 8, background: accent, opacity: 0.9, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 14, fontWeight: 700 }}>Илгээх</div>
        </div>
      )
    }

    const canvas = tryBlockCanvas('contact', wrapStyle, zoneParts)
    if (canvas) return canvas

    return (
      <div style={{ ...wrapStyle, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32 }}>
        {zoneParts.title}
        {p.showForm !== false && zoneParts.form}
        {freeEls}
      </div>
    )
  }

  if (type === 'footer') {
    return (
      <div style={{ ...wrapStyle, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 16 }}>
        <div style={{ fontWeight: '800', fontSize: 24, color: text }}>{p.brandName || p.title || 'Брэнд нэр'}</div>
        {p.description ? <div style={{ fontSize: 14, opacity: 0.6, maxWidth: 600 }}>{p.description}</div> : (
          <div style={{ display: 'flex', gap: 20 }}>
            <SkeletonLine w={60} color={text} />
            <SkeletonLine w={60} color={text} />
            <SkeletonLine w={60} color={text} />
          </div>
        )}
        <div style={{ fontSize: 12, color: text, opacity: 0.5, marginTop: 20 }}>
          © {new Date().getFullYear()} {p.copyright || 'Бүх эрх хуулиар хамгаалагдсан.'}
        </div>
        {freeEls}
      </div>
    )
  }

  // Fallback for any other type
  return (
    <div style={{ 
      ...wrapStyle, 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: (p.align === 'center' ? 'center' : p.align === 'right' ? 'flex-end' : 'flex-start'),
      minHeight: 120 
    }}>
      <div style={{ fontSize: 12, fontWeight: 'bold', opacity: 0.2, marginBottom: 8, textTransform: 'uppercase' }}>{type} preview</div>
      {p.title ? <div style={{ fontSize: 24, fontWeight: 800 }}>{p.title}</div> : <SkeletonLine w="80%" color={text} mb={8} />}
      {p.subtitle ? <div style={{ opacity: 0.7 }}>{p.subtitle}</div> : <SkeletonLine w="60%" color={text} mb={16} />}
      {freeEls}
    </div>
  )
}

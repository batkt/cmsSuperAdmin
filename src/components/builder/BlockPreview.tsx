'use client'
import type { CSSProperties } from 'react'
import { BlockSection } from './templates'
import { Image as ImageIcon, Package } from 'lucide-react'
import { HeaderCanvasPreview } from './HeaderCanvasPreview'
import { ZoneCanvasPreview } from './ZoneCanvasPreview'
import { defaultBlockCanvasHeight, isBuilderBlockCanvasType } from './sectionCanvasDefaults'

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
}

function FreeElementsRenderer({ elements, accentColor }: { elements: FreeElement[]; accentColor: string }) {
  if (!elements || elements.length === 0) return null
  return (
    <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
      {elements.map(el => {
        switch (el.type) {
          case 'text':
            return (
              <div key={el.id} style={{
                color: el.color || '#1e293b', fontSize: el.size || 16,
                textAlign: (el.align as any) || 'left', fontWeight: 400,
                padding: '2px 0', opacity: 0.85,
              }}>
                {el.value || el.label}
              </div>
            )

          case 'button':
            return (
              <div key={el.id} style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                background: el.bg || accentColor,
                color: el.color || '#fff',
                borderRadius: el.radius ?? 10,
                fontSize: el.size || 14,
                fontWeight: 600,
                padding: '10px 24px',
                cursor: 'default',
                alignSelf: 'flex-start',
                boxShadow: `0 2px 8px ${(el.bg || accentColor)}40`,
              }}>
                {el.value || el.label}
              </div>
            )

          case 'input':
            return (
              <div key={el.id} style={{
                background: el.bg || '#f1f5f9',
                borderRadius: el.radius ?? 8,
                border: '1px solid #e2e8f0',
                padding: '10px 14px',
                fontSize: 13,
                color: '#94a3b8',
                cursor: 'default',
              }}>
                {el.placeholder || el.label}
              </div>
            )

          case 'image':
            return (
              <div key={el.id} style={{
                width: el.width || '100%',
                height: el.height || 200,
                background: '#e2e8f0',
                borderRadius: 8,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#94a3b8', fontSize: 12,
                border: '1px dashed #cbd5e1',
              }}>
                <ImageIcon style={{ width: 28, height: 28, opacity: 0.4 }} />
              </div>
            )

          case 'card':
            return (
              <div key={el.id} style={{
                background: el.bg || '#ffffff',
                borderRadius: el.radius ?? 12,
                height: el.height || 120,
                border: '1px solid #e2e8f0',
                boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#94a3b8', fontSize: 12,
              }}>
                {el.label}
              </div>
            )

          case 'section':
            return (
              <div key={el.id} style={{
                background: el.bg || '#f8fafc',
                height: el.height || 80,
                borderRadius: 8,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#94a3b8', fontSize: 12,
                border: '1px dashed #e2e8f0',
              }}>
                {el.label}
              </div>
            )

          case 'divider':
            return (
              <div key={el.id} style={{
                width: '100%',
                height: el.height || 1,
                background: el.color || '#e2e8f0',
                borderRadius: 99,
                margin: '4px 0',
              }} />
            )

          case 'badge':
            return (
              <div key={el.id} style={{ display: 'flex' }}>
                <span style={{
                  background: el.bg || accentColor,
                  color: el.color || '#fff',
                  borderRadius: el.radius ?? 999,
                  fontSize: el.size || 11,
                  fontWeight: 700,
                  padding: '3px 10px',
                  display: 'inline-block',
                }}>
                  {el.value || el.label}
                </span>
              </div>
            )

          default:
            return null
        }
      })}
    </div>
  )
}

// ─── BlockPreview ──────────────────────────────────────────────────────────────

export function BlockPreview({ block, isSelected, onPatchProps }: { block: BlockSection; isSelected: boolean; onPatchProps?: (patch: Record<string, unknown>) => void }) {
  const { props: p = {} } = block
  const animationClass = p.animation && p.animation !== 'none' ? `animate-${p.animation}` : ''
  return (
    <div className={animationClass} style={{ width: '100%' }}>
      <BlockPreviewContent block={block} isSelected={isSelected} onPatchProps={onPatchProps} />
    </div>
  )
}

function BlockPreviewContent({ block, isSelected, onPatchProps }: { block: BlockSection; isSelected: boolean; onPatchProps?: (patch: Record<string, unknown>) => void }) {
  const { componentType: type, props: p = {} } = block
  const bg     = p.bgColor     || '#ffffff'
  const text   = p.textColor   || '#1e293b'
  const accent = p.accentColor || '#6366f1'
  const font   = p.fontFamily  || 'Inter'
  const px     = p.paddingX    ?? 48
  const py     = p.paddingY    ?? 60
  const border = isSelected ? '2px solid #6366f1' : '2px solid transparent'
  const elements: FreeElement[] = p._elements || []

  const wrapStyle: CSSProperties = {
    fontFamily: font, background: bg, color: text,
    paddingLeft: px, paddingRight: px, paddingTop: py, paddingBottom: py,
    border, transition: 'border 0.15s',
  }

  // ── Renders the free elements at the bottom of any block ──────────────────
  const freeEls = <FreeElementsRenderer elements={elements} accentColor={accent} />

  function tryBlockCanvas(
    blockType: string,
    wrap: CSSProperties,
    zoneParts: Record<string, React.ReactNode>,
    after?: React.ReactNode,
  ): React.ReactNode | null {
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
            minH={minH}
            parts={zoneParts}
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
          {String(p.title || 'Site')}
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
            titleBlock={titleBlock}
            navEls={navEls}
            ctaBlock={ctaBlock}
            ctaSep={ctaSep}
            hasCta={!!p.button}
            minH={typeof p.headerCanvasHeight === 'number' && p.headerCanvasHeight > 0 ? p.headerCanvasHeight : 88}
            freeEls={elements.length > 0 ? <div style={{ width: '100%' }}>{freeEls}</div> : <></>}
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
        {String(p.title || 'Site')}
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
    const mediaEl = p.hasImage ? (
      <div style={{ width: '100%', maxWidth: 420, height: 160, background: text, opacity: 0.06, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <ImageIcon style={{ color: text, opacity: 0.25, width: 36, height: 36 }} />
      </div>
    ) : (
      <div style={{ width: 120, height: 36, borderRadius: 8, border: `1px dashed ${text}22` }} title="Зураггүй" />
    )
    const titleEl = <SkeletonLine w={340} h={p.titleSize ? p.titleSize * 0.7 : 36} color={text} mb={12} />
    const subtitleEl = (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: flexAlign as any }}>
        <SkeletonLine w={460} h={14} color={text} mb={0} />
        <SkeletonLine w={380} h={14} color={text} mb={0} />
      </div>
    )
    const ctaEl = (
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: flexAlign as any }}>
        <div style={{ width: 140, height: 46, background: accent, borderRadius: p.btnRadius ?? 10, opacity: 0.9 }} />
        <div style={{ width: 120, height: 46, background: 'transparent', border: `2px solid ${accent}`, borderRadius: p.btnRadius ?? 10, opacity: 0.5 }} />
      </div>
    )
    const cv = tryBlockCanvas(
      'hero',
      { ...wrapStyle, display: 'block', textAlign: align as any },
      { media: mediaEl, title: titleEl, subtitle: subtitleEl, cta: ctaEl },
      freeEls,
    )
    if (cv) return cv
    return (
      <div style={{ ...wrapStyle, display: 'flex', flexDirection: 'column', alignItems: flexAlign, textAlign: align as any }}>
        {p.hasImage && <div style={{ width: '100%', height: 220, background: text, opacity: 0.04, borderRadius: 12, marginBottom: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ImageIcon style={{ color: text, opacity: 0.2, width: 40, height: 40 }} /></div>}
        <SkeletonLine w={340} h={p.titleSize ? p.titleSize * 0.7 : 36} color={text} mb={12} />
        <SkeletonLine w={460} h={14} color={text} mb={6} />
        <SkeletonLine w={380} h={14} color={text} mb={28} />
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ width: 140, height: 46, background: accent, borderRadius: p.btnRadius ?? 10, opacity: 0.9 }} />
          <div style={{ width: 120, height: 46, background: 'transparent', border: `2px solid ${accent}`, borderRadius: p.btnRadius ?? 10, opacity: 0.5 }} />
        </div>
        {freeEls}
      </div>
    )
  }

  if (type === 'about') {
    const dir = p.align === 'right' ? 'row-reverse' : 'row'
    return (
      <div style={{ ...wrapStyle, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', gap: 48, alignItems: 'center', flexDirection: dir as any }}>
          {p.hasImage && <div style={{ flex: 1, height: 260, background: text, opacity: 0.05, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ImageIcon style={{ color: text, opacity: 0.2, width: 40, height: 40 }} /></div>}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <SkeletonLine w={220} h={28} color={text} mb={16} />
            {[100, 95, 90, 80].map((w, i) => <SkeletonLine key={i} w={`${w}%`} h={11} color={text} mb={8} />)}
            <div style={{ marginTop: 20, width: 130, height: 40, background: accent, borderRadius: p.btnRadius ?? 10, opacity: 0.85 }} />
          </div>
        </div>
        {freeEls}
      </div>
    )
  }

  if (type === 'services' || type === 'features') {
    const cols = p.columns || 3
    return (
      <div style={{ ...wrapStyle, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <SkeletonLine w={260} h={28} color={text} mb={32} />
        <div style={{ width: '100%', display: 'grid', gridTemplateColumns: `repeat(${cols},1fr)`, gap: 20 }}>
          {Array.from({ length: cols }).map((_, i) => (
            <div key={i} style={{ background: p.cardBg || '#f8fafc', padding: 24, borderRadius: p.cardRadius ?? 14, display: 'flex', flexDirection: 'column', alignItems: 'center', border: `1px solid ${accent}20` }}>
              <div style={{ width: 44, height: 44, background: accent, borderRadius: 10, marginBottom: 14, opacity: 0.8 }} />
              <SkeletonLine w="65%" h={16} color={text} mb={10} />
              <SkeletonLine w="100%" h={10} color={text} mb={6} />
              <SkeletonLine w="85%" h={10} color={text} />
            </div>
          ))}
        </div>
        {freeEls}
      </div>
    )
  }

  if (type === 'products') {
    const cols = p.columns || 3
    return (
      <div style={{ ...wrapStyle, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <SkeletonLine w={220} h={28} color={text} mb={32} />
        <div style={{ width: '100%', display: 'grid', gridTemplateColumns: `repeat(${cols},1fr)`, gap: 16 }}>
          {Array.from({ length: cols }).map((_, i) => (
            <div key={i} style={{ background: p.cardBg || '#fff', borderRadius: p.cardRadius ?? 14, overflow: 'hidden', border: `1px solid ${accent}15` }}>
              <div style={{ height: 160, background: text, opacity: 0.05 }} />
              <div style={{ padding: 16 }}>
                <SkeletonLine w="70%" h={14} color={text} mb={8} />
                <SkeletonLine w="40%" h={18} color={accent} mb={12} />
                <div style={{ height: 32, background: accent, borderRadius: 8, opacity: 0.8 }} />
              </div>
            </div>
          ))}
        </div>
        {freeEls}
      </div>
    )
  }

  if (type === 'pricing') {
    return (
      <div style={{ ...wrapStyle, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <SkeletonLine w={280} h={28} color={text} mb={12} />
        <SkeletonLine w={400} h={13} color={text} mb={36} />
        <div style={{ width: '100%', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
          {[false, true, false].map((featured, i) => (
            <div key={i} style={{ background: featured ? accent : (p.cardBg || '#f8fafc'), borderRadius: p.cardRadius ?? 16, padding: 28, border: featured ? 'none' : `1px solid ${accent}20`, transform: featured ? 'scale(1.04)' : 'none' }}>
              <SkeletonLine w="50%" h={16} color={featured ? '#fff' : text} mb={8} />
              <SkeletonLine w="60%" h={32} color={featured ? '#fff' : accent} mb={16} />
              {[1,2,3].map(j => <SkeletonLine key={j} w="85%" h={10} color={featured ? '#fff' : text} mb={8} />)}
              <div style={{ height: 40, background: featured ? '#fff' : accent, borderRadius: 10, marginTop: 16, opacity: featured ? 0.9 : 0.8 }} />
            </div>
          ))}
        </div>
        {freeEls}
      </div>
    )
  }

  if (type === 'clients') {
    return (
      <div style={{ ...wrapStyle, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <SkeletonLine w={240} h={26} color={text} mb={32} />
        <div style={{ width: '100%', display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 16 }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} style={{ height: 60, background: p.cardBg || '#f1f5f9', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 80, height: 24, background: text, opacity: 0.15, borderRadius: 4 }} />
            </div>
          ))}
        </div>
        {freeEls}
      </div>
    )
  }

  if (type === 'promo') {
    return (
      <div style={{ ...wrapStyle, background: accent, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <SkeletonLine w={320} h={32} color="#fff" mb={12} />
        <SkeletonLine w={440} h={14} color="#fff" mb={28} />
        <div style={{ width: 160, height: 50, background: '#fff', borderRadius: p.btnRadius ?? 12, opacity: 0.9 }} />
        {freeEls}
      </div>
    )
  }

  if (type === 'contact') {
    return (
      <div style={{ ...wrapStyle, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <SkeletonLine w={240} h={26} color={text} mb={32} />
        <div style={{ width: '100%', maxWidth: 520, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[1,2,3].map(i => <div key={i} style={{ height: 46, background: p.cardBg || '#f1f5f9', borderRadius: 10, border: `1px solid ${accent}20` }} />)}
          <div style={{ height: 100, background: p.cardBg || '#f1f5f9', borderRadius: 10, border: `1px solid ${accent}20` }} />
          <div style={{ height: 48, background: accent, borderRadius: 12, opacity: 0.85 }} />
        </div>
        {freeEls}
      </div>
    )
  }

  if (type === 'footer') {
    return (
      <div style={{ ...wrapStyle, display: 'flex', flexDirection: 'column', alignItems: p.align === 'left' ? 'flex-start' : 'center', gap: 12 }}>
        <div style={{ width: 120, height: 24, background: accent, opacity: 0.8, borderRadius: 6 }} />
        <div style={{ display: 'flex', gap: 24 }}>
          {[80, 70, 90, 65].map((w, i) => <SkeletonLine key={i} w={w} h={11} color={text} />)}
        </div>
        <SkeletonLine w={220} h={10} color={text} />
        {freeEls}
      </div>
    )
  }

  // ── Fallback / custom ─────────────────────────────────────────────────────
  return (
    <div style={{ ...wrapStyle, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Package style={{ color: text, opacity: 0.2, width: 36, height: 36, marginBottom: 12 }} />
      <SkeletonLine w={150} h={14} color={text} />
      {freeEls}
    </div>
  )
}

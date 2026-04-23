'use client'
import { useState } from 'react'
import { Template, ALL_TEMPLATES } from './templates'
import { X, Eye, Check, ShoppingBag, Info, Video, Building2, Car, ParkingMeter, Smartphone, Home, LayoutGrid } from 'lucide-react'
import { BlockPreview } from './BlockPreview'

const CATEGORY_META: Record<string, { icon: React.ElementType; label: string }> = {
  static:     { icon: Building2,    label: 'Статик сайт' },
  ecommerce:  { icon: ShoppingBag,  label: 'Онлайн дэлгүүр' },
  info:       { icon: Info,         label: 'Мэдээлэл / Корпорат' },
  video:      { icon: Video,        label: 'Видео систем' },
  rental:     { icon: Home,         label: 'Түрээс' },
  parking:    { icon: LayoutGrid,   label: 'Зогсоол' },
  pos:        { icon: Smartphone,   label: 'POS систем' },
  automotive: { icon: Car,          label: 'Авто' },
}

function PreviewModal({ template, onClose, onApply }: { template: Template; onClose: () => void; onApply: () => void }) {
  const { icon: Icon, label } = CATEGORY_META[template.category] ?? { icon: Building2, label: template.category }
  const firstPage = template.pages[0]

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-md" style={{ background: template.gradient }}>
              <Icon className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">{template.name}</h3>
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{label} · {template.pages.length} хуудас</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onApply}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold text-white shadow-lg transition-all hover:opacity-90"
              style={{ background: template.gradient }}>
              <Check className="w-4 h-4" /> Загвар ашиглах
            </button>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Canvas preview */}
        <div className="flex-1 overflow-y-auto bg-[#e8edf3] p-4">
          <div className="bg-white rounded-xl overflow-hidden shadow-sm ring-1 ring-black/5">
            {firstPage?.blocks.map(block => (
              <BlockPreview key={block.id} block={block} isSelected={false} />
            ))}
          </div>
        </div>

        {/* Pages list */}
        <div className="px-6 py-3 border-t border-slate-100 shrink-0 bg-slate-50 flex items-center gap-3 flex-wrap">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Хуудсууд:</span>
          {template.pages.map(pg => (
            <span key={pg.id} className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-600">{pg.name}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

export function TemplateGallery({ onSelect, onClose }: { onSelect: (t: Template) => void; onClose: () => void }) {
  const [preview, setPreview] = useState<Template | null>(null)
  const [activeCategory, setActiveCategory] = useState<string>('all')

  const categories = ['all', ...Array.from(new Set(ALL_TEMPLATES.map(t => t.category)))]
  const filtered = activeCategory === 'all' ? ALL_TEMPLATES : ALL_TEMPLATES.filter(t => t.category === activeCategory)

  return (
    <>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[88vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>

          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-100 shrink-0">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Загвар сонгох</h2>
                <p className="text-sm text-slate-500 mt-0.5">{ALL_TEMPLATES.length} бэлэн загвараас сонгоно уу эсвэл хоосноос эхэлнэ үү</p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Category filter tabs */}
            <div className="flex gap-1.5 flex-wrap">
              {categories.map(cat => {
                const meta = CATEGORY_META[cat]
                const Icon = meta?.icon
                return (
                  <button key={cat} onClick={() => setActiveCategory(cat)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${activeCategory === cat ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                    {Icon && <Icon className="w-3 h-3" />}
                    {cat === 'all' ? 'Бүгд' : meta?.label ?? cat}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Grid */}
          <div className="flex-1 overflow-y-auto p-5">
            {/* Blank start */}
            <button onClick={() => onSelect({ id: 'blank', name: '', nameEn: '', description: '', category: 'static', color: '', gradient: '', pages: [] })}
              className="w-full mb-4 p-4 rounded-2xl border-2 border-dashed border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 transition-all flex items-center gap-4 text-left group">
              <div className="w-11 h-11 rounded-xl bg-slate-100 group-hover:bg-indigo-100 flex items-center justify-center text-2xl transition-colors font-light text-slate-400 group-hover:text-indigo-500">＋</div>
              <div>
                <p className="font-bold text-slate-700 group-hover:text-indigo-700 text-sm">Хоосноос эхлэх</p>
                <p className="text-xs text-slate-400 mt-0.5">Загваргүйгээр бүрэлдэхүүнүүдийг гараараа нэмнэ</p>
              </div>
            </button>

            <div className="grid grid-cols-3 gap-4">
              {filtered.map(t => {
                const { icon: Icon, label } = CATEGORY_META[t.category] ?? { icon: Building2, label: t.category }
                return (
                  <div key={t.id} className="rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group cursor-pointer flex flex-col">
                    {/* Thumbnail */}
                    <div className="h-36 overflow-hidden relative flex-shrink-0">
                      {/* Scaled down preview */}
                      <div style={{ transform: 'scale(0.28)', transformOrigin: 'top left', width: '357%', pointerEvents: 'none' }}>
                        {t.pages[0]?.blocks.map(block => (
                          <BlockPreview key={block.id} block={block} isSelected={false} />
                        ))}
                      </div>
                      {/* Gradient fade */}
                      <div className="absolute inset-0 bg-gradient-to-t from-white/70 via-transparent to-transparent" />
                      {/* Color accent strip */}
                      <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: t.gradient }} />
                    </div>

                    <div className="p-3 flex-1 flex flex-col">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-5 h-5 rounded-md flex items-center justify-center shrink-0" style={{ background: t.gradient }}>
                          <Icon className="w-2.5 h-2.5 text-white" />
                        </div>
                        <p className="font-bold text-sm text-slate-800 truncate">{t.name}</p>
                        <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full font-semibold shrink-0" style={{ background: t.color + '18', color: t.color }}>
                          {t.pages.length}п
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2 flex-1">{t.description}</p>

                      <div className="flex gap-1.5 mt-2.5">
                        <button onClick={() => setPreview(t)}
                          className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[11px] font-semibold border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors">
                          <Eye className="w-3 h-3" /> Урьдчилан үзэх
                        </button>
                        <button onClick={() => onSelect(t)}
                          className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[11px] font-bold text-white transition-all hover:opacity-90"
                          style={{ background: t.gradient }}>
                          <Check className="w-3 h-3" /> Сонгох
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {preview && (
        <PreviewModal
          template={preview}
          onClose={() => setPreview(null)}
          onApply={() => { onSelect(preview); setPreview(null) }}
        />
      )}
    </>
  )
}

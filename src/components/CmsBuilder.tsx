'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Plus, Trash2, ArrowLeft, Loader2, AlertCircle, Eye, EyeOff,
  Check, Globe, Home, Info, Phone, Settings2, Building2, Megaphone,
  Briefcase, Users, LayoutGrid, ChevronDown, ChevronRight, X,
  RefreshCw, Save, LogIn,
} from 'lucide-react'
import { useCmsStore, type CmsProject } from '@/stores/cmsStore'

// ─── Types ────────────────────────────────────────────────────────────────────

type Lang = 'mn' | 'en'
type PageId =
  | 'home'
  | 'about'
  | 'services'
  | 'contact'
  | 'properties-page'
  | 'sales-page'
  | 'jobs-page'
  | 'team'
  | 'footer'

type SimpleFieldDef = {
  type: 'text' | 'textarea' | 'url' | 'number'
  key: string
  label: string
}
type StringArrayFieldDef = { type: 'string-array'; key: string; label: string }
type ObjectArrayFieldDef = {
  type: 'object-array'
  key: string
  label: string
  itemFields: SimpleFieldDef[]
  defaultItem: Record<string, string | number>
}
type FieldDef = SimpleFieldDef | StringArrayFieldDef | ObjectArrayFieldDef

type ObjectSectionDef = {
  key: string
  label: string
  valueType: 'object'
  fields: FieldDef[]
}
type ObjectArraySectionDef = {
  key: string
  label: string
  valueType: 'object-array'
  itemFields: SimpleFieldDef[]
  defaultItem: Record<string, string | number>
}
type StringArraySectionDef = { key: string; label: string; valueType: 'string-array' }
type PrimitiveSectionDef = {
  key: string
  label: string
  valueType: 'primitive'
  fieldType: 'text' | 'textarea'
}
type SectionDef =
  | ObjectSectionDef
  | ObjectArraySectionDef
  | StringArraySectionDef
  | PrimitiveSectionDef

type PageDef = { id: PageId; label: string; icon: React.ElementType; sections: SectionDef[] }

// ─── Page Schemas ─────────────────────────────────────────────────────────────

const STATS_FIELD: ObjectArrayFieldDef = {
  type: 'object-array',
  key: 'stats',
  label: 'Статистик тоонууд',
  defaultItem: { value: '', label: '' },
  itemFields: [
    { type: 'text', key: 'value', label: 'Утга (жишээ: 500+)' },
    { type: 'text', key: 'label', label: 'Шошго' },
  ],
}

const CMS_PAGES: PageDef[] = [
  {
    id: 'home',
    label: 'Нүүр хуудас',
    icon: Home,
    sections: [
      {
        key: 'hero',
        label: 'Hero хэсэг',
        valueType: 'object',
        fields: [
          { type: 'text', key: 'badge', label: 'Жигт текст' },
          { type: 'text', key: 'titleLine1', label: 'Гарчиг 1-р мөр' },
          { type: 'text', key: 'titleAccent', label: 'Гарчиг (өнгөт хэсэг)' },
          { type: 'text', key: 'titleLine2', label: 'Гарчиг 2-р мөр' },
          { type: 'textarea', key: 'desc', label: 'Тайлбар' },
          { type: 'text', key: 'btn1', label: 'Товч 1 текст' },
          { type: 'text', key: 'btn2', label: 'Товч 2 текст' },
          { type: 'text', key: 'slideLabel', label: 'Слайд шошго' },
          { type: 'string-array', key: 'slideImages', label: 'Слайд зургуудын URL' },
          STATS_FIELD,
        ],
      },
    ],
  },
  {
    id: 'about',
    label: 'Тухай',
    icon: Info,
    sections: [
      {
        key: 'main',
        label: 'Үндсэн хэсэг',
        valueType: 'object',
        fields: [
          { type: 'text', key: 'sectionLabel', label: 'Хэсгийн шошго' },
          { type: 'text', key: 'h2Line1', label: 'Гарчиг 1-р мөр' },
          { type: 'text', key: 'h2Accent', label: 'Гарчиг (өнгөт хэсэг)' },
          { type: 'url', key: 'imageUrl', label: 'Зургийн URL' },
          { type: 'text', key: 'imageBuildingName', label: 'Барилгын нэр' },
          { type: 'text', key: 'imageBuildingSubtitle', label: 'Барилгын дэд гарчиг' },
          { type: 'text', key: 'yearsBadgeValue', label: 'Жилийн тоо (жишээ: 15+)' },
          { type: 'text', key: 'yearsLabel', label: 'Жилийн шошго' },
          { type: 'textarea', key: 'p1', label: 'Эхний параграф' },
          { type: 'textarea', key: 'p2', label: 'Хоёрдах параграф' },
          STATS_FIELD,
        ],
      },
    ],
  },
  {
    id: 'services',
    label: 'Үйлчилгээ',
    icon: Settings2,
    sections: [
      {
        key: 'header',
        label: 'Толгой хэсэг',
        valueType: 'object',
        fields: [
          { type: 'text', key: 'badge', label: 'Жигт текст' },
          { type: 'text', key: 'h2Line1', label: 'Гарчиг 1-р мөр' },
          { type: 'text', key: 'h2Accent', label: 'Гарчиг (өнгөт хэсэг)' },
          { type: 'textarea', key: 'intro', label: 'Танилцуулга' },
        ],
      },
      {
        key: 'features',
        label: 'Онцлогуудын жагсаалт',
        valueType: 'object-array',
        defaultItem: { title: '', desc: '' },
        itemFields: [
          { type: 'text', key: 'title', label: 'Гарчиг' },
          { type: 'textarea', key: 'desc', label: 'Тайлбар' },
        ],
      },
      {
        key: 'banner',
        label: 'Баннер тоонууд',
        valueType: 'object-array',
        defaultItem: { value: '', suffix: '', label: '' },
        itemFields: [
          { type: 'text', key: 'value', label: 'Утга (жишээ: 500)' },
          { type: 'text', key: 'suffix', label: 'Дагавар (жишээ: +)' },
          { type: 'text', key: 'label', label: 'Шошго' },
        ],
      },
    ],
  },
  {
    id: 'contact',
    label: 'Холбоо барих',
    icon: Phone,
    sections: [
      {
        key: 'hero',
        label: 'Дээд хэсэг',
        valueType: 'object',
        fields: [
          { type: 'text', key: 'badge', label: 'Жигт текст' },
          { type: 'text', key: 'h2Accent', label: 'Гарчиг' },
          { type: 'textarea', key: 'intro', label: 'Танилцуулга' },
        ],
      },
      {
        key: 'items',
        label: 'Холбоо барих мэдээлэл',
        valueType: 'object-array',
        defaultItem: { title: '', value: '' },
        itemFields: [
          { type: 'text', key: 'title', label: 'Төрөл (жишээ: Утасны дугаар)' },
          { type: 'text', key: 'value', label: 'Утга (жишээ: +976 9900-0000)' },
        ],
      },
      {
        key: 'agent',
        label: 'Агент мэдээлэл',
        valueType: 'object',
        fields: [
          { type: 'text', key: 'initials', label: 'Нэрийн эхний үсэг (жишээ: БА)' },
          { type: 'text', key: 'name', label: 'Бүтэн нэр' },
          { type: 'text', key: 'role', label: 'Албан тушаал' },
          { type: 'text', key: 'telHref', label: 'Утасны линк (tel:+976...)' },
          { type: 'text', key: 'telLabel', label: 'Харуулах утасны дугаар' },
        ],
      },
      {
        key: 'formTitle',
        label: 'Маягтын гарчиг',
        valueType: 'primitive',
        fieldType: 'text',
      },
    ],
  },
  {
    id: 'properties-page',
    label: 'Үл хөдлөх',
    icon: Building2,
    sections: [
      {
        key: 'header',
        label: 'Толгой хэсэг',
        valueType: 'object',
        fields: [
          { type: 'text', key: 'badge', label: 'Жигт текст' },
          { type: 'text', key: 'titleLine1', label: 'Гарчиг 1-р мөр' },
          { type: 'text', key: 'titleAccent', label: 'Гарчиг (өнгөт хэсэг)' },
          { type: 'textarea', key: 'intro', label: 'Танилцуулга' },
        ],
      },
      { key: 'categories', label: 'Ангиллууд', valueType: 'string-array' },
      {
        key: 'cta',
        label: 'Дуудлага товч',
        valueType: 'object',
        fields: [
          { type: 'url', key: 'href', label: 'Линкийн URL' },
          { type: 'text', key: 'label', label: 'Товчны текст' },
        ],
      },
    ],
  },
  {
    id: 'sales-page',
    label: 'Борлуулалт',
    icon: Megaphone,
    sections: [
      {
        key: 'header',
        label: 'Толгой хэсэг',
        valueType: 'object',
        fields: [
          { type: 'text', key: 'eyebrow', label: 'Дээд текст' },
          { type: 'text', key: 'title', label: 'Гарчиг' },
          { type: 'textarea', key: 'intro', label: 'Танилцуулга' },
        ],
      },
    ],
  },
  {
    id: 'jobs-page',
    label: 'Ажлын байр',
    icon: Briefcase,
    sections: [
      {
        key: 'header',
        label: 'Толгой хэсэг',
        valueType: 'object',
        fields: [
          { type: 'text', key: 'title', label: 'Гарчиг' },
          { type: 'textarea', key: 'intro', label: 'Танилцуулга' },
        ],
      },
    ],
  },
  {
    id: 'team',
    label: 'Баг',
    icon: Users,
    sections: [
      {
        key: 'header',
        label: 'Толгой хэсэг',
        valueType: 'object',
        fields: [
          { type: 'text', key: 'eyebrow', label: 'Дээд текст' },
          { type: 'text', key: 'h2Line1', label: 'Гарчиг 1-р мөр' },
          { type: 'text', key: 'h2Accent', label: 'Гарчиг (өнгөт хэсэг)' },
          { type: 'textarea', key: 'intro', label: 'Танилцуулга' },
        ],
      },
      {
        key: 'members',
        label: 'Багийн гишүүд',
        valueType: 'object-array',
        defaultItem: {
          name: '',
          role: '',
          initials: '',
          color: '#6366f1',
          phone: '',
          email: '',
          bio: '',
          projects: 0,
        },
        itemFields: [
          { type: 'text', key: 'name', label: 'Нэр' },
          { type: 'text', key: 'role', label: 'Албан тушаал' },
          { type: 'text', key: 'initials', label: 'Эхний үсэг (жишээ: БА)' },
          { type: 'text', key: 'color', label: 'Дэвсгэр өнгө (#hex)' },
          { type: 'text', key: 'phone', label: 'Утас' },
          { type: 'text', key: 'email', label: 'Имэйл' },
          { type: 'textarea', key: 'bio', label: 'Товч намтар' },
          { type: 'number', key: 'projects', label: 'Төслийн тоо' },
        ],
      },
      {
        key: 'cta',
        label: 'Дуудлага хэсэг',
        valueType: 'object',
        fields: [
          { type: 'text', key: 'title', label: 'Гарчиг' },
          { type: 'text', key: 'subtitle', label: 'Дэд гарчиг' },
          { type: 'text', key: 'buttonLabel', label: 'Товчны текст' },
          { type: 'url', key: 'buttonHref', label: 'Товчны линк' },
        ],
      },
    ],
  },
  {
    id: 'footer',
    label: 'Хөл хэсэг',
    icon: LayoutGrid,
    sections: [
      {
        key: 'partners',
        label: 'Партнерууд',
        valueType: 'object',
        fields: [
          { type: 'text', key: 'partnersLabel', label: 'Партнерын хэсгийн гарчиг' },
          {
            type: 'object-array',
            key: 'items',
            label: 'Партнерын жагсаалт',
            defaultItem: { name: '', src: '', width: 120, height: 40 },
            itemFields: [
              { type: 'text', key: 'name', label: 'Нэр' },
              { type: 'url', key: 'src', label: 'Логоны URL' },
              { type: 'number', key: 'width', label: 'Өргөн (px)' },
              { type: 'number', key: 'height', label: 'Өндөр (px)' },
            ],
          },
        ],
      },
      {
        key: 'brand',
        label: 'Брэнд тайлбар',
        valueType: 'object',
        fields: [{ type: 'textarea', key: 'desc', label: 'Компанийн тайлбар' }],
      },
    ],
  },
]

// ─── API Helpers ──────────────────────────────────────────────────────────────

async function cmsLogin(
  backendUrl: string,
  username: string,
  password: string,
): Promise<string> {
  const res = await fetch('/api/cms-proxy/api/v1/admin/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-cms-backend-url': backendUrl.replace(/\/$/, ''),
    },
    body: JSON.stringify({ username, password }),
  })
  const json = (await res.json().catch(() => ({}))) as Record<string, unknown>
  if (!res.ok) {
    const msg =
      (json.error as { message?: string } | string | undefined) instanceof Object
        ? (json.error as { message?: string }).message
        : (json.error as string | undefined) ?? (json.message as string | undefined)
    throw new Error(msg ?? `HTTP ${res.status}`)
  }
  const token = (json.token ?? (json.data as Record<string, unknown> | undefined)?.token) as
    | string
    | undefined
  if (!token) throw new Error('Серверээс нэвтрэх идэвхжүүлэгч (token) хүлээн аваагүй')
  return token
}

async function cmsGetPage(
  backendUrl: string,
  token: string,
  pageId: string,
  lang: string,
): Promise<Record<string, unknown>> {
  const res = await fetch(
    `/api/cms-proxy/api/v1/admin/site-pages/${pageId}?lang=${lang}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'x-cms-backend-url': backendUrl.replace(/\/$/, ''),
      },
    },
  )
  const json = (await res.json().catch(() => ({}))) as Record<string, unknown>
  if (!res.ok) {
    throw new Error(
      (json.message as string | undefined) ??
        (json.error as string | undefined) ??
        `HTTP ${res.status}`,
    )
  }
  const sections = (json.data as Record<string, unknown> | undefined)?.sections
  return sections && typeof sections === 'object' && !Array.isArray(sections)
    ? (sections as Record<string, unknown>)
    : {}
}

async function cmsPutPage(
  backendUrl: string,
  token: string,
  pageId: string,
  lang: string,
  sections: unknown,
): Promise<void> {
  const res = await fetch(
    `/api/cms-proxy/api/v1/admin/site-pages/${pageId}?lang=${lang}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        'x-cms-backend-url': backendUrl.replace(/\/$/, ''),
      },
      body: JSON.stringify({ sections }),
    },
  )
  const json = (await res.json().catch(() => ({}))) as Record<string, unknown>
  if (!res.ok) {
    throw new Error(
      (json.message as string | undefined) ??
        (json.error as string | undefined) ??
        `HTTP ${res.status}`,
    )
  }
}

// ─── Utility Helpers ──────────────────────────────────────────────────────────

function asObj(v: unknown): Record<string, unknown> {
  return v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : {}
}
function asArr<T>(v: unknown): T[] {
  return Array.isArray(v) ? (v as T[]) : []
}
function toStr(v: unknown): string {
  return typeof v === 'string' ? v : typeof v === 'number' ? String(v) : ''
}
function cn(...cls: (string | boolean | undefined | null)[]): string {
  return cls.filter(Boolean).join(' ')
}

// ─── Primitive Field Component ────────────────────────────────────────────────

function FieldInput({
  label,
  value,
  onChange,
  type = 'text',
  dm,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
  dm: boolean
}) {
  const base = cn(
    'w-full px-3 py-2 text-sm rounded-lg border outline-none transition-all',
    dm
      ? 'bg-slate-800 border-slate-600 text-slate-100 placeholder-slate-500 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400/30'
      : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100',
  )
  return (
    <div className="space-y-1.5">
      <label
        className={cn(
          'block text-[11px] font-semibold uppercase tracking-wide',
          dm ? 'text-slate-400' : 'text-slate-500',
        )}
      >
        {label}
      </label>
      {type === 'textarea' ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className={cn(base, 'resize-y min-h-[72px]')}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={base}
        />
      )}
    </div>
  )
}

// ─── String Array Editor ──────────────────────────────────────────────────────

function StringArrayEditor({
  label,
  values,
  onChange,
  dm,
}: {
  label: string
  values: string[]
  onChange: (v: string[]) => void
  dm: boolean
}) {
  const inputCls = cn(
    'flex-1 px-3 py-2 text-sm rounded-lg border outline-none transition-all',
    dm
      ? 'bg-slate-800 border-slate-600 text-slate-100 focus:border-indigo-400'
      : 'bg-white border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100',
  )
  return (
    <div className="space-y-2">
      <div
        className={cn(
          'text-[11px] font-semibold uppercase tracking-wide',
          dm ? 'text-slate-400' : 'text-slate-500',
        )}
      >
        {label}
      </div>
      <div className="space-y-2">
        {values.map((v, i) => (
          <div key={i} className="flex gap-2">
            <input
              value={v}
              onChange={(e) => {
                const n = [...values]
                n[i] = e.target.value
                onChange(n)
              }}
              className={inputCls}
            />
            <button
              onClick={() => onChange(values.filter((_, j) => j !== i))}
              className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
        <button
          onClick={() => onChange([...values, ''])}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all',
            dm
              ? 'border-slate-600 text-indigo-400 hover:bg-slate-800/60'
              : 'border-indigo-200 text-indigo-600 hover:bg-indigo-50',
          )}
        >
          <Plus className="w-3.5 h-3.5" /> Нэмэх
        </button>
      </div>
    </div>
  )
}

// ─── Object Array Editor ──────────────────────────────────────────────────────

function ObjectArrayEditor({
  label,
  items,
  onChange,
  itemFields,
  defaultItem,
  dm,
}: {
  label: string
  items: Record<string, unknown>[]
  onChange: (v: Record<string, unknown>[]) => void
  itemFields: SimpleFieldDef[]
  defaultItem: Record<string, string | number>
  dm: boolean
}) {
  return (
    <div className="space-y-3">
      <div
        className={cn(
          'text-[11px] font-semibold uppercase tracking-wide',
          dm ? 'text-slate-400' : 'text-slate-500',
        )}
      >
        {label}
      </div>
      <div className="space-y-3">
        {items.map((item, i) => (
          <div
            key={i}
            className={cn(
              'relative rounded-xl border p-4',
              dm ? 'border-slate-700 bg-slate-800/50' : 'border-slate-100 bg-slate-50/60',
            )}
          >
            <button
              onClick={() => onChange(items.filter((_, j) => j !== i))}
              className="absolute top-3 right-3 p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
            >
              <Trash2 className="w-3 h-3" />
            </button>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-8">
              {itemFields.map((f) => (
                <FieldInput
                  key={f.key}
                  label={f.label}
                  type={f.type === 'url' ? 'url' : f.type === 'textarea' ? 'textarea' : f.type}
                  value={toStr(item[f.key])}
                  onChange={(v) => {
                    const n = [...items]
                    n[i] = { ...n[i], [f.key]: f.type === 'number' ? Number(v) : v }
                    onChange(n)
                  }}
                  dm={dm}
                />
              ))}
            </div>
          </div>
        ))}
        <button
          onClick={() => onChange([...items, { ...defaultItem }])}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all',
            dm
              ? 'border-slate-600 text-indigo-400 hover:bg-slate-800/60'
              : 'border-indigo-200 text-indigo-600 hover:bg-indigo-50',
          )}
        >
          <Plus className="w-3.5 h-3.5" /> Нэмэх
        </button>
      </div>
    </div>
  )
}

// ─── Section Panel ────────────────────────────────────────────────────────────

function renderField(
  field: FieldDef,
  sectionObj: Record<string, unknown>,
  onChange: (k: string, v: unknown) => void,
  dm: boolean,
) {
  if (field.type === 'string-array') {
    return (
      <StringArrayEditor
        key={field.key}
        label={field.label}
        values={asArr<string>(sectionObj[field.key])}
        onChange={(v) => onChange(field.key, v)}
        dm={dm}
      />
    )
  }
  if (field.type === 'object-array') {
    return (
      <ObjectArrayEditor
        key={field.key}
        label={field.label}
        items={asArr<Record<string, unknown>>(sectionObj[field.key])}
        onChange={(v) => onChange(field.key, v)}
        itemFields={field.itemFields}
        defaultItem={field.defaultItem}
        dm={dm}
      />
    )
  }
  return (
    <FieldInput
      key={field.key}
      label={field.label}
      type={field.type === 'url' ? 'url' : field.type === 'textarea' ? 'textarea' : field.type}
      value={toStr(sectionObj[field.key])}
      onChange={(v) => onChange(field.key, field.type === 'number' ? Number(v) : v)}
      dm={dm}
    />
  )
}

function SectionPanel({
  section,
  sectionValue,
  onUpdate,
  dm,
}: {
  section: SectionDef
  sectionValue: unknown
  onUpdate: (v: unknown) => void
  dm: boolean
}) {
  const [open, setOpen] = useState(true)

  const renderBody = () => {
    if (section.valueType === 'primitive') {
      return (
        <FieldInput
          label={section.label}
          type={section.fieldType}
          value={toStr(sectionValue)}
          onChange={onUpdate}
          dm={dm}
        />
      )
    }
    if (section.valueType === 'string-array') {
      return (
        <StringArrayEditor
          label={section.label}
          values={asArr<string>(sectionValue)}
          onChange={onUpdate}
          dm={dm}
        />
      )
    }
    if (section.valueType === 'object-array') {
      return (
        <ObjectArrayEditor
          label={section.label}
          items={asArr<Record<string, unknown>>(sectionValue)}
          onChange={onUpdate}
          itemFields={section.itemFields}
          defaultItem={section.defaultItem}
          dm={dm}
        />
      )
    }
    // object section
    const obj = asObj(sectionValue)
    const handleFieldChange = (key: string, val: unknown) =>
      onUpdate({ ...obj, [key]: val })
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {section.fields.map((field) => renderField(field, obj, handleFieldChange, dm))}
      </div>
    )
  }

  return (
    <div
      className={cn(
        'rounded-2xl border overflow-hidden',
        dm ? 'border-slate-700' : 'border-slate-200 shadow-sm',
      )}
    >
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          'flex items-center justify-between w-full px-5 py-3.5 text-sm font-semibold transition-colors cursor-pointer',
          dm
            ? 'bg-slate-800 text-slate-200 hover:bg-slate-800/80'
            : 'bg-slate-50 text-slate-800 hover:bg-slate-100',
        )}
      >
        <span>{section.label}</span>
        {open ? (
          <ChevronDown className="w-4 h-4 opacity-50" />
        ) : (
          <ChevronRight className="w-4 h-4 opacity-50" />
        )}
      </button>
      {open && (
        <div className={cn('p-5 space-y-4', dm ? 'bg-slate-900/40' : 'bg-white')}>
          {renderBody()}
        </div>
      )}
    </div>
  )
}

// ─── Project Login Panel ──────────────────────────────────────────────────────

function ProjectLoginPanel({
  project,
  onSuccess,
  dm,
}: {
  project: CmsProject
  onSuccess: () => void
  dm: boolean
}) {
  const [username, setUsername] = useState(project.username || '')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { setToken } = useCmsStore()

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setError('Нэвтрэх нэр болон нууц үгийг оруулна уу')
      return
    }
    setLoading(true)
    setError('')
    try {
      const token = await cmsLogin(project.backendUrl, username.trim(), password)
      setToken(project.id, token)
      onSuccess()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Нэвтрэх үед алдаа гарлаа')
    } finally {
      setLoading(false)
    }
  }

  const inputCls = cn(
    'w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all',
    dm
      ? 'bg-slate-800 border-slate-600 text-white placeholder-slate-500 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400/30'
      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100',
  )

  return (
    <div className="flex items-center justify-center min-h-full p-6">
      <div
        className={cn(
          'w-full max-w-md rounded-2xl border p-8',
          dm ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200 shadow-xl',
        )}
      >
        <div className="mb-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/30">
            <LogIn className="w-7 h-7 text-white" />
          </div>
          <h3 className={cn('text-lg font-bold', dm ? 'text-white' : 'text-slate-900')}>
            {project.name}
          </h3>
          <p className={cn('text-xs mt-1 font-mono', dm ? 'text-slate-500' : 'text-slate-400')}>
            {project.backendUrl}
          </p>
          <p className={cn('text-sm mt-3', dm ? 'text-slate-400' : 'text-slate-500')}>
            CMS-д нэвтрэх мэдээллээ оруулна уу
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-700 mb-5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <div className="space-y-3">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Нэвтрэх нэр (username)"
            className={inputCls}
            onKeyDown={(e) => e.key === 'Enter' && void handleLogin()}
          />
          <div className="relative">
            <input
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Нууц үг"
              className={cn(inputCls, 'pr-12')}
              onKeyDown={(e) => e.key === 'Enter' && void handleLogin()}
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <button
            onClick={() => void handleLogin()}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition-all disabled:opacity-50 shadow-lg shadow-indigo-500/20 mt-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <LogIn className="w-4 h-4" />
            )}
            {loading ? 'Нэвтрэж байна...' : 'Нэвтрэх'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Add Project Modal ────────────────────────────────────────────────────────

function AddProjectModal({ onClose, dm }: { onClose: () => void; dm: boolean }) {
  const [name, setName] = useState('')
  const [url, setUrl] = useState('http://localhost:5000')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { addProject, setToken } = useCmsStore()

  const handleAdd = async () => {
    if (!name.trim() || !url.trim() || !username.trim() || !password.trim()) {
      setError('Бүх талбарыг бөглөнө үү')
      return
    }
    setLoading(true)
    setError('')
    try {
      const token = await cmsLogin(url.trim(), username.trim(), password)
      const id = addProject({
        name: name.trim(),
        backendUrl: url.trim(),
        token,
        username: username.trim(),
      })
      setToken(id, token)
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Холболт хийх үед алдаа гарлаа')
    } finally {
      setLoading(false)
    }
  }

  const inputCls = cn(
    'w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all',
    dm
      ? 'bg-slate-800 border-slate-600 text-white placeholder-slate-500 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400/30'
      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100',
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div
        className={cn(
          'w-full max-w-md rounded-2xl border shadow-2xl p-6',
          dm ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200',
        )}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className={cn('text-lg font-bold', dm ? 'text-white' : 'text-slate-900')}>
            Шинэ CMS төсөл нэмэх
          </h3>
          <button
            onClick={onClose}
            className={cn(
              'p-1.5 rounded-lg transition-colors',
              dm ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-400 hover:bg-slate-100',
            )}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-700 mb-4">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label
              className={cn(
                'text-xs font-semibold uppercase tracking-wide',
                dm ? 'text-slate-400' : 'text-slate-500',
              )}
            >
              Төслийн нэр
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="жишээ нь: FoodCity Admin"
              className={inputCls}
            />
          </div>

          <div className="space-y-1.5">
            <label
              className={cn(
                'text-xs font-semibold uppercase tracking-wide',
                dm ? 'text-slate-400' : 'text-slate-500',
              )}
            >
              Backend URL
            </label>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="http://localhost:5000"
              className={inputCls}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label
                className={cn(
                  'text-xs font-semibold uppercase tracking-wide',
                  dm ? 'text-slate-400' : 'text-slate-500',
                )}
              >
                Нэвтрэх нэр
              </label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className={inputCls}
              />
            </div>
            <div className="space-y-1.5">
              <label
                className={cn(
                  'text-xs font-semibold uppercase tracking-wide',
                  dm ? 'text-slate-400' : 'text-slate-500',
                )}
              >
                Нууц үг
              </label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••"
                  className={cn(inputCls, 'pr-10')}
                  onKeyDown={(e) => e.key === 'Enter' && void handleAdd()}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                >
                  {showPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <button
              onClick={onClose}
              className={cn(
                'flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors',
                dm ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-50',
              )}
            >
              Болих
            </button>
            <button
              onClick={() => void handleAdd()}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-lg shadow-indigo-500/20"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              {loading ? 'Холбож байна...' : 'Нэмэх'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Project Card ─────────────────────────────────────────────────────────────

function ProjectCard({
  project,
  onOpen,
  dm,
}: {
  project: CmsProject
  onOpen: () => void
  dm: boolean
}) {
  const { removeProject, setToken } = useCmsStore()
  const isConnected = !!project.token

  return (
    <div
      className={cn(
        'rounded-2xl border p-5 flex flex-col gap-4 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5',
        dm
          ? 'bg-slate-800/80 border-slate-700/80 hover:border-slate-600'
          : 'bg-white border-slate-200 shadow-sm hover:shadow-slate-100',
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-black text-white shrink-0 shadow-lg"
            style={{
              background: 'linear-gradient(135deg, hsl(238 84% 67%), hsl(262 83% 65%))',
            }}
          >
            {project.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h3
              className={cn(
                'font-semibold text-sm truncate max-w-[160px]',
                dm ? 'text-white' : 'text-slate-900',
              )}
            >
              {project.name}
            </h3>
            <p
              className={cn(
                'text-[11px] mt-0.5 truncate max-w-[160px] font-mono',
                dm ? 'text-slate-500' : 'text-slate-400',
              )}
            >
              {project.backendUrl}
            </p>
          </div>
        </div>
        <span
          className={cn(
            'shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full',
            isConnected
              ? dm
                ? 'bg-emerald-900/30 text-emerald-400'
                : 'bg-emerald-50 text-emerald-700'
              : dm
                ? 'bg-slate-700 text-slate-400'
                : 'bg-slate-50 text-slate-500',
          )}
        >
          {isConnected ? '● Холбогдсон' : '○ Авторизаци'}
        </span>
      </div>

      {project.lastConnected && (
        <p className={cn('text-[11px]', dm ? 'text-slate-600' : 'text-slate-400')}>
          Сүүлд:{' '}
          {new Date(project.lastConnected).toLocaleString('mn-MN', {
            dateStyle: 'short',
            timeStyle: 'short',
          })}
        </p>
      )}

      <div className="flex gap-2 mt-auto pt-1">
        <button
          onClick={onOpen}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors shadow-sm"
        >
          {isConnected ? (
            <Settings2 className="w-3.5 h-3.5" />
          ) : (
            <LogIn className="w-3.5 h-3.5" />
          )}
          {isConnected ? 'Засварлах' : 'Нэвтрэх'}
        </button>
        {isConnected && (
          <button
            onClick={() => setToken(project.id, null)}
            title="Сессийг цуцлах"
            className={cn(
              'p-2 rounded-xl transition-colors',
              dm ? 'text-slate-500 hover:bg-slate-700' : 'text-slate-400 hover:bg-slate-100',
            )}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
        <button
          onClick={() => {
            if (window.confirm(`"${project.name}"-г устгах уу?`)) removeProject(project.id)
          }}
          title="Устгах"
          className="p-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}

// ─── Project Editor ───────────────────────────────────────────────────────────

function ProjectEditor({
  project,
  dm,
  onBack,
}: {
  project: CmsProject
  dm: boolean
  onBack: () => void
}) {
  const [activePage, setActivePage] = useState<PageId>('home')
  const [lang, setLang] = useState<Lang>('mn')
  const [sections, setSections] = useState<Record<string, unknown>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const { setToken } = useCmsStore()

  const loadPage = useCallback(async () => {
    if (!project.token) return
    setLoading(true)
    setError('')
    try {
      const s = await cmsGetPage(project.backendUrl, project.token, activePage, lang)
      setSections(s)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Хүсэлт амжилтгүй'
      if (
        msg.includes('401') ||
        msg.includes('403') ||
        msg.toLowerCase().includes('unauthorized')
      ) {
        setToken(project.id, null)
      }
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [project.token, project.backendUrl, project.id, activePage, lang, setToken])

  useEffect(() => {
    void loadPage()
  }, [loadPage])

  const handleSave = async () => {
    if (!project.token) return
    setSaving(true)
    setError('')
    setSuccessMsg('')
    try {
      await cmsPutPage(project.backendUrl, project.token, activePage, lang, sections)
      setSuccessMsg('Амжилттай хадгалагдлаа ✓')
      setTimeout(() => setSuccessMsg(''), 4000)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Хадгалах үед алдаа гарлаа')
    } finally {
      setSaving(false)
    }
  }

  if (!project.token) {
    return <ProjectLoginPanel project={project} onSuccess={loadPage} dm={dm} />
  }

  const pageDef = CMS_PAGES.find((p) => p.id === activePage)!

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* ── Header ── */}
      <div
        className={cn(
          'flex items-center gap-3 px-5 py-3 border-b shrink-0',
          dm ? 'border-slate-700/80 bg-[#070b1a]' : 'border-slate-200 bg-white shadow-sm',
        )}
      >
        <button
          onClick={onBack}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
            dm ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-100 text-slate-600',
          )}
        >
          <ArrowLeft className="w-4 h-4" />
          Буцах
        </button>
        <div className="h-5 w-px bg-slate-200 dark:bg-slate-700" />
        <div className="flex-1 min-w-0">
          <h2
            className={cn('font-bold text-sm truncate', dm ? 'text-white' : 'text-slate-900')}
          >
            {project.name}
          </h2>
          <p
            className={cn('text-[11px] font-mono', dm ? 'text-slate-500' : 'text-slate-400')}
          >
            {project.backendUrl}
          </p>
        </div>

        {/* Language toggle */}
        <div
          className={cn(
            'flex rounded-lg border overflow-hidden text-xs font-bold',
            dm ? 'border-slate-700' : 'border-slate-200',
          )}
        >
          {(['mn', 'en'] as Lang[]).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={cn(
                'px-3 py-1.5 transition-colors uppercase',
                lang === l
                  ? 'bg-indigo-600 text-white'
                  : dm
                    ? 'text-slate-400 hover:bg-slate-800'
                    : 'text-slate-500 hover:bg-slate-50',
              )}
            >
              {l}
            </button>
          ))}
        </div>

        {/* Refresh */}
        <button
          onClick={() => void loadPage()}
          disabled={loading}
          className={cn(
            'p-2 rounded-lg transition-colors',
            dm
              ? 'text-slate-400 hover:bg-slate-800'
              : 'text-slate-500 hover:bg-slate-100',
          )}
          title="Дахин ачаалах"
        >
          <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
        </button>

        {/* Save */}
        <button
          onClick={() => void handleSave()}
          disabled={saving || loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-lg shadow-indigo-500/20"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {saving ? 'Хадгалж байна...' : 'Хадгалах'}
        </button>
      </div>

      {/* ── Status bar ── */}
      {(error || successMsg) && (
        <div
          className={cn(
            'px-5 py-2.5 text-sm flex items-center gap-2 shrink-0 border-b',
            error
              ? 'bg-red-50 text-red-700 border-red-100'
              : 'bg-emerald-50 text-emerald-700 border-emerald-100',
          )}
        >
          {error ? (
            <AlertCircle className="w-4 h-4 shrink-0" />
          ) : (
            <Check className="w-4 h-4 shrink-0" />
          )}
          <span className="flex-1">{error || successMsg}</span>
          <button
            onClick={() => {
              setError('')
              setSuccessMsg('')
            }}
            className="ml-auto opacity-50 hover:opacity-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Page sidebar */}
        <aside
          className={cn(
            'w-52 shrink-0 border-r overflow-y-auto',
            dm ? 'border-slate-700/80 bg-[#070b1a]' : 'border-slate-200 bg-white',
          )}
        >
          <div className="p-3 space-y-0.5">
            {CMS_PAGES.map((page) => {
              const Icon = page.icon
              const active = activePage === page.id
              return (
                <button
                  key={page.id}
                  onClick={() => setActivePage(page.id)}
                  className={cn(
                    'w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all text-left',
                    active
                      ? dm
                        ? 'text-indigo-300'
                        : 'text-indigo-700 font-semibold'
                      : dm
                        ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                  )}
                  style={
                    active
                      ? {
                          background: dm
                            ? 'linear-gradient(135deg, hsl(238 84% 67% / 0.25), hsl(262 83% 65% / 0.15))'
                            : 'linear-gradient(135deg, hsl(238 84% 67% / 0.1), hsl(262 83% 65% / 0.05))',
                          border: dm
                            ? '1px solid rgba(99,102,241,0.2)'
                            : '1px solid rgba(99,102,241,0.1)',
                        }
                      : { border: '1px solid transparent' }
                  }
                >
                  <Icon
                    className={cn(
                      'w-4 h-4 shrink-0',
                      active ? 'text-indigo-500' : 'text-slate-400',
                    )}
                  />
                  {page.label}
                </button>
              )
            })}
          </div>
        </aside>

        {/* Editor content */}
        <main className={cn('flex-1 overflow-y-auto', dm ? 'bg-slate-900/20' : 'bg-slate-50')}>
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
              <p className={cn('text-sm', dm ? 'text-slate-400' : 'text-slate-500')}>
                Ачааллаж байна...
              </p>
            </div>
          ) : (
            <div className="p-6 space-y-4 max-w-3xl mx-auto">
              <div className="mb-4">
                <h2
                  className={cn(
                    'text-xl font-bold',
                    dm ? 'text-white' : 'text-slate-900',
                  )}
                >
                  {pageDef.label}
                </h2>
                <p className={cn('text-xs mt-1', dm ? 'text-slate-500' : 'text-slate-400')}>
                  Хуудасны агуулгыг засварлан "Хадгалах" товчийг дарна уу
                </p>
              </div>

              {pageDef.sections.map((section) => (
                <SectionPanel
                  key={section.key}
                  section={section}
                  sectionValue={sections[section.key]}
                  onUpdate={(v) =>
                    setSections((prev) => ({ ...prev, [section.key]: v }))
                  }
                  dm={dm}
                />
              ))}

              <button
                onClick={() => void handleSave()}
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-lg shadow-indigo-500/20 mt-4"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {saving ? 'Хадгалж байна...' : `"${pageDef.label}" хуудас хадгалах`}
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

// ─── Main CmsBuilder ──────────────────────────────────────────────────────────

export default function CmsBuilder({ isDarkMode }: { isDarkMode: boolean }) {
  const { projects } = useCmsStore()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const dm = isDarkMode

  useEffect(() => {
    void useCmsStore.persist.rehydrate()
  }, [])

  const selected = projects.find((p) => p.id === selectedId)

  if (selected) {
    return (
      <div className="flex h-full flex-col overflow-hidden">
        <ProjectEditor project={selected} dm={dm} onBack={() => setSelectedId(null)} />
      </div>
    )
  }

  return (
    <div className={cn('min-h-full p-6 transition-colors', dm ? 'bg-background' : 'bg-slate-50')}>
      <div className="flex items-center justify-between mb-8 animate-slide-in-left">
        <div>
          <h1 className={cn('text-2xl font-bold', dm ? 'text-white' : 'text-slate-900')}>
            CMS Бүтээгч
          </h1>
          <p className={cn('text-sm mt-0.5', dm ? 'text-slate-400' : 'text-slate-500')}>
            Олон CMS төслийн хуудасны агуулгыг нэг дор удирдах
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20"
        >
          <Plus className="w-4 h-4" />
          Шинэ төсөл
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-in-up">
          <div
            className={cn(
              'w-20 h-20 rounded-2xl flex items-center justify-center mb-5',
              dm ? 'bg-slate-800' : 'bg-slate-100',
            )}
          >
            <Globe
              className={cn('w-10 h-10', dm ? 'text-slate-600' : 'text-slate-300')}
            />
          </div>
          <p
            className={cn('font-semibold text-lg', dm ? 'text-slate-300' : 'text-slate-700')}
          >
            CMS төсөл алга байна
          </p>
          <p
            className={cn(
              'text-sm mt-2 max-w-xs leading-relaxed',
              dm ? 'text-slate-500' : 'text-slate-400',
            )}
          >
            "Шинэ төсөл" товчийг дарж CMS бэкэнд URL болон admin мэдээллийг оруулна уу
          </p>
          <button
            onClick={() => setShowAdd(true)}
            className="mt-6 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20"
          >
            <Plus className="w-4 h-4" />
            Төсөл нэмэх
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 stagger-children">
          {projects.map((p) => (
            <ProjectCard
              key={p.id}
              project={p}
              onOpen={() => setSelectedId(p.id)}
              dm={dm}
            />
          ))}
          {/* Add new card */}
          <button
            onClick={() => setShowAdd(true)}
            className={cn(
              'rounded-2xl border-2 border-dashed p-8 flex flex-col items-center justify-center gap-3 transition-all duration-200',
              dm
                ? 'border-slate-700 text-slate-600 hover:border-indigo-600 hover:text-indigo-400 hover:bg-slate-800/30'
                : 'border-slate-200 text-slate-400 hover:border-indigo-300 hover:text-indigo-500 hover:bg-indigo-50/30',
            )}
          >
            <div
              className={cn(
                'w-12 h-12 rounded-xl flex items-center justify-center transition-colors',
                dm ? 'bg-slate-800' : 'bg-slate-100',
              )}
            >
              <Plus className="w-6 h-6" />
            </div>
            <span className="text-sm font-semibold">Шинэ CMS төсөл нэмэх</span>
          </button>
        </div>
      )}

      {showAdd && <AddProjectModal onClose={() => setShowAdd(false)} dm={dm} />}
    </div>
  )
}

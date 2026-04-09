'use client'

import { useState } from 'react'
import { Search, Eye, Download, Star, X, Edit3, Check } from 'lucide-react'

interface ComponentStyles {
  backgroundColor: string
  textColor: string
  padding: number
  margin: number
  borderRadius: number
  buttonBackgroundColor: string
  buttonTextColor: string
  linkColor: string
  borderColor: string
  headingColor: string
}

interface ComponentImage {
  id: string
  url: string
  alt: string
}

interface ComponentContent {
  title?: string
  subtitle?: string
  description?: string
  buttonText?: string
  services?: string[]
  contactInfo?: {
    email?: string
    phone?: string
    address?: string
  }
  navLinks?: {
    home?: string
    about?: string
    services?: string
    contact?: string
  }
  footerLinks?: {
    privacy?: string
    terms?: string
    contact?: string
  }
  copyright?: string
  images?: ComponentImage[]
}

interface TemplateComponent {
  id: string
  type: 'home' | 'about' | 'service' | 'contact' | 'header' | 'footer'
  content: ComponentContent
  styles: ComponentStyles
}

interface Template {
  id: string
  name: string
  category: string
  rating: number
  downloads: number
  components: TemplateComponent[]
}

interface TemplateLibraryProps {
  isDarkMode: boolean
  onUseTemplate?: (template: Template) => void
}

const defaultStyles: ComponentStyles = {
  backgroundColor: '#ffffff',
  textColor: '#1f2937',
  padding: 32,
  margin: 0,
  borderRadius: 8,
  buttonBackgroundColor: '#3b82f6',
  buttonTextColor: '#ffffff',
  linkColor: '#3b82f6',
  borderColor: '#e5e7eb',
  headingColor: '#111827',
}

const templates: Template[] = [
  {
    id: '1',
    name: 'Бизнес Профайл',
    category: 'Бизнес',
    rating: 4.5,
    downloads: 1250,
    components: [
      { id: 'h1', type: 'header', content: { title: 'Монгол Бизнес', navLinks: { home: 'Нүүр', about: 'Бидний тухай', services: 'Үйлчилгээ', contact: 'Холбогдох' } }, styles: { ...defaultStyles, backgroundColor: '#1e40af', textColor: '#ffffff', linkColor: '#ffffff', padding: 24 } },
      { id: 'h2', type: 'home', content: { title: 'Бизнесээ хөгжүүлээрэй', subtitle: 'Орчин үеийн шийдэл, мэргэжлийн үйлчилгээ', buttonText: 'Эхлэх', images: [{id: 'img1', url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200', alt: 'Оффис'}] }, styles: { ...defaultStyles, backgroundColor: '#3b82f6', textColor: '#ffffff', headingColor: '#ffffff', padding: 80 } },
      { id: 's1', type: 'service', content: { title: 'Манай үйлчилгээ', services: ['Зөвлөх үйлчилгээ', 'Стратеги төлөвлөгөө', 'Маркетинг'], images: [{id: 'img2', url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600', alt: 'Багийн хурал'}, {id: 'img3', url: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=600', alt: 'Төлөвлөгөө'}] }, styles: { ...defaultStyles, padding: 64 } },
      { id: 'f1', type: 'footer', content: { title: 'Монгол Бизнес', copyright: '© 2026 Монгол Бизнес. Бүх эрх хуулиар хамгаалагдсан.', footerLinks: { privacy: 'Нууцлалын бодлого', terms: 'Үйлчилгээний нөхцөл', contact: 'Холбогдох' } }, styles: { ...defaultStyles, backgroundColor: '#1e40af', textColor: '#ffffff', linkColor: '#bfdbfe' } },
    ]
  },
  {
    id: '2',
    name: 'Онлайн Дэлгүүр',
    category: 'Дэлгүүр',
    rating: 4.8,
    downloads: 890,
    components: [
      { id: 'h1', type: 'header', content: { title: 'Монгол Март', navLinks: { home: 'Нүүр', about: 'Дэлгүүр', services: 'Ангилал', contact: 'Сагс' } }, styles: { ...defaultStyles, backgroundColor: '#ffffff', textColor: '#111827', linkColor: '#111827', padding: 24 } },
      { id: 'h2', type: 'home', content: { title: 'Зун Хямдрал 50%', subtitle: 'Чанартай бараа бүтээгдэхүүнээс сонголтоо хийгээрэй', buttonText: 'Худалдан авах', images: [{id: 'img4', url: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200', alt: 'Худалдан авалт'}] }, styles: { ...defaultStyles, backgroundColor: '#10b981', textColor: '#ffffff', headingColor: '#ffffff', padding: 80 } },
      { id: 's1', type: 'service', content: { title: 'Онцлох бараа', services: ['Электроник', 'Хувцас', 'Гэр ахуй'], images: [{id: 'img5', url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400', alt: 'Бараа 1'}, {id: 'img6', url: 'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?w=400', alt: 'Бараа 2'}] }, styles: { ...defaultStyles, padding: 64 } },
      { id: 'f1', type: 'footer', content: { title: 'Монгол Март', copyright: '© 2026 Монгол Март. Бүх эрх хуулиар хамгаалагдсан.', footerLinks: { privacy: 'Нууцлал', terms: 'Нөхцөл', contact: 'Холбогдох' } }, styles: { ...defaultStyles, backgroundColor: '#064e3b', textColor: '#ffffff', linkColor: '#6ee7b7' } },
    ]
  },
  {
    id: '3',
    name: 'Бүтээлч Портфолио',
    category: 'Портфолио',
    rating: 4.6,
    downloads: 2100,
    components: [
      { id: 'h1', type: 'header', content: { title: 'Бүтээлч Студи', navLinks: { home: 'Ажлууд', about: 'Бидний тухай', services: 'Үйлчилгээ', contact: 'Холбогдох' } }, styles: { ...defaultStyles, backgroundColor: '#111827', textColor: '#ffffff', linkColor: '#ffffff', padding: 24 } },
      { id: 'h2', type: 'home', content: { title: 'Дизайн Студи', subtitle: 'Бид гайхалтай дижитал туршлагыг бүтээдэг', buttonText: 'Ажил үзэх', images: [{id: 'img7', url: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=1200', alt: 'Дизайн'}] }, styles: { ...defaultStyles, backgroundColor: '#8b5cf6', textColor: '#ffffff', headingColor: '#ffffff', padding: 80 } },
      { id: 's1', type: 'service', content: { title: 'Бид юу хийдэг вэ?', services: ['UI/UX Дизайн', 'Вэб хөгжүүлэлт', 'Брэндинг'], images: [{id: 'img8', url: 'https://images.unsplash.com/photo-1559028012-481c04fa702d?w=600', alt: 'UI дизайн'}, {id: 'img9', url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600', alt: 'Вэб хөгжүүлэлт'}] }, styles: { ...defaultStyles, padding: 64 } },
      { id: 'f1', type: 'footer', content: { title: 'Бүтээлч Студи', copyright: '© 2026 Бүтээлч Студи. Бүх эрх хуулиар хамгаалагдсан.', footerLinks: { privacy: 'Нууцлал', terms: 'Нөхцөл', contact: 'Сайн уу?' } }, styles: { ...defaultStyles, backgroundColor: '#111827', textColor: '#ffffff', linkColor: '#a78bfa' } },
    ]
  },
  {
    id: '4',
    name: 'Орчин Үеийн Ресторан',
    category: 'Ресторан',
    rating: 4.7,
    downloads: 650,
    components: [
      { id: 'h1', type: 'header', content: { title: 'Монгол Хоол', navLinks: { home: 'Цэс', about: 'Бидний тухай', services: 'Захиалга', contact: 'Холбогдох' } }, styles: { ...defaultStyles, backgroundColor: '#7c2d12', textColor: '#ffffff', linkColor: '#ffffff', padding: 24 } },
      { id: 'h2', type: 'home', content: { title: 'Гайхалтай Хоол', subtitle: 'Гайхмаар амт. Өнөөдөр ширээ захиалаарай.', buttonText: 'Захиалах', images: [{id: 'img10', url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200', alt: 'Ресторан'}] }, styles: { ...defaultStyles, backgroundColor: '#f59e0b', textColor: '#ffffff', headingColor: '#ffffff', padding: 80 } },
      { id: 's1', type: 'service', content: { title: 'Манай цэс', services: ['Усан хоол', 'Үндсэн хоол', 'Амттан'], images: [{id: 'img11', url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600', alt: 'Хоол 1'}, {id: 'img12', url: 'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=600', alt: 'Хоол 2'}] }, styles: { ...defaultStyles, padding: 64 } },
      { id: 'f1', type: 'footer', content: { title: 'Монгол Хоол', copyright: '© 2026 Монгол Хоол. Бүх эрх хуулиар хамгаалагдсан.', footerLinks: { privacy: 'Нууцлал', terms: 'Нөхцөл', contact: 'Холбогдох' } }, styles: { ...defaultStyles, backgroundColor: '#7c2d12', textColor: '#ffffff', linkColor: '#fdba74' } },
    ]
  },
  {
    id: '5',
    name: 'Технологи Стартап',
    category: 'Технологи',
    rating: 4.4,
    downloads: 1800,
    components: [
      { id: 'h1', type: 'header', content: { title: 'ТехНүүд', navLinks: { home: 'Бүтээгдэхүүн', about: 'Шийдэл', services: 'Үнэ', contact: 'Холбогдох' } }, styles: { ...defaultStyles, backgroundColor: '#0f172a', textColor: '#ffffff', linkColor: '#ffffff', padding: 24 } },
      { id: 'h2', type: 'home', content: { title: 'Ирээдүйг Бүтээе', subtitle: 'Хиймэл оюун ухаанд суурилсан шийдэл', buttonText: 'Үнэгүй турших', images: [{id: 'img13', url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200', alt: 'AI робот'}] }, styles: { ...defaultStyles, backgroundColor: '#6366f1', textColor: '#ffffff', headingColor: '#ffffff', padding: 80 } },
      { id: 's1', type: 'service', content: { title: 'Манай платформ', services: ['AI шинжилгээ', 'Үүлэн сан', 'Аюулгүй байдал'], images: [{id: 'img14', url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600', alt: 'Технологи'}, {id: 'img15', url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600', alt: 'Сервер'}] }, styles: { ...defaultStyles, padding: 64 } },
      { id: 'f1', type: 'footer', content: { title: 'ТехНүүд', copyright: '© 2026 ТехНүүд. Бүх эрх хуулиар хамгаалагдсан.', footerLinks: { privacy: 'Нууцлал', terms: 'Нөхцөл', contact: 'Холбогдох' } }, styles: { ...defaultStyles, backgroundColor: '#0f172a', textColor: '#ffffff', linkColor: '#818cf8' } },
    ]
  },
  {
    id: '6',
    name: 'Минималист Блог',
    category: 'Блог',
    rating: 4.3,
    downloads: 3200,
    components: [
      { id: 'h1', type: 'header', content: { title: 'Минималист', navLinks: { home: 'Нийтлэлүүд', about: 'Бидний тухай', services: 'Ангилал', contact: 'Бүртгүүлэх' } }, styles: { ...defaultStyles, backgroundColor: '#ffffff', textColor: '#1f2937', linkColor: '#1f2937', padding: 24 } },
      { id: 'h2', type: 'home', content: { title: 'Ач холбогдолтой түүхүүд', subtitle: 'Дизайн, амьдрал, бүтээлч талаарх бодитой бичвэрүүд', buttonText: 'Уншиж эхлэх', images: [{id: 'img16', url: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200', alt: 'Блог'}] }, styles: { ...defaultStyles, backgroundColor: '#f3f4f6', textColor: '#1f2937', headingColor: '#1f2937', padding: 80 } },
      { id: 's1', type: 'service', content: { title: 'Онцлох сэдвүүд', services: ['Дизайн', 'Технологи', 'Амьдралын хэв маяг'], images: [{id: 'img17', url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600', alt: 'Дизайн'}, {id: 'img18', url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600', alt: 'Технологи'}] }, styles: { ...defaultStyles, padding: 64 } },
      { id: 'f1', type: 'footer', content: { title: 'Минималист', copyright: '© 2026 Минималист. Бүх эрх хуулиар хамгаалагдсан.', footerLinks: { privacy: 'Нууцлал', terms: 'Нөхцөл', contact: 'Сайн уу?' } }, styles: { ...defaultStyles, backgroundColor: '#f3f4f6', textColor: '#4b5563', linkColor: '#6b7280' } },
    ]
  }
]

const categories = ['Бүгд', 'Бизнес', 'Дэлгүүр', 'Портфолио', 'Ресторан', 'Технологи', 'Блог']

const getColorValue = (colorName: string): string => {
  const colorPalette: Record<string, string> = {
    'white': '#ffffff',
    'black': '#000000',
    'slate-50': '#f8fafc', 'slate-100': '#f1f5f9', 'slate-200': '#e2e8f0', 'slate-300': '#cbd5e1', 'slate-400': '#94a3b8', 'slate-500': '#64748b', 'slate-600': '#475569', 'slate-700': '#334155', 'slate-800': '#1e293b', 'slate-900': '#0f172a',
    'blue-50': '#eff6ff', 'blue-100': '#dbeafe', 'blue-200': '#bfdbfe', 'blue-300': '#93c5fd', 'blue-400': '#60a5fa', 'blue-500': '#3b82f6', 'blue-600': '#2563eb', 'blue-700': '#1d4ed8', 'blue-800': '#1e40af', 'blue-900': '#1e3a8a',
    'red-50': '#fef2f2', 'red-100': '#fee2e2', 'red-200': '#fecaca', 'red-300': '#fca5a5', 'red-400': '#f87171', 'red-500': '#ef4444', 'red-600': '#dc2626', 'red-700': '#b91c1c', 'red-800': '#991b1b', 'red-900': '#7f1d1d',
    'green-50': '#f0fdf4', 'green-100': '#dcfce7', 'green-200': '#bbf7d0', 'green-300': '#86efac', 'green-400': '#4ade80', 'green-500': '#22c55e', 'green-600': '#16a34a', 'green-700': '#15803d', 'green-800': '#166534', 'green-900': '#14532d',
    'purple-50': '#faf5ff', 'purple-100': '#f3e8ff', 'purple-200': '#e9d5ff', 'purple-300': '#d8b4fe', 'purple-400': '#c084fc', 'purple-500': '#a855f7', 'purple-600': '#9333ea', 'purple-700': '#7c3aed', 'purple-800': '#6b21a8', 'purple-900': '#581c87',
    'orange-50': '#fff7ed', 'orange-100': '#ffedd5', 'orange-200': '#fed7aa', 'orange-300': '#fdba74', 'orange-400': '#fb923c', 'orange-500': '#f97316', 'orange-600': '#ea580c', 'orange-700': '#c2410c', 'orange-800': '#9a3412', 'orange-900': '#7c2d12',
    'yellow-50': '#fefce8', 'yellow-100': '#fef9c3', 'yellow-200': '#fef08a', 'yellow-300': '#fde047', 'yellow-400': '#facc15', 'yellow-500': '#eab308', 'yellow-600': '#ca8a04', 'yellow-700': '#a16207', 'yellow-800': '#854d0e', 'yellow-900': '#713f12',
    'pink-50': '#fdf2f8', 'pink-100': '#fce7f3', 'pink-200': '#fbcfe8', 'pink-300': '#f9a8d4', 'pink-400': '#f472b6', 'pink-500': '#ec4899', 'pink-600': '#db2777', 'pink-700': '#be185d', 'pink-800': '#9d174d', 'pink-900': '#831843',
    'indigo-50': '#eef2ff', 'indigo-100': '#e0e7ff', 'indigo-200': '#c7d2fe', 'indigo-300': '#a5b4fc', 'indigo-400': '#818cf8', 'indigo-500': '#6366f1', 'indigo-600': '#4f46e5', 'indigo-700': '#4338ca', 'indigo-800': '#3730a3', 'indigo-900': '#312e81',
    'teal-50': '#f0fdfa', 'teal-100': '#ccfbf1', 'teal-200': '#99f6e4', 'teal-300': '#5eead4', 'teal-400': '#2dd4bf', 'teal-500': '#14b8a6', 'teal-600': '#0d9488', 'teal-700': '#0f766e', 'teal-800': '#115e59', 'teal-900': '#134e4a',
    'cyan-50': '#ecfeff', 'cyan-100': '#cffafe', 'cyan-200': '#a5f3fc', 'cyan-300': '#67e8f9', 'cyan-400': '#22d3ee', 'cyan-500': '#06b6d4', 'cyan-600': '#0891b2', 'cyan-700': '#0e7490', 'cyan-800': '#155e75', 'cyan-900': '#164e63',
    'emerald-50': '#ecfdf5', 'emerald-100': '#d1fae5', 'emerald-200': '#a7f3d0', 'emerald-300': '#6ee7b7', 'emerald-400': '#34d399', 'emerald-500': '#10b981', 'emerald-600': '#059669', 'emerald-700': '#047857', 'emerald-800': '#065f46', 'emerald-900': '#064e3b',
  }
  if (colorName.startsWith('#')) return colorName
  return colorPalette[colorName] || colorName
}

function TemplatePreview({ components, scale = 0.5 }: { components: TemplateComponent[]; scale?: number }) {
  const renderComponent = (component: TemplateComponent) => {
    const componentStyle = {
      backgroundColor: getColorValue(component.styles.backgroundColor),
      color: getColorValue(component.styles.textColor),
      padding: `${component.styles.padding * scale}px`,
      borderRadius: `${component.styles.borderRadius * scale}px`,
    }

    const buttonStyle = {
      backgroundColor: getColorValue(component.styles.buttonBackgroundColor),
      color: getColorValue(component.styles.buttonTextColor),
    }

    const linkStyle = {
      color: getColorValue(component.styles.linkColor),
    }

    const headingStyle = {
      color: getColorValue(component.styles.headingColor),
    }

    switch (component.type) {
      case 'home':
        return (
          <div style={componentStyle}>
            <h1 className="font-bold mb-2" style={{ ...headingStyle, fontSize: `${24 * scale}px` }}>
              {component.content.title || 'Тавтай морил'}</h1>
            <p className="mb-3" style={{ fontSize: `${14 * scale}px` }}>{component.content.subtitle || 'Таны аялал эндээс эхэлнэ'}</p>
            <button className="px-3 py-1 rounded font-semibold" style={{ ...buttonStyle, fontSize: `${12 * scale}px` }}>
              {component.content.buttonText || 'Эхлэх'}
            </button>
            {component.content.images && component.content.images.length > 0 && (
              <div className="mt-3 grid grid-cols-2 gap-2">
                {component.content.images.map((img) => (
                  <img key={img.id} src={img.url} alt={img.alt} className="rounded-lg w-full h-24 object-cover" />
                ))}
              </div>
            )}
          </div>
        )
      case 'about':
        return (
          <div style={componentStyle}>
            <h2 className="font-bold mb-2" style={{ ...headingStyle, fontSize: `${20 * scale}px` }}>
              {component.content.title || 'Бидний тухай'}</h2>
            <p style={{ fontSize: `${12 * scale}px` }}>{component.content.description || 'Бид өндөр чанартай үйлчилгээ үзүүлэхээр зорьж ажилладаг.'}</p>
          </div>
        )
      case 'service':
        return (
          <div style={componentStyle}>
            <h2 className="font-bold mb-3 text-center" style={{ ...headingStyle, fontSize: `${20 * scale}px` }}>
              {component.content.title || 'Манай үйлчилгээ'}</h2>
            {component.content.images && component.content.images.length > 0 && (
              <div className="mb-3 grid grid-cols-3 gap-2">
                {component.content.images.slice(0, 3).map((img) => (
                  <img key={img.id} src={img.url} alt={img.alt} className="rounded w-full h-20 object-cover" />
                ))}
              </div>
            )}
            <div className="grid grid-cols-3 gap-2">
              {(component.content.services || ['Вэб хөгжүүлэлт', 'Дизайн', 'Зөвлөгөө']).map((service: string, index: number) => (
                <div key={index} className="p-2 rounded border text-center" style={{ borderColor: getColorValue(component.styles.borderColor) }}>
                  <h3 className="font-semibold mb-1" style={{ ...headingStyle, fontSize: `${12 * scale}px` }}>{service}</h3>
                </div>
              ))}
            </div>
          </div>
        )
      case 'contact':
        return (
          <div style={componentStyle}>
            <h2 className="font-bold mb-3" style={{ ...headingStyle, fontSize: `${20 * scale}px` }}>
              {component.content.title || 'Холбогдох'}</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <h3 className="font-semibold mb-1" style={{ ...headingStyle, fontSize: `${14 * scale}px` }}>Холбоо барих</h3>
                <div className="space-y-1" style={{ fontSize: `${10 * scale}px` }}>
                  <p>{component.content.contactInfo?.email || 'contact@example.com'}</p>
                  <p>{component.content.contactInfo?.phone || '+1 (555) 123-4567'}</p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-1" style={{ ...headingStyle, fontSize: `${14 * scale}px` }}>Мессеж илгээх</h3>
                <button className="w-full py-1 rounded font-semibold" style={{ ...buttonStyle, fontSize: `${12 * scale}px` }}>
                  {component.content.buttonText || 'Илгээх'}
                </button>
              </div>
            </div>
          </div>
        )
      case 'header':
        return (
          <div style={componentStyle}>
            <div className="flex justify-between items-center">
              <h1 className="font-bold" style={{ ...headingStyle, fontSize: `${16 * scale}px` }}>{component.content.title || 'Таны брэнд'}</h1>
              <nav className="space-x-2" style={{ fontSize: `${10 * scale}px` }}>
                <a href="#" className="hover:opacity-80" style={linkStyle}>{component.content.navLinks?.home || 'Нүүр'}</a>
                <a href="#" className="hover:opacity-80" style={linkStyle}>{component.content.navLinks?.about || 'Бидний тухай'}</a>
                <a href="#" className="hover:opacity-80" style={linkStyle}>{component.content.navLinks?.services || 'Үйлчилгээ'}</a>
                <a href="#" className="hover:opacity-80" style={linkStyle}>{component.content.navLinks?.contact || 'Холбогдох'}</a>
              </nav>
            </div>
          </div>
        )
      case 'footer':
        return (
          <div style={componentStyle}>
            <div className="text-center" style={{ fontSize: `${10 * scale}px` }}>
              <p className="mb-1">{component.content.copyright || '© 2026Таны компани. Бүх эрх хуулиар хамгаалагдсан.'}</p>
              <div className="space-x-2">
                <a href="#" className="hover:opacity-80" style={linkStyle}>{component.content.footerLinks?.privacy || 'Нууцлал'}</a>
                <a href="#" className="hover:opacity-80" style={linkStyle}>{component.content.footerLinks?.terms || 'Нөхцөл'}</a>
                <a href="#" className="hover:opacity-80" style={linkStyle}>{component.content.footerLinks?.contact || 'Холбогдох'}</a>
              </div>
            </div>
          </div>
        )
      default:
        return <div style={componentStyle}><p>{component.type} component</p></div>
    }
  }

  return (
    <div className="w-full h-full overflow-y-auto bg-white rounded-lg">
      {components.map((component) => (
        <div key={component.id} style={{ marginBottom: `${component.styles.margin * scale}px` }}>
          {renderComponent(component)}
        </div>
      ))}
    </div>
  )
}

export default function TemplateLibrary({ isDarkMode, onUseTemplate }: TemplateLibraryProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null)
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null)
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null)
  const [newImageUrl, setNewImageUrl] = useState('')
  const [newImageAlt, setNewImageAlt] = useState('')

  // Create editable copy when opening preview
  const openPreview = (template: Template) => {
    setPreviewTemplate(template)
    setEditingTemplate(JSON.parse(JSON.stringify(template))) // Deep copy
    setSelectedComponentId(null)
    setNewImageUrl('')
    setNewImageAlt('')
  }

  const closePreview = () => {
    setPreviewTemplate(null)
    setEditingTemplate(null)
    setSelectedComponentId(null)
    setNewImageUrl('')
    setNewImageAlt('')
  }

  const updateComponentContent = (componentId: string, key: string, value: any) => {
    if (!editingTemplate) return
    
    const updatedComponents = editingTemplate.components.map(comp => {
      if (comp.id === componentId) {
        return { ...comp, content: { ...comp.content, [key]: value } }
      }
      return comp
    })
    
    setEditingTemplate({ ...editingTemplate, components: updatedComponents })
  }

  const updateComponentStyle = (componentId: string, key: keyof ComponentStyles, value: any) => {
    if (!editingTemplate) return
    
    const updatedComponents = editingTemplate.components.map(comp => {
      if (comp.id === componentId) {
        return { ...comp, styles: { ...comp.styles, [key]: value } }
      }
      return comp
    })
    
    setEditingTemplate({ ...editingTemplate, components: updatedComponents })
  }

  const updateNavLink = (componentId: string, key: string, value: string) => {
    if (!editingTemplate) return
    
    const updatedComponents = editingTemplate.components.map(comp => {
      if (comp.id === componentId) {
        return { 
          ...comp, 
          content: { 
            ...comp.content, 
            navLinks: { ...comp.content.navLinks, [key]: value } 
          } 
        }
      }
      return comp
    })
    
    setEditingTemplate({ ...editingTemplate, components: updatedComponents })
  }

  const updateFooterLink = (componentId: string, key: string, value: string) => {
    if (!editingTemplate) return
    
    const updatedComponents = editingTemplate.components.map(comp => {
      if (comp.id === componentId) {
        return { 
          ...comp, 
          content: { 
            ...comp.content, 
            footerLinks: { ...comp.content.footerLinks, [key]: value } 
          } 
        }
      }
      return comp
    })
    
    setEditingTemplate({ ...editingTemplate, components: updatedComponents })
  }

  const updateContactInfo = (componentId: string, key: string, value: string) => {
    if (!editingTemplate) return
    
    const updatedComponents = editingTemplate.components.map(comp => {
      if (comp.id === componentId) {
        return { 
          ...comp, 
          content: { 
            ...comp.content, 
            contactInfo: { ...comp.content.contactInfo, [key]: value } 
          } 
        }
      }
      return comp
    })
    
    setEditingTemplate({ ...editingTemplate, components: updatedComponents })
  }

  const addService = (componentId: string) => {
    if (!editingTemplate) return
    
    const updatedComponents = editingTemplate.components.map(comp => {
      if (comp.id === componentId) {
        const services = [...(comp.content.services || []), `Үйлчилгээ ${(comp.content.services?.length || 0) + 1}`]
        return { ...comp, content: { ...comp.content, services } }
      }
      return comp
    })
    
    setEditingTemplate({ ...editingTemplate, components: updatedComponents })
  }

  const updateService = (componentId: string, index: number, value: string) => {
    if (!editingTemplate) return
    
    const updatedComponents = editingTemplate.components.map(comp => {
      if (comp.id === componentId) {
        const services = [...(comp.content.services || [])]
        services[index] = value
        return { ...comp, content: { ...comp.content, services } }
      }
      return comp
    })
    
    setEditingTemplate({ ...editingTemplate, components: updatedComponents })
  }

  const removeService = (componentId: string, index: number) => {
    if (!editingTemplate) return
    
    const updatedComponents = editingTemplate.components.map(comp => {
      if (comp.id === componentId) {
        const services = [...(comp.content.services || [])]
        services.splice(index, 1)
        return { ...comp, content: { ...comp.content, services } }
      }
      return comp
    })
    
    setEditingTemplate({ ...editingTemplate, components: updatedComponents })
  }

  const addImage = (componentId: string) => {
    if (!editingTemplate || !newImageUrl.trim()) return
    
    const newImage: ComponentImage = { 
      id: Date.now().toString(), 
      url: newImageUrl, 
      alt: newImageAlt || 'Зураг' 
    }
    
    const updatedComponents = editingTemplate.components.map(comp => {
      if (comp.id === componentId) {
        return { 
          ...comp, 
          content: { 
            ...comp.content, 
            images: [...(comp.content.images || []), newImage] 
          } 
        }
      }
      return comp
    })
    
    setEditingTemplate({ ...editingTemplate, components: updatedComponents })
    setNewImageUrl('')
    setNewImageAlt('')
  }

  const removeImage = (componentId: string, imageId: string) => {
    if (!editingTemplate) return
    
    const updatedComponents = editingTemplate.components.map(comp => {
      if (comp.id === componentId) {
        return { 
          ...comp, 
          content: { 
            ...comp.content, 
            images: comp.content.images?.filter(img => img.id !== imageId) || [] 
          } 
        }
      }
      return comp
    })
    
    setEditingTemplate({ ...editingTemplate, components: updatedComponents })
  }

  const handleUseTemplate = (template: Template) => {
    if (onUseTemplate) {
      // Use the edited template if available, otherwise use the original
      const templateToUse = editingTemplate || template
      onUseTemplate(templateToUse)
    }
    console.log('Using template:', template.name)
  }

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'All' || template.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const ColorPicker = ({ label, value, onChange }: { label: string; value: string; onChange: (val: string) => void }) => {
    const colorGroups = [
      { name: 'Саарал', colors: ['slate-50', 'slate-100', 'slate-200', 'slate-300', 'slate-400', 'slate-500', 'slate-600', 'slate-700', 'slate-800', 'slate-900'] },
      { name: 'Хөх', colors: ['blue-50', 'blue-100', 'blue-200', 'blue-300', 'blue-400', 'blue-500', 'blue-600', 'blue-700', 'blue-800', 'blue-900'] },
      { name: 'Улаан', colors: ['red-50', 'red-100', 'red-200', 'red-300', 'red-400', 'red-500', 'red-600', 'red-700', 'red-800', 'red-900'] },
      { name: 'Ногоон', colors: ['green-50', 'green-100', 'green-200', 'green-300', 'green-400', 'green-500', 'green-600', 'green-700', 'green-800', 'green-900'] },
      { name: 'Ягаан', colors: ['purple-50', 'purple-100', 'purple-200', 'purple-300', 'purple-400', 'purple-500', 'purple-600', 'purple-700', 'purple-800', 'purple-900'] },
      { name: 'Улбар шар', colors: ['orange-50', 'orange-100', 'orange-200', 'orange-300', 'orange-400', 'orange-500', 'orange-600', 'orange-700', 'orange-800', 'orange-900'] },
      { name: 'Шар', colors: ['yellow-50', 'yellow-100', 'yellow-200', 'yellow-300', 'yellow-400', 'yellow-500', 'yellow-600', 'yellow-700', 'yellow-800', 'yellow-900'] },
      { name: 'Ягаан (pink)', colors: ['pink-50', 'pink-100', 'pink-200', 'pink-300', 'pink-400', 'pink-500', 'pink-600', 'pink-700', 'pink-800', 'pink-900'] },
      { name: 'Индиго', colors: ['indigo-50', 'indigo-100', 'indigo-200', 'indigo-300', 'indigo-400', 'indigo-500', 'indigo-600', 'indigo-700', 'indigo-800', 'indigo-900'] },
      { name: 'Түлхүүр', colors: ['teal-50', 'teal-100', 'teal-200', 'teal-300', 'teal-400', 'teal-500', 'teal-600', 'teal-700', 'teal-800', 'teal-900'] },
    ]
    
    return (
      <div>
        <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{label}</label>
        <div className="space-y-3">
          {/* Selected color preview */}
          <div className="flex items-center space-x-2">
            <div 
              className="w-10 h-10 rounded-lg border-2 border-gray-300 shadow-sm" 
              style={{ backgroundColor: getColorValue(value) }}
            />
            <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{value}</span>
          </div>
          
          {/* Color palette */}
          <div className={`max-h-48 overflow-y-auto rounded-lg border p-2 ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white/20 border-white/30'}`}>
            {/* White and Black */}
            <div className="mb-3">
              <div className="flex gap-1">
                <button
                  onClick={() => onChange('white')}
                  className={`w-8 h-8 rounded border-2 transition-all ${value === 'white' ? 'border-green-500 ring-2 ring-green-200' : 'border-gray-300 hover:border-gray-400'}`}
                  style={{ backgroundColor: '#ffffff' }}
                  title="Цагаан"
                />
                <button
                  onClick={() => onChange('black')}
                  className={`w-8 h-8 rounded border-2 transition-all ${value === 'black' ? 'border-green-500 ring-2 ring-green-200' : 'border-gray-300 hover:border-gray-400'}`}
                  style={{ backgroundColor: '#000000' }}
                  title="Хар"
                />
              </div>
            </div>
            
            {/* Color groups */}
            {colorGroups.map((group) => (
              <div key={group.name} className="mb-3">
                <span className={`text-xs font-medium block mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{group.name}</span>
                <div className="flex gap-1 flex-wrap">
                  {group.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => onChange(color)}
                      className={`w-6 h-6 rounded transition-all ${value === color ? 'ring-2 ring-green-500 ring-offset-2' : 'hover:scale-110'}`}
                      style={{ backgroundColor: getColorValue(color) }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen p-8 ${isDarkMode ? 'text-white bg-gray-900' : 'bg-gradient-to-br from-gray-400 via-slate-700 to-emerald-950 text-gray-900'}`}>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Бэлэн загвар</h2>
          <p className={`mt-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>Манай мэргэжлийн загваруудаас сонгоно уу</p>
        </div>
      </div>

      <div className="mb-8 space-y-4">
        <div className="relative max-w-md">
          <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
          <input
            type="text"
            placeholder="Загвар хайх..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
              isDarkMode ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300'
            }`}
          />
        </div>

        <div className="flex space-x-2 flex-wrap">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg transition-colors mb-2 ${
                selectedCategory === category
                  ? 'bg-emerald-600 text-white'
                  : isDarkMode 
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                    : 'bg-white/80 text-gray-800 hover:bg-white'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <div key={template.id} className={`rounded-lg shadow-sm border overflow-hidden hover:shadow-lg transition-shadow ${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'
          }`}>
            {/* Component Preview */}
            <div className="relative h-48 overflow-hidden">
              <div className="absolute inset-0 transform scale-[0.42] origin-top-left" style={{ width: '240%', height: '240%' }}>
                <TemplatePreview components={template.components} scale={0.4} />
              </div>
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20 pointer-events-none" />
            </div>
            
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{template.name}</h3>
                <div className={`flex items-center text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  <Star className="w-4 h-4 text-yellow-400 mr-1" />
                  {template.rating}
                </div>
              </div>
              
              <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{template.category}</p>
              
              <div className={`flex items-center justify-between text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                <span>{template.downloads} таталт</span>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => openPreview(template)}
                  className={`flex-1 flex items-center justify-center px-3 py-2 border rounded-lg transition-colors ${
                    isDarkMode 
                      ? 'border-gray-600 hover:bg-gray-700' 
                      : 'border-white/30 hover:bg-white/20'
                  }`}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Урьдчилан харах
                </button>
                <button
                  onClick={() => handleUseTemplate(template)}
                  className="flex-1 flex items-center justify-center px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Ашиглах
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Загвар олдсонгүй</p>
          <p className={`mt-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Хайлт эсвэл шүүлтүүрээ тохируулна уу</p>
        </div>
      )}

      {/* Preview Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className={`w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-lg shadow-2xl ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="flex justify-between items-center p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}">
              <div>
                <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{previewTemplate.name}</h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{previewTemplate.category} Загвар</p>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => handleUseTemplate(previewTemplate)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Download className="w-4 h-4 mr-2 inline" />
                  Ашиглах
                </button>
                <button
                  onClick={() => closePreview()}
                  className={`p-2 rounded-lg hover:bg-gray-100 ${isDarkMode ? 'text-gray-400 hover:text-white hover:bg-gray-700' : ''}`}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              <div className="flex gap-6">
                {/* Preview Area */}
                <div className={`flex-1 rounded-lg shadow-sm border p-8 ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white'}`}>
                  <div className="max-w-4xl mx-auto">
                    {editingTemplate && (
                      <div className="space-y-4">
                        {editingTemplate.components.map((component) => (
                          <div 
                            key={component.id} 
                            className={`group relative cursor-pointer ${selectedComponentId === component.id ? 'ring-2 ring-green-500 rounded-lg' : ''}`}
                            onClick={() => setSelectedComponentId(component.id)}
                          >
                            <div className="absolute -top-3 -right-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                              <button className="p-2 bg-white shadow-md rounded-full text-green-600">
                                <Edit3 className="w-4 h-4" />
                              </button>
                            </div>
                            <TemplatePreview components={[component]} scale={1} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Edit Panel */}
                {selectedComponentId && editingTemplate && (
                  <div className="w-96 flex-shrink-0">
                    <div className={`rounded-lg shadow-sm border p-6 sticky top-4 max-h-[80vh] overflow-y-auto ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
                      {(() => {
                        const component = editingTemplate.components.find(c => c.id === selectedComponentId)
                        if (!component) return null
                        
                        return (
                          <>
                            <div className="flex justify-between items-center mb-4">
                              <h3 className={`font-semibold text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Засварлах {component.type}</h3>
                              <button 
                                onClick={() => setSelectedComponentId(null)}
                                className={`p-1 hover:bg-gray-100 rounded ${isDarkMode ? 'text-gray-400 hover:text-white' : ''}`}
                              >
                                <X className="w-5 h-5" />
                              </button>
                            </div>

                            <div className="space-y-4">
                              {/* Title */}
                              <div>
                                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Гарчиг</label>
                                <input 
                                  type="text" 
                                  value={component.content.title || ''} 
                                  onChange={(e) => updateComponentContent(component.id, 'title', e.target.value)}
                                  className={`w-full px-3 py-2 border rounded-lg ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                                  placeholder="Гарчиг оруулах"
                                />
                              </div>

                              {/* Home specific */}
                              {component.type === 'home' && (
                                <>
                                  <div>
                                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Дэд гарчиг</label>
                                    <input 
                                      type="text" 
                                      value={component.content.subtitle || ''} 
                                      onChange={(e) => updateComponentContent(component.id, 'subtitle', e.target.value)}
                                      className={`w-full px-3 py-2 border rounded-lg ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                                      placeholder="Дэд гарчиг"
                                    />
                                  </div>
                                  <div>
                                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Товчны текст</label>
                                    <input 
                                      type="text" 
                                      value={component.content.buttonText || ''} 
                                      onChange={(e) => updateComponentContent(component.id, 'buttonText', e.target.value)}
                                      className={`w-full px-3 py-2 border rounded-lg ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                                      placeholder="Товчны текст"
                                    />
                                  </div>
                                </>
                              )}

                              {/* About specific */}
                              {component.type === 'about' && (
                                <div>
                                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Тайлбар</label>
                                  <textarea 
                                    value={component.content.description || ''} 
                                    onChange={(e) => updateComponentContent(component.id, 'description', e.target.value)}
                                    rows={4}
                                    className={`w-full px-3 py-2 border rounded-lg ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                                    placeholder="Тайлбар"
                                  />
                                </div>
                              )}

                              {/* Services specific */}
                              {component.type === 'service' && (
                                <div>
                                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Үйлчилгээнүүд</label>
                                  <div className="space-y-2">
                                    {(component.content.services || []).map((service: string, index: number) => (
                                      <div key={index} className="flex items-center space-x-2">
                                        <input 
                                          type="text" 
                                          value={service}
                                          onChange={(e) => updateService(component.id, index, e.target.value)}
                                          className={`flex-1 px-3 py-2 border rounded-lg text-sm ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                                        />
                                        <button 
                                          onClick={() => removeService(component.id, index)}
                                          className="px-2 py-1 text-red-600 hover:bg-red-50 rounded"
                                        >
                                          ×
                                        </button>
                                      </div>
                                    ))}
                                    <button 
                                      onClick={() => addService(component.id)}
                                      className={`w-full py-2 border-2 border-dashed rounded-lg text-sm ${isDarkMode ? 'border-gray-600 text-gray-400' : 'border-gray-300 text-gray-500'}`}
                                    >
                                      + Үйлчилгээ нэмэх
                                    </button>
                                  </div>
                                </div>
                              )}

                              {/* Contact specific */}
                              {component.type === 'contact' && (
                                <>
                                  <div>
                                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Имэйл</label>
                                    <input 
                                      type="text" 
                                      value={component.content.contactInfo?.email || ''}
                                      onChange={(e) => updateContactInfo(component.id, 'email', e.target.value)}
                                      className={`w-full px-3 py-2 border rounded-lg ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                                    />
                                  </div>
                                  <div>
                                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Утас</label>
                                    <input 
                                      type="text" 
                                      value={component.content.contactInfo?.phone || ''}
                                      onChange={(e) => updateContactInfo(component.id, 'phone', e.target.value)}
                                      className={`w-full px-3 py-2 border rounded-lg ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                                    />
                                  </div>
                                  <div>
                                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Хаяг</label>
                                    <input 
                                      type="text" 
                                      value={component.content.contactInfo?.address || ''}
                                      onChange={(e) => updateContactInfo(component.id, 'address', e.target.value)}
                                      className={`w-full px-3 py-2 border rounded-lg ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                                    />
                                  </div>
                                </>
                              )}

                              {/* Header specific */}
                              {component.type === 'header' && (
                                <>
                                  <div>
                                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Нүүр холбоос</label>
                                    <input 
                                      type="text" 
                                      value={component.content.navLinks?.home || ''}
                                      onChange={(e) => updateNavLink(component.id, 'home', e.target.value)}
                                      className={`w-full px-3 py-2 border rounded-lg ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                                    />
                                  </div>
                                  <div>
                                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Бидний тухай холбоос</label>
                                    <input 
                                      type="text" 
                                      value={component.content.navLinks?.about || ''}
                                      onChange={(e) => updateNavLink(component.id, 'about', e.target.value)}
                                      className={`w-full px-3 py-2 border rounded-lg ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                                    />
                                  </div>
                                  <div>
                                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Үйлчилгээ холбоос</label>
                                    <input 
                                      type="text" 
                                      value={component.content.navLinks?.services || ''}
                                      onChange={(e) => updateNavLink(component.id, 'services', e.target.value)}
                                      className={`w-full px-3 py-2 border rounded-lg ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                                    />
                                  </div>
                                  <div>
                                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Холбогдох холбоос</label>
                                    <input 
                                      type="text" 
                                      value={component.content.navLinks?.contact || ''}
                                      onChange={(e) => updateNavLink(component.id, 'contact', e.target.value)}
                                      className={`w-full px-3 py-2 border rounded-lg ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                                    />
                                  </div>
                                </>
                              )}

                              {/* Footer specific */}
                              {component.type === 'footer' && (
                                <>
                                  <div>
                                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Зохиогчийн эрх</label>
                                    <input 
                                      type="text" 
                                      value={component.content.copyright || ''}
                                      onChange={(e) => updateComponentContent(component.id, 'copyright', e.target.value)}
                                      className={`w-full px-3 py-2 border rounded-lg ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                                    />
                                  </div>
                                  <div>
                                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Нууцлал холбоос</label>
                                    <input 
                                      type="text" 
                                      value={component.content.footerLinks?.privacy || ''}
                                      onChange={(e) => updateFooterLink(component.id, 'privacy', e.target.value)}
                                      className={`w-full px-3 py-2 border rounded-lg ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                                    />
                                  </div>
                                  <div>
                                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Нөхцөл холбоос</label>
                                    <input 
                                      type="text" 
                                      value={component.content.footerLinks?.terms || ''}
                                      onChange={(e) => updateFooterLink(component.id, 'terms', e.target.value)}
                                      className={`w-full px-3 py-2 border rounded-lg ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                                    />
                                  </div>
                                </>
                              )}

                              <hr className={isDarkMode ? 'border-gray-600' : 'border-gray-200'} />

                              {/* Colors */}
                              <h4 className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>Өнгө</h4>
                              <div className="grid grid-cols-2 gap-3">
                                <ColorPicker
                                  label="Дэвсгэр өнгө"
                                  value={component.styles.backgroundColor}
                                  onChange={(val) => updateComponentStyle(component.id, 'backgroundColor', val)}
                                />
                                <ColorPicker
                                  label="Текст өнгө"
                                  value={component.styles.textColor}
                                  onChange={(val) => updateComponentStyle(component.id, 'textColor', val)}
                                />
                                <ColorPicker
                                  label="Гарчиг өнгө"
                                  value={component.styles.headingColor}
                                  onChange={(val) => updateComponentStyle(component.id, 'headingColor', val)}
                                />
                                <ColorPicker
                                  label="Товчны дэвсгэр"
                                  value={component.styles.buttonBackgroundColor}
                                  onChange={(val) => updateComponentStyle(component.id, 'buttonBackgroundColor', val)}
                                />
                                <ColorPicker
                                  label="Товчны текст"
                                  value={component.styles.buttonTextColor}
                                  onChange={(val) => updateComponentStyle(component.id, 'buttonTextColor', val)}
                                />
                                <ColorPicker
                                  label="Холбоос өнгө"
                                  value={component.styles.linkColor}
                                  onChange={(val) => updateComponentStyle(component.id, 'linkColor', val)}
                                />
                                <ColorPicker
                                  label="Хүрээний өнгө"
                                  value={component.styles.borderColor}
                                  onChange={(val) => updateComponentStyle(component.id, 'borderColor', val)}
                                />
                              </div>

                              <hr className={isDarkMode ? 'border-gray-600' : 'border-gray-200'} />

                              {/* Spacing */}
                              <h4 className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>Зай</h4>
                              <div>
                                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                  Дотор зай: {component.styles.padding}px
                                </label>
                                <input 
                                  type="range" 
                                  min="0" 
                                  max="100" 
                                  value={component.styles.padding}
                                  onChange={(e) => updateComponentStyle(component.id, 'padding', parseInt(e.target.value))}
                                  className="w-full"
                                />
                              </div>
                              <div>
                                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                  Гадаад зай: {component.styles.margin}px
                                </label>
                                <input 
                                  type="range" 
                                  min="0" 
                                  max="50" 
                                  value={component.styles.margin}
                                  onChange={(e) => updateComponentStyle(component.id, 'margin', parseInt(e.target.value))}
                                  className="w-full"
                                />
                              </div>
                              <div>
                                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                  Хүрээний радиус: {component.styles.borderRadius}px
                                </label>
                                <input 
                                  type="range" 
                                  min="0" 
                                  max="30" 
                                  value={component.styles.borderRadius}
                                  onChange={(e) => updateComponentStyle(component.id, 'borderRadius', parseInt(e.target.value))}
                                  className="w-full"
                                />
                              </div>
                            </div>
                          </>
                        )
                      })()}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

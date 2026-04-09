'use client'

import { Users, Layout, LayoutTemplate, Sun, Moon, FolderOpen, Boxes } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  websiteName: string
  setWebsiteName: (name: string) => void
  isDarkMode: boolean
  setIsDarkMode: (dark: boolean) => void
  user?: any
}

const menuItems = [
  { id: 'projects', label: 'Төслүүд', title: 'Төсөл удирдлага', icon: FolderOpen },
  { id: 'users', label: 'Хэрэглэгчид', title: 'Хэрэглэгч удирдлага', icon: Users },
  { id: 'builder', label: 'Вэбсайт угсрах', title: 'Вэб бүтэц бүтээгч', icon: Boxes },
  { id: 'templates', label: 'Загварууд', title: 'Загвар сан', icon: LayoutTemplate },
]

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  websiteName, 
  setWebsiteName,
  isDarkMode,
  setIsDarkMode,
  user 
}: SidebarProps) {
  const getTitle = () => {
    const item = menuItems.find(item => item.id === activeTab)
    return item?.title || 'Superadmin Panel'
  }

  return (
    <div className={`w-64 shadow-lg flex flex-col h-full ${isDarkMode ? 'bg-slate-900' : 'bg-white'}`}>
      {/* Header */}
      <div className={`p-6 border-b ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
        <h1 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Супер Админ</h1>
        <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>zevtabs 2026</p>
      </div>

      {/* Project Name - only show when in builder */}
      {activeTab === 'builder' && (
        <div className={`p-4 border-b ${isDarkMode ? 'bg-slate-800 border-slate-600' : 'bg-gray-50 border-gray-200'}`}>
          <label className={`block text-xs font-medium mb-1 uppercase tracking-wide ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Төслийн нэр
          </label>
          <input
            type="text"
            value={websiteName}
            onChange={(e) => setWebsiteName(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-white"
            placeholder="Төслийн нэр оруулах"
          />
        </div>
      )}
      
      <nav className="mt-4 flex-1">
        {menuItems.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center px-6 py-3 text-left transition-colors",
                activeTab === item.id
                  ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-r-4 border-emerald-500 dark:border-emerald-400"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-gray-200"
              )}
            >
              <Icon className="w-5 h-5 mr-3" />
              <span className="font-medium">{item.label}</span>
            </button>
          )
        })}
      </nav>

      <div className={`p-4 border-t ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className={cn(
            "w-full flex items-center justify-center px-4 py-2 rounded-lg transition-colors font-medium",
            isDarkMode
              ? "bg-gray-800 text-yellow-400 hover:bg-gray-700"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          )}
        >
          {isDarkMode ? (
            <>
              <Sun className="w-5 h-5 mr-2" />
              Гэгээлэг
            </>
          ) : (
            <>
              <Moon className="w-5 h-5 mr-2" />
              Харанхуй
            </>
          )}
        </button>
      </div>
      
      <div className={`p-6 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center">
          <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-semibold">SA</span>
          </div>
          <div className="ml-3">
            <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Супер Админ</p>
            <p className={`text-xs truncate max-w-[140px] ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {user?.email || 'admin@demo.com'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import { Users, Layout, LayoutTemplate, Sun, Moon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  websiteName: string
  setWebsiteName: (name: string) => void
  isDarkMode: boolean
  setIsDarkMode: (dark: boolean) => void
}

const menuItems = [
  { id: 'users', label: 'Хэрэглэгчид', title: 'Хэрэглэгчдийн удирдлага', icon: Users },
  { id: 'builder', label: 'Вэбсайт угсрах', title: 'Вэбсайт угсрах', icon: Layout },
  { id: 'templates', label: 'Бэлэн загвар', title: 'Бэлэн загвар', icon: LayoutTemplate },
]

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  websiteName, 
  setWebsiteName,
  isDarkMode,
  setIsDarkMode 
}: SidebarProps) {
  const getTitle = () => {
    const item = menuItems.find(item => item.id === activeTab)
    return item?.title || 'Админ панел'
  }

  return (
    <div className="w-64 bg-white dark:bg-slate-900 shadow-lg flex flex-col h-full">
      

      <div className="p-4 border-b bg-gray-50 dark:bg-slate-800 dark:border-slate-600">
        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide">
          Вэбсайтын нэр
        </label>
        <input
          type="text"
          value={websiteName}
          onChange={(e) => setWebsiteName(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-white"
          placeholder="Вэбсайтын нэр оруулах"
        />
      </div>
      
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
                  ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-r-4 border-blue-600 dark:border-blue-400"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-gray-200"
              )}
            >
              <Icon className="w-5 h-5 mr-3" />
              <span className="font-medium">{item.label}</span>
            </button>
          )
        })}
      </nav>

      <div className="p-4 border-t">
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
              
            </>
          ) : (
            <>
              <Moon className="w-5 h-5 mr-2" />
        
            </>
          )}
        </button>
        
      </div>
      
      <div className="p-6 border-t dark:border-gray-700">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-semibold">СА</span>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Админ</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">admin@zevtabs.mn</p>
          </div>
        </div>
      </div>
    </div>
  )
}

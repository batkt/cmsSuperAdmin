'use client'

import { useState, useEffect, useCallback } from 'react'
import { LogOut, Zap } from 'lucide-react'
import {
  Sidebar,
  UserManagement,
  ProjectManagement,
  Login,
} from './index'
import CmsBuilder from './CmsBuilder'
import AdminDashboard from './AdminDashboard'
import { useAuthStore } from '@/stores/authStore'
import { useProjectStore } from '@/stores/projectStore'

type TabType = 'dashboard' | 'users' | 'projects' | 'cms'

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard')
  const [isDarkMode, setIsDarkMode] = useState(false)

  const { accessToken, user, clearSession } = useAuthStore()

  if (!accessToken) return <Login />

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <AdminDashboard isDarkMode={isDarkMode} />
      case 'users':
        return <UserManagement isDarkMode={isDarkMode} />
      case 'cms':
        return <CmsBuilder isDarkMode={isDarkMode} />
      case 'projects':
        return <ProjectManagement isDarkMode={isDarkMode} />
      default:
        return <AdminDashboard isDarkMode={isDarkMode} />
    }
  }

  return (
    <div className={`flex h-screen overflow-hidden ${isDarkMode ? 'dark bg-background' : 'bg-slate-50'}`}>
      <Sidebar
        activeTab={activeTab}
        setActiveTab={(tab) => setActiveTab(tab as TabType)}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        user={user}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header
          className={`flex items-center justify-between px-6 py-3 shrink-0 border-b shadow-sm ${isDarkMode ? 'bg-card border-slate-800/50' : 'bg-white border-slate-200'
            }`}
        >
          <div>
            <h2 className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              {/* {PAGE_TITLES[activeTab]} */}
            </h2>

          </div>

          <button
            id="topbar-logout"
            onClick={clearSession}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${isDarkMode
              ? 'text-red-400 hover:bg-red-900/20'
              : 'text-red-500 hover:bg-red-50'
              }`}
          >
            <LogOut className="w-3.5 h-3.5" />
            Гарах
          </button>
        </header>

        {/* Content */}
        <main className={`flex-1 overflow-hidden ${activeTab === 'cms' ? '' : 'overflow-auto'}`}>
          {renderContent()}
        </main>
      </div>
    </div>
  )
}

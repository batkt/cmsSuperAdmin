'use client'

import { useState, useEffect, useCallback, createContext, useContext } from 'react'
import { LogOut, Zap } from 'lucide-react'
import {
  Sidebar,
  UserManagement,
  WebsiteBuilder,
  ProjectManagement,
  Login,
} from './index'
import AdminDashboard from './AdminDashboard'

// API Context for sharing token and API URL across components
interface ApiContextType {
  token: string | null
  apiUrl: string
  logout: () => void
}

export const ApiContext = createContext<ApiContextType>({
  token: null,
  apiUrl: 'http://202.179.6.77:4000',
  logout: () => { },
})

export const useApi = () => useContext(ApiContext)

type TabType = 'dashboard' | 'users' | 'builder' | 'projects'

const PAGE_TITLES: Record<TabType, string> = {
  dashboard: 'Хянах самбар',
  projects: 'Төслийн удирдлага',
  users: 'Хэрэглэгчийн удирдлага',
  builder: 'Вэб бүтээгч',
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard')
  const [websiteName, setWebsiteName] = useState('My Project')
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null)
  const [editingProjectName, setEditingProjectName] = useState<string | undefined>(undefined)
  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const [apiUrl, setApiUrl] = useState('http://202.179.6.77:4000')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const savedToken = localStorage.getItem('superadminToken')
    const savedUser = localStorage.getItem('superadminUser')
    const savedApiUrl = localStorage.getItem('apiUrl')
    if (savedToken) {
      setToken(savedToken)
      if (savedUser) { try { setUser(JSON.parse(savedUser)) } catch { } }
    }
    if (savedApiUrl) setApiUrl(savedApiUrl)
    setIsLoading(false)
  }, [])

  const handleLogin = (newToken: string, newUser: any) => {
    setToken(newToken)
    setUser(newUser)
    localStorage.setItem('superadminToken', newToken)
    localStorage.setItem('superadminUser', JSON.stringify(newUser))
  }

  const handleLogout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('superadminToken')
    localStorage.removeItem('superadminUser')
    localStorage.removeItem('apiUrl')
  }

  const handleUseTemplate = (template: any) => {
    setSelectedTemplate(template)
    setEditingProjectName(undefined)
    setActiveTab('builder')
  }

  const handleEditProject = useCallback((projectName: string) => {
    setWebsiteName(projectName)
    setEditingProjectName(projectName)
    localStorage.setItem('currentProject', projectName)
    localStorage.setItem('projectName', projectName)
    setActiveTab('builder')
  }, [])

  useEffect(() => {
    const handleEditProjectEvent = (event: CustomEvent) => {
      const projectName = event.detail
      if (projectName) handleEditProject(projectName)
    }
    window.addEventListener('editProject' as any, handleEditProjectEvent)
    return () => window.removeEventListener('editProject' as any, handleEditProjectEvent)
  }, [handleEditProject])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#070b1a]">
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center animate-pulse"
            style={{ background: 'linear-gradient(135deg, hsl(238 84% 67%), hsl(262 83% 65%))' }}
          >
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div className="flex gap-1">
            {[0, 1, 2].map(i => (
              <div key={i} className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce"
                style={{ animationDelay: `${i * 150}ms` }} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!token) return <Login onLogin={handleLogin} />

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <AdminDashboard />
      case 'users':
        return <UserManagement isDarkMode={isDarkMode} />
      case 'builder':
        return (
          <WebsiteBuilder
            key={editingProjectName || 'new-builder'}
            websiteName={websiteName}
            isDarkMode={isDarkMode}
            template={selectedTemplate}
            apiUrl={apiUrl}
            token={token}
            initialProjectName={editingProjectName}
          />
        )
      case 'projects':
        return <ProjectManagement isDarkMode={isDarkMode} onEditProject={handleEditProject} />
      default:
        return <AdminDashboard />
    }
  }

  return (
    <ApiContext.Provider value={{ token, apiUrl, logout: handleLogout }}>
      <div className={`flex h-screen overflow-hidden ${isDarkMode ? 'dark' : ''}`}
        style={{ background: isDarkMode ? 'hsl(224 71% 4%)' : 'hsl(220 20% 98%)' }}>
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
            className="flex items-center justify-between px-6 py-3 shrink-0"
            style={{
              background: isDarkMode ? 'hsl(224 50% 7%)' : 'white',
              borderBottom: isDarkMode ? '1px solid rgba(255,255,255,0.05)' : '1px solid hsl(220 13% 91%)',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}
          >
            <div>
              <h2 className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                {/* {PAGE_TITLES[activeTab]} */}
              </h2>
              <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                {activeTab === 'builder' && editingProjectName
                  ? `Засаж байна: ${editingProjectName}`
                  : ''}
              </p>
            </div>

            <button
              id="topbar-logout"
              onClick={handleLogout}
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
          <main className="flex-1 overflow-auto">
            {renderContent()}
          </main>
        </div>
      </div>
    </ApiContext.Provider>
  )
}

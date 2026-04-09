'use client'

import { useState, useEffect, createContext, useContext } from 'react'
import { LogOut } from 'lucide-react'
import {
  Sidebar,
  UserManagement,
  WebsiteBuilder,
  TemplateLibrary,
  ProjectManagement,
  Login,
} from './index'

// API Context for sharing token and API URL across components
interface ApiContextType {
  token: string | null
  apiUrl: string
  logout: () => void
}

export const ApiContext = createContext<ApiContextType>({
  token: null,
  apiUrl: 'http://202.179.6.77:4000',
  logout: () => {},
})

export const useApi = () => useContext(ApiContext)

type TabType = 'users' | 'builder' | 'templates' | 'projects'

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('projects')
  const [websiteName, setWebsiteName] = useState('My Project')
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null)
  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const [apiUrl, setApiUrl] = useState('http://202.179.6.77:4000')
  const [isLoading, setIsLoading] = useState(true)

  // Check for existing session on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('superadminToken')
    const savedUser = localStorage.getItem('superadminUser')
    const savedApiUrl = localStorage.getItem('apiUrl')
    if (savedToken) {
      setToken(savedToken)
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser))
        } catch {}
      }
    }
    if (savedApiUrl) {
      setApiUrl(savedApiUrl)
    }
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
    setActiveTab('builder')
  }

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-black">Ачаалж байна...</p>
        </div>
      </div>
    )
  }

  // If not logged in, show login
  if (!token) {
    return <Login onLogin={handleLogin} />
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'users':
        return <UserManagement isDarkMode={isDarkMode} />
      case 'builder':
        return (
          <WebsiteBuilder 
            websiteName={websiteName} 
            isDarkMode={isDarkMode}
            template={selectedTemplate}
            apiUrl={apiUrl}
            token={token}
          />
        )
      case 'templates':
        return <TemplateLibrary isDarkMode={isDarkMode} onUseTemplate={handleUseTemplate} />
      case 'projects':
        return <ProjectManagement isDarkMode={isDarkMode} />
      default:
        return (
          <div className={`p-8 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white/90 backdrop-blur text-gray-900'}`}>
            <h1 className="text-3xl font-bold mb-6">Хянах самбар</h1>
            <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Тавтай морил, {user?.email || 'Супер Админ'}</p>
          </div>
        )
    }
  }

  return (
    <ApiContext.Provider value={{ token, apiUrl, logout: handleLogout }}>
      <div className={`flex h-screen ${isDarkMode ? 'dark bg-gray-900' : 'bg-white'}`}>
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={(tab) => setActiveTab(tab as TabType)}
          websiteName={websiteName}
          setWebsiteName={setWebsiteName}
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
          user={user}
        />
        <div className="flex-1 overflow-auto flex flex-col">
          {/* Header with logout */}
          <div className={`flex justify-between items-center px-6 py-4 border-b ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
           
            <button
              onClick={handleLogout}
              className={`flex items-end gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isDarkMode 
                  ? 'text-red-400 hover:bg-red-900/30' 
                  : 'text-red-600 hover:bg-red-50'
              }`}
            >
              <LogOut className="w-4 h-4" />
              Гарах
            </button>
          </div>
          <div className="flex-1 overflow-auto">
            {renderContent()}
          </div>
        </div>
      </div>
    </ApiContext.Provider>
  )
}

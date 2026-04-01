'use client'

import { useState } from 'react'
import Sidebar from './Sidebar'
import UserManagement from './UserManagement'
import WebsiteBuilder from './WebsiteBuilder'
import TemplateLibrary from './TemplateLibrary'

type TabType = 'users' | 'builder' | 'templates'

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('users')
  const [websiteName, setWebsiteName] = useState('Миний вэбсайт')
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null)

  const handleUseTemplate = (template: any) => {
    setSelectedTemplate(template)
    setActiveTab('builder')
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'users':
        return <UserManagement isDarkMode={isDarkMode} />
      case 'builder':
        return <WebsiteBuilder websiteName={websiteName} isDarkMode={isDarkMode} template={selectedTemplate} />
      case 'templates':
        return <TemplateLibrary isDarkMode={isDarkMode} onUseTemplate={handleUseTemplate} />
      default:
        return <UserManagement />
    }
  }

  return (
    <div className={`flex h-screen ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-100'}`}>
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={(tab) => setActiveTab(tab as TabType)}
        websiteName={websiteName}
        setWebsiteName={setWebsiteName}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
      />
      <div className="flex-1 overflow-auto">
        {renderContent()}
      </div>
    </div>
  )
}

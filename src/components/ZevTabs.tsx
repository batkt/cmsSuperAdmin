'use client'

import React from 'react'

interface Tab {
  id: string
  label: string
  icon?: React.ReactNode
}

interface ZevTabsProps {
  tabs: Tab[]
  activeTab: string
  onTabChange: (tabId: string) => void
  variant?: 'pill' | 'underline' | 'glass'
  className?: string
}

export default function ZevTabs({
  tabs,
  activeTab,
  onTabChange,
  variant = 'glass',
  className = '',
}: ZevTabsProps) {
  const variantStyles = {
    pill: 'bg-gray-100/50 p-1.5 rounded-2xl',
    underline: 'border-b border-white/10',
    glass: 'bg-white/10 backdrop-blur-xl p-1.5 rounded-2xl border border-white/20 shadow-lg',
  }

  const tabStyles = {
    pill: {
      base: 'px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300',
      inactive: 'text-gray-500 hover:text-gray-700 hover:bg-white/50',
      active: 'bg-white text-gray-900 shadow-sm',
    },
    underline: {
      base: 'px-5 py-3 text-sm font-medium transition-all duration-300 border-b-2',
      inactive: 'text-white/60 hover:text-white border-transparent',
      active: 'text-white border-white',
    },
    glass: {
      base: 'px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 relative overflow-hidden',
      inactive: 'text-white/70 hover:text-white hover:bg-white/10',
      active: 'text-gray-900 bg-white shadow-lg',
    },
  }

  const styles = tabStyles[variant]

  return (
    <div className={`${variantStyles[variant]} ${className}`}>
      <div className="flex gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              ${styles.base}
              ${activeTab === tab.id ? styles.active : styles.inactive}
              flex items-center gap-2
            `}
          >
            {tab.icon && <span className="w-4 h-4">{tab.icon}</span>}
            <span>{tab.label}</span>
            {variant === 'glass' && activeTab === tab.id && (
              <span className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl" />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

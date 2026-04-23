'use client'

import { useState, useEffect } from 'react'
import {
  LayoutDashboard, FolderOpen, Users, Boxes,
  Sun, Moon, Zap, ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  isDarkMode: boolean
  setIsDarkMode: (dark: boolean) => void
  user?: any
}

const menuItems = [
  { id: 'dashboard', label: 'Хянах самбар', icon: LayoutDashboard, badge: null },
  { id: 'projects', label: 'Төслүүд', icon: FolderOpen, badge: null },
  { id: 'users', label: 'Хэрэглэгчид', icon: Users, badge: null },
  { id: 'builder', label: 'Вэб бүтээгч', icon: Boxes, badge: 'Builder' },
]

const getInitials = (email?: string) =>
  email ? email.slice(0, 2).toUpperCase() : 'SA'

export default function Sidebar({
  activeTab, setActiveTab, isDarkMode, setIsDarkMode, user,
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  // auto collapse on full-screen tabs
  useEffect(() => {
    if (activeTab === 'builder') setIsCollapsed(true)
    else setIsCollapsed(false)
  }, [activeTab])

  return (
    <aside
      className={cn(
        "flex flex-col h-full shrink-0 relative transition-all duration-300",
        isCollapsed ? "w-[72px]" : "w-[220px]",
        isDarkMode ? "bg-[#070b1a] border-r border-white/5" : "bg-white border-r border-slate-200"
      )}
    >
      {/* Collapse toggle button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className={cn(
          "absolute -right-3 top-6 w-6 h-6 rounded-full flex items-center justify-center border shadow-sm z-50 transition-transform",
          isDarkMode ? "bg-slate-800 border-white/10 text-slate-300 hover:bg-slate-700" : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50",
          isCollapsed ? "rotate-180" : ""
        )}
      >
        <ChevronRight className="w-3.5 h-3.5 -ml-0.5" />
      </button>

      {/* Top ambient glow */}
      {isDarkMode && (
        <div
          className="absolute top-0 left-0 right-0 h-32 opacity-30 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 0%, hsl(238 84% 67% / 0.4), transparent 70%)' }}
        />
      )}

      {/* Brand */}
      <div className={cn("px-5 pt-6 pb-5 flex items-center relative", isCollapsed ? "justify-center px-0" : "gap-3")}>
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/20"
          style={{ background: 'linear-gradient(135deg, hsl(238 84% 67%), hsl(262 83% 65%))' }}
        >
          <Zap className="w-4 h-4 text-white" />
        </div>
        {!isCollapsed && (
          <div className="whitespace-nowrap overflow-hidden">
            <p className={cn("text-sm font-bold tracking-tight leading-none", isDarkMode ? "text-white" : "text-slate-900")}>Zevtabs</p>
            <p className={cn("text-[10px] mt-0.5 font-medium", isDarkMode ? "text-slate-500" : "text-slate-400")}>Super Admin</p>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className={cn("mx-4 h-px mb-2", isDarkMode ? "bg-white/5" : "bg-slate-100")} />

      {/* Nav items */}
      <nav className="flex-1 px-2 space-y-0.5 overflow-hidden">
        {menuItems.map(item => {
          const Icon = item.icon
          const active = activeTab === item.id
          return (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                'w-full flex items-center px-3 py-2.5 rounded-xl transition-all duration-200 relative group',
                isCollapsed ? 'justify-center' : 'gap-3 text-left',
                active
                  ? (isDarkMode ? 'text-white' : 'text-indigo-600')
                  : (isDarkMode ? 'text-slate-500 hover:text-slate-200 hover:bg-white/5' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'),
              )}
              style={active ? {
                background: isDarkMode 
                  ? 'linear-gradient(135deg, hsl(238 84% 67% / 0.25), hsl(262 83% 65% / 0.15))'
                  : 'linear-gradient(135deg, hsl(238 84% 67% / 0.1), hsl(262 83% 65% / 0.05))',
                border: isDarkMode ? '1px solid rgba(99,102,241,0.2)' : '1px solid rgba(99,102,241,0.1)',
              } : { border: '1px solid transparent' }}
              title={isCollapsed ? item.label : undefined}
            >
              {/* Active glow line */}
              {active && (
                <span
                  className="absolute right-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-l-full"
                  style={{ background: 'hsl(238 84% 67%)' }}
                />
              )}
              <Icon className={cn('w-4 h-4 shrink-0', active ? (isDarkMode ? 'text-indigo-400' : 'text-indigo-600') : (isDarkMode ? 'text-slate-500 group-hover:text-slate-300' : 'text-slate-400 group-hover:text-slate-600'))} />
              
              {!isCollapsed && (
                <>
                  <span className="text-sm font-medium flex-1 whitespace-nowrap">{item.label}</span>
                  {active && <ChevronRight className={cn("w-3 h-3 shrink-0", isDarkMode ? "text-indigo-400/60" : "text-indigo-600/60")} />}
                  {item.badge && !active && (
                    <span className={cn(
                      "text-[9px] font-bold px-1.5 py-0.5 rounded-full",
                      isDarkMode ? "bg-indigo-500/20 text-indigo-400" : "bg-indigo-50 text-indigo-600"
                    )}>
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </button>
          )
        })}
      </nav>

      {/* Spacer */}
      <div className={cn("py-3 space-y-2", isCollapsed ? "px-2" : "px-4")}>
        {/* Dark/light toggle */}
        <button
          id="sidebar-theme-toggle"
          onClick={() => setIsDarkMode(!isDarkMode)}
          className={cn(
            "w-full flex items-center rounded-xl transition-all duration-200 text-sm",
            isCollapsed ? "justify-center p-2.5" : "gap-2.5 px-3 py-2",
            isDarkMode 
              ? "text-slate-500 hover:text-slate-300 hover:bg-white/5" 
              : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
          )}
          title={isDarkMode ? "Цайвар горим" : "Харанхуй горим"}
        >
          {isDarkMode
            ? <><Sun className="w-4 h-4 shrink-0" />{!isCollapsed && <span className="whitespace-nowrap">Цайвар горим</span>}</>
            : <><Moon className="w-4 h-4 shrink-0" />{!isCollapsed && <span className="whitespace-nowrap">Харанхуй горим</span>}</>
          }
        </button>

        {/* Divider */}
        <div className={cn("h-px", isDarkMode ? "bg-white/5" : "bg-slate-100", isCollapsed ? "mx-2" : "")} />

        {/* User */}
        <div className={cn("flex items-center", isCollapsed ? "justify-center px-0 py-2" : "gap-2.5 px-3 py-2")}>
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold text-white shrink-0 shadow-sm"
            style={{ background: 'linear-gradient(135deg, hsl(238 84% 67%), hsl(262 83% 65%))' }}
          >
            {getInitials(user?.email)}
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className={cn("text-[11px] font-semibold truncate", isDarkMode ? "text-slate-300" : "text-slate-700")}>
                {user?.email || 'Super Admin'}
              </p>
              <p className={cn("text-[9px]", isDarkMode ? "text-slate-600" : "text-slate-400")}>superadmin</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}

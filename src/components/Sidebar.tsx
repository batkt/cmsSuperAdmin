'use client'

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
  return (
    <aside
      className={cn(
        "w-[220px] flex flex-col h-full shrink-0 relative transition-colors duration-300",
        isDarkMode ? "bg-[#070b1a] border-r border-white/5" : "bg-white border-r border-slate-200"
      )}
    >
      {/* Top ambient glow */}
      {isDarkMode && (
        <div
          className="absolute top-0 left-0 right-0 h-32 opacity-30 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 0%, hsl(238 84% 67% / 0.4), transparent 70%)' }}
        />
      )}

      {/* Brand */}
      <div className="px-5 pt-6 pb-5 flex items-center gap-3 relative">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/20"
          style={{ background: 'linear-gradient(135deg, hsl(238 84% 67%), hsl(262 83% 65%))' }}
        >
          <Zap className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className={cn("text-sm font-bold tracking-tight leading-none", isDarkMode ? "text-white" : "text-slate-900")}>Zevtabs</p>
          <p className={cn("text-[10px] mt-0.5 font-medium", isDarkMode ? "text-slate-500" : "text-slate-400")}>Super Admin</p>
        </div>
      </div>

      {/* Divider */}
      <div className={cn("mx-4 h-px mb-2", isDarkMode ? "bg-white/5" : "bg-slate-100")} />

      {/* Nav items */}
      <nav className="flex-1 px-2 space-y-0.5">
        {menuItems.map(item => {
          const Icon = item.icon
          const active = activeTab === item.id
          return (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200 relative group',
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
            >
              {/* Active glow line */}
              {active && (
                <span
                  className="absolute right-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-l-full"
                  style={{ background: 'hsl(238 84% 67%)' }}
                />
              )}
              <Icon className={cn('w-4 h-4 shrink-0', active ? (isDarkMode ? 'text-indigo-400' : 'text-indigo-600') : (isDarkMode ? 'text-slate-500 group-hover:text-slate-300' : 'text-slate-400 group-hover:text-slate-600'))} />
              <span className="text-sm font-medium flex-1">{item.label}</span>
              {active && <ChevronRight className={cn("w-3 h-3", isDarkMode ? "text-indigo-400/60" : "text-indigo-600/60")} />}
              {item.badge && !active && (
                <span className={cn(
                  "text-[9px] font-bold px-1.5 py-0.5 rounded-full",
                  isDarkMode ? "bg-indigo-500/20 text-indigo-400" : "bg-indigo-50 text-indigo-600"
                )}>
                  {item.badge}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      {/* Spacer */}
      <div className="px-4 py-3 space-y-2">
        {/* Dark/light toggle */}
        <button
          id="sidebar-theme-toggle"
          onClick={() => setIsDarkMode(!isDarkMode)}
          className={cn(
            "w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all duration-200 text-sm",
            isDarkMode 
              ? "text-slate-500 hover:text-slate-300 hover:bg-white/5" 
              : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
          )}
        >
          {isDarkMode
            ? <><Sun className="w-4 h-4" /><span>Цайвар горим</span></>
            : <><Moon className="w-4 h-4" /><span>Харанхуй горим</span></>
          }
        </button>

        {/* Divider */}
        <div className={cn("h-px", isDarkMode ? "bg-white/5" : "bg-slate-100")} />

        {/* User */}
        <div className="flex items-center gap-2.5 px-3 py-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold text-white shrink-0 shadow-sm"
            style={{ background: 'linear-gradient(135deg, hsl(238 84% 67%), hsl(262 83% 65%))' }}
          >
            {getInitials(user?.email)}
          </div>
          <div className="flex-1 min-w-0">
            <p className={cn("text-[11px] font-semibold truncate", isDarkMode ? "text-slate-300" : "text-slate-700")}>
              {user?.email || 'Super Admin'}
            </p>
            <p className={cn("text-[9px]", isDarkMode ? "text-slate-600" : "text-slate-400")}>superadmin</p>
          </div>
        </div>
      </div>
    </aside>
  )
}

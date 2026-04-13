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
      className="w-[220px] flex flex-col h-full shrink-0 relative"
      style={{
        background: 'hsl(226 57% 8%)',
        borderRight: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      {/* Top ambient glow */}
      <div
        className="absolute top-0 left-0 right-0 h-32 opacity-30 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 0%, hsl(238 84% 67% / 0.4), transparent 70%)' }}
      />

      {/* Brand */}
      <div className="px-5 pt-6 pb-5 flex items-center gap-3 relative">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: 'linear-gradient(135deg, hsl(238 84% 67%), hsl(262 83% 65%))' }}
        >
          <Zap className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-white text-sm font-bold tracking-tight leading-none">Zevtabs</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Super Admin</p>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-4 h-px bg-white/5 mb-2" />

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
                  ? 'text-white'
                  : 'text-slate-500 hover:text-slate-200 hover:bg-white/5',
              )}
              style={active ? {
                background: 'linear-gradient(135deg, hsl(238 84% 67% / 0.25), hsl(262 83% 65% / 0.15))',
                border: '1px solid rgba(99,102,241,0.2)',
              } : { border: '1px solid transparent' }}
            >
              {/* Active glow line */}
              {active && (
                <span
                  className="absolute right-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-l-full"
                  style={{ background: 'hsl(238 84% 67%)' }}
                />
              )}
              <Icon className={cn('w-4 h-4 shrink-0', active ? 'text-indigo-400' : '')} />
              <span className="text-sm font-medium flex-1">{item.label}</span>
              {active && <ChevronRight className="w-3 h-3 text-indigo-400/60" />}
              {item.badge && !active && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400">
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
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-all duration-200 text-sm"
        >
          {isDarkMode
            ? <><Sun className="w-4 h-4" /><span>Цайвар горим</span></>
            : <><Moon className="w-4 h-4" /><span>Харанхуй горим</span></>
          }
        </button>

        {/* Divider */}
        <div className="h-px bg-white/5" />

        {/* User */}
        <div className="flex items-center gap-2.5 px-3 py-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold text-white shrink-0"
            style={{ background: 'linear-gradient(135deg, hsl(238 84% 67%), hsl(262 83% 65%))' }}
          >
            {getInitials(user?.email)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-medium text-slate-300 truncate">
              {user?.email || 'Super Admin'}
            </p>
            <p className="text-[9px] text-slate-600">superadmin</p>
          </div>
        </div>
      </div>
    </aside>
  )
}

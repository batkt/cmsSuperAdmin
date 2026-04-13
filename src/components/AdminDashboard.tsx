'use client'

import { useState, useEffect } from 'react'
import {
  FolderOpen, Users, Activity, TrendingUp,
  CheckCircle, XCircle, Loader2, RefreshCw,
  Server, Globe, Database, Boxes, Plus,
  ArrowUpRight,
} from 'lucide-react'
import { projectApi, userApi } from '@/lib/api-service'

interface Project {
  name: string
  port: number
  status: 'running' | 'stopped' | 'error' | 'building'
  dbName: string
  dbStatus: string
  url?: string
}

interface User {
  email: string
  role: string
  bindings?: any[]
}

interface StatCardProps {
  label: string
  value: number | string
  icon: React.ElementType
  color: string
  bg: string
  trend?: string
  delay?: number
}

function StatCard({ label, value, icon: Icon, color, bg, trend, delay = 0, isDarkMode }: StatCardProps & { isDarkMode: boolean }) {
  return (
    <div
      className="rounded-2xl p-5 animate-fade-in-up"
      style={{
        background: isDarkMode ? 'hsl(var(--surface))' : 'white',
        border: `1px solid ${isDarkMode ? 'var(--border)' : '#e2e8f0'}`,
        boxShadow: isDarkMode ? 'none' : '0 1px 4px rgba(0,0,0,0.06)',
        animationDelay: `${delay}ms`,
      }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className={`text-xs font-medium mb-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{label}</p>
          <p className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{value}</p>
          {trend && (
            <p className={`text-xs font-medium mt-1.5 flex items-center gap-1 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
              <TrendingUp className="w-3 h-3" />
              {trend}
            </p>
          )}
        </div>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${isDarkMode ? 'bg-slate-800' : bg}`}>
          <Icon className={`w-5 h-5 ${isDarkMode ? 'text-indigo-400' : color}`} />
        </div>
      </div>
    </div>
  )
}

function SkeletonCard({ isDarkMode }: { isDarkMode: boolean }) {
  return (
    <div className={`rounded-2xl p-5 border animate-pulse ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-100'}`}>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className={`h-3 rounded w-20 ${isDarkMode ? 'bg-slate-700' : 'bg-slate-100'}`} />
          <div className={`h-8 rounded w-12 ${isDarkMode ? 'bg-slate-700' : 'bg-slate-100'}`} />
        </div>
        <div className={`h-11 w-11 rounded-xl ${isDarkMode ? 'bg-slate-700' : 'bg-slate-100'}`} />
      </div>
    </div>
  )
}

const statusConfig = {
  running: { label: 'Ажиллаж байгаа', dot: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50' },
  stopped: { label: 'Зогссон', dot: 'bg-slate-400', text: 'text-slate-600', bg: 'bg-slate-50' },
  error: { label: 'Алдаа', dot: 'bg-red-500', text: 'text-red-700', bg: 'bg-red-50' },
  building: { label: 'Угсарч байна', dot: 'bg-blue-500', text: 'text-blue-700', bg: 'bg-blue-50' },
}

export default function AdminDashboard({ isDarkMode }: { isDarkMode: boolean }) {
  const [projects, setProjects] = useState<Project[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())
  const [isRefreshing, setIsRefreshing] = useState(false)

  const load = async (quiet = false) => {
    if (!quiet) setIsLoading(true)
    else setIsRefreshing(true)
    try {
      const [projRes, userRes] = await Promise.allSettled([
        projectApi.list(),
        userApi.list(),
      ])
      if (projRes.status === 'fulfilled') {
        const p = projRes.value.projects || projRes.value.data?.projects || projRes.value || []
        setProjects(Array.isArray(p) ? p : [])
      }
      if (userRes.status === 'fulfilled') {
        const u = userRes.value.data?.users || userRes.value.users || userRes.value || []
        setUsers(Array.isArray(u) ? u : [])
      }
      setLastRefresh(new Date())
    } catch { /* silent */ } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => { load() }, [])
  // Auto-refresh every 30 s
  useEffect(() => {
    const t = setInterval(() => load(true), 30_000)
    return () => clearInterval(t)
  }, [])

  const running = projects.filter(p => p.status === 'running').length
  const stopped = projects.filter(p => p.status === 'stopped').length
  const building = projects.filter(p => p.status === 'building').length
  const clients = users.filter(u => u.role !== 'superadmin').length

  const recentProjects = [...projects].slice(0, 6)
  const recentUsers = [...users].slice(0, 5)

  return (
    <div className={`min-h-screen p-6 transition-colors duration-300 ${isDarkMode ? 'bg-background' : 'bg-slate-50'}`}>
      {/* Page header */}
      <div className="flex items-center justify-between mb-8">
        <div className="animate-slide-in-left">
          <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Хянах самбар</h1>
          <p className={`text-sm mt-0.5 ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
            Сүүлд шинэчлэгдсэн: {lastRefresh.toLocaleTimeString()}
          </p>
        </div>
        <button
          id="dashboard-refresh"
          onClick={() => load(true)}
          disabled={isRefreshing}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 shadow-sm disabled:opacity-50 ${isDarkMode
              ? 'bg-slate-800 border-slate-700 text-slate-300 hover:border-indigo-500 hover:text-indigo-400'
              : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600'
            }`}
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Шинэчлэх
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {isLoading ? (
          [...Array(4)].map((_, i) => <SkeletonCard key={i} isDarkMode={isDarkMode} />)
        ) : (
          <>
            <StatCard
              label="Нийт төсөл"
              value={projects.length}
              icon={FolderOpen}
              color="text-indigo-600"
              bg="bg-indigo-50"
              trend={`${running} ажиллаж байна`}
              delay={0}
              isDarkMode={isDarkMode}
            />
            <StatCard
              label="Ажиллаж байгаа"
              value={running}
              icon={Activity}
              color="text-emerald-600"
              bg="bg-emerald-50"
              delay={60}
              isDarkMode={isDarkMode}
            />
            <StatCard
              label="Нийт хэрэглэгч"
              value={users.length}
              icon={Users}
              color="text-violet-600"
              bg="bg-violet-50"
              trend={`${clients} харилцагч`}
              delay={120}
              isDarkMode={isDarkMode}
            />
            <StatCard
              label="Зогссон"
              value={stopped}
              icon={Server}
              color="text-amber-600"
              bg="bg-amber-50"
              delay={180}
              isDarkMode={isDarkMode}
            />
          </>
        )}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Project health donut-like bar */}
        <div className={`lg:col-span-2 rounded-2xl border p-6 shadow-sm animate-fade-in-up ${isDarkMode ? 'bg-card border-slate-800' : 'bg-white border-slate-100'}`} style={{ animationDelay: '200ms' }}>
          <div className="flex items-center justify-between mb-5">
            <h2 className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Төслийн төлөв</h2>
            <span className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Нийт {projects.length}</span>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex items-center justify-between mb-1">
                    <div className={`h-3 rounded w-16 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`} />
                    <div className={`h-3 rounded w-8 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`} />
                  </div>
                  <div className={`h-2 rounded-full ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`} />
                </div>
              ))}
            </div>
          ) : projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Server className={`w-10 h-10 mb-3 ${isDarkMode ? 'text-slate-700' : 'text-slate-200'}`} />
              <p className={`text-sm ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Төсөл алга</p>
            </div>
          ) : (
            <div className="space-y-4">
              {(
                [
                  { label: 'Ажиллаж байгаа', count: running, color: '#10b981', bg: 'bg-emerald-500' },
                  { label: 'Зогссон', count: stopped, color: '#94a3b8', bg: 'bg-slate-400' },
                  { label: 'Угсарч байна', count: building, color: '#3b82f6', bg: 'bg-blue-500' },
                ] as const
              ).map(item => (
                <div key={item.label}>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${item.bg}`} />
                      <span className={`font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{item.label}</span>
                    </div>
                    <span className={`${isDarkMode ? 'text-slate-400' : 'text-slate-500'} font-medium`}>
                      {item.count} <span className="opacity-40">/ {projects.length}</span>
                    </span>
                  </div>
                  <div className={`h-2 rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: projects.length ? `${(item.count / projects.length) * 100}%` : '0%',
                        background: item.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* User breakdown */}
        <div className={`rounded-2xl border p-6 shadow-sm animate-fade-in-up ${isDarkMode ? 'bg-card border-slate-800' : 'bg-white border-slate-100'}`} style={{ animationDelay: '260ms' }}>
          <div className="flex items-center justify-between mb-5">
            <h2 className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Хэрэглэгчийн эрх</h2>
          </div>
          {isLoading ? (
            <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className={`h-10 animate-pulse rounded-xl ${isDarkMode ? 'bg-slate-800' : 'bg-slate-50'}`} />)}</div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Users className={`w-10 h-10 mb-3 ${isDarkMode ? 'text-slate-700' : 'text-slate-200'}`} />
              <p className={`text-sm ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Хэрэглэгч алга</p>
            </div>
          ) : (
            <div className="space-y-2">
              {(['superadmin', 'client-admin', 'editor'] as const).map(role => {
                const count = users.filter(u => u.role === role).length
                if (!count) return null
                const styles = {
                  superadmin: {
                    label: 'Супер Админ',
                    color: isDarkMode ? 'bg-violet-900/20 text-violet-300 border-violet-800/30' : 'bg-violet-50 text-violet-700 border-violet-100'
                  },
                  'client-admin': {
                    label: 'Харилцагч Админ',
                    color: isDarkMode ? 'bg-indigo-900/20 text-indigo-300 border-indigo-800/30' : 'bg-indigo-50 text-indigo-700 border-indigo-100'
                  },
                  editor: {
                    label: 'Засварлагч',
                    color: isDarkMode ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-slate-50 text-slate-700 border-slate-100'
                  },
                }
                const s = styles[role]
                return (
                  <div key={role} className={`flex items-center justify-between px-3 py-2.5 rounded-xl border text-xs font-medium ${s.color}`}>
                    <span>{s.label}</span>
                    <span className="font-bold text-sm">{count}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recent tables row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Projects */}
        <div className={`rounded-2xl border shadow-sm animate-fade-in-up ${isDarkMode ? 'bg-card border-slate-800' : 'bg-white border-slate-100'}`} style={{ animationDelay: '320ms' }}>
          <div className={`px-6 py-4 border-b flex items-center justify-between ${isDarkMode ? 'border-slate-800' : 'border-slate-50'}`}>
            <h2 className={`text-sm font-semibold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              <FolderOpen className="w-4 h-4 text-indigo-500" />
              Сүүлийн төслүүд
            </h2>
            <button className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1 font-medium">
              Бүгдийг үзэх <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
          <div className={`divide-y ${isDarkMode ? 'divide-slate-800' : 'divide-slate-50'}`}>
            {isLoading ? (
              [...Array(4)].map((_, i) => (
                <div key={i} className="px-6 py-3 flex items-center justify-between animate-pulse">
                  <div className="space-y-1">
                    <div className={`h-3 rounded w-28 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`} />
                    <div className={`h-2.5 rounded w-16 ${isDarkMode ? 'bg-slate-800/50' : 'bg-slate-50'}`} />
                  </div>
                  <div className={`h-5 rounded-full w-16 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`} />
                </div>
              ))
            ) : recentProjects.length === 0 ? (
              <div className="px-6 py-8 text-center">
                <p className={`text-sm ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Төсөл алга</p>
              </div>
            ) : (
              recentProjects.map(p => {
                const cfg = statusConfig[p.status] || statusConfig.stopped
                return (
                  <div key={p.name} className={`px-6 py-3 flex items-center justify-between transition-colors ${isDarkMode ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50/50'}`}>
                    <div>
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{p.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Globe className="w-3 h-3 text-slate-400" />
                        <span className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Порт {p.port}</span>
                        <Database className="w-3 h-3 text-slate-400" />
                        <span className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>{p.dbStatus}</span>
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${isDarkMode ? (p.status === 'running' ? 'bg-emerald-900/30 text-emerald-400' : 'bg-slate-800 text-slate-400') : (cfg.bg + ' ' + cfg.text)}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} ${p.status === 'running' ? 'animate-pulse' : ''}`} />
                      {cfg.label}
                    </span>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Recent Users */}
        <div className={`rounded-2xl border shadow-sm animate-fade-in-up ${isDarkMode ? 'bg-card border-slate-800' : 'bg-white border-slate-100'}`} style={{ animationDelay: '380ms' }}>
          <div className={`px-6 py-4 border-b flex items-center justify-between ${isDarkMode ? 'border-slate-800' : 'border-slate-50'}`}>
            <h2 className={`text-sm font-semibold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              <Users className="w-4 h-4 text-violet-500" />
              Сүүлийн хэрэглэгчид
            </h2>
            <button className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1 font-medium">
              Бүгдийг үзэх <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
          <div className={`divide-y ${isDarkMode ? 'divide-slate-800' : 'divide-slate-50'}`}>
            {isLoading ? (
              [...Array(4)].map((_, i) => (
                <div key={i} className="px-6 py-3 flex items-center gap-3 animate-pulse">
                  <div className={`h-8 w-8 rounded-full ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`} />
                  <div className="space-y-1 flex-1">
                    <div className={`h-3 rounded w-36 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`} />
                    <div className={`h-2.5 rounded w-20 ${isDarkMode ? 'bg-slate-800/50' : 'bg-slate-50'}`} />
                  </div>
                  <div className={`h-5 rounded-full w-20 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`} />
                </div>
              ))
            ) : recentUsers.length === 0 ? (
              <div className="px-6 py-8 text-center">
                <p className={`text-sm ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Хэрэглэгч алга</p>
              </div>
            ) : (
              recentUsers.map(u => {
                const initials = u.email.slice(0, 2).toUpperCase()
                const roleMap: Record<string, { label: string; color: string }> = {
                  superadmin: { label: 'Супер Админ', color: isDarkMode ? 'bg-violet-900/30 text-violet-300' : 'bg-violet-50 text-violet-700' },
                  'client-admin': { label: 'Харилцагч Админ', color: isDarkMode ? 'bg-indigo-900/30 text-indigo-300' : 'bg-indigo-50 text-indigo-700' },
                  editor: { label: 'Засварлагч', color: isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-50 text-slate-600' },
                }
                const r = roleMap[u.role] || { label: u.role, color: 'bg-slate-50 text-slate-600' }
                return (
                  <div key={u.email} className={`px-6 py-3 flex items-center gap-3 transition-colors ${isDarkMode ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50/50'}`}>
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-lg"
                      style={{ background: 'linear-gradient(135deg, hsl(238 84% 67%), hsl(262 83% 65%))' }}
                    >
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{u.email}</p>
                      <p className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                        {((u as any).bindings?.length ?? 0)} төсөл холбогдсон
                      </p>
                    </div>
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${r.color}`}>
                      {r.label}
                    </span>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'
import {
  Trash2, Play, Square, Loader2, Server,
  Globe, Database, ExternalLink, RefreshCw,
  CheckCircle, XCircle, Edit3, Plus, AlertCircle,
  Activity,
} from 'lucide-react'
import { api } from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'

interface ProjectManagementProps {
  isDarkMode: boolean
  onEditProject?: (projectName: string) => void
}

interface Project {
  name: string
  port: number
  status: 'running' | 'stopped' | 'error' | 'building'
  path: string
  dbName: string
  dbStatus: string
  url?: string
  owner?: string
}

const statusConfig = {
  running: { label: 'Ажиллаж байгаа', icon: Activity, dot: 'bg-emerald-400', card: 'border-emerald-100', badge: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' },
  stopped: { label: 'Зогссон', icon: XCircle, dot: 'bg-slate-400', card: 'border-slate-100', badge: 'bg-slate-500/10 text-slate-400 border border-slate-500/20' },
  error: { label: 'Алдаа', icon: AlertCircle, dot: 'bg-red-400', card: 'border-red-100', badge: 'bg-red-500/10 text-red-400 border border-red-500/20' },
  building: { label: 'Угсарч байна', icon: Loader2, dot: 'bg-blue-400', card: 'border-blue-100', badge: 'bg-blue-500/10 text-blue-400 border border-blue-500/20' },
}

function SkeletonCard({ isDarkMode }: { isDarkMode: boolean }) {
  return (
    <div className={`rounded-2xl border p-5 animate-pulse ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-100'}`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`h-4 rounded w-32 ${isDarkMode ? 'bg-slate-700' : 'bg-slate-100'}`} />
        <div className={`h-5 rounded-full w-20 ${isDarkMode ? 'bg-slate-700' : 'bg-slate-100'}`} />
      </div>
      <div className="space-y-2">
        <div className={`h-3 rounded w-24 ${isDarkMode ? 'bg-slate-700' : 'bg-slate-50'}`} />
        <div className={`h-3 rounded w-20 ${isDarkMode ? 'bg-slate-700' : 'bg-slate-50'}`} />
      </div>
      <div className={`mt-4 pt-4 border-t flex justify-end gap-2 ${isDarkMode ? 'border-slate-700' : 'border-slate-50'}`}>
        <div className={`h-7 rounded-lg w-16 ${isDarkMode ? 'bg-slate-700' : 'bg-slate-100'}`} />
        <div className={`h-7 rounded-lg w-7 ${isDarkMode ? 'bg-slate-700' : 'bg-slate-100'}`} />
        <div className={`h-7 rounded-lg w-7 ${isDarkMode ? 'bg-slate-700' : 'bg-slate-100'}`} />
      </div>
    </div>
  )
}

export default function ProjectManagement({ isDarkMode, onEditProject }: ProjectManagementProps) {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionInProgress, setActionInProgress] = useState<string | null>(null)
  const [users, setUsers] = useState<{ email: string; role: string; bindings: any[] }[]>([])
  const [selectedUserFilter, setSelectedUserFilter] = useState<string>('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const accessToken = useAuthStore(s => s.accessToken)!

  useEffect(() => { loadProjects(); loadUsers() }, [])

  const loadUsers = async () => {
    try {
      const response = await api.listUsers(accessToken)
      const list: any[] = response.users || []
      const withBindings = await Promise.all(
        list.map(async (u: any) => {
          try {
            const br = await api.getBindings(accessToken, u.email)
            return { ...u, bindings: br.bindings || [] }
          } catch { return { ...u, bindings: [] } }
        })
      )
      setUsers(withBindings)
    } catch { }
  }

  const loadProjects = async () => {
    setIsLoading(true); setError('')
    try {
      const response = await api.listProjects(accessToken)
      const data: Project[] = (response.projects as any) || []
      if (Array.isArray(data)) {
        setProjects(data)
      } else { setProjects([]) }
    } catch (err: any) {
      setError(err.message)
    } finally { setIsLoading(false) }
  }

  const filteredProjects = projects.filter(p => {
    if (selectedUserFilter && p.owner !== selectedUserFilter) return false
    if (filterStatus !== 'all' && p.status !== filterStatus) return false
    return true
  })

  const runningCount = projects.filter(p => p.status === 'running').length
  const stoppedCount = projects.filter(p => p.status === 'stopped').length
  const errorCount = projects.filter(p => p.status === 'error').length

  const deleteProject = async (name: string) => {
    if (!confirm(`"${name}"-г устгах уу? Энэ үйлдлийг буцаах боломжгүй.`)) return
    setActionInProgress(name)
    try { await api.deleteProject(accessToken, name); await loadProjects() }
    catch (err: any) { setError(err.message) }
    finally { setActionInProgress(null) }
  }

  const generateSite = async (name: string) => {
    setActionInProgress(`${name}-generate`)
    try {
      await api.generateProject(accessToken, name)
      setProjects(ps => ps.map(p => p.name === name ? { ...p, status: 'building' } : p))
    } catch (err: any) { setError(err.message) }
    finally { setActionInProgress(null) }
  }

  const buildProject = async (name: string) => {
    setActionInProgress(`${name}-build`)
    try {
      await api.buildProject(accessToken, name)
      setProjects(ps => ps.map(p => p.name === name ? { ...p, status: 'running' } : p))
    } catch (err: any) { setError(err.message) }
    finally { setActionInProgress(null) }
  }

  const stopProject = async (name: string) => {
    setActionInProgress(`${name}-stop`)
    try {
      await api.stopProject(accessToken, name)
      setProjects(ps => ps.map(p => p.name === name ? { ...p, status: 'stopped' } : p))
    } catch (err: any) { setError(err.message) }
    finally { setActionInProgress(null) }
  }

  const handleGenerateProject = async () => {
    if (!newProjectName.trim()) return
    setIsGenerating(true)
    setError('')
    try {
      await api.generateProject(accessToken, newProjectName.trim())
      await loadProjects()
      setIsModalOpen(false)
      setNewProjectName('')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className={`min-h-screen p-6 transition-colors duration-300 ${isDarkMode ? 'bg-background' : 'bg-slate-50'}`}>
      {/* Header */}
      <div className="mb-6 flex items-start justify-between animate-slide-in-left">
        <div>
          <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Төслүүд</h1>
          <p className={`text-sm mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            CMS төслүүдээ удирдах болон байршуулах
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsModalOpen(true)}
            disabled={isLoading || isGenerating}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 shadow-lg shadow-indigo-500/20 ${isDarkMode
                ? 'bg-indigo-600 border-indigo-500 text-white hover:bg-indigo-500'
                : 'bg-indigo-600 border-indigo-500 text-white hover:bg-indigo-700'
              } disabled:opacity-50`}
          >
            <Plus className="w-4 h-4" />
            Шинэ төсөл
          </button>
          <button
            id="projects-refresh"
            onClick={loadProjects}
            disabled={isLoading}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all duration-200 shadow-sm ${isDarkMode
                ? 'bg-slate-800 border-slate-700 text-slate-300 hover:border-indigo-500 hover:text-indigo-400'
                : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600'
              } disabled:opacity-50`}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Шинэчлэх
          </button>
        </div>
      </div>

      {/* Stats pills */}
      <div className="flex items-center gap-3 mb-6 animate-fade-in-up" style={{ animationDelay: '60ms' }}>
        {[
          { label: 'Бүгд', val: 'all', count: projects.length, color: isDarkMode ? 'bg-slate-700 text-slate-200' : 'bg-white text-slate-700 border border-slate-200' },
          { label: 'Ажиллаж байгаа', val: 'running', count: runningCount, color: 'bg-emerald-50 text-emerald-700' },
          { label: 'Зогссон', val: 'stopped', count: stoppedCount, color: 'bg-slate-100 text-slate-600' },
          { label: 'Алдаа', val: 'error', count: errorCount, color: 'bg-red-50 text-red-700' },
        ].map(f => (
          <button
            key={f.val}
            onClick={() => setFilterStatus(f.val)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${filterStatus === f.val
                ? 'ring-2 ring-indigo-500 ring-offset-1 ' + f.color
                : f.color + ' opacity-70 hover:opacity-100'
              }`}
          >
            {f.label}
            <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${isDarkMode ? 'bg-slate-600' : 'bg-white/70'}`}>
              {f.count}
            </span>
          </button>
        ))}

        {users.filter(u => u.role !== 'superadmin').length > 0 && (
          <select
            value={selectedUserFilter}
            onChange={e => setSelectedUserFilter(e.target.value)}
            className={`ml-auto px-3 py-1.5 rounded-xl text-xs border transition-all ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-white border-slate-200 text-slate-700'
              }`}
          >
            <option value="">Бүх хэрэглэгчид</option>
            {users.filter(u => u.role !== 'superadmin').map(u => (
              <option key={u.email} value={u.email}>{u.email}</option>
            ))}
          </select>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-100 flex items-center gap-2 text-sm text-red-700 animate-scale-in">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
          <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-600 text-xs underline">Хаах</button>
        </div>
      )}

      {/* Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 stagger-children">
        {isLoading ? (
          [...Array(6)].map((_, i) => <SkeletonCard key={i} isDarkMode={isDarkMode} />)
        ) : filteredProjects.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
              <Server className={`w-8 h-8 ${isDarkMode ? 'text-slate-600' : 'text-slate-300'}`} />
            </div>
            <p className={`font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Төсөл олдсонгүй</p>
            <p className={`text-sm mt-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
              {filterStatus !== 'all' ? 'Өөр шүүлтүүр туршина уу' : 'Вэб бүтээгчээс төсөл үүсгэнэ үү'}
            </p>
          </div>
        ) : (
          filteredProjects.map(project => {
            const cfg = statusConfig[project.status] || statusConfig.stopped
            const inAction = actionInProgress?.startsWith(project.name)
            return (
              <div
                key={project.name}
                className={`rounded-2xl border p-5 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${isDarkMode
                    ? 'bg-slate-800/80 border-slate-700/80 hover:border-slate-600'
                    : `bg-white ${cfg.card} hover:shadow-slate-100`
                  }`}
              >
                {/* Card top */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className={`relative w-2.5 h-2.5 rounded-full ${cfg.dot} ${project.status === 'running' ? 'animate-pulse' : ''}`} />
                    <h3 className={`font-semibold text-sm truncate max-w-[140px] ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      {project.name}
                    </h3>
                  </div>
                  <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${isDarkMode ? cfg.badge : cfg.badge.replace('-500/11', '-50').replace('-400', '-700').replace('-500/20', '-200')
                    }`}>
                    {cfg.label}
                  </span>
                </div>

                {/* Meta */}
                <div className={`space-y-1.5 text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  {project.owner && (
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />
                      <span className="truncate">{project.owner}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1"><Globe className="w-3 h-3" /> Порт {project.port}</span>
                    <span className="flex items-center gap-1"><Database className="w-3 h-3" /> {project.dbStatus}</span>
                  </div>
                  {project.url && (
                    <a href={project.url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 text-indigo-500 hover:text-indigo-600">
                      <ExternalLink className="w-3 h-3" /> Сайт руу зочлох
                    </a>
                  )}
                </div>

                {/* Actions */}
                <div className={`mt-4 pt-3 border-t flex items-center justify-end gap-1.5 ${isDarkMode ? 'border-slate-700' : 'border-slate-100'}`}>
                  {onEditProject && (
                    <button
                      id={`project-edit-${project.name}`}
                      onClick={() => onEditProject(project.name)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Засах
                    </button>
                  )}
                  <button
                    onClick={() => generateSite(project.name)}
                    disabled={!!inAction}
                    title="Сайт дахин үүсгэх"
                    className={`p-1.5 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-500'} disabled:opacity-40`}
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${actionInProgress === `${project.name}-generate` ? 'animate-spin' : ''}`} />
                  </button>
                  {project.status === 'stopped' || project.status === 'error' ? (
                    <button
                      onClick={() => buildProject(project.name)}
                      disabled={!!inAction}
                      title="Төсөл эхлүүлэх"
                      className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors disabled:opacity-40"
                    >
                      {actionInProgress === `${project.name}-build`
                        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        : <Play className="w-3.5 h-3.5" />}
                    </button>
                  ) : (
                    <button
                      onClick={() => stopProject(project.name)}
                      disabled={!!inAction}
                      title="Төсөл зогсоох"
                      className="p-1.5 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors disabled:opacity-40"
                    >
                      {actionInProgress === `${project.name}-stop`
                        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        : <Square className="w-3.5 h-3.5" />}
                    </button>
                  )}
                  <button
                    onClick={() => deleteProject(project.name)}
                    disabled={!!inAction}
                    title="Төсөл устгах"
                    className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors disabled:opacity-40"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className={`w-full max-w-md rounded-2xl p-6 shadow-2xl ${isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-200'}`}>
            <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Шинэ төсөл үүсгэх</h3>
            <p className={`text-sm mb-5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Оруулах төслийн нэрийг бичнэ үү (жишээ нь: my-new-project)
            </p>
            <input 
              autoFocus
              type="text" 
              value={newProjectName} 
              onChange={e => setNewProjectName(e.target.value)}
              placeholder="Төслийн нэр"
              className={`w-full px-4 py-3 rounded-xl border text-sm mb-6 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
              onKeyDown={e => { if (e.key === 'Enter') handleGenerateProject() }}
              disabled={isGenerating}
            />
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => { setIsModalOpen(false); setNewProjectName('') }}
                disabled={isGenerating}
                className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-colors ${isDarkMode ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                Болих
              </button>
              <button 
                onClick={handleGenerateProject}
                disabled={!newProjectName.trim() || isGenerating}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-lg shadow-indigo-500/20"
              >
                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                {isGenerating ? 'Үүсгэж байна...' : 'Үүсгэх'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

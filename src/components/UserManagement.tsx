'use client'

import { useState, useEffect } from 'react'
import {
  Plus, Search, Edit, Trash2, Link2, Loader2, X, FolderOpen,
  ExternalLink, RefreshCw, ChevronDown, Shield, UserCircle, Pencil,
} from 'lucide-react'
import { userApi, projectApi } from '@/lib/api-service'

interface User {
  email: string
  role: 'superadmin' | 'client-admin' | 'editor'
  bindings: Binding[]
  createdAt?: string
}
interface Binding { projectName: string; roles: string[] }
interface UserManagementProps { isDarkMode?: boolean }

const roleStyles: Record<string, { label: string; badge: string; avatar: string }> = {
  superadmin:    { label: 'Супер Админ',  badge: 'bg-violet-50 text-violet-700 border border-violet-200',   avatar: 'from-violet-500 to-violet-700'   },
  'client-admin':{ label: 'Харилцагч Админ', badge: 'bg-indigo-50 text-indigo-700 border border-indigo-200',   avatar: 'from-indigo-500 to-indigo-700'   },
  editor:        { label: 'Засварлагч',       badge: 'bg-slate-50 text-slate-600 border border-slate-200',      avatar: 'from-slate-400 to-slate-600'     },
}

function Modal({ show, onClose, title, children, isDark }: {
  show: boolean; onClose: () => void; title: string; children: React.ReactNode; isDark: boolean
}) {
  if (!show) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full max-w-md rounded-2xl p-6 shadow-2xl animate-scale-in"
        style={{
          background: isDark ? 'hsl(224 50% 7%)' : 'white',
          border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid hsl(220 13% 91%)',
        }}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className={`text-base font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{title}</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

function FormField({ label, children, isDark }: { label: string; children: React.ReactNode; isDark: boolean }) {
  return (
    <div>
      <label className={`block text-xs font-medium mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{label}</label>
      {children}
    </div>
  )
}

const inputCls = (isDark: boolean) =>
  `w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all duration-200 ${
    isDark
      ? 'bg-slate-800/80 border border-slate-700 text-white placeholder-slate-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
      : 'bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/15'
  }`

export default function UserManagement({ isDarkMode = false }: UserManagementProps) {
  const dm = isDarkMode
  const [users, setUsers]             = useState<User[]>([])
  const [isLoading, setIsLoading]     = useState(true)
  const [error, setError]             = useState('')
  const [searchTerm, setSearchTerm]   = useState('')
  const [expandedUser, setExpandedUser] = useState<string | null>(null)

  // Modals
  const [showAdd, setShowAdd]       = useState(false)
  const [showEdit, setShowEdit]     = useState(false)
  const [showBind, setShowBind]     = useState(false)
  const [showProjects, setShowProjects] = useState(false)

  // Forms
  const [newUser, setNewUser]       = useState({ email: '', password: '', role: 'client-admin' as any })
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [editForm, setEditForm]     = useState({ password: '', role: 'client-admin' as any })
  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  const [newBinding, setNewBinding] = useState({ projectName: '', roles: ['editor'] })
  const [selectedUserForProjects, setSelectedUserForProjects] = useState<User | null>(null)
  const [userProjects, setUserProjects] = useState<any[]>([])
  const [isLoadingProjects, setIsLoadingProjects] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => { loadUsers() }, [])

  const loadUsers = async () => {
    setIsLoading(true)
    try {
      const res = await userApi.list()
      const list: any[] = res.data?.users || res.users || res || []
      const withB = await Promise.all(list.map(async (u: any) => {
        try {
          const br = await userApi.getBindings(u.email)
          return { ...u, bindings: br.data?.bindings || br.bindings || [] }
        } catch { return { ...u, bindings: [] } }
      }))
      setUsers(withB)
    } catch (e: any) { setError(e.message) }
    finally { setIsLoading(false) }
  }

  const filteredUsers = users.filter(u =>
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.role.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAddUser = async () => {
    if (!newUser.email || !newUser.password) return
    setIsSubmitting(true); setError('')
    try {
      await userApi.create(newUser.email, newUser.password, newUser.role)
      await loadUsers()
      setNewUser({ email: '', password: '', role: 'client-admin' })
      setShowAdd(false)
    } catch (e: any) { setError(e.message) }
    finally { setIsSubmitting(false) }
  }

  const handleUpdateUser = async () => {
    if (!editingUser) return
    setIsSubmitting(true); setError('')
    try {
      const data: any = {}
      if (editForm.password) data.password = editForm.password
      if (editForm.role !== editingUser.role) data.role = editForm.role
      if (Object.keys(data).length > 0) await userApi.update(editingUser.email, data)
      await loadUsers()
      setShowEdit(false); setEditingUser(null)
    } catch (e: any) { setError(e.message) }
    finally { setIsSubmitting(false) }
  }

  const handleDeleteUser = async (email: string) => {
    if (!confirm(`"${email}" хэрэглэгчийг устгах уу?`)) return
    setIsSubmitting(true)
    try { await userApi.delete(email); await loadUsers() }
    catch (e: any) { setError(e.message) }
    finally { setIsSubmitting(false) }
  }

  const handleAddBinding = async () => {
    if (!selectedUser || !newBinding.projectName) return
    setIsSubmitting(true); setError('')
    try {
      await userApi.addBinding(selectedUser, newBinding.projectName, newBinding.roles)
      await loadUsers()
      setNewBinding({ projectName: '', roles: ['editor'] }); setShowBind(false); setSelectedUser(null)
    } catch (e: any) { setError(e.message) }
    finally { setIsSubmitting(false) }
  }

  const handleRemoveBinding = async (email: string, projectName: string) => {
    if (!confirm(`"${projectName}" төслийн эрхийг устгах уу?`)) return
    try { await userApi.removeBinding(email, projectName); await loadUsers() }
    catch (e: any) { setError(e.message) }
  }

  const handleViewProjects = async (user: User) => {
    setSelectedUserForProjects(user); setShowProjects(true); setIsLoadingProjects(true)
    try {
      const res = await projectApi.list()
      const all = res.data?.projects || res.projects || res || []
      const names = user.bindings?.map((b: Binding) => b.projectName) || []
      setUserProjects(all.filter((p: any) => names.includes(p.name)))
    } catch (e: any) { setError(e.message) }
    finally { setIsLoadingProjects(false) }
  }

  const btnPrimary = 'px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50 flex items-center gap-2'
  const btnGhost   = (d: boolean) => `px-4 py-2 rounded-xl text-sm transition-all ${d ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'}`

  return (
    <div className={`min-h-screen p-6 ${dm ? 'bg-[hsl(224_71%_4%)]' : 'bg-[hsl(220_20%_98%)]'}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-6 animate-slide-in-left">
        <div>
          <h1 className={`text-2xl font-bold ${dm ? 'text-white' : 'text-slate-900'}`}>Хэрэглэгчид</h1>
          <p className={`text-sm mt-0.5 ${dm ? 'text-slate-400' : 'text-slate-500'}`}>
            {users.length} хэрэглэгч бүртгэлтэй байна
          </p>
        </div>
        <button
          id="users-add-btn"
          onClick={() => setShowAdd(true)}
          className={`${btnPrimary} text-sm`}
          style={{ background: 'linear-gradient(135deg, hsl(238 84% 67%), hsl(262 83% 55%))', boxShadow: '0 4px 12px rgba(99,102,241,0.3)' }}
        >
          <Plus className="w-4 h-4" /> Хэрэглэгч нэмэх
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-700 flex items-center gap-2">
          {error}
          <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-600 text-xs underline">Хаах</button>
        </div>
      )}

      {/* Search */}
      <div className="relative mb-5 animate-fade-in-up" style={{ animationDelay: '60ms' }}>
        <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${dm ? 'text-slate-500' : 'text-slate-400'}`} />
        <input
          type="text"
          placeholder="Хэрэглэгч хайх..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className={inputCls(dm) + ' pl-10'}
        />
      </div>

      {/* Users list */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className={`rounded-2xl p-5 animate-pulse ${dm ? 'bg-slate-800' : 'bg-white border border-slate-100'}`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-200 rounded-xl" />
                <div className="flex-1 space-y-2"><div className="h-3 bg-slate-200 rounded w-40" /><div className="h-3 bg-slate-100 rounded w-24" /></div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <UserCircle className={`w-12 h-12 mb-3 ${dm ? 'text-slate-600' : 'text-slate-300'}`} />
          <p className={`font-medium ${dm ? 'text-slate-400' : 'text-slate-600'}`}>Хэрэглэгч олдсонгүй</p>
        </div>
      ) : (
        <div className="space-y-3 stagger-children">
          {filteredUsers.map(user => {
            const rs  = roleStyles[user.role] || roleStyles.editor
            const initials = user.email.slice(0, 2).toUpperCase()
            const isExpanded = expandedUser === user.email
            return (
              <div
                key={user.email}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  dm
                    ? 'bg-slate-800/70 border-slate-700 hover:border-slate-600'
                    : 'bg-white border-slate-100 hover:border-slate-200 hover:shadow-sm'
                }`}
              >
                <div className="p-4 flex items-center gap-3">
                  {/* Avatar */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white bg-gradient-to-br ${rs.avatar} shrink-0`}>
                    {initials}
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className={`text-sm font-semibold truncate ${dm ? 'text-white' : 'text-slate-900'}`}>{user.email}</p>
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${rs.badge}`}>{rs.label}</span>
                    </div>
                    <p className={`text-xs mt-0.5 ${dm ? 'text-slate-500' : 'text-slate-400'}`}>
                      {user.bindings?.length ?? 0} төсөл холбогдсон
                    </p>
                  </div>
                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    {user.bindings?.length > 0 && (
                      <button
                        onClick={() => handleViewProjects(user)}
                        className={`p-2 rounded-lg transition-colors ${dm ? 'hover:bg-slate-700 text-emerald-400' : 'hover:bg-emerald-50 text-emerald-600'}`}
                        title="Төслүүд харах"
                      >
                        <FolderOpen className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => { setSelectedUser(user.email); setShowBind(true) }}
                      className={`p-2 rounded-lg transition-colors ${dm ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
                      title="Төсөл холбох"
                    >
                      <Link2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => { setEditingUser(user); setEditForm({ password: '', role: user.role }); setShowEdit(true) }}
                      className={`p-2 rounded-lg transition-colors ${dm ? 'hover:bg-slate-700 text-blue-400' : 'hover:bg-blue-50 text-blue-600'}`}
                      title="Хэрэглэгч засах"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.email)}
                      disabled={user.role === 'superadmin'}
                      className={`p-2 rounded-lg transition-colors ${dm ? 'hover:bg-slate-700 text-red-400' : 'hover:bg-red-50 text-red-500'} disabled:opacity-30 disabled:cursor-not-allowed`}
                      title={user.role === 'superadmin' ? 'Супер админыг устгах боломжгүй' : 'Хэрэглэгч устгах'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    {user.bindings?.length > 0 && (
                      <button
                        onClick={() => setExpandedUser(isExpanded ? null : user.email)}
                        className={`p-2 rounded-lg transition-colors ${dm ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
                      >
                        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Expanded bindings */}
                {isExpanded && user.bindings?.length > 0 && (
                  <div className={`px-4 pb-4 border-t ${dm ? 'border-slate-700' : 'border-slate-50'}`}>
                    <p className={`text-[11px] font-semibold uppercase tracking-wider mt-3 mb-2 ${dm ? 'text-slate-500' : 'text-slate-400'}`}>
                      Холбогдсон төслүүд
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {user.bindings.map(b => (
                        <div key={b.projectName}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${dm ? 'bg-slate-700 text-slate-200' : 'bg-indigo-50 text-indigo-700 border border-indigo-100'}`}
                        >
                          <FolderOpen className="w-3 h-3" />
                          {b.projectName}
                          <span className={`text-[10px] ${dm ? 'text-slate-500' : 'text-indigo-400'}`}>
                            [{b.roles.join(', ')}]
                          </span>
                          <button onClick={() => handleRemoveBinding(user.email, b.projectName)}
                            className="hover:text-red-500 transition-colors ml-0.5">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Add User Modal */}
      <Modal show={showAdd} onClose={() => setShowAdd(false)} title="Шинэ хэрэглэгч нэмэх" isDark={dm}>
        <div className="space-y-4">
          <FormField label="Имэйл хаяг" isDark={dm}>
            <input type="email" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })}
              className={inputCls(dm)} placeholder="user@example.com" />
          </FormField>
          <FormField label="Нууц үг" isDark={dm}>
            <input type="password" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })}
              className={inputCls(dm)} placeholder="••••••••" />
          </FormField>
          <FormField label="Эрх" isDark={dm}>
            <select value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })} className={inputCls(dm)}>
              <option value="client-admin">Харилцагч Админ</option>
              <option value="editor">Засварлагч</option>
              <option value="superadmin">Супер Админ</option>
            </select>
          </FormField>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button onClick={() => setShowAdd(false)} className={btnGhost(dm)}>Цуцлах</button>
          <button onClick={handleAddUser} disabled={isSubmitting || !newUser.email || !newUser.password}
            className={btnPrimary} style={{ background: 'linear-gradient(135deg, hsl(238 84% 67%), hsl(262 83% 55%))' }}>
            {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Нэмж байна...</> : 'Хэрэглэгч нэмэх'}
          </button>
        </div>
      </Modal>

      {/* Edit User Modal */}
      <Modal show={showEdit && !!editingUser} onClose={() => { setShowEdit(false); setEditingUser(null) }} title="Хэрэглэгч засах" isDark={dm}>
        <div className="space-y-4">
          <p className={`text-sm ${dm ? 'text-slate-400' : 'text-slate-500'}`}>{editingUser?.email}</p>
          <FormField label="Шинэ нууц үг (хэвээр үлдээх бол хоосон орхи)" isDark={dm}>
            <input type="password" value={editForm.password} onChange={e => setEditForm({ ...editForm, password: e.target.value })}
              className={inputCls(dm)} placeholder="Нууц үг" />
          </FormField>
          <FormField label="Эрх" isDark={dm}>
            <select value={editForm.role} onChange={e => setEditForm({ ...editForm, role: e.target.value as any })} className={inputCls(dm)}>
              <option value="superadmin">Супер Админ</option>
              <option value="client-admin">Харилцагч Админ</option>
              <option value="editor">Засварлагч</option>
            </select>
          </FormField>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button onClick={() => { setShowEdit(false); setEditingUser(null); setError('') }} className={btnGhost(dm)}>Цуцлах</button>
          <button onClick={handleUpdateUser} disabled={isSubmitting}
            className={btnPrimary} style={{ background: 'linear-gradient(135deg, hsl(238 84% 67%), hsl(262 83% 55%))' }}>
            {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Хадгалж байна...</> : 'Өөрчлөлтийг хадгалах'}
          </button>
        </div>
      </Modal>

      {/* Add Binding Modal */}
      <Modal show={showBind} onClose={() => { setShowBind(false); setSelectedUser(null) }} title="Төсөлд хандах эрх олгох" isDark={dm}>
        <div className="space-y-4">
          <p className={`text-sm ${dm ? 'text-slate-400' : 'text-slate-500'}`}>Хэрэглэгч: <strong className={dm ? 'text-white' : 'text-slate-900'}>{selectedUser}</strong></p>
          <FormField label="Төслийн нэр" isDark={dm}>
            <input type="text" value={newBinding.projectName} onChange={e => setNewBinding({ ...newBinding, projectName: e.target.value })}
              className={inputCls(dm)} placeholder="e.g. acme-storefront" />
          </FormField>
          <FormField label="Төслийн эрх" isDark={dm}>
            <select value={newBinding.roles[0]} onChange={e => setNewBinding({ ...newBinding, roles: [e.target.value] })} className={inputCls(dm)}>
              <option value="client-admin">Харилцагч Админ</option>
              <option value="editor">Засварлагч</option>
            </select>
          </FormField>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button onClick={() => { setShowBind(false); setSelectedUser(null) }} className={btnGhost(dm)}>Цуцлах</button>
          <button onClick={handleAddBinding} disabled={isSubmitting || !newBinding.projectName}
            className={btnPrimary} style={{ background: 'linear-gradient(135deg, hsl(238 84% 67%), hsl(262 83% 55%))' }}>
            {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Олгож байна...</> : 'Эрх олгох'}
          </button>
        </div>
      </Modal>

      {/* View Projects Modal */}
      <Modal show={showProjects && !!selectedUserForProjects} onClose={() => { setShowProjects(false); setSelectedUserForProjects(null); setUserProjects([]) }}
        title={`${selectedUserForProjects?.email ?? ''} — Төслүүд`} isDark={dm}>
        {isLoadingProjects ? (
          <div className="py-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-indigo-500" /></div>
        ) : userProjects.length === 0 ? (
          <div className="py-8 text-center">
            <FolderOpen className={`w-10 h-10 mx-auto mb-2 ${dm ? 'text-slate-600' : 'text-slate-200'}`} />
            <p className={`text-sm ${dm ? 'text-slate-400' : 'text-slate-500'}`}>Төсөл холбогдоогүй байна</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {userProjects.map(p => (
              <div key={p.name} className={`flex items-center justify-between p-3 rounded-xl border ${dm ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                <div>
                  <p className={`text-sm font-medium ${dm ? 'text-white' : 'text-slate-900'}`}>{p.name}</p>
                  <p className={`text-xs mt-0.5 ${dm ? 'text-slate-500' : 'text-slate-400'}`}>Порт {p.port} · {p.status}</p>
                </div>
                <button onClick={() => { setShowProjects(false); localStorage.setItem('currentProject', p.name); window.dispatchEvent(new CustomEvent('editProject', { detail: p.name })) }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors">
                  <Edit className="w-3 h-3" /> Засах
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="mt-4 flex justify-end">
          <button onClick={() => { setShowProjects(false); setSelectedUserForProjects(null) }} className={btnGhost(dm)}>Хаах</button>
        </div>
      </Modal>
    </div>
  )
}

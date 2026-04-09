'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Edit, Trash2, Link2, Loader2, X } from 'lucide-react'
import { userApi } from '@/lib/api-service'

interface User {
  email: string
  role: 'superadmin' | 'client-admin' | 'editor'
  bindings: Binding[]
  createdAt?: string
}

interface Binding {
  projectName: string
  roles: string[]
}

interface UserManagementProps {
  isDarkMode?: boolean
}

export default function UserManagement({ isDarkMode = false }: UserManagementProps) {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showBindingModal, setShowBindingModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  const [newUser, setNewUser] = useState({ email: '', password: '', role: 'client-admin' as const })
  const [newBinding, setNewBinding] = useState({ projectName: '', roles: ['editor'] })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Load users on mount
  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setIsLoading(true)
      const data = await userApi.list()
      // Fetch bindings for each user
      const usersWithBindings = await Promise.all(
        data.map(async (user: any) => {
          try {
            const bindings = await userApi.getBindings(user.email)
            return { ...user, bindings }
          } catch {
            return { ...user, bindings: [] }
          }
        })
      )
      setUsers(usersWithBindings)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAddUser = async () => {
    if (!newUser.email || !newUser.password) return
    
    setIsSubmitting(true)
    setError('')
    
    try {
      await userApi.create(newUser.email, newUser.password, newUser.role)
      await loadUsers()
      setNewUser({ email: '', password: '', role: 'client-admin' })
      setShowAddModal(false)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAddBinding = async () => {
    if (!selectedUser || !newBinding.projectName) return
    
    setIsSubmitting(true)
    setError('')
    
    try {
      await userApi.addBinding(selectedUser, newBinding.projectName, newBinding.roles)
      await loadUsers()
      setNewBinding({ projectName: '', roles: ['editor'] })
      setShowBindingModal(false)
      setSelectedUser(null)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRemoveBinding = async (email: string, projectName: string) => {
    if (!confirm(`"${projectName}" төсөлд хандах эрхийг хасах уу?`)) return
    
    try {
      await userApi.removeBinding(email, projectName)
      await loadUsers()
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <div className={`min-h-screen p-6 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <div className="mb-8">
        <h1 className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Хэрэглэгч удирдлага</h1>
        <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
          Хэрэглэгчдийг үүсгэж, төслийн хандалтыг удирдна уу
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
          <button 
            onClick={() => setError('')}
            className="text-red-600 text-sm underline mt-1"
          >
            Хаах
          </button>
        </div>
      )}

      {/* Controls */}
      <div className="flex justify-between items-center mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDarkMode ? 'text-slate-400' : 'text-gray-400'}`} />
          <input
            type="text"
            placeholder="Хэрэглэгч хайх..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
              isDarkMode 
                ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' 
                : 'bg-white border-gray-300'
            }`}
          />
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors ml-4"
        >
          <Plus className="w-5 h-5 mr-2" />
          Хэрэглэгч нэмэх
        </button>
      </div>

      {/* Users List */}
      <div className={`rounded-xl border overflow-hidden shadow-lg ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        {isLoading ? (
          <div className="p-12 text-center">
            <Loader2 className={`w-8 h-8 mx-auto animate-spin ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
            <p className={`mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Хэрэглэгчдийг ачаалж байна...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center">
            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Хэрэглэгч олдсонгүй</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredUsers.map((user) => (
              <div key={user.email} className={`p-6 ${isDarkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-2 py-1 text-xs font-semibold rounded ${
                        user.role === 'superadmin' 
                          ? 'bg-purple-100 text-purple-800' 
                          : user.role === 'client-admin'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.role}
                      </span>
                      <h3 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                        {user.email}
                      </h3>
                    </div>
                    
                    {/* Project Bindings */}
                    <div className="mt-3">
                      <p className={`text-sm mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-700'}`}>
                        Төслийн хандалт:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {user.bindings?.length > 0 ? (
                          user.bindings.map((binding) => (
                            <span 
                              key={binding.projectName}
                              className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                                isDarkMode 
                                  ? 'bg-gray-700 text-gray-300' 
                                  : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {binding.projectName}
                              <button
                                onClick={() => handleRemoveBinding(user.email, binding.projectName)}
                                className="ml-2 text-red-500 hover:text-red-700"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))
                        ) : (
                          <span className={`text-sm italic ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                            Төслийн хандалт байхгүй
                          </span>
                        )}
                        <button
                          onClick={() => {
                            setSelectedUser(user.email)
                            setShowBindingModal(true)
                          }}
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm border border-dashed ${
                            isDarkMode 
                              ? 'border-gray-600 text-gray-400 hover:border-blue-500 hover:text-blue-400' 
                              : 'border-gray-300 text-gray-600 hover:border-blue-500 hover:text-blue-500'
                          }`}
                        >
                          <Link2 className="w-3 h-3 mr-1" />
                          Нэмэх
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className={`rounded-xl p-6 w-96 shadow-2xl ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'}`}>
            <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Шинэ хэрэглэгч нэмэх</h3>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Имэйл
                </label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    isDarkMode 
                      ? 'bg-gray-900 border-gray-600 text-white placeholder-gray-500' 
                      : 'bg-white border-gray-300'
                  }`}
                  placeholder="user@example.com"
                  
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Нууц үг
                </label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    isDarkMode 
                      ? 'bg-gray-900 border-gray-600 text-white placeholder-gray-500' 
                      : 'bg-white border-gray-300'
                  }`}
                  placeholder="Нууц үг"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Эрх
                </label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value as any })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDarkMode 
                      ? 'bg-gray-900 border-gray-600 text-white' 
                      : 'bg-white border-gray-300'
                  }`}
                >
                  <option value="client-admin">Клиент Админ</option>
                  <option value="editor">Засварлагч</option>
                  <option value="superadmin">Супер Админ</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className={`px-4 py-2 rounded-lg ${isDarkMode ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' : 'text-gray-600 hover:text-gray-800'}`}
              >
                Болих
              </button>
              <button
                onClick={handleAddUser}
                disabled={isSubmitting || !newUser.email || !newUser.password}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-emerald-600/50 flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Нэмж байна...
                  </>
                ) : (
                  'Хэрэглэгч нэмэх'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Binding Modal */}
      {showBindingModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className={`rounded-xl p-6 w-96 shadow-2xl ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'}`}>
            <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-black'}`}>
              Төслийн хандалт олгох
            </h3>
            <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-black'}`}>
              Хэрэглэгч: {selectedUser}
            </p>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Төслийн нэр
                </label>
                <input
                  type="text"
                  value={newBinding.projectName}
                  onChange={(e) => setNewBinding({ ...newBinding, projectName: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    isDarkMode 
                      ? 'bg-gray-900 border-gray-600 text-white placeholder-gray-500' 
                      : 'bg-white border-gray-300'
                  }`}
                  placeholder="жишээ: acme-storefront"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Төсөл дахь эрх
                </label>
                <select
                  multiple
                  value={newBinding.roles}
                  onChange={(e) => {
                    const values = Array.from(e.target.selectedOptions, opt => opt.value)
                    setNewBinding({ ...newBinding, roles: values })
                  }}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDarkMode 
                      ? 'bg-gray-900 border-gray-600 text-white' 
                      : 'bg-white border-gray-300'
                  }`}
                >
                  <option value="client-admin">Клиент Админ</option>
                  <option value="editor">Засварлагч</option>
                </select>
                <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  Олон сонгохын тулд Ctrl/Cmd дарна уу
                </p>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowBindingModal(false)
                  setSelectedUser(null)
                }}
                className={`px-4 py-2 rounded-lg ${isDarkMode ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' : 'text-gray-600 hover:text-gray-800'}`}
              >
                Болих
              </button>
              <button
                onClick={handleAddBinding}
                disabled={isSubmitting || !newBinding.projectName}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-emerald-600/50 flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Олгож байна...
                  </>
                ) : (
                  'Хандалт олгох'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

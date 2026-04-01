'use client'

import { useState } from 'react'
import { Plus, Search, Edit, Trash2, ExternalLink } from 'lucide-react'

interface User {
  id: string
  name: string
  email: string
  domain: string
  status: 'active' | 'inactive'
  createdAt: string
}

interface UserManagementProps {
  isDarkMode?: boolean
}

export default function UserManagement({ isDarkMode = false }: UserManagementProps) {
  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      name: 'foodcity',
      email: 'admin@foodcity.zevtabs.mn',
      domain: 'foodcity.zevtabs.mn',
      status: 'active',
      createdAt: '2026-01-15'
    },
    {
      id: '2',
      name: 'rently',
      email: 'turees@zevtabs.mn',
      domain: 'turees.zevtabs.mn',
      status: 'active',
      createdAt: '2026-01-20'
    }
  ])

  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [newUser, setNewUser] = useState({ name: '', email: '' })

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.domain.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAddUser = () => {
    if (newUser.name) {
      const user: User = {
        id: Date.now().toString(),
        name: newUser.name.toLowerCase().replace(/\s+/g, ''),
        email: newUser.email || `admin@${newUser.name.toLowerCase().replace(/\s+/g, '')}.zevtabs.mn`,
        domain: `${newUser.name.toLowerCase().replace(/\s+/g, '')}.zevtabs.mn`,
        status: 'active',
        createdAt: new Date().toISOString().split('T')[0]
      }
      setUsers([...users, user])
      setNewUser({ name: '', email: '' })
      setShowAddModal(false)
    }
  }

  const handleDeleteUser = (id: string) => {
    setUsers(users.filter(user => user.id !== id))
  }

  const toggleUserStatus = (id: string) => {
    setUsers(users.map(user =>
      user.id === id
        ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' }
        : user
    ))
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Хэрэглэгчдийн удирдлага</h2>
          <p className={`mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Хэрэглэгчдийг болон тэдний вэбсайтуудыг удирдах</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30"
        >
          <Plus className="w-5 h-5 mr-2" />
          Хэрэглэгч нэмэх
        </button>
      </div>

      <div className={`rounded-lg shadow-sm border overflow-hidden ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
        <div className={`p-4 border-b ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
          <div className="relative">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDarkMode ? 'text-slate-400' : 'text-gray-400'}`} />
            <input
              type="text"
              placeholder="Хэрэглэгч хайх..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDarkMode 
                  ? 'bg-slate-900 border-slate-600 text-white placeholder-slate-500' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={isDarkMode ? 'bg-slate-900/50' : 'bg-gray-50'}>
              <tr>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                  Хэрэглэгч
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                  Домайн
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                  Төлөв
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                  Үүсгэсэн
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                  Үйлдэл
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDarkMode ? 'bg-slate-800 divide-slate-700' : 'bg-white divide-gray-200'}`}>
              {filteredUsers.map((user) => (
                <tr key={user.id} className={isDarkMode ? 'hover:bg-slate-700/50' : 'hover:bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{user.name}</div>
                      <div className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>{user.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`flex items-center text-sm ${isDarkMode ? 'text-slate-300' : 'text-gray-900'}`}>
                      {user.domain}
                      <a
                        href={`http://${user.domain}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`ml-2 ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}`}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      onClick={() => toggleUserStatus(user.id)}
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full cursor-pointer ${
                        user.status === 'active'
                          ? isDarkMode 
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                            : 'bg-green-100 text-green-800'
                          : isDarkMode
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {user.status === 'active' ? 'Идэвхтэй' : 'Идэвхгүй'}
                    </span>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                    {user.createdAt}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className={`mr-3 ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-900'}`}>
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className={isDarkMode ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-900'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className={`rounded-lg p-6 w-96 shadow-2xl ${isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white'}`}>
            <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Шинэ хэрэглэгч нэмэх</h3>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                  Хэрэглэгчийн нэр
                </label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDarkMode 
                      ? 'bg-slate-900 border-slate-600 text-white placeholder-slate-500' 
                      : 'bg-white border-gray-300'
                  }`}
                  placeholder="жишээ: foodcity"
                />
                <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-500' : 'text-gray-500'}`}>
                  Домайн: {newUser.name.toLowerCase().replace(/\s+/g, '') || 'username'}.zevtabs.mn
                </p>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                  Имэйл (заавал биш)
                </label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDarkMode 
                      ? 'bg-slate-900 border-slate-600 text-white placeholder-slate-500' 
                      : 'bg-white border-gray-300'
                  }`}
                  placeholder="admin@foodcity.zevtabs.mn"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className={`px-4 py-2 rounded-lg ${isDarkMode ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-700' : 'text-gray-600 hover:text-gray-800'}`}
              >
                Болих
              </button>
              <button
                onClick={handleAddUser}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Нэмэх
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

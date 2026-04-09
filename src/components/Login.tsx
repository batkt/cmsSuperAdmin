'use client'

import { useState } from 'react'
import { Eye, EyeOff, Shield, Lock, User } from 'lucide-react'

interface LoginProps {
  onLogin: (token: string, user: any) => void
}

export default function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('admin@demo.com')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const apiUrl = 'http://202.179.6.77:4000'
      const response = await fetch(`${apiUrl}/api/v2/core/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Нэвтрэх амжилтгүй')
      }

      // API returns { version, data: { accessToken, user, ... } }
      const responseData = data.data || data
      onLogin(responseData.accessToken || responseData.token, responseData.user)
    } catch (err: any) {
      setError(err.message || 'Серверт холбогдож чадсангүй')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-100/40 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-gray-200/50 via-transparent to-transparent" />
      
      {/* Decorative floating elements */}
      <div className="absolute top-20 left-20 w-64 h-64 bg-emerald-200/20 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-slate-200/30 rounded-full blur-3xl" />
      
      <div className="w-full max-w-md p-6 relative z-10">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-emerald-500/20 rounded-2xl blur-xl transform scale-110" />
            <img
              src="/logo.webp"
              alt="Зевтабс"
              className="relative w-20 h-20 rounded-2xl mb-4 shadow-xl shadow-emerald-500/20 object-cover ring-4 ring-white/50"
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-1">Super Admin</h1>
          <p className="text-gray-500 text-sm">Системд нэвтрэх</p>
        </div>

        {/* iOS 26 Glassy Login Card */}
        <div className="relative group">
          {/* Glass effect layers */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/30 via-slate-400/30 to-emerald-500/30 rounded-3xl blur opacity-75 group-hover:opacity-100 transition duration-500" />
          
          <div className="relative bg-white/70 backdrop-blur-xl rounded-3xl p-8 border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.08)]">
            {/* Card header */}
            <div className="flex items-center justify-center mb-6">
              <div className="p-3 bg-emerald-500/10 rounded-2xl">
                <Shield className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
            
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Field */}
              <div className="relative">
                <label className={`absolute left-12 transition-all duration-200 pointer-events-none ${
                  focusedField === 'email' || email 
                    ? '-top-2 text-xs text-emerald-600 bg-white/80 px-2 rounded' 
                    : 'top-3.5 text-gray-400'
                }`}>
                  Нэвтрэх нэр
                </label>
                <div className="flex items-center">
                  <div className={`absolute left-4 transition-colors duration-200 ${
                    focusedField === 'email' ? 'text-emerald-500' : 'text-gray-400'
                  }`}>
                    <User className="w-5 h-5" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    className="w-full pl-12 pr-4 py-4 bg-white/60 border border-gray-200 rounded-2xl text-gray-800 placeholder-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all duration-200"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="relative">
                <label className={`absolute left-12 transition-all duration-200 pointer-events-none ${
                  focusedField === 'password' || password 
                    ? '-top-2 text-xs text-emerald-600 bg-white/80 px-2 rounded' 
                    : 'top-3.5 text-gray-400'
                }`}>
                  Нууц үг
                </label>
                <div className="flex items-center">
                  <div className={`absolute left-4 transition-colors duration-200 ${
                    focusedField === 'password' ? 'text-emerald-500' : 'text-gray-400'
                  }`}>
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    className="w-full pl-12 pr-12 py-4 bg-white/60 border border-gray-200 rounded-2xl text-gray-800 placeholder-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all duration-200"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 text-gray-400 hover:text-emerald-500 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 px-6 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 disabled:from-emerald-400 disabled:to-emerald-500 text-white font-semibold rounded-2xl shadow-lg shadow-emerald-500/25 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-3">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Нэвтэрч байна...
                  </span>
                ) : (
                  'Нэвтрэх'
                )}
              </button>
            </form>

            {/* Card footer decoration */}
            <div className="mt-6 flex justify-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500/30" />
              <div className="w-2 h-2 rounded-full bg-slate-400/30" />
              <div className="w-2 h-2 rounded-full bg-emerald-500/30" />
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-sm text-gray-400">
          Powered by <span className="text-emerald-600 font-medium">Zevtabs</span>
        </p>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { Eye, EyeOff, Lock, Mail, ArrowRight, Zap } from 'lucide-react'

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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Нэвтрэхэд алдаа гарлаа')
      const responseData = data.data || data
      onLogin(responseData.accessToken || responseData.token, responseData.user)
    } catch (err: any) {
      setError(err.message || 'Сервертэй холбогдож чадсангүй')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#070b1a]">
      {/* Ambient gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full opacity-30 animate-float"
          style={{ background: 'radial-gradient(circle, hsl(238 84% 67%) 0%, transparent 70%)' }}
        />
        <div
          className="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full opacity-20 animate-float"
          style={{ background: 'radial-gradient(circle, hsl(262 83% 65%) 0%, transparent 70%)', animationDelay: '2s' }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-5"
          style={{ background: 'radial-gradient(circle, #fff 0%, transparent 60%)' }}
        />
        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(to right, rgba(255,255,255,1) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
      </div>

      {/* Floating particles */}
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-indigo-400/40 animate-float"
          style={{
            top: `${15 + i * 15}%`,
            left: `${10 + i * 14}%`,
            animationDelay: `${i * 0.7}s`,
            animationDuration: `${3 + i * 0.5}s`,
          }}
        />
      ))}

      <div className="relative z-10 w-full max-w-[420px] px-4">
        {/* Brand */}
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 relative"
            style={{ background: 'linear-gradient(135deg, hsla(140, 91%, 55%, 1.00), hsla(229, 100%, 60%, 1.00))' }}>
            <Zap className="w-7 h-7 text-white" />
            <div className="absolute inset-0 rounded-2xl opacity-50 blur-lg"
              style={{ background: 'linear-gradient(135deg, hsla(143, 97%, 33%, 1.00), hsl(262 83% 65%))' }} />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Супер Админ</h1>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-8 animate-fade-in-up"
          style={{
            background: 'rgba(255,255,255,0.04)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
            animationDelay: '80ms',
          }}
        >
          {error && (
            <div className="mb-5 px-4 py-3 rounded-xl text-sm flex items-center gap-2.5 animate-scale-in"
              style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5' }}>
              <div className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5 ml-1">Имэйл</label>
              <div className="relative">
                <Mail className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-200 ${focusedField === 'email' ? 'text-indigo-400' : 'text-slate-500'}`} />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-white placeholder-slate-600 outline-none transition-all duration-200"
                  style={{
                    background: focusedField === 'email' ? 'rgba(99,102,241,0.08)' : 'rgba(255,255,255,0.04)',
                    border: focusedField === 'email' ? '1px solid rgba(99,102,241,0.5)' : '1px solid rgba(255,255,255,0.07)',
                    boxShadow: focusedField === 'email' ? '0 0 0 3px rgba(99,102,241,0.12)' : 'none',
                  }}
                  placeholder="admin@example.com"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5 ml-1">Нууц үг</label>
              <div className="relative">
                <Lock className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-200 ${focusedField === 'password' ? 'text-indigo-400' : 'text-slate-500'}`} />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  className="w-full pl-10 pr-11 py-3 rounded-xl text-sm text-white placeholder-slate-600 outline-none transition-all duration-200"
                  style={{
                    background: focusedField === 'password' ? 'rgba(99,102,241,0.08)' : 'rgba(255,255,255,0.04)',
                    border: focusedField === 'password' ? '1px solid rgba(99,102,241,0.5)' : '1px solid rgba(255,255,255,0.07)',
                    boxShadow: focusedField === 'password' ? '0 0 0 3px rgba(99,102,241,0.12)' : 'none',
                  }}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              id="login-submit"
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed relative overflow-hidden group"
              style={{
                background: 'linear-gradient(135deg, hsl(238 84% 67%), hsl(262 83% 55%))',
                boxShadow: '0 4px 20px rgba(99,102,241,0.4)',
              }}
            >
              {/* Shimmer */}
              <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 shimmer" />
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Нэвтэрч байна...
                </>
              ) : (
                <>
                  Нэвтрэх
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center mt-6 text-xs text-slate-600 animate-fade-in" style={{ animationDelay: '200ms' }}>
          Powered by{' '}
          <span className="text-gradient font-semibold">Zevtabs</span>
        </p>
      </div>
    </div>
  )
}

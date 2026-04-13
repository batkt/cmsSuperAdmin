'use client'

import { useState } from 'react'
import { Eye, EyeOff, Lock, Mail, ArrowRight, Zap } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { api } from '@/lib/api'

export default function Login() {
  const [email, setEmail] = useState('admin@demo.com')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const setSession = useAuthStore(s => s.setSession)

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const moveX = (clientX - window.innerWidth / 2) / 25;
    const moveY = (clientY - window.innerHeight / 2) / 25;
    setMousePos({ x: moveX, y: moveY });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    try {
      const data = await api.login(email, password)
      setSession(data.accessToken, data.refreshToken, data.user)
    } catch (err: any) {
      setError(err.message || 'Сервертэй холбогдож чадсангүй')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#070b1a]"
      onMouseMove={handleMouseMove}
    >
      {/* Ambient gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full opacity-30 transition-transform duration-700 ease-out"
          style={{
            background: 'radial-gradient(circle, hsl(238 84% 67%) 0%, transparent 70%)',
            transform: `translate(${mousePos.x}px, ${mousePos.y}px)`
          }}
        />
        <div
          className="absolute -bottom-40 -right-40 w-[700px] h-[700px] rounded-full opacity-20 transition-transform duration-1000 ease-out"
          style={{
            background: 'radial-gradient(circle, hsl(262 83% 65%) 0%, transparent 70%)',
            transform: `translate(${-mousePos.x * 1.5}px, ${-mousePos.y * 1.5}px)`
          }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-[0.03] transition-transform duration-500 ease-out"
          style={{
            background: 'radial-gradient(circle, #fff 0%, transparent 60%)',
            transform: `translate(${-mousePos.x * 0.5}px, ${-mousePos.y * 0.5}px)`
          }}
        />

        {/* Animated accent orb near mouse */}
        <div
          className="absolute w-[400px] h-[400px] rounded-full opacity-[0.15] blur-[100px] pointer-events-none transition-all duration-300 ease-out"
          style={{
            background: 'hsl(238 84% 67%)',
            left: `calc(50% + ${mousePos.x * 20}px)`,
            top: `calc(50% + ${mousePos.y * 20}px)`,
            transform: 'translate(-50%, -50%)',
          }}
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
            transform: `translate(${mousePos.x * (i + 1) * 0.1}px, ${mousePos.y * (i + 1) * 0.1}px)`
          }}
        />
      ))}

      <div className="relative z-10 w-full max-w-[420px] px-4">
        {/* Brand */}
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 mb-6 shadow-2xl shadow-indigo-500/20 active:scale-95 transition-transform duration-300">
            <Zap className="w-8 h-8 text-white fill-white/20" />
          </div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2">Супер Админ</h1>
          <p className="text-slate-400 text-sm font-medium">Системд тавтай морилно уу</p>
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

        <div className="text-center mt-8 animate-fade-in opacity-50 hover:opacity-100 transition-opacity duration-300" style={{ animationDelay: '300ms' }}>
          <p className="text-[11px] font-medium tracking-widest uppercase text-slate-500">
            <span className="text-white font-bold ml-1">Powered by Zevtabs</span>
          </p>
        </div>
      </div>
    </div>
  )
}

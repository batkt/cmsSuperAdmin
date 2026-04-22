import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface CmsProject {
  id: string
  name: string
  backendUrl: string
  token: string | null
  username: string
  lastConnected?: string
}

interface CmsState {
  projects: CmsProject[]
  addProject: (p: Omit<CmsProject, 'id'>) => string
  updateProject: (id: string, updates: Partial<CmsProject>) => void
  removeProject: (id: string) => void
  setToken: (id: string, token: string | null) => void
}

export const useCmsStore = create<CmsState>()(
  persist(
    (set) => ({
      projects: [],
      addProject: (p) => {
        const id = `cms-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
        set((s) => ({ projects: [...s.projects, { ...p, id }] }))
        return id
      },
      updateProject: (id, updates) =>
        set((s) => ({
          projects: s.projects.map((p) => (p.id === id ? { ...p, ...updates } : p)),
        })),
      removeProject: (id) =>
        set((s) => ({ projects: s.projects.filter((p) => p.id !== id) })),
      setToken: (id, token) =>
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === id
              ? { ...p, token, lastConnected: token ? new Date().toISOString() : p.lastConnected }
              : p,
          ),
        })),
    }),
    {
      name: 'cms-projects-store',
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
    },
  ),
)

'use client'

import { useState, useEffect } from 'react'
import { 
  Trash2, Play, Square, Loader2, Server, 
  Globe, Database, ExternalLink, RefreshCw, CheckCircle, XCircle,
  Edit3
} from 'lucide-react'
import { projectApi } from '@/lib/api-service'

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
}

export default function ProjectManagement({ isDarkMode, onEditProject }: ProjectManagementProps) {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionInProgress, setActionInProgress] = useState<string | null>(null)

  // Load projects on mount
  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    setIsLoading(true)
    setError('')
    try {
      // Load projects from backend API
      const response = await projectApi.list()
      console.log('Projects API response:', response)
      
      // Handle different response structures
      const projectsData = response.projects || response.data?.projects || response
      if (Array.isArray(projectsData)) {
        setProjects(projectsData)
      } else {
        setProjects([])
      }
      setIsLoading(false)
    } catch (err: any) {
      console.error('Failed to load projects:', err)
      setError(err.message)
      setIsLoading(false)
    }
  }

  const deleteProject = async (name: string) => {
    if (!confirm(`"${name}" төслийг устгах уу? Энэ үйлдлийг буцаах боломжгүй.`)) return
    
    setActionInProgress(name)
    try {
      await projectApi.delete(name)
      // Reload projects from backend after delete
      await loadProjects()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setActionInProgress(null)
    }
  }

  const generateSite = async (name: string) => {
    setActionInProgress(`${name}-generate`)
    try {
      await projectApi.generate(name)
      // Update project status
      setProjects(projects.map(p => 
        p.name === name ? { ...p, status: 'building' } : p
      ))
    } catch (err: any) {
      setError(err.message)
    } finally {
      setActionInProgress(null)
    }
  }

  const buildProject = async (name: string) => {
    setActionInProgress(`${name}-build`)
    try {
      await projectApi.build(name)
      setProjects(projects.map(p => 
        p.name === name ? { ...p, status: 'running' } : p
      ))
    } catch (err: any) {
      setError(err.message)
    } finally {
      setActionInProgress(null)
    }
  }

  const stopProject = async (name: string) => {
    setActionInProgress(`${name}-stop`)
    try {
      await projectApi.stop(name)
      setProjects(projects.map(p => 
        p.name === name ? { ...p, status: 'stopped' } : p
      ))
    } catch (err: any) {
      setError(err.message)
    } finally {
      setActionInProgress(null)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'stopped':
        return <XCircle className="w-5 h-5 text-gray-400" />
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />
      case 'building':
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
      default:
        return <Server className="w-5 h-5 text-gray-400" />
    }
  }

  return (
    <div className={`min-h-screen p-6 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <div className="mb-8">
        <h1 className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Төсөл удирдлага</h1>
        <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
          Төслүүдээ үүсгэж, удирдана уу
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

      {/* Projects List - Display projects created from WebsiteBuilder */}
      <div className={`rounded-xl border overflow-hidden shadow-lg ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className={`px-6 py-4 border-b flex justify-between items-center ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Төслүүд ({projects.length})</h2>
          <button
            onClick={loadProjects}
            disabled={isLoading}
            className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            title="Жагсаалт шинэчлэх"
          >
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
        
        {projects.length === 0 ? (
          <div className="p-12 text-center">
            <Server className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-300'}`} />
            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
              Төсөл байхгүй. Вебсайт угсрах-аас шинэ төсөл үүсгэнэ үү.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {projects.map((project) => (
              <div 
                key={project.name} 
                className={`px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors`}
              >
                <div className="flex items-center gap-4">
                  {getStatusIcon(project.status)}
                  <div>
                    <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{project.name}</h3>
                    <div className={`text-sm mt-1 flex items-center gap-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      <span className="flex items-center gap-1">
                        <Globe className="w-4 h-4" />
                        Порт {project.port}
                      </span>
                      <span className="flex items-center gap-1">
                        <Database className="w-4 h-4" />
                        {project.dbName} ({project.dbStatus})
                      </span>
                      {project.url && (
                        <a 
                          href={project.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-blue-500 hover:text-blue-600"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Visit
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Edit Project */}
                  {onEditProject && (
                    <button
                      onClick={() => onEditProject(project.name)}
                      className={`p-2 rounded-lg transition-colors ${
                        isDarkMode 
                          ? 'hover:bg-gray-700 text-blue-400' 
                          : 'hover:bg-gray-100 text-blue-600'
                      }`}
                      title="Засварлах"
                    >
                      <Edit3 className="w-5 h-5" />
                    </button>
                  )}

                  {/* Generate Site */}
                  <button
                    onClick={() => generateSite(project.name)}
                    disabled={actionInProgress === `${project.name}-generate`}
                    className={`p-2 rounded-lg transition-colors ${
                      isDarkMode 
                        ? 'hover:bg-gray-700 text-gray-300' 
                        : 'hover:bg-gray-100 text-gray-600'
                    }`}
                    title="Сайт үүсгэх"
                  >
                    <RefreshCw className={`w-5 h-5 ${actionInProgress === `${project.name}-generate` ? 'animate-spin' : ''}`} />
                  </button>

                  {/* Build/Start */}
                  {project.status === 'stopped' ? (
                    <button
                      onClick={() => buildProject(project.name)}
                      disabled={actionInProgress === `${project.name}-build`}
                      className="p-2 rounded-lg hover:bg-green-100 text-green-600 transition-colors"
                      title="Барих/Эхлүүлэх"
                    >
                      <Play className="w-5 h-5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => stopProject(project.name)}
                      disabled={actionInProgress === `${project.name}-stop`}
                      className="p-2 rounded-lg hover:bg-red-100 text-red-600 transition-colors"
                      title="Зогсоох"
                    >
                      <Square className="w-5 h-5" />
                    </button>
                  )}

                  {/* Delete */}
                  <button
                    onClick={() => deleteProject(project.name)}
                    disabled={actionInProgress === project.name}
                    className="p-2 rounded-lg hover:bg-red-100 text-red-600 transition-colors"
                    title="Устгах"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

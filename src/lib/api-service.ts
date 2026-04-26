// API Service for Server Control Backend
// Based on SUPERADMIN.md specification

const getApiUrl = () => {
  if (typeof window !== 'undefined') return '/api/proxy'
  return localStorage.getItem('apiUrl') || 'http://202.179.6.77:4000'
}
function readZustandAccessToken(): string {
  if (typeof window === 'undefined') return ''
  try {
    const raw = localStorage.getItem('auth-storage')
    if (!raw) return ''
    const p = JSON.parse(raw) as { state?: { accessToken?: string } }
    if (p.state?.accessToken && typeof p.state.accessToken === 'string') return p.state.accessToken
  } catch {
    /* ignore */
  }
  return ''
}

const getToken = () => readZustandAccessToken() || localStorage.getItem('superadminToken') || localStorage.getItem('token') || ''
const isLatin1Safe = (value: string) => /^[\x00-\xFF]*$/.test(value)
const getComponentApiBase = () => `${getApiUrl()}/api/v2/core/components`

type ComponentPayload = {
  componentType?: string
  pageRoute?: string
  props?: Record<string, any>
  content?: object | string
}

const headers = (includeProject = false, projectName?: string) => {
  const h: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getToken()}`,
  }
  
  if (projectName) {
    const normalized = projectName.trim()
    if (isLatin1Safe(normalized)) {
      h['x-project-id'] = normalized
      h['x-project-name'] = normalized
    }
  }
  
  return h
}

const componentHeaders = (projectName: string) => {
  return headers(true, projectName)
}

const ensureComponentRequiredProps = (payload: ComponentPayload): ComponentPayload => {
  const type = payload.componentType?.toLowerCase()
  if (!type) return payload

  const nextProps: Record<string, any> = { ...(payload.props || {}) }
  const title = typeof nextProps.title === 'string' ? nextProps.title.trim() : ''

  if ((type === 'header' || type === 'hero') && !title) {
    nextProps.title = type === 'header' ? 'Site Header' : 'Welcome'
  }
  if (type === 'footer') {
    if (!title) {
      nextProps.title = 'Footer'
    }
    const copyright = typeof nextProps.copyright === 'string' ? nextProps.copyright.trim() : ''
    if (!copyright) {
      nextProps.copyright = `© ${new Date().getFullYear()} All rights reserved.`
    }
  }

  return {
    ...payload,
    props: nextProps,
  }
}

// Error handler
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    const msg = error.data?.error || error.error || error.message || `HTTP ${response.status}: ${response.statusText}`
    
    if (response.status === 401) {
      throw new Error(msg || 'Unauthorized: missing, expired, or invalid access token')
    }
    if (response.status === 403) {
      throw new Error(msg || 'Forbidden: insufficient route role or project role')
    }
    throw new Error(msg)
  }
  return response.json()
}

// ==================== AUTH ====================
export const authApi = {
  login: async (email: string, password: string, apiUrl: string) => {
    const response = await fetch(`${apiUrl}/api/v2/core/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    return handleResponse(response)
  },
}

// ==================== PROJECTS ====================
export const projectApi = {
  // List all projects
  list: async () => {
    const response = await fetch(`${getApiUrl()}/api/v2/core/projects`, {
      headers: headers(),
    })
    return handleResponse(response)
  },

  // Create project
  create: async (projectName: string) => {
    const response = await fetch(`${getApiUrl()}/api/v2/core/projects/generate`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ projectName }),
    })
    return handleResponse(response)
  },

  // Delete project
  delete: async (name: string) => {
    const response = await fetch(`${getApiUrl()}/api/v2/core/projects/${name}`, {
      method: 'DELETE',
      headers: headers(),
    })
    return handleResponse(response)
  },

  // Generate site (scaffold + build)
  generate: async (projectName: string) => {
    const response = await fetch(`${getApiUrl()}/api/v2/core/projects/generate`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ projectName }),
    })
    return handleResponse(response)
  },

  // Get project details/logs would be added here
  get: async (name: string) => {
    const response = await fetch(`${getApiUrl()}/api/v2/core/projects/${name}`, {
      headers: headers(),
    })
    return handleResponse(response)
  },

  // Build project
  build: async (name: string) => {
    const response = await fetch(`${getApiUrl()}/api/v2/core/projects/${name}/build`, {
      method: 'POST',
      headers: headers(),
    })
    return handleResponse(response)
  },

  // Stop project
  stop: async (name: string) => {
    const response = await fetch(`${getApiUrl()}/api/v2/core/projects/${name}/stop`, {
      method: 'POST',
      headers: headers(),
    })
    return handleResponse(response)
  },
}

// ==================== USERS ====================
export const userApi = {
  // List all users
  list: async () => {
    const response = await fetch(`${getApiUrl()}/api/v2/core/users`, {
      headers: headers(),
    })
    return handleResponse(response)
  },

  // Create user
  create: async (email: string, password: string, role: 'superadmin' | 'client-admin' | 'editor' = 'client-admin') => {
    const response = await fetch(`${getApiUrl()}/api/v2/core/users`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ email, password, role }),
    })
    return handleResponse(response)
  },

  // Get user project bindings
  getBindings: async (email: string) => {
    const response = await fetch(`${getApiUrl()}/api/v2/core/users/${encodeURIComponent(email)}/bindings`, {
      headers: headers(),
    })
    return handleResponse(response)
  },

  // Add/Update user project binding
  addBinding: async (email: string, projectName: string, roles: string[] = ['editor']) => {
    const response = await fetch(`${getApiUrl()}/api/v2/core/users/${encodeURIComponent(email)}/bindings`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ projectName, roles }),
    })
    return handleResponse(response)
  },

  // Remove user project binding
  removeBinding: async (email: string, projectName: string) => {
    const response = await fetch(`${getApiUrl()}/api/v2/core/users/${encodeURIComponent(email)}/bindings/${projectName}`, {
      method: 'DELETE',
      headers: headers(),
    })
    return handleResponse(response)
  },

  // Delete user
  delete: async (email: string) => {
    const response = await fetch(`${getApiUrl()}/api/v2/core/users/${encodeURIComponent(email)}`, {
      method: 'DELETE',
      headers: headers(),
    })
    return handleResponse(response)
  },

  // Update user
  update: async (email: string, data: { password?: string; role?: string }) => {
    const response = await fetch(`${getApiUrl()}/api/v2/core/users/${encodeURIComponent(email)}`, {
      method: 'PATCH',
      headers: headers(),
      body: JSON.stringify(data),
    })
    return handleResponse(response)
  },
}

// ==================== INFRASTRUCTURE ====================
export const infrastructureApi = {
  // List servers
  listServers: async () => {
    const response = await fetch(`${getApiUrl()}/api/v2/infrastructure/servers`, {
      headers: headers(),
    })
    return handleResponse(response)
  },

  // Register server
  createServer: async (data: {
    name: string
    host: string
    user: string
    port?: number
    authMode?: 'ssh-key' | 'password' | 'agent'
    sshKeyPath?: string
    knownHostsPath?: string
    labels?: string[]
    isActive?: boolean
  }) => {
    const response = await fetch(`${getApiUrl()}/api/v2/infrastructure/servers`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(data),
    })
    return handleResponse(response)
  },

  // Execute remote command
  execCommand: async (serverId: string, command: string) => {
    const response = await fetch(`${getApiUrl()}/api/v2/infrastructure/servers/${serverId}/exec`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ command }),
    })
    return handleResponse(response)
  },
}

// ==================== DESIGNS ====================
export const designApi = {
  // Create design
  create: async (data: {
    projectName: string
    title?: string
    description?: string
    theme?: object
    typography?: object
  }) => {
    const response = await fetch(`${getApiUrl()}/api/v2/core/designs`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(data),
    })
    return handleResponse(response)
  },

  // Patch design
  patch: async (name: string, data: object) => {
    const response = await fetch(`${getApiUrl()}/api/v2/core/designs/${name}`, {
      method: 'PATCH',
      headers: headers(),
      body: JSON.stringify(data),
    })
    return handleResponse(response)
  },
}

// ==================== COMPONENTS ====================
export const componentApi = {
  // Create component
  create: async (projectName: string, data: {
    componentType: string
    pageRoute?: string
    props?: object
    content?: object | string
  }) => {
    const normalizedProject = projectName.trim()
    const safeData = ensureComponentRequiredProps(data)
    const response = await fetch(`${getComponentApiBase()}?projectId=${encodeURIComponent(normalizedProject)}`, {
      method: 'POST',
      headers: componentHeaders(normalizedProject),
      body: JSON.stringify({
        ...safeData,
        projectId: normalizedProject,
      }),
    })
    return handleResponse(response)
  },

  // Patch component
  patch: async (projectName: string, instanceId: string, data: {
    componentType?: string
    pageRoute?: string
    props?: object
    content?: object | string
  }) => {
    const normalizedProject = projectName.trim()
    const safeData = ensureComponentRequiredProps(data)
    const response = await fetch(`${getComponentApiBase()}/${instanceId}?projectId=${encodeURIComponent(normalizedProject)}`, {
      method: 'PATCH',
      headers: componentHeaders(normalizedProject),
      body: JSON.stringify({
        ...safeData,
        projectId: normalizedProject,
      }),
    })
    return handleResponse(response)
  },

  // Reorder components
  reorder: async (projectName: string, instances: Array<{
    instanceId: string
    order: number
    parentId?: string | null
  }>) => {
    const normalizedProject = projectName.trim()
    const response = await fetch(`${getComponentApiBase()}/reorder?projectId=${encodeURIComponent(normalizedProject)}`, {
      method: 'POST',
      headers: componentHeaders(normalizedProject),
      body: JSON.stringify({ instances, projectId: normalizedProject }),
    })
    return handleResponse(response)
  },
}

// API Service for Server Control Backend
// Based on SUPERADMIN.md specification

const getApiUrl = () => localStorage.getItem('apiUrl') || 'http://202.179.6.77:4000'
const getToken = () => localStorage.getItem('superadminToken')

const headers = (includeProject = false, projectName?: string) => {
  const h: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getToken()}`,
  }
  if (includeProject && projectName) {
    h['x-project-id'] = projectName
  }
  return h
}

// Error handler
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.message || `HTTP ${response.status}: ${response.statusText}`)
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
    const response = await fetch(`${getApiUrl()}/api/v2/core/components`, {
      method: 'POST',
      headers: headers(true, projectName),
      body: JSON.stringify(data),
    })
    return handleResponse(response)
  },

  // Patch component
  patch: async (projectName: string, instanceId: string, data: {
    pageRoute?: string
    props?: object
    content?: object | string
  }) => {
    const response = await fetch(`${getApiUrl()}/api/v2/core/components/${instanceId}`, {
      method: 'PATCH',
      headers: headers(true, projectName),
      body: JSON.stringify(data),
    })
    return handleResponse(response)
  },

  // Reorder components
  reorder: async (projectName: string, instances: Array<{
    instanceId: string
    order: number
    parentId?: string | null
  }>) => {
    const response = await fetch(`${getApiUrl()}/api/v2/core/components/reorder`, {
      method: 'POST',
      headers: headers(true, projectName),
      body: JSON.stringify({ instances }),
    })
    return handleResponse(response)
  },
}

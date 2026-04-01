// API configuration and endpoints for the website builder admin panel

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

// Types for API responses
export interface User {
  id: string
  name: string
  email: string
  domain: string
  status: 'active' | 'inactive'
  createdAt: string
}

export interface Template {
  id: string
  name: string
  category: string
  preview: string
  isPremium: boolean
  rating: number
  downloads: number
  components: any[]
}

export interface Website {
  id: string
  userId: string
  domain: string
  templateId?: string
  components: any[]
  published: boolean
  createdAt: string
  updatedAt: string
}


class ApiClient {
  private baseURL: string

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseURL}${endpoint}`
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }


  async getUsers(): Promise<User[]> {
    return this.request('/users')
  }

  async createUser(userData: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  }

  async updateUser(id: string, userData: Partial<User>): Promise<User> {
    return this.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    })
  }

  async deleteUser(id: string): Promise<void> {
    return this.request(`/users/${id}`, {
      method: 'DELETE',
    })
  }

  // Template Management APIs
  async getTemplates(): Promise<Template[]> {
    return this.request('/templates')
  }

  async getTemplate(id: string): Promise<Template> {
    return this.request(`/templates/${id}`)
  }

  async createTemplate(templateData: Omit<Template, 'id' | 'downloads'>): Promise<Template> {
    return this.request('/templates', {
      method: 'POST',
      body: JSON.stringify(templateData),
    })
  }

  // Website Management APIs
  async getWebsites(userId?: string): Promise<Website[]> {
    const endpoint = userId ? `/websites?userId=${userId}` : '/websites'
    return this.request(endpoint)
  }

  async getWebsite(id: string): Promise<Website> {
    return this.request(`/websites/${id}`)
  }

  async createWebsite(websiteData: Omit<Website, 'id' | 'createdAt' | 'updatedAt'>): Promise<Website> {
    return this.request('/websites', {
      method: 'POST',
      body: JSON.stringify(websiteData),
    })
  }

  async updateWebsite(id: string, websiteData: Partial<Website>): Promise<Website> {
    return this.request(`/websites/${id}`, {
      method: 'PUT',
      body: JSON.stringify(websiteData),
    })
  }

  async deleteWebsite(id: string): Promise<void> {
    return this.request(`/websites/${id}`, {
      method: 'DELETE',
    })
  }

  async publishWebsite(id: string): Promise<Website> {
    return this.request(`/websites/${id}/publish`, {
      method: 'POST',
    })
  }
}

// Export singleton instance
export const apiClient = new ApiClient(API_BASE_URL)

// Export individual API functions for convenience
export const {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getTemplates,
  getTemplate,
  createTemplate,
  getWebsites,
  getWebsite,
  createWebsite,
  updateWebsite,
  deleteWebsite,
  publishWebsite,
} = apiClient

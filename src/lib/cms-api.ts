// API Service for CMS Backend Integration
// Base URL: http://202.179.6.77:4000/api/v2/core

const BASE_URL = 'http://202.179.6.77:4000/api/v2/core'

// Get auth token from localStorage
const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('superadminToken') || localStorage.getItem('token') || ''
  }
  return ''
}

// Get current project name from localStorage
const getCurrentProject = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('currentProject') || localStorage.getItem('projectName') || ''
  }
  return ''
}

// Helper function for API requests
async function fetchAPI(endpoint: string, options?: RequestInit, compress: boolean = false) {
  const url = `${BASE_URL}${endpoint}`
  
  let body = options?.body
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getToken()}`,
  }
  
  // Note: x-project-id header removed due to CORS - using body instead
  
  if (options?.headers) {
    Object.entries(options.headers).forEach(([key, value]) => {
      if (typeof value === 'string') {
        headers[key] = value
      }
    })
  }
  
  // Compress large payloads
  if (compress && body && typeof body === 'string' && body.length > 10000) {
    try {
      const encoder = new TextEncoder()
      const data = encoder.encode(body)
      const compressed = await compressData(data)
      body = compressed
      headers['Content-Encoding'] = 'gzip'
      headers['Content-Type'] = 'application/gzip'
    } catch (e) {
      console.warn('Compression failed, sending uncompressed:', e)
    }
  }

  const response = await fetch(url, {
    ...options,
    headers,
    body,
  })

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error')
    throw new Error(`API Error ${response.status}: ${errorText}`)
  }

  return response.json()
}

// Compression helper using CompressionStream API
async function compressData(data: Uint8Array): Promise<Blob> {
  const buffer = new Uint8Array(data)
  const stream = new Blob([buffer.buffer]).stream()
  const compressedStream = stream.pipeThrough(new CompressionStream('gzip'))
  return new Response(compressedStream).blob()
}

// Helper to compress and send large payloads
async function fetchAPICompressed(endpoint: string, options?: RequestInit) {
  return fetchAPI(endpoint, options, true)
}

// ==================== 3. COMPONENTS API (/api/v2/core/components) ====================

export interface ComponentTemplate {
  type: string // e.g., 'Navbar', 'Hero'
  category: string // 'Navbar', 'Hero', 'News', etc.
  code: string // React component code as string
  description?: string
  defaultProps?: Record<string, any>
  projectName?: string // If provided, this is a project-specific component
}

export const ComponentAPI = {
  // GET /api/components - List all components
  // Query params: ?category=...&projectName=...
  listComponents: (params?: { category?: string; projectName?: string }) => {
    const query = params
      ? '?' + new URLSearchParams(Object.entries(params).filter(([_, v]) => v)).toString()
      : ''
    return fetchAPI(`/components${query}`)
  },

  // GET /api/components/:type - Get specific component
  // Query params: ?projectName=...
  getComponent: (type: string, projectName?: string) => {
    const query = projectName ? `?projectName=${projectName}` : ''
    return fetchAPI(`/components/${type}${query}`)
  },

  // POST /api/components - Create or update component
  saveComponent: (component: ComponentTemplate) =>
    fetchAPI('/components', {
      method: 'POST',
      body: JSON.stringify(component),
    }),

  // PUT /api/components/:type - Update specific component
  updateComponent: (type: string, component: Partial<ComponentTemplate>) =>
    fetchAPI(`/components/${type}`, {
      method: 'PUT',
      body: JSON.stringify(component),
    }),

  // DELETE /api/components/:type - Delete component
  // Body: { projectName: string } (for project-level components)
  deleteComponent: (type: string, projectName?: string) =>
    fetchAPI(`/components/${type}`, {
      method: 'DELETE',
      body: JSON.stringify(projectName ? { projectName } : {}),
    }),
}

// ==================== 1. PROJECTS API (/api/v2/core/projects) ====================

export interface Project {
  name: string
  status?: 'running' | 'stopped' | 'building'
  port?: number
  url?: string
  githubRepo?: {
    owner: string
    repo: string
    branch: string
  }
  createdAt?: string
  updatedAt?: string
}

export const ProjectAPI = {
  // GET /api/projects - List all projects
  listProjects: () =>
    fetchAPI('/projects'),

  // GET /api/projects/:name - Get specific project
  getProject: (name: string) =>
    fetchAPI(`/projects/${name}`),

  // POST /api/projects - Create new project
  createProject: (projectName: string) =>
    fetchAPI('/projects', {
      method: 'POST',
      body: JSON.stringify({ projectName }),
    }),

  // PATCH /api/projects/:name - Update project metadata
  updateProject: (name: string, updates: Partial<Project>) =>
    fetchAPI(`/projects/${name}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }),

  // DELETE /api/projects/:name - Delete project
  deleteProject: (name: string) =>
    fetchAPI(`/projects/${name}`, {
      method: 'DELETE',
    }),

  // POST /api/projects/:name/stop - Stop running project
  stopProject: (name: string) =>
    fetchAPI(`/projects/${name}/stop`, {
      method: 'POST',
    }),

  // POST /api/projects/:name/build - Build for production
  buildProject: (name: string) =>
    fetchAPI(`/projects/${name}/build`, {
      method: 'POST',
    }),

  // POST /api/projects/generate - Generate site from design
  generateSite: (projectName: string): Promise<{ success: boolean; port: number; url: string; message: string }> =>
    fetchAPI('/projects/generate', {
      method: 'POST',
      body: JSON.stringify({ projectName }),
    }),
}

// ==================== 2. DESIGNS API (/api/v2/core/designs) ====================

export interface ComponentInstance {
  type: string // e.g., 'Navbar', 'Hero', 'News'
  props: Record<string, any>
  order?: number
}

export interface Page {
  route: string // e.g., '/', '/about'
  title: string
  description?: string
  components: ComponentInstance[]
}

export interface Theme {
  primaryColor?: string
  secondaryColor?: string
  fontFamily?: string
  darkMode?: boolean
}

export interface WebsiteDesign {
  projectName: string
  theme: Theme
  pages: Page[]
  domain?: string
  createdAt?: string
  updatedAt?: string
}

export const DesignAPI = {
  // GET /api/designs - List all designs
  listDesigns: () =>
    fetchAPI('/designs'),

  // GET /api/designs/:name - Get specific design
  getDesign: (name: string) =>
    fetchAPI(`/designs/${name}`),

  // POST /api/designs - Create or update design (upsert) with compression
  saveDesign: (design: WebsiteDesign) =>
    fetchAPICompressed('/designs', {
      method: 'POST',
      body: JSON.stringify(design),
    }),

  // PATCH /api/designs/:name - Update specific design
  updateDesign: (name: string, updates: Partial<WebsiteDesign>) =>
    fetchAPI(`/designs/${name}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }),

  // DELETE /api/designs/:name - Delete design
  deleteDesign: (name: string) =>
    fetchAPI(`/designs/${name}`, {
      method: 'DELETE',
    }),

  // POST /api/designs/:name/pages/:route - Add or update a page
  savePage: (projectName: string, route: string, page: Omit<Page, 'route'>) =>
    fetchAPI(`/designs/${projectName}/pages/${encodeURIComponent(route)}`, {
      method: 'POST',
      body: JSON.stringify(page),
    }),

  // DELETE /api/designs/:name/pages/:route - Delete a page
  deletePage: (projectName: string, route: string) =>
    fetchAPI(`/designs/${projectName}/pages/${encodeURIComponent(route)}`, {
      method: 'DELETE',
    }),
}

// ==================== 4. CONTENT MANAGEMENT (/api/v2/core/sites/:projectName/...) ====================

// These are content items that populate the component instances

export interface NewsItem {
  id: string
  title: string
  content: string
  excerpt: string
  author: string
  publishedAt: string
  status: 'published' | 'draft'
  imageUrl?: string
  category: string
  views?: number
}

export interface RentalAd {
  id: string
  title: string
  description: string
  price: number
  priceType: 'monthly' | 'daily'
  location: string
  bedrooms: number
  bathrooms: number
  area: number
  images: string[]
  contactName: string
  contactPhone: string
  status: 'active' | 'inactive'
  category: 'apartment' | 'house' | 'office' | 'shop'
}

export interface JobPosting {
  id: string
  title: string
  company: string
  location: string
  salary: {
    min: number
    max: number
    type: 'monthly' | 'hourly' | 'project'
  }
  type: 'full-time' | 'part-time' | 'contract' | 'internship'
  category: string
  description: string
  requirements: string[]
  benefits: string[]
  contactEmail: string
  contactPhone: string
  deadline: string
  status: 'active' | 'closed' | 'draft'
  applications?: number
}

export const ContentAPI = {
  // News Management
  getNews: (projectName: string) =>
    fetchAPI(`/sites/${projectName}/news`),

  createNews: (projectName: string, news: NewsItem) =>
    fetchAPI(`/sites/${projectName}/news`, {
      method: 'POST',
      body: JSON.stringify(news),
    }),

  updateNews: (projectName: string, newsId: string, news: NewsItem) =>
    fetchAPI(`/sites/${projectName}/news/${newsId}`, {
      method: 'PUT',
      body: JSON.stringify(news),
    }),

  deleteNews: (projectName: string, newsId: string) =>
    fetchAPI(`/sites/${projectName}/news/${newsId}`, {
      method: 'DELETE',
    }),

  // Rental Ads Management
  getRentals: (projectName: string) =>
    fetchAPI(`/sites/${projectName}/rentals`),

  createRental: (projectName: string, rental: RentalAd) =>
    fetchAPI(`/sites/${projectName}/rentals`, {
      method: 'POST',
      body: JSON.stringify(rental),
    }),

  updateRental: (projectName: string, rentalId: string, rental: RentalAd) =>
    fetchAPI(`/sites/${projectName}/rentals/${rentalId}`, {
      method: 'PUT',
      body: JSON.stringify(rental),
    }),

  deleteRental: (projectName: string, rentalId: string) =>
    fetchAPI(`/sites/${projectName}/rentals/${rentalId}`, {
      method: 'DELETE',
    }),

  // Job Postings Management
  getJobs: (projectName: string) =>
    fetchAPI(`/sites/${projectName}/jobs`),

  createJob: (projectName: string, job: JobPosting) =>
    fetchAPI(`/sites/${projectName}/jobs`, {
      method: 'POST',
      body: JSON.stringify(job),
    }),

  updateJob: (projectName: string, jobId: string, job: JobPosting) =>
    fetchAPI(`/sites/${projectName}/jobs/${jobId}`, {
      method: 'PUT',
      body: JSON.stringify(job),
    }),

  deleteJob: (projectName: string, jobId: string) =>
    fetchAPI(`/sites/${projectName}/jobs/${jobId}`, {
      method: 'DELETE',
    }),
}

// ==================== 5. PROJECT DATA API (/api/v2/core/data) ====================

// Arbitrary key-value storage for projects

export const DataAPI = {
  // GET /api/data/:name - Get all data for project
  getAllData: (projectName: string) =>
    fetchAPI(`/data/${projectName}`),

  // GET /api/data/:name/:key - Get specific data key
  getData: (projectName: string, key: string) =>
    fetchAPI(`/data/${projectName}/${key}`),

  // POST /api/data/:name - Set or update a data key
  // Body: { key: string, value: any }
  setData: (projectName: string, key: string, value: any) =>
    fetchAPI(`/data/${projectName}`, {
      method: 'POST',
      body: JSON.stringify({ key, value }),
    }),

  // DELETE /api/data/:name/:key - Delete data key
  deleteData: (projectName: string, key: string) =>
    fetchAPI(`/data/${projectName}/${key}`, {
      method: 'DELETE',
    }),
}

// Content management using DataAPI for storage (refactored)
export const ContentDataAPI = {
  // News Management (stored as 'news' key in project data)
  getNews: async (projectName: string): Promise<NewsItem[]> => {
    const data = await DataAPI.getData(projectName, 'news')
    return data?.value || []
  },

  saveNews: async (projectName: string, news: NewsItem[]) =>
    DataAPI.setData(projectName, 'news', news),

  // Rental Ads Management
  getRentals: async (projectName: string): Promise<RentalAd[]> => {
    const data = await DataAPI.getData(projectName, 'rentals')
    return data?.value || []
  },

  saveRentals: async (projectName: string, rentals: RentalAd[]) =>
    DataAPI.setData(projectName, 'rentals', rentals),

  // Job Postings Management
  getJobs: async (projectName: string): Promise<JobPosting[]> => {
    const data = await DataAPI.getData(projectName, 'jobs')
    return data?.value || []
  },

  saveJobs: async (projectName: string, jobs: JobPosting[]) =>
    DataAPI.setData(projectName, 'jobs', jobs),
}

// ==================== 6. COMPONENT REGISTRATION HELPERS ====================

export const ComponentRegistration = {
  // Create a component template
  createTemplate: (
    type: string,
    category: string,
    code: string,
    description: string,
    defaultProps: Record<string, any> = {},
    projectName?: string
  ): ComponentTemplate => ({
    type,
    category,
    code,
    description,
    defaultProps,
    projectName,
  }),

  // Register all standard components
  registerStandardComponents: async () => {
    const standardComponents: ComponentTemplate[] = [
      {
        type: 'header',
        category: 'Navbar',
        description: 'Site header with navigation',
        code: `export default function Header({ title, navLinks, logoUrl }) {
  return (
    <header className="flex justify-between items-center p-4 bg-white shadow-sm">
      {logoUrl && <img src={logoUrl} alt="Logo" className="h-10" />}
      <h1 className="text-xl font-bold">{title}</h1>
      <nav className="space-x-4">
        {Object.entries(navLinks || {}).map(([key, label]) => (
          <a key={key} href={\`#\${key}\`} className="text-gray-600 hover:text-blue-600">{label}</a>
        ))}
      </nav>
    </header>
  )
}`,
        defaultProps: {
          title: 'My Website',
          navLinks: { home: 'Home', about: 'About', services: 'Services', contact: 'Contact' }
        }
      },
      {
        type: 'Hero',
        category: 'Hero',
        description: 'Hero section with title and CTA',
        code: `export default function Hero({ title, subtitle, ctaText }) {
  return (
    <div className="py-20 px-4 text-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">{title}</h1>
      <p className="text-xl text-gray-600 mb-8">{subtitle}</p>
      {ctaText && <button className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">{ctaText}</button>}
    </div>
  )
}`,
        defaultProps: {
          title: 'The Future of CMS',
          subtitle: 'Built for scale and performance.',
          ctaText: 'Explore Now'
        }
      },
      {
        type: 'Navbar',
        category: 'Navbar',
        description: 'Navigation bar component',
        code: `export default function Navbar({ togglePosition, links = [] }) {
  return (
    <nav className="bg-white shadow-sm px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="font-bold text-xl">Logo</div>
        <div className={\`flex gap-4 \${togglePosition === 'right' ? 'ml-auto' : ''}\`}>
          {links.map(link => (
            <a key={link.href} href={link.href} className="text-gray-600 hover:text-blue-600">{link.label}</a>
          ))}
        </div>
      </div>
    </nav>
  )
}`,
        defaultProps: {
          togglePosition: 'right',
          links: [{ label: 'Home', href: '/' }, { label: 'About', href: '/about' }]
        }
      }
    ]

    const results = await Promise.all(
      standardComponents.map(comp =>
        ComponentAPI.saveComponent(comp).catch(err => {
          console.error(`Failed to register ${comp.type}:`, err)
          return null
        })
      )
    )

    return results.filter(r => r !== null)
  }
}

// ==================== COMBINED EXPORTS ====================

export const CMSAPI = {
  Project: ProjectAPI,
  Design: DesignAPI,
  Component: ComponentAPI,
  Data: DataAPI,
  Content: ContentAPI,
  ContentData: ContentDataAPI,
  Registration: ComponentRegistration,
}

export default CMSAPI

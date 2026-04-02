// API Service for CMS Backend Integration
// Base URL: http://202.179.6.77:4000/api

const BASE_URL = 'http://202.179.6.77:4000/api'

// Helper function for API requests
async function fetchAPI(endpoint: string, options?: RequestInit) {
  const url = `${BASE_URL}${endpoint}`
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

// ==================== 1. COMPONENT LIBRARY MANAGEMENT ====================

export interface ComponentTemplate {
  id?: string
  type: string // e.g. 'Hero', 'Navbar', 'News', 'Rental', 'Jobs', 'ContactForm', 'Chatbot'
  scope: 'GLOBAL' | 'PROJECT'
  projectName?: string | null // Only used if scope is 'PROJECT'
  category: string // Navbar, Hero, News, Rental, Jobs, Footer, etc.
  code: string // The React code string
  description?: string
  defaultProps?: Record<string, any>
  createdAt?: string
}

export const ComponentAPI = {
  // Create or update a component template
  saveComponent: (component: ComponentTemplate) =>
    fetchAPI('/components', {
      method: 'POST',
      body: JSON.stringify(component),
    }),

  // List all components, optionally filtered by category or scope
  getComponents: (category?: string, scope?: 'GLOBAL' | 'PROJECT', projectName?: string) => {
    let query = ''
    const params: string[] = []
    if (category) params.push(`category=${category}`)
    if (scope) params.push(`scope=${scope}`)
    if (projectName) params.push(`projectName=${projectName}`)
    if (params.length > 0) query = '?' + params.join('&')
    return fetchAPI(`/components${query}`)
  },

  // Get component by type and project (for override logic)
  getComponent: (type: string, projectName?: string) =>
    fetchAPI(`/components/${type}${projectName ? `?projectName=${projectName}` : ''}`),
}

// ==================== 2. PROJECT MANAGEMENT ====================

export interface Project {
  name: string
  port?: number
  url?: string
  status?: 'running' | 'stopped'
}

export const ProjectAPI = {
  // Create a new Next.js project from template
  createProject: (projectName: string, domain?: string) =>
    fetchAPI('/create-project', {
      method: 'POST',
      body: JSON.stringify({ projectName, domain }),
    }),

  // List all active project instances and their ports
  getProjects: () =>
    fetchAPI('/projects'),
}

// ==================== 3. SITE GENERATION & DEPLOYMENT ====================

export interface SiteGenerationResponse {
  success: boolean
  port: number
  url: string
  message: string
}

export const SiteAPI = {
  // Generate project structure and start Next.js server
  // Use this after updating a site design in DB
  generateSite: (projectName: string) =>
    fetchAPI('/sites/generate', {
      method: 'POST',
      body: JSON.stringify({ projectName }),
    }) as Promise<SiteGenerationResponse>,

  // Trigger production build and sync to GitHub
  buildProject: (projectName: string) =>
    fetchAPI(`/projects/${projectName}/build`, {
      method: 'POST',
    }),
}

// ==================== 4. SITE DESIGN & CONTENT ====================

// Component Instance - the bridge between library and site structure
export interface ComponentInstance {
  id?: string
  type: string // must exist in ComponentLibrary
  props: Record<string, any>
  order?: number
}

// Page Schema
export interface Page {
  id?: string
  route: string // e.g., '/', '/about', '/pricing'
  title: string
  description?: string
  components: ComponentInstance[]
}

// Theme Configuration
export interface Theme {
  primaryColor?: string
  secondaryColor?: string
  fontFamily?: string
  darkMode?: boolean
}

// Website Design Schema - The root document
export interface WebsiteDesign {
  id?: string
  projectName: string
  domain?: string
  theme: Theme
  pages: Page[]
  createdAt?: string
  updatedAt?: string
}

export const DesignAPI = {
  // List all project designs stored in database
  getDesigns: () =>
    fetchAPI('/designs'),

  // Fetch full JSON design for a specific project
  getSiteContent: (projectName: string) =>
    fetchAPI(`/sites/${projectName}/content`),

  // Note: Design is auto-created when project is created
  // Use updateDesign to modify existing design
  updateDesign: (projectName: string, design: Partial<WebsiteDesign>) =>
    fetchAPI(`/sites/${projectName}/content`, {
      method: 'PUT',
      body: JSON.stringify(design),
    }),
}

// ==================== 5. CONTENT MANAGEMENT (News, Rental, Jobs) ====================

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

// ==================== COMPONENT REGISTRATION HELPERS ====================

// Helper to convert WebsiteBuilder components to ComponentLibrary format
export const ComponentRegistration = {
  // Create a component template from WebsiteBuilder component code
  createTemplate: (
    type: string,
    category: string,
    code: string,
    description: string,
    defaultProps: Record<string, any> = {},
    scope: 'GLOBAL' | 'PROJECT' = 'GLOBAL',
    projectName?: string
  ): ComponentTemplate => ({
    type,
    category,
    code,
    description,
    defaultProps,
    scope,
    projectName: scope === 'PROJECT' ? projectName : null,
  }),

  // Register all standard components to the backend
  registerStandardComponents: async () => {
    const standardComponents: ComponentTemplate[] = [
      {
        type: 'header',
        category: 'Navbar',
        scope: 'GLOBAL',
        projectName: null,
        description: 'Site header with navigation links',
        code: `export default function Header({ title, navLinks, logoUrl, logoPosition }) {
  return (
    <header className="flex justify-between items-center p-4">
      {logoUrl && <img src={logoUrl} alt="Logo" className="w-12 h-12" />}
      <h1 className="text-2xl font-bold">{title}</h1>
      <nav className="space-x-6">
        {Object.entries(navLinks || {}).map(([key, label]) => (
          <a key={key} href={\`#\${key}\`} className="hover:opacity-80">{label}</a>
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
        type: 'news',
        category: 'News',
        scope: 'GLOBAL',
        projectName: null,
        description: 'News/Medee component with grid layout',
        code: `export default function News({ title, items = [] }) {
  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold mb-6 text-center">{title || 'Мэдээ мэдээлэл'}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((news) => (
          <div key={news.id} className="rounded-lg border overflow-hidden">
            {news.imageUrl && <img src={news.imageUrl} alt={news.title} className="w-full h-48 object-cover" />}
            <div className="p-4">
              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">{news.category}</span>
              <h3 className="font-semibold text-lg mt-2">{news.title}</h3>
              <p className="text-sm mt-2 text-gray-600">{news.excerpt}</p>
              <p className="text-xs text-gray-500 mt-3">{news.date}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}`,
        defaultProps: {
          title: 'Мэдээ мэдээлэл',
          items: []
        }
      },
      {
        type: 'rental',
        category: 'Rental',
        scope: 'GLOBAL',
        projectName: null,
        description: 'Rental listings component',
        code: `export default function Rental({ title, items = [] }) {
  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold mb-6 text-center">{title || 'Борлуулалтын зарууд'}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <div key={item.id} className="rounded-lg border overflow-hidden">
            {item.imageUrl ? (
              <img src={item.imageUrl} alt={item.title} className="w-full h-48 object-cover" />
            ) : (
              <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400">Зураггүй</span>
              </div>
            )}
            <div className="p-4">
              <h3 className="font-semibold text-lg">{item.title}</h3>
              <p className="text-sm text-gray-600">{item.location}</p>
              <div className="flex items-center gap-4 mt-2 text-sm">
                {item.bedrooms > 0 && <span>{item.bedrooms} өрөө</span>}
                <span>{item.area} м²</span>
              </div>
              <p className="text-lg font-bold text-blue-600 mt-3">
                {item.price?.toLocaleString()}₮/{item.priceType === 'monthly' ? 'сар' : 'өдөр'}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}`,
        defaultProps: {
          title: 'Борлуулалтын зарууд',
          items: []
        }
      },
      {
        type: 'jobs',
        category: 'Jobs',
        scope: 'GLOBAL',
        projectName: null,
        description: 'Job board component',
        code: `export default function Jobs({ title, items = [] }) {
  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold mb-6 text-center">{title || 'Ажлын зарууд'}</h2>
      <div className="space-y-4">
        {items.map((job) => (
          <div key={job.id} className="p-4 rounded-lg border">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg">{job.title}</h3>
                <p className="text-sm">{job.company}</p>
              </div>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">{job.category}</span>
            </div>
            <div className="flex items-center gap-4 mt-3 text-sm">
              <span>{job.location}</span>
              <span>{job.salary?.min?.toLocaleString()} - {job.salary?.max?.toLocaleString()}₮</span>
              <span>{job.type === 'full-time' ? 'Бүтэн цагийн' : job.type === 'part-time' ? 'Хагас цагийн' : 'Гэрээт'}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}`,
        defaultProps: {
          title: 'Ажлын зарууд',
          items: []
        }
      },
      {
        type: 'contact-form',
        category: 'Contact',
        scope: 'GLOBAL',
        projectName: null,
        description: 'Contact form with map placeholder',
        code: `export default function ContactForm({ title, contactInfo = {} }) {
  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold mb-6">{title || 'Холбоо барих'}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-xl font-semibold mb-4">Байршил</h3>
          <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
            <span className="text-gray-500">Газрын зураг энд харагдана</span>
          </div>
          <div className="mt-4 space-y-2">
            <p>📍 {contactInfo.address || 'Улаанбаатар, Монгол'}</p>
            <p>📞 {contactInfo.phone || '+976 9911 xxxx'}</p>
            <p>✉️ {contactInfo.email || 'contact@example.com'}</p>
          </div>
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-4">Бидэнд мессеж илгээх</h3>
          <form className="space-y-4">
            <input type="text" placeholder="Таны нэр" className="w-full p-3 rounded border" />
            <input type="email" placeholder="Имэйл хаяг" className="w-full p-3 rounded border" />
            <input type="text" placeholder="Гарчиг" className="w-full p-3 rounded border" />
            <textarea placeholder="Таны мессеж" rows={4} className="w-full p-3 rounded border" />
            <button type="submit" className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold">
              Илгээх
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}`,
        defaultProps: {
          title: 'Холбоо барих',
          contactInfo: {
            address: 'Улаанбаатар, Монгол',
            phone: '+976 9911 xxxx',
            email: 'contact@example.com'
          }
        }
      },
      {
        type: 'chatbot',
        category: 'Chatbot',
        scope: 'GLOBAL',
        projectName: null,
        description: 'Live chat floating widget',
        code: `export default function Chatbot({ title }) {
  const [chatOpen, setChatOpen] = React.useState(false)
  const [messages, setMessages] = React.useState([{ text: 'Сайн байна уу! Бид танд хэрхэн туслах вэ?', isUser: false }])
  const [inputMessage, setInputMessage] = React.useState('')
  
  const sendMessage = () => {
    if (inputMessage.trim()) {
      setMessages(prev => [...prev, { text: inputMessage, isUser: true }])
      setInputMessage('')
      setTimeout(() => {
        setMessages(prev => [...prev, { text: 'Баярлалаа! Бид таны мессежийг хүлээн авлаа.', isUser: false }])
      }, 1000)
    }
  }
  
  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold mb-4 text-center">{title || 'Live Chat'}</h2>
      <p className="text-center mb-6">Бидэнтэй шуурхай холбогдохын тулд чат нээнэ үү</p>
      
      <button
        onClick={() => setChatOpen(!chatOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 z-50 flex items-center justify-center"
      >
        {chatOpen ? '✕' : '💬'}
      </button>
      
      {chatOpen && (
        <div className="fixed bottom-24 right-6 w-80 h-96 bg-white rounded-lg shadow-2xl z-50 flex flex-col border">
          <div className="p-4 bg-blue-600 text-white rounded-t-lg">
            <h3 className="font-semibold">Live Chat</h3>
          </div>
          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {messages.map((msg, idx) => (
              <div key={idx} className={\`flex \${msg.isUser ? 'justify-end' : 'justify-start'}\`}>
                <span className={\`px-3 py-2 rounded-lg max-w-[80%] text-sm \${msg.isUser ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'}\`}>
                  {msg.text}
                </span>
              </div>
            ))}
          </div>
          <div className="p-3 border-t flex gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Мессеж бичнэ үү..."
              className="flex-1 px-3 py-2 border rounded-lg text-sm"
            />
            <button onClick={sendMessage} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">Илгээх</button>
          </div>
        </div>
      )}
    </div>
  )
}`,
        defaultProps: {
          title: 'Live Chat'
        }
      }
    ]

    // Register each component
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
  Component: ComponentAPI,
  Project: ProjectAPI,
  Site: SiteAPI,
  Design: DesignAPI,
  Content: ContentAPI,
  Registration: ComponentRegistration,
}

export default CMSAPI

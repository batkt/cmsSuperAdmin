# API Integration Guide (Refactored MVC)

**Backend URL**: `http://202.179.6.77:4000/api`

This document lists all APIs for the refactored MVC backend architecture.

---

## 1. Projects API (`/api/projects`)

### Save Site Design (Primary Save)
```http
POST /api/designs
```

**When to call**: User clicks **"Хадгалах"** (Save) button

**Request Body**:
```json
{
  "projectName": "my-website",
  "domain": "my-website.example.com",
  "theme": {
    "primaryColor": "#3b82f6",
    "secondaryColor": "#1f2937",
    "fontFamily": "Inter",
    "darkMode": false
  },
  "pages": [
    {
      "route": "/",
      "title": "Home Page",
      "description": "Welcome page",
      "components": [
        {
          "type": "header",
          "props": {
            "title": "My Website",
            "navLinks": {
              "home": "Нүүр",
              "about": "Бидний тухай",
              "services": "Үйлчилгээ",
              "contact": "Холбогдох"
            },
            "logoUrl": "https://example.com/logo.png"
          },
          "order": 0
        },
        {
          "type": "news",
          "props": {
            "title": "Мэдээ мэдээлэл",
            "items": [
              {
                "id": "1",
                "title": "Шинэ мэдээ",
                "excerpt": "Товч тайлбар...",
                "date": "2026-04-01",
                "category": "Мэдээ",
                "imageUrl": "https://example.com/image.jpg"
              }
            ]
          },
          "order": 1
        }
      ]
    },
    {
      "route": "/about",
      "title": "About Us",
      "components": [
        {
          "type": "about",
          "props": {
            "title": "Бидний тухай",
            "description": "Компанийн тайлбар..."
          },
          "order": 0
        }
      ]
    }
  ]
}
```

**Response**:
```json
{
  "success": true,
  "message": "Design saved successfully",
  "designId": "abc123"
}
```

---

## 2. Site Generation & Deployment

### Generate and Deploy Site
```http
POST /api/sites/generate
```

**When to call**: User clicks **"Нийтлэх"** (Publish) button

**Request Body**:
```json
{
  "projectName": "my-website"
}
```

**Response**:
```json
{
  "success": true,
  "port": 5001,
  "url": "http://localhost:5001",
  "message": "Site generated and started"
}
```

---

## 3. Component Library Registration

### Register Component to Library
```http
POST /api/components
```

**When to call**: 
- First-time setup
- Adding new component types
- Updating existing component code

**Request Body**:
```json
{
  "type": "news",
  "scope": "GLOBAL",
  "projectName": null,
  "category": "News",
  "code": "export default function News({ title, items }) { return ( ... ) }",
  "description": "News/Medee component with grid layout",
  "defaultProps": {
    "title": "Мэдээ мэдээлэл",
    "items": []
  }
}
```

**For Project-Specific Override**:
```json
{
  "type": "news",
  "scope": "PROJECT",
  "projectName": "my-website",
  "category": "News",
  "code": "... custom news component ...",
  "description": "Custom news for my-website",
  "defaultProps": { ... }
}
```

### List Components
```http
GET /api/components
GET /api/components?category=News
GET /api/components?scope=GLOBAL
GET /api/components?projectName=my-website
```

**Response**:
```json
[
  {
    "type": "news",
    "scope": "GLOBAL",
    "projectName": null,
    "category": "News",
    "code": "...",
    "description": "...",
    "defaultProps": { ... }
  }
]
```

---

## 4. Content Management APIs

### News Management

#### Get All News
```http
GET /api/sites/{projectName}/news
```

#### Create News
```http
POST /api/sites/{projectName}/news
```

**Request Body**:
```json
{
  "id": "1",
  "title": "Шинэ мэдээ",
  "content": "Бүрэн агуулга...",
  "excerpt": "Товч тайлбар...",
  "author": "Админ",
  "publishedAt": "2026-04-01",
  "status": "published",
  "imageUrl": "https://example.com/image.jpg",
  "category": "Мэдээ",
  "views": 0
}
```

#### Update News
```http
PUT /api/sites/{projectName}/news/{newsId}
```

#### Delete News
```http
DELETE /api/sites/{projectName}/news/{newsId}
```

---

### Rental Ads Management

#### Get All Rentals
```http
GET /api/sites/{projectName}/rentals
```

#### Create Rental
```http
POST /api/sites/{projectName}/rentals
```

**Request Body**:
```json
{
  "id": "1",
  "title": "2 өрөө байр",
  "description": "Дэлгэрэнгүй тайлбар...",
  "price": 1500000,
  "priceType": "monthly",
  "location": "Сүхбаатар дүүрэг, Улаанбаатар",
  "bedrooms": 2,
  "bathrooms": 1,
  "area": 65,
  "images": ["https://example.com/img1.jpg"],
  "contactName": "Бат",
  "contactPhone": "99119911",
  "status": "active",
  "category": "apartment"
}
```

#### Update Rental
```http
PUT /api/sites/{projectName}/rentals/{rentalId}
```

#### Delete Rental
```http
DELETE /api/sites/{projectName}/rentals/{rentalId}
```

---

### Job Postings Management

#### Get All Jobs
```http
GET /api/sites/{projectName}/jobs
```

#### Create Job
```http
POST /api/sites/{projectName}/jobs
```

**Request Body**:
```json
{
  "id": "1",
  "title": "Вэб хөгжүүлэгч",
  "company": "Tech Solutions LLC",
  "location": "Улаанбаатар",
  "salary": {
    "min": 3000000,
    "max": 5000000,
    "type": "monthly"
  },
  "type": "full-time",
  "category": "IT",
  "description": "Ажлын тайлбар...",
  "requirements": ["React туршлагатай", "3+ жилийн туршлага"],
  "benefits": ["Амралтын цалин", "Унааны мөнгө"],
  "contactEmail": "jobs@tech.mn",
  "contactPhone": "99119911",
  "deadline": "2026-05-01",
  "status": "active",
  "applications": 0
}
```

#### Update Job
```http
PUT /api/sites/{projectName}/jobs/{jobId}
```

#### Delete Job
```http
DELETE /api/sites/{projectName}/jobs/{jobId}
```

---

## 5. Project Management

### Create New Project
```http
POST /api/create-project
```

**Request Body**:
```json
{
  "projectName": "new-website",
  "domain": "new-website.example.com"
}
```

### List All Projects
```http
GET /api/projects
```

**Response**:
```json
[
  {
    "name": "my-website",
    "port": 5001,
    "url": "http://localhost:5001",
    "status": "running"
  }
]
```

---

## 6. Build & Deploy

### Manual Build (Production)
```http
POST /api/projects/{projectName}/build
```

**When**: Push to GitHub, production deployment

---

## Complete Save Workflow

### Option 1: Quick Save (Design Only)
```
1. POST /api/designs → Save design to DB
```

### Option 2: Save + Deploy
```
1. POST /api/designs → Save design to DB
2. POST /api/sites/generate → Generate and start site
```

### Option 3: Full Setup (New Project)
```
1. POST /api/create-project → Create project shell
2. POST /api/components (multiple) → Register components
3. POST /api/designs → Save design
4. POST /api/sites/generate → Generate site
```

---

## Frontend Integration Code

### Save Handler in WebsiteBuilder
```typescript
import { CMSAPI } from '@/lib/cms-api'

const handleSave = async () => {
  const design = {
    projectName,
    domain: `${projectName}.example.com`,
    theme: {
      primaryColor: '#3b82f6',
      secondaryColor: '#1f2937',
      fontFamily: 'Inter',
      darkMode: isDarkMode
    },
    pages: pages.map(page => ({
      route: page.path,
      title: page.name,
      description: '',
      components: page.components.map((comp, idx) => ({
        type: comp.type,
        props: comp.content,
        order: idx
      }))
    }))
  }

  try {
    await CMSAPI.Design.saveDesign(design)
    alert('Сайт амжилттай хадгалагдлаа!')
  } catch (err) {
    alert('Хадгалахад алдаа гарлаа')
  }
}
```

### Publish Handler
```typescript
const handlePublish = async () => {
  // First save the design
  await handleSave()
  
  // Then generate/deploy
  try {
    const response = await CMSAPI.Site.generateSite(projectName)
    if (response.success) {
      alert(`Сайт нийтлэгдлээ: ${response.url}`)
    }
  } catch (err) {
    alert('Нийтлэхэд алдаа гарлаа')
  }
}
```

---

## Summary Table

| Feature | API Endpoint | Method | When to Call |
|---------|--------------|--------|--------------|
| Save Design | `/api/designs` | POST | Save button |
| Publish Site | `/api/sites/generate` | POST | Publish button |
| Register Component | `/api/components` | POST | First setup |
| List Components | `/api/components` | GET | Component picker |
| Get News | `/api/sites/{name}/news` | GET | Load news data |
| Create News | `/api/sites/{name}/news` | POST | Add news |
| Update News | `/api/sites/{name}/news/{id}` | PUT | Edit news |
| Delete News | `/api/sites/{name}/news/{id}` | DELETE | Remove news |
| Get Rentals | `/api/sites/{name}/rentals` | GET | Load rentals |
| Create Rental | `/api/sites/{name}/rentals` | POST | Add rental |
| Update Rental | `/api/sites/{name}/rentals/{id}` | PUT | Edit rental |
| Delete Rental | `/api/sites/{name}/rentals/{id}` | DELETE | Remove rental |
| Get Jobs | `/api/sites/{name}/jobs` | GET | Load jobs |
| Create Job | `/api/sites/{name}/jobs` | POST | Add job |
| Update Job | `/api/sites/{name}/jobs/{id}` | PUT | Edit job |
| Delete Job | `/api/sites/{name}/jobs/{id}` | DELETE | Remove job |
| Create Project | `/api/create-project` | POST | New project |
| List Projects | `/api/projects` | GET | Project list |
| Build Project | `/api/projects/{name}/build` | POST | Production deploy |

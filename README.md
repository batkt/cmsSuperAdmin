# Website Builder Admin Panel

A modern admin panel for managing users, building websites with drag-and-drop functionality, and managing templates. Built with Next.js, TypeScript, and Tailwind CSS.

## Features

### User Management
- ✅ Create, edit, and delete users
- ✅ Automatic subdomain generation (username.zevtabs.mn)
- ✅ User status management (active/inactive)
- ✅ Search and filter users
- ✅ Direct link to user websites

### Website Builder
- ✅ Drag-and-drop interface
- ✅ Pre-built components (Header, Hero, Features, Footer)
- ✅ Component reordering
- ✅ Component editing and deletion
- ✅ Save website functionality
- ✅ Real-time preview

### Template Library
- ✅ Browse ready-to-use templates
- ✅ Template categories and filtering
- ✅ Search functionality
- ✅ Template preview
- ✅ Premium and free templates
- ✅ Rating and download tracking

## Tech Stack

- **Frontend**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Drag & Drop**: @dnd-kit
- **State Management**: React Hooks

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd website-builder-admin
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## API Integration

The application is prepared for backend integration with a structured API client:

### API Endpoints Structure

```
/api/users          - User management
/api/templates      - Template management  
/api/websites       - Website management
```

### Key API Functions

- `getUsers()`, `createUser()`, `updateUser()`, `deleteUser()`
- `getTemplates()`, `getTemplate()`, `createTemplate()`
- `getWebsites()`, `createWebsite()`, `updateWebsite()`, `publishWebsite()`

### Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── Dashboard.tsx      # Main dashboard
│   ├── Sidebar.tsx        # Navigation sidebar
│   ├── UserManagement.tsx # User management
│   ├── WebsiteBuilder.tsx # Drag-drop builder
│   └── TemplateLibrary.tsx # Template library
└── lib/                   # Utilities
    ├── api.ts             # API client
    └── utils.ts           # Helper functions
```

## Component Architecture

### Dashboard
- Main layout with sidebar navigation
- Tab-based interface for different sections
- Responsive design

### User Management
- CRUD operations for users
- Automatic subdomain generation
- Status toggle functionality
- Search and filtering

### Website Builder
- Drag-and-drop canvas
- Component library sidebar
- Real-time component manipulation
- Save and export functionality

### Template Library
- Grid layout for templates
- Category filtering
- Search functionality
- Preview modal

## Styling

The application uses Tailwind CSS with a custom design system:

- Custom color palette defined in `tailwind.config.js`
- Consistent spacing and typography
- Responsive design patterns
- Hover and transition effects

## Future Enhancements

- [ ] Component customization panel
- [ ] More template categories
- [ ] User roles and permissions
- [ ] Website analytics
- [ ] Bulk user operations
- [ ] Template editor
- [ ] Export/import functionality
- [ ] Multi-language support

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the development team.

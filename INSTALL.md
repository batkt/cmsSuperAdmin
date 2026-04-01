# Installation Guide

## Prerequisites

Before running the website builder admin panel, you need to install Node.js and npm.

### Step 1: Install Node.js

1. Download Node.js from [https://nodejs.org/](https://nodejs.org/)
2. Download the LTS version (recommended: Node.js 18.x or higher)
3. Run the installer and follow the installation wizard
4. Restart your terminal/command prompt after installation

### Step 2: Verify Installation

Open a new terminal/command prompt and run:

```bash
node --version
npm --version
```

You should see version numbers displayed, confirming the installation was successful.

### Step 3: Install Project Dependencies

Navigate to the project directory and run:

```bash
cd website-builder-admin
npm install
```

### Step 4: Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Alternative: Using Yarn

If you prefer using Yarn instead of npm:

1. Install Yarn: `npm install -g yarn`
2. Install dependencies: `yarn install`
3. Start development: `yarn dev`

## Troubleshooting

### "npm is not recognized" Error
- Make sure Node.js is properly installed
- Restart your terminal/command prompt
- Try running `node -v` to verify Node.js installation

### Permission Issues (Windows)
- Run Command Prompt as Administrator
- Or use PowerShell with Administrator privileges

### Port Already in Use
If port 3000 is already in use, the development server will automatically use the next available port (3001, 3002, etc.)

## Development vs Production

- **Development**: `npm run dev` - Hot reload enabled
- **Production Build**: `npm run build` then `npm start` - Optimized for production

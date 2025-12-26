# Godot Plugin Crawler

[中文](./README_CN.md) | English

A comprehensive solution for crawling and displaying Godot Engine plugin library, featuring a backend crawler service built with TypeScript/Node.js and a modern frontend interface built with Vue 3.

## 🚀 Features

- **🔍 Intelligent Crawling**: Automatically crawls all plugins from the official Godot Asset Library
- **📊 Detailed Information**: Extracts comprehensive plugin data including descriptions, author info, versions, licenses, and more
- **🌐 Multi-Platform Support**: Supports plugins from GitHub, GitLab, and Codeberg repositories
- **🤖 AI Summaries**: Uses AI technology to automatically generate plugin functionality summaries (optional)
- **💾 Local Storage**: Stores plugin data locally using SQLite database for fast access
- **🎨 Modern Interface**: Responsive frontend built with Vue 3, TypeScript, and Vite
- **🌍 Internationalization**: Built-in i18n support with Chinese and English languages
- **⭐ Favorites Management**: Support for marking and managing favorite plugins
- **🔄 Manual Updates**: Support for manual refresh of individual plugin information
- **🔷 Advanced Filtering**: Filter by Godot version, category, license, support level, and search queries
- **📈 Smart Sorting**: Sort by last updated, GitHub stars, or last commit date

## 📁 Project Structure

```
godot-plugin-crawler/
├── backend/                    # Backend service (TypeScript/Node.js)
│   ├── src/
│   │   ├── crawler/           # Web crawler modules
│   │   │   ├── crawlerOrchestrator.ts  # Main crawler controller
│   │   │   ├── httpClient.ts           # HTTP client with retry logic
│   │   │   ├── assetService.ts         # Asset processing service
│   │   │   ├── sites/                   # Platform-specific crawlers
│   │   │   │   ├── github.ts           # GitHub integration
│   │   │   │   ├── gitlab.ts           # GitLab integration
│   │   │   │   ├── codeberg.ts         # Codeberg integration
│   │   │   │   └── site.ts             # Base interface
│   │   │   └── index.ts                # Crawler entry point
│   │   ├── server.ts          # Express server with API endpoints
│   │   ├── database.ts        # SQLite database operations
│   │   ├── config.ts          # Configuration management
│   │   ├── types.ts           # TypeScript type definitions
│   │   └── summarizer.ts      # AI summary service (OpenAI)
│   ├── data/                  # SQLite database files
│   ├── package.json           # Backend dependencies
│   └── tsconfig.json          # TypeScript configuration
├── frontend/                  # Frontend application (Vue 3/Vite)
│   ├── src/
│   │   ├── components/        # Vue components
│   │   │   ├── FilterSidebar.vue      # Advanced filtering UI
│   │   │   ├── LanguageSwitcher.vue   # Language switcher
│   │   │   ├── Pagination.vue         # Pagination component
│   │   │   ├── PluginCard.vue         # Individual plugin card
│   │   │   ├── PluginGrid.vue         # Plugin grid layout
│   │   │   └── PluginList.vue         # Main plugin list
│   │   ├── services/          # API services
│   │   │   └── api.ts                # API client
│   │   ├── utils/             # Utility functions
│   │   │   └── i18n.ts               # Internationalization
│   │   ├── App.vue            # Root component
│   │   ├── main.ts            # Application entry point
│   │   └── style.css          # Global styles
│   ├── public/                # Static assets
│   ├── package.json           # Frontend dependencies
│   └── vite.config.ts         # Vite configuration
├── .env.example               # Environment variables template
├── license                    # MIT License
├── README.md                  # This file
└── README_CN.md               # Chinese documentation
```

## ⚡ Quick Start

### Prerequisites

- Node.js 16+ 
- npm or yarn
- GitHub Personal Access Token (required for repository information)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd godot-plugin-crawler
```

2. **Install dependencies**
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. **Configure environment variables**

Copy the environment template and configure your settings:

```bash
# In the root directory
cp .env.example .env
```

Edit `.env` file with your configuration:

```env
# Basic Configuration
MAX_PAGE=20                    # Maximum pages to crawl
MAX_ASSETS=9999                # Maximum number of plugins

# Retry Configuration
MAX_RETRIES=3                  # Maximum retry attempts
RETRY_DELAY_BASE=1000          # Base retry delay (ms)

# GitHub API Configuration (Required)
GITHUB_TOKEN="your_github_token"
GITHUB_USER_AGENT="GodotPluginCrawler/1.0"

# GitLab API Configuration (Optional)
GITLAB_TOKEN="your_gitlab_token"
GITLAB_USER_AGENT="GodotPluginCrawler/1.0"

# AI Summary Configuration (Optional)
USE_AI=0                       # Enable AI summaries (1=enabled, 0=disabled)
AI_BASE_URL="https://api.openai.com/v1"
AI_API_KEY="your_openai_api_key"
AI_MODEL="gpt-3.5-turbo"
SUMMARIZE_PROMPT="You are a programmer who is good at summarizing code repositories. Below is the code for a Godot plugin. Please summarize its functionality based on the code."

# Other Configuration (Optional)
SERVER_PORT=3001               # Backend service port
PROXY=""                       # Proxy configuration (if needed)
```

### Running the Application

#### 1. Start the Backend Service

```bash
cd backend

# Run the crawler (first time setup to fetch data)
npm run crawler

# Start the API server
npm run server
```

#### 2. Start the Frontend Application

```bash
cd frontend
npm run dev
```

#### 3. Access the Application

Open your browser and visit: `http://localhost:5173`

## 📡 API Endpoints

### Get All Plugins
```
GET /api/assets
```

### Update Favorite Status
```
POST /api/assets/favorite
Body: { url: string, favorite: boolean }
```

### Refresh Plugin Information
```
POST /api/assets/refresh
Body: { url: string }
```

## 📊 Data Model

Plugin information includes the following fields:

```typescript
interface Asset {
  id?: number;
  title: string;           // Plugin title
  url: string;             // Plugin page URL
  author: string;          // Author name
  authorUrl: string;       // Author page URL
  version: string;         // Version number
  lastUpdated: string;     // Last update time
  category: string;        // Category
  godotVersion: string;    // Supported Godot version
  supportLevel: string;    // Support level
  license: string;         // License type
  iconUrl: string;         // Icon URL
  repoUrl: string;         // Repository URL
  repoContent: string;     // Repository content summary
  summary: string;         // AI-generated functionality summary
  stars: number;           // stars count
  lastCommit: string;      // Last commit time
  crawledAt?: string;      // Crawling timestamp
  favorite?: boolean;      // Favorite status
}
```

## 🛠️ Development

### Backend Development

```bash
cd backend
npm run crawler  # Run the crawler
npm run server   # Start the server
```

### Frontend Development

```bash
cd frontend
npm run dev      # Start development server (http://localhost:5173)
npm run build    # Build for production (TypeScript compilation + Vite bundling)
npm run preview  # Preview production build
```

### Production Deployment

1. **Build the frontend:**
```bash
cd frontend
npm run build
```

2. **Configure production environment variables**
3. **Start the backend service:**
```bash
cd backend
npm run server
```

4. **Use Nginx or other web server to host frontend files**

The backend automatically serves the built frontend if the `frontend/dist` folder exists.

## ⚠️ Notes

- Please respect Godot's robots.txt and terms of service when crawling
- GitHub Personal Access Token is **required** for fetching repository information

## 🤝 Contributing

Contributions are welcome! Please feel free to submit Issues and Pull Requests to improve this project.

## 📄 License

This project is licensed under the MIT License.
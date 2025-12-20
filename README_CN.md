# Godot 插件爬虫

中文 | [English](./README.md)

一个用于爬取和展示 Godot 引擎插件库的完整解决方案，包含后端爬虫服务和前端展示界面。

## 🚀 项目特性

- 🔍 **智能爬虫**: 自动爬取 Godot 官方插件库的所有插件信息
- 📊 **详细信息**: 获取插件的详细描述、作者信息、版本、许可证等
- 🤖 **AI 摘要**: 使用 AI 技术自动生成插件功能摘要（可选）
- 💾 **本地存储**: 使用 SQLite 数据库本地存储插件数据
- 🎨 **现代界面**: 基于 Vue 3 的响应式前端界面
- ⭐ **收藏功能**: 支持标记和管理喜欢的插件
- 🔄 **手动更新**: 支持手动刷新单个插件信息
- 🔷 **高级筛选**: 按 Godot 版本、分类、许可证、支持级别和搜索查询筛选
- 📈 **智能排序**: 支持按最后更新、GitHub 星标数或最后提交时间排序

## 项目结构

```
godot-plugin-crawler/
├── backend/                    # 后端服务
│   ├── src/
│   │   ├── crawler/           # 网络爬虫模块
│   │   │   ├── assetPageService.ts
│   │   │   ├── assetParser.ts
│   │   │   ├── assetProcessor.ts
│   │   │   ├── crawlerOrchestrator.ts
│   │   │   ├── githubService.ts
│   │   │   ├── httpClient.ts
│   │   │   └── index.ts
│   │   ├── server.ts          # Express 服务器
│   │   ├── database.ts        # 数据库操作
│   │   ├── config.ts          # 配置管理
│   │   ├── types.ts           # TypeScript 类型定义
│   │   └── summarizer.ts      # AI 摘要服务
│   ├── data/                  # 数据库文件
│   ├── reference/             # 参考文件
│   └── package.json
├── frontend/                  # 前端应用
│   ├── src/
│   │   ├── components/        # Vue 组件
│   │   │   ├── FilterSidebar.vue
│   │   │   ├── Pagination.vue
│   │   │   ├── PluginCard.vue
│   │   │   ├── PluginGrid.vue
│   │   │   └── PluginList.vue
│   │   ├── services/          # API 服务
│   │   ├── App.vue            # 根组件
│   │   └── main.ts            # 入口文件
│   ├── public/                # 静态资源
│   └── package.json
├── .env.example               # 环境变量模板
└── README.md
```

## 快速开始

### 环境要求

- Node.js 16+
- npm 或 yarn

### 安装依赖

```bash
# 安装后端依赖
cd backend
npm install

# 安装前端依赖
cd ../frontend
npm install
```

### 配置环境变量

复制环境变量模板文件：

```bash
# 在根目录
cp .env.example .env
```

编辑 `.env` 文件，配置以下参数：

```env
# 基础配置
MAX_PAGE=20                    # 最大爬取页数
MAX_ASSETS=9999                # 最大插件数量

# 重试配置
MAX_RETRIES=3                  # 最大重试次数
RETRY_DELAY_BASE=1000          # 重试延迟基数(ms)

# GitHub API 配置
GITHUB_TOKEN="your_github_token"

# AI 摘要配置（可选）
USE_AI=1                       # 启用 AI 摘要（1=启用，0=禁用）
AI_BASE_URL="https://api.openai.com/v1"
AI_API_KEY="your_openai_api_key"
AI_MODEL="gpt-3.5-turbo"
SUMMARIZE_PROMPT="You are a programmer who is good at summarizing code repositories..."

# 其他配置（可选）
SERVER_PORT=3001               # 后端服务端口
PROXY=""                       # 代理配置
USER_AGENT="Your User Agent" 
```

### 运行项目

#### 1. 启动后端服务

```bash
cd backend

# 启动爬虫（首次运行需要爬取数据）
npm run crawler

# 启动 API 服务器
npm run server
```

#### 2. 启动前端应用

```bash
cd frontend
npm run dev
```

#### 3. 访问应用

打开浏览器访问：`http://localhost:5173`

## API 接口

### 获取所有插件
```
GET /api/assets
```

### 更新收藏状态
```
POST /api/assets/favorite
Body: { url: string, favorite: boolean }
```

### 刷新插件信息
```
POST /api/assets/refresh
Body: { url: string }
```

## 数据结构

插件信息包含以下字段：

```typescript
interface Asset {
  id?: number;
  title: string;           // 插件标题
  url: string;             // 插件页面URL
  author: string;          // 作者
  authorUrl: string;       // 作者页面URL
  version: string;         // 版本号
  lastUpdated: string;     // 最后更新时间
  category: string;        // 分类
  godotVersion: string;    // 支持的 Godot 版本
  supportLevel: string;    // 支持级别
  license: string;         // 许可证
  iconUrl: string;         // 图标URL
  repoUrl: string;         // 代码仓库URL
  repoContent: string;     // 仓库内容摘要
  summary: string;         // AI 生成的功能摘要
  stars: number;           // GitHub 星标数
  lastCommit: string;      // 最后提交时间
  crawledAt?: string;      // 爬取时间
  favorite?: boolean;      // 是否收藏
}
```

## 开发说明

### 后端开发

```bash
cd backend
npm run crawler  # 运行爬虫
npm run server   # 启动服务器
```

### 前端开发

```bash
cd frontend
npm run dev      # 启动开发服务器
npm run build    # 构建生产版本
npm run preview  # 预览生产版本
```

## 部署

### 生产环境部署

1. 构建前端：
```bash
cd frontend
npm run build
```

2. 配置生产环境变量
3. 启动后端服务：
```bash
cd backend
npm run server
```

4. 使用 Nginx 或其他 Web 服务器托管前端文件

> **注意**: 后端会自动检测并托管 `frontend/dist` 文件夹（如果存在）

## ⚠️ 注意事项

- 爬取时请遵守 Godot 官方的 robots.txt 和使用条款
- 建议设置合理的请求间隔，避免对服务器造成压力
- AI 摘要功能需要 OpenAI API Key，可能会产生费用
- 数据库文件 `backend/data/plugins.db` 会自动创建
- 首次爬取可能需要较长时间，具体取决于配置的页面数量
- GitHub Token 是必需的，用于获取仓库信息

## 贡献

欢迎提交 Issue 和 Pull Request 来改进这个项目！

## 许可证

本项目采用 MIT 许可证。
# 00 - Project Setup

<!-- AI: This document defines the development environment for the project. Fill in this template based on the tech stack chosen in doc 07 (Technical Architecture). Use the stack-specific section that matches your project type. -->

## Project Type

<!-- AI: Select ONE project type and delete the others. This determines which setup instructions apply. -->

- [ ] Web Application (SPA)
- [ ] Web Application (SSR/Full-Stack)
- [ ] Desktop Application
- [ ] Mobile Application
- [ ] Backend API
- [ ] CLI Tool

---

## Universal Environment Setup

<!-- AI: These requirements apply to most JavaScript/TypeScript projects. Adjust based on your stack. -->

### Version Control
- **Git**: >= 2.30
- **Install**: https://git-scm.com/

### Package Manager

<!-- AI: Choose ONE package manager and specify version. Common choices: npm (bundled with Node), pnpm (fast, strict), yarn (workspaces), bun (fast, all-in-one). -->

| Manager | Version | Install Command |
|---------|---------|-----------------|
| npm | <!-- AI: Specify version, e.g., >= 10.0 --> | Bundled with Node.js |
| pnpm | <!-- AI: Specify version, e.g., >= 8.0 --> | `npm install -g pnpm` |
| yarn | <!-- AI: Specify version, e.g., >= 4.0 --> | `corepack enable && corepack prepare yarn@stable --activate` |
| bun | <!-- AI: Specify version, e.g., >= 1.0 --> | https://bun.sh/docs/installation |

**Selected**: <!-- AI: State which package manager this project uses -->

---

## Stack-Specific Setup

<!-- AI: Keep only the section that matches your project type. Delete the others. -->

### Web Application (SPA)

<!-- AI: For React, Vue, Svelte, Angular, etc. without server-side rendering. -->

#### Prerequisites
| Tool | Version | Install |
|------|---------|---------|
| Node.js | <!-- AI: e.g., >= 20.0 LTS --> | https://nodejs.org/ |

#### Bootstrap Commands

```bash
# Step 1: Create project
# <!-- AI: Provide the exact command. Examples:
# - React: npx create-vite@latest my-app --template react-ts
# - Vue: npm create vue@latest
# - Svelte: npm create svelte@latest my-app
# - Angular: npx @angular/cli new my-app -->

# Step 2: Install dependencies
cd [PROJECT_NAME]
# <!-- AI: e.g., pnpm install -->

# Step 3: Start development server
# <!-- AI: e.g., pnpm dev -->

# Step 4: Verify (expected output)
# <!-- AI: e.g., "Local: http://localhost:5173" -->
```

#### Verification Checklist
- [ ] Node version matches requirement (`node --version`)
- [ ] Package manager works (`pnpm --version` or equivalent)
- [ ] Dev server starts without errors
- [ ] Browser opens to localhost
- [ ] Hot reload works (edit a file, see change)

---

### Web Application (SSR/Full-Stack)

<!-- AI: For Next.js, Nuxt, SvelteKit, Remix, etc. -->

#### Prerequisites
| Tool | Version | Install |
|------|---------|---------|
| Node.js | <!-- AI: e.g., >= 20.0 LTS --> | https://nodejs.org/ |
| Database | <!-- AI: If applicable, e.g., PostgreSQL >= 15 --> | <!-- AI: Install link --> |

#### Bootstrap Commands

```bash
# Step 1: Create project
# <!-- AI: Provide the exact command. Examples:
# - Next.js: npx create-next-app@latest my-app --typescript
# - Nuxt: npx nuxi init my-app
# - SvelteKit: npm create svelte@latest my-app
# - Remix: npx create-remix@latest -->

# Step 2: Install dependencies
cd [PROJECT_NAME]
# <!-- AI: e.g., pnpm install -->

# Step 3: Set up database (if applicable)
# <!-- AI: e.g., pnpm db:push, prisma migrate dev, etc. -->

# Step 4: Start development server
# <!-- AI: e.g., pnpm dev -->
```

#### Environment Variables
<!-- AI: List required environment variables. Do NOT include actual secrets. -->
```bash
# .env.local
DATABASE_URL=           # <!-- AI: Describe format, e.g., postgresql://user:pass@host:5432/db -->
NEXTAUTH_SECRET=        # <!-- AI: Describe how to generate, e.g., openssl rand -base64 32 -->
```

#### Verification Checklist
- [ ] Node version matches requirement
- [ ] Database connection works
- [ ] Dev server starts without errors
- [ ] SSR renders correctly (view page source shows content)
- [ ] API routes respond

---

### Desktop Application

<!-- AI: For Tauri, Electron, or similar frameworks. -->

#### Prerequisites
| Tool | Version | Install |
|------|---------|---------|
| Node.js | <!-- AI: e.g., >= 20.0 LTS --> | https://nodejs.org/ |
| Rust | <!-- AI: For Tauri, e.g., >= 1.70 --> | https://rustup.rs/ |

#### OS-Specific Requirements

**Windows:**
<!-- AI: List Windows-specific requirements. Examples for Tauri: -->
- [ ] Visual Studio Build Tools (C++ workload)
- [ ] WebView2 Runtime

**macOS:**
<!-- AI: List macOS-specific requirements. Examples: -->
- [ ] Xcode Command Line Tools (`xcode-select --install`)

**Linux:**
<!-- AI: List Linux-specific requirements. Examples for Tauri: -->
- [ ] webkit2gtk-4.1 development libraries
- [ ] build-essential

#### Bootstrap Commands

```bash
# Step 1: Create project
# <!-- AI: Provide the exact command. Examples:
# - Tauri: npm create tauri-app@latest
# - Electron: npm init electron-app@latest my-app -->

# Step 2: Install dependencies
cd [PROJECT_NAME]
# <!-- AI: e.g., pnpm install -->

# Step 3: Start development
# <!-- AI: e.g., pnpm tauri dev -->
```

#### Verification Checklist
- [ ] Node version matches requirement
- [ ] Rust compiles (`rustc --version`) (if applicable)
- [ ] Native dependencies installed
- [ ] Dev command starts without errors
- [ ] Application window opens
- [ ] Hot reload works

---

### Mobile Application

<!-- AI: For React Native, Flutter, Expo, etc. -->

#### Prerequisites
| Tool | Version | Install |
|------|---------|---------|
| Node.js | <!-- AI: If applicable --> | https://nodejs.org/ |
| Java JDK | <!-- AI: For Android, e.g., >= 17 --> | https://adoptium.net/ |
| Android Studio | <!-- AI: e.g., Latest stable --> | https://developer.android.com/studio |
| Xcode | <!-- AI: For iOS, e.g., >= 15.0 --> | Mac App Store |

#### Platform Setup

**Android:**
<!-- AI: Android-specific setup steps -->
- [ ] Android SDK installed
- [ ] Emulator configured or device connected
- [ ] `adb devices` shows device

**iOS (macOS only):**
<!-- AI: iOS-specific setup steps -->
- [ ] Xcode installed with iOS Simulator
- [ ] CocoaPods installed (`sudo gem install cocoapods`)

#### Bootstrap Commands

```bash
# Step 1: Create project
# <!-- AI: Provide the exact command. Examples:
# - React Native: npx react-native@latest init MyApp
# - Expo: npx create-expo-app my-app
# - Flutter: flutter create my_app -->

# Step 2: Install dependencies
cd [PROJECT_NAME]
# <!-- AI: e.g., pnpm install && cd ios && pod install && cd .. -->

# Step 3: Start development
# <!-- AI: e.g., npx react-native start -->

# Step 4: Run on device/emulator
# <!-- AI: e.g., npx react-native run-android -->
```

#### Verification Checklist
- [ ] Node/Flutter version matches requirement
- [ ] Android emulator or device works
- [ ] iOS simulator works (if on macOS)
- [ ] App builds and runs
- [ ] Hot reload/Fast refresh works

---

### Backend API

<!-- AI: For Express, Fastify, NestJS, FastAPI, Go, Rust, etc. -->

#### Prerequisites
| Tool | Version | Install |
|------|---------|---------|
| Runtime | <!-- AI: e.g., Node.js >= 20, Python >= 3.11, Go >= 1.21 --> | <!-- AI: Install link --> |
| Database | <!-- AI: e.g., PostgreSQL >= 15, MongoDB >= 7 --> | <!-- AI: Install link --> |
| Cache | <!-- AI: If applicable, e.g., Redis >= 7 --> | <!-- AI: Install link --> |

#### Bootstrap Commands

```bash
# Step 1: Create project
# <!-- AI: Provide the exact command. Examples:
# - NestJS: npx @nestjs/cli new my-api
# - FastAPI: mkdir my-api && cd my-api && python -m venv venv
# - Go: go mod init github.com/user/my-api -->

# Step 2: Install dependencies
cd [PROJECT_NAME]
# <!-- AI: e.g., pnpm install, pip install -r requirements.txt, go mod tidy -->

# Step 3: Set up database
# <!-- AI: e.g., docker-compose up -d db, createdb myapp -->

# Step 4: Run migrations
# <!-- AI: e.g., pnpm db:migrate, alembic upgrade head -->

# Step 5: Start development server
# <!-- AI: e.g., pnpm dev, uvicorn main:app --reload, go run . -->
```

#### Environment Variables
```bash
# .env
DATABASE_URL=           # <!-- AI: Connection string format -->
PORT=                   # <!-- AI: Default port, e.g., 3000 -->
JWT_SECRET=             # <!-- AI: For auth, how to generate -->
```

#### Verification Checklist
- [ ] Runtime version matches requirement
- [ ] Database connection works
- [ ] Server starts without errors
- [ ] Health check endpoint responds (`curl http://localhost:PORT/health`)
- [ ] API routes respond correctly

---

### CLI Tool

<!-- AI: For Node.js, Go, Rust, Python command-line tools. -->

#### Prerequisites
| Tool | Version | Install |
|------|---------|---------|
| Runtime | <!-- AI: e.g., Go >= 1.21, Rust >= 1.70, Node.js >= 20 --> | <!-- AI: Install link --> |

#### Bootstrap Commands

```bash
# Step 1: Create project
# <!-- AI: Provide the exact command. Examples:
# - Go: go mod init github.com/user/my-cli
# - Rust: cargo new my-cli
# - Node: mkdir my-cli && cd my-cli && npm init -y -->

# Step 2: Install dependencies (if applicable)
cd [PROJECT_NAME]
# <!-- AI: e.g., npm install commander, go get ... -->

# Step 3: Build
# <!-- AI: e.g., go build, cargo build, npm run build -->

# Step 4: Test run
# <!-- AI: e.g., ./my-cli --help -->
```

#### Verification Checklist
- [ ] Runtime version matches requirement
- [ ] Project compiles/builds
- [ ] `--help` flag works
- [ ] Basic command executes successfully

---

## IDE Setup

<!-- AI: Provide IDE-specific configuration for the project. Include at least VS Code. Add others if team uses them. -->

### VS Code

#### Required Extensions
<!-- AI: List extensions relevant to your stack. Delete irrelevant ones. -->
- [ ] ESLint - JavaScript/TypeScript linting
- [ ] Prettier - Code formatting
- [ ] TypeScript and JavaScript Language Features (built-in)
- [ ] Rust Analyzer - For Rust projects
- [ ] Python - For Python projects
- [ ] Go - For Go projects
- [ ] Tailwind CSS IntelliSense - If using Tailwind
- [ ] Prisma - If using Prisma ORM
- [ ] Docker - If using Docker
- [ ] GitLens - Enhanced Git features

#### Recommended settings.json
<!-- AI: Provide project-specific VS Code settings -->
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "[rust]": {
    "editor.defaultFormatter": "rust-lang.rust-analyzer"
  }
}
```

### JetBrains IDEs (WebStorm/IntelliJ/PyCharm)

<!-- AI: Include if team uses JetBrains IDEs -->
- [ ] Enable ESLint/Prettier integration
- [ ] Configure Node.js interpreter
- [ ] Set up run configurations for dev/build/test

### Vim/Neovim

<!-- AI: Include if team uses Vim/Neovim -->
```lua
-- Example LSP setup (for Neovim with nvim-lspconfig)
-- <!-- AI: Provide LSP servers relevant to your stack -->
require('lspconfig').tsserver.setup{}
require('lspconfig').rust_analyzer.setup{}
```

---

## Common Issues & Solutions

<!-- AI: Document setup issues you encounter and their solutions -->

| Issue | Cause | Solution |
|-------|-------|----------|
| <!-- AI: e.g., "EACCES permission denied" --> | <!-- AI: e.g., "npm global install permissions" --> | <!-- AI: e.g., "Use nvm or configure npm prefix" --> |
| <!-- AI: e.g., "Port 3000 already in use" --> | <!-- AI: e.g., "Another process using port" --> | <!-- AI: e.g., "Kill process or use different port" --> |

---

## Related Documents

| Doc | Relationship |
|-----|--------------|
| [07-technical-architecture.md](./07-technical-architecture.md) | Defines tech stack (read before filling this doc) |
| [15-file-architecture.md](./15-file-architecture.md) | Project structure |
| [19-cicd-pipeline.md](./19-cicd-pipeline.md) | Build and deployment |
| [23-configuration-management.md](./23-configuration-management.md) | Environment variables and secrets |
| [AGENT-GUIDE.md](./AGENT-GUIDE.md) | How to lead the project |

---

## AI Agent Instructions

### When Completing This Document

1. **Read doc 07 first** - Technical Architecture defines the stack
2. **Select one project type** - Delete the others to reduce confusion
3. **Fill in all version numbers** - Be specific (e.g., ">= 20.0" not "latest")
4. **Test commands yourself** - Verify they work before documenting
5. **Document encountered issues** - Add to Common Issues table

### When Setting Up a New Environment

1. Follow the stack-specific section step by step
2. Complete the verification checklist before proceeding
3. If a step fails, check Common Issues table first
4. Document any new issues for future reference

### Version Guidance

- **LTS versions preferred** for stability
- **Specify minimum versions** (">= X.Y") not exact versions
- **Document breaking changes** if specific version required

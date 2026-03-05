# PHASE 0: INFRASTRUCTURE SETUP ⚙️

**Phase Duration:** 2-3 days  
**Dependencies:** None (First Phase)  
**Priority:** CRITICAL - Foundation for all phases  
**Status:** [ ] Not Started | [ ] In Progress | [ ] Complete

---

## 1. OVERVIEW

Phase 0 establishes the complete project infrastructure - backend server, frontend application, database connection, and verification that all components communicate correctly. This is the foundation upon which all subsequent phases build.

### Key Goals
- Initialize Node.js Express backend project
- Initialize React + Vite frontend project  
- Configure database connections
- Set up middleware and utilities
- Verify inter-service communication (backend ↔ frontend)
- Establish project structure and conventions
- Create health check endpoints

---

## 2. TECH STACK SPECIFICATIONS

### Backend
- **Runtime:** Node.js (v18+)
- **Framework:** Express.js (v4.18+)
- **Database Driver:** mysql2 (v3.2+)
- **Dev Server:** nodemon (for auto-reload)
- **Environment:** dotenv (for config management)

### Frontend
- **Framework:** React (v18+)
- **Build Tool:** Vite (v4+)
- **State Management:** Zustand (v4+)
- **HTTP Client:** axios (v1+)
- **Routing:** react-router-dom (v6+)
- **Styling:** Tailwind CSS (v3+)

### Database
- **DBMS:** MariaDB 10.4 (existing at localhost:3306)
- **Database:** infinextg_ricon (existing)
- **Connection Pool:** mysql2/promise

---

## 3. BACKEND SETUP SPECIFICATIONS

### 3.1 Directory Structure

```
server/
├── src/
│   ├── config/
│   │   ├── database.js          # Database connection & pool
│   │   ├── constants.js         # App constants (status codes, roles, etc.)
│   │   └── env.js               # Environment configuration (optional)
│   │
│   ├── middleware/
│   │   ├── auth.js              # JWT authentication & role authorization
│   │   ├── cors.js              # CORS configuration
│   │   └── errorHandler.js      # Global error handling
│   │
│   ├── routes/
│   │   └── health.js            # Health check and version routes
│   │
│   ├── controllers/
│   │   └── (controllers per phase)
│   │
│   ├── models/
│   │   └── (database models per phase)
│   │
│   ├── utils/
│   │   ├── responseHandler.js   # Standard response formatting
│   │   ├── passwordUtils.js     # Password hashing (Phase 1)
│   │   ├── jwtUtils.js          # JWT token management (Phase 1)
│   │   └── (additional utils per phase)
│   │
│   └── index.js                 # Express app initialization & startup
│
├── .env                         # Environment variables (not in git)
├── .env.example                 # Template for .env
├── .gitignore                   # Git ignore rules
├── package.json                 # Node.js dependencies & scripts
└── package-lock.json            # Dependency lock file (auto-generated)
```

### 3.2 Backend Dependencies

#### Core Dependencies
```json
{
  "express": "^4.18.2",
  "cors": "^2.8.5",
  "dotenv": "^16.0.3",
  "mysql2": "^3.2.0",
  "body-parser": "^1.20.2"
}
```

#### Security & Auth
```json
{
  "bcryptjs": "^2.4.3",
  "jsonwebtoken": "^9.0.0"
}
```

#### File Uploads
```json
{
  "multer": "^1.4.5"
}
```

#### Dev Dependencies
```json
{
  "nodemon": "^2.0.22"
}
```

**Total packages to install:** 8 dependencies

### 3.3 Environment Variables (.env)

```properties
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=infinextg_ricon
DB_PORT=3306

# Server
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your_super_secret_key_change_in_production_min_32_chars
JWT_EXPIRY=24h
JWT_REFRESH_SECRET=your_refresh_secret_key_change_in_production
JWT_REFRESH_EXPIRY=7d

# CORS
CORS_ORIGIN=http://localhost:5173

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_DIR=../uploads

# Logging (optional)
LOG_LEVEL=dev

# Email Service (for Phase 1.5)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

### 3.4 Package.json Scripts

```json
{
  "scripts": {
    "start": "node src/index.js",
    "dev": "nodemon src/index.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  }
}
```

### 3.5 Core Backend Files to Create

#### 1. server/src/config/database.js
**Purpose:** Database connection pool initialization and health check

**Specifications:**
- Create mysql2 connection pool with 10 connections
- Connection limit: 10
- Wait for connections: enabled
- Keep-alive enabled
- Test connection on startup
- Log connection status (success/error details)
- Export pool for use in models

**Key Methods:**
- `pool.getConnection()` - Get connection from pool
- `pool.query()` - Execute query (callback style)
- Graceful error handling for various connection errors

---

#### 2. server/src/config/constants.js
**Purpose:** Application-wide constants

**Specifications:**
- STATUS object: NEW(0), PENDING_APPROVAL(1), APPROVED(2), REJECTED(3), COMPLETED(4), CLOSED(5)
- ACTIVE object: ACTIVE(0), INACTIVE(1)
- ROLES object: admin, manager, reviewer, user, viewer
- ERROR_CODES object: All standard error codes (ERR_INVALID_CREDENTIALS, ERR_UNAUTHORIZED, etc.)

---

#### 3. server/src/middleware/auth.js
**Purpose:** JWT authentication and role authorization

**Specifications:**
- Export `authenticateToken(req, res, next)` middleware
  - Extract token from Authorization header (Bearer scheme)
  - Verify JWT signature
  - Attach user object to req.user
  - Return 401 if invalid/missing
  - Return 403 if expired

- Export `authorizeRole(...roles)` middleware factory
  - Accept variable args of role names
  - Check if req.user.role matches any allowed role
  - Return 403 if unauthorized
  - Call next() if authorized

---

#### 4. server/src/middleware/cors.js
**Purpose:** CORS configuration

**Specifications:**
- Read CORS_ORIGIN from .env
- Allow methods: GET, POST, PUT, DELETE, OPTIONS
- Allow headers: Content-Type, Authorization
- Credentials: true (allow cookies)
- Success status: 200

---

#### 5. server/src/middleware/errorHandler.js
**Purpose:** Global error handling middleware

**Specifications:**
- Catch all errors from route handlers
- Handle specific error types:
  - ValidationError → 400
  - UnauthorizedError/JsonWebTokenError → 401
  - Database errors (ER_*) → 500 (with specific handling for ER_DUP_ENTRY → 409)
  - Generic errors → appropriate status

- Response format:
  ```json
  {
    "success": false,
    "message": "Error description",
    "error": "ERROR_CODE",
    "data": null,
    "timestamp": "ISO timestamp"
  }
  ```

---

#### 6. server/src/utils/responseHandler.js
**Purpose:** Standardized API response formatting

**Specifications:**
- Export `sendSuccess(res, data, message, statusCode)` function
  - Default status: 200
  - Always include: success, message, data, error (null), timestamp

- Export `sendError(res, message, errorCode, statusCode, details)` function
  - Default status: 400
  - Always include: success (false), message, error, data (null), timestamp

---

#### 7. server/src/routes/health.js
**Purpose:** Health check and version endpoints

**Specifications:**
- GET `/api/health` endpoint
  - Test database connection
  - Return: `{ status: "healthy", timestamp, db: "connected" }`
  - Return 503 if DB not available

- GET `/api/version` endpoint
  - Return: `{ version: "1.0.0", environment: "development" }`

---

#### 8. server/src/index.js
**Purpose:** Express app initialization and server startup

**Specifications:**
- Load environment variables using dotenv
- Create Express app instance
- Configure middleware (in order):
  1. CORS middleware
  2. Body parser (json, urlencoded)
  3. Static files (optional)

- Register routes:
  - `/api` → health routes

- 404 handler (must return JSON)

- Global error handler (must be last)

- Start server on PORT (default 5000)

- Log startup message with:
  - Server URL
  - Environment
  - Port

**Startup Message Format:**
```
╔════════════════════════════════════════╗
║     GMP_LIVE Backend Server Started    ║
║  Running on http://localhost:5000     ║
║  Environment: development              ║
╚════════════════════════════════════════╝
```

---

### 3.6 Backend Project Initialization

**Steps:**
1. Create `server/` directory
2. Create `src/` subdirectories (config, middleware, routes, utils, controllers, models)
3. Initialize npm: `npm init -y`
4. Install dependencies: `npm install express cors dotenv mysql2 bcryptjs jsonwebtoken multer body-parser`
5. Install dev dependencies: `npm install -D nodemon`
6. Create `.env` file (from template)
7. Create `.gitignore` file
8. Create all core files listed above

---

## 4. FRONTEND SETUP SPECIFICATIONS

### 4.1 Directory Structure

```
client/
├── src/
│   ├── pages/
│   │   ├── Login.jsx                # User login page
│   │   └── Dashboard.jsx            # Basic dashboard (placeholder)
│   │
│   ├── components/
│   │   ├── ProtectedRoute.jsx       # Route protection wrapper
│   │   ├── Header.jsx               # Navigation header (Phase 1)
│   │   ├── Alert.jsx                # Alert/notification component (Phase 1)
│   │   └── LoadingSpinner.jsx       # Loading indicator (Phase 1)
│   │
│   ├── stores/
│   │   └── authStore.js             # Zustand authentication store
│   │
│   ├── services/
│   │   ├── api.js                   # Axios instance with interceptors
│   │   └── authService.js           # Auth API calls (Phase 1)
│   │
│   ├── hooks/
│   │   └── useAuth.js               # Custom auth hook
│   │
│   ├── styles/
│   │   └── index.css                # Global styles with Tailwind
│   │
│   ├── App.jsx                      # Main app component with routing
│   ├── main.jsx                     # Vite entry point
│   ├── index.css                    # Global CSS (Tailwind import)
│   └── vite.svg                     # Vite logo (auto-created)
│
├── public/
│   └── vite.svg                     # Static assets
│
├── .env.development                 # Dev environment variables
├── .env.production                  # Prod environment variables
├── .gitignore                       # Git ignore rules
├── index.html                       # HTML entry point (Vite)
├── package.json                     # Dependencies & scripts
├── package-lock.json                # Lock file
├── vite.config.js                   # Vite configuration
└── postcss.config.js                # PostCSS configuration (Tailwind)
```

### 4.2 Frontend Dependencies

#### Core Dependencies
```json
{
  "react": "^18.x.x",
  "react-dom": "^18.x.x",
  "react-router-dom": "^6.x.x",
  "zustand": "^4.x.x",
  "axios": "^1.x.x"
}
```

#### Dev Dependencies
```json
{
  "@vitejs/plugin-react": "^4.x.x",
  "vite": "^4.x.x",
  "tailwindcss": "^3.x.x",
  "postcss": "^8.x.x",
  "autoprefixer": "^10.x.x"
}
```

**Total packages to install:** 10 packages (5 production, 5 dev)

### 4.3 Environment Variables

#### .env.development
```
VITE_API_URL=http://localhost:5000/api
VITE_APP_TITLE=GMP_LIVE - Development
```

#### .env.production
```
VITE_API_URL=https://api.gmp-live.com/api
VITE_APP_TITLE=GMP_LIVE
```

### 4.4 Package.json Scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint src/ --ext .jsx,.js"
  }
}
```

### 4.5 Core Frontend Files to Create

#### 1. client/vite.config.js
**Purpose:** Vite build configuration

**Specifications:**
- Root component: src/App.jsx
- React plugin enabled
- Dev server:
  - Port: 5173
  - Strict port: false (use next available if blocked)
  - Auto-open: true (open browser on start)
- Build output: dist/
- Source maps: Enabled in dev, disabled in prod

---

#### 2. client/postcss.config.js & client/tailwind.config.js
**Purpose:** Tailwind CSS configuration

**Specifications:**
- PostCSS plugins: tailwindcss, autoprefixer
- Tailwind template paths: `src/**/*.{js,jsx}`
- Theme: Default with any customizations (can be minimal for Phase 0)

---

#### 3. client/index.html
**Purpose:** HTML entry point

**Specifications:**
- Meta tags: charset, viewport
- Title: GMP_LIVE
- Root div with id="root"
- Script tag: `<script type="module" src="/src/main.jsx"></script>`

---

#### 4. client/src/main.jsx
**Purpose:** React entry point

**Specifications:**
- Import React and ReactDOM
- Import App component
- Import index.css (global styles)
- Create root and render App

```javascript
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

---

#### 5. client/src/index.css
**Purpose:** Global styling

**Specifications:**
- Import Tailwind directives: @tailwind base, components, utilities
- Reset styles: * { margin: 0; padding: 0; box-sizing: border-box; }
- Body styles: Font, smoothing, antialiasing

---

#### 6. client/src/App.jsx
**Purpose:** Main app component with routing

**Specifications:**
- BrowserRouter setup
- Routes:
  - `/login` → LoginPage (public)
  - `/dashboard` → DashboardPage (protected)
  - `/` → redirect to /dashboard
  - `*` → redirect to /dashboard
- ProtectedRoute wrapper for authenticated pages

---

#### 7. client/src/stores/authStore.js
**Purpose:** Zustand authentication state management

**Specifications:**
- State properties:
  - isAuthenticated (boolean)
  - userId (number or null)
  - token (string or null)
  - role (string or null)
  - companyId (number or null)
  - userName (string or null)
  - userEmail (string or null)
  - loading (boolean)
  - error (string or null)

- Actions:
  - `setAuthData(data)` - Set all auth info
  - `clearAuth()` - Clear everything
  - `setLoading(bool)` - Set loading state
  - `setError(error)` - Set error message
  - `getToken()` - Get current token
  - `isLoggedIn()` - Check if authenticated

- Persistence:
  - Use zustand persist middleware
  - Persist all except token (for security) or in httpOnly cookie
  - Storage name: 'auth-storage'

---

#### 8. client/src/services/api.js
**Purpose:** Axios instance with interceptors

**Specifications:**
- Base URL: import.meta.env.VITE_API_URL
- Headers: Content-Type: application/json
- Request interceptor:
  - Get token from auth store
  - Add to Authorization header: `Bearer {token}`
  - Attach to all requests

- Response interceptor:
  - If 401: clear auth, redirect to /login
  - If error: return error response
  - Otherwise: return response.data

---

#### 9. client/src/hooks/useAuth.js
**Purpose:** Custom hook for auth store access

**Specifications:**
- Return object containing all auth selectors:
  - isAuthenticated
  - userId
  - token
  - role
  - companyId
  - userName
  - userEmail
  - loading
  - error
  - setAuthData (function)
  - clearAuth (function)
  - setLoading (function)
  - setError (function)

- Usage: `const { isAuthenticated, userId, ... } = useAuth();`

---

#### 10. client/src/components/ProtectedRoute.jsx
**Purpose:** Route protection wrapper

**Specifications:**
- Check isAuthenticated from auth store
- If not authenticated: redirect to /login
- If requiredRole provided: check if user.role matches
- If role doesn't match: redirect to /unauthorized
- Otherwise: render children

---

#### 11. client/src/pages/Login.jsx
**Purpose:** User login page (basic template)

**Specifications:**
- Form fields:
  - Username (text input)
  - Password (password input)
  - Remember Me (checkbox, optional)

- Features:
  - Form submission handling
  - Loading state with disabled button
  - Error message display
  - Forgot password link (mock)

- UI:
  - Centered card layout
  - Tailwind styling
  - Responsive design

---

#### 12. client/src/pages/Dashboard.jsx
**Purpose:** Basic dashboard (placeholder for Phase 1)

**Specifications:**
- Display:
  - Greeting with user name
  - Current role
  - Welcome message

- Features:
  - Header with logout button
  - Basic layout
  - Links to future sections (placeholder)

---

### 4.6 Frontend Project Initialization

**Steps:**
1. Create React + Vite project: `npm create vite@latest client -- --template react`
2. Navigate to client: `cd client`
3. Install dependencies: `npm install`
4. Install Tailwind: `npm install -D tailwindcss postcss autoprefixer`
5. Install additional deps: `npm install zustand axios react-router-dom`
6. Initialize Tailwind: `npx tailwindcss init -p`
7. Create all src/ files listed above
8. Create .env files

---

## 5. DATABASE SETUP SPECIFICATIONS

### 5.1 Database Connection Verification

**Action Required:**
- Verify MariaDB is running on localhost:3306
- Verify database `infinextg_ricon` exists
- Verify MySQL user credentials (root/password)
- Keep existing database schema (7025 lines, 70+ tables)

**No database changes in Phase 0** - only verification

### 5.2 Database Health Check

**Backend endpoint:** `GET /api/health` should:
- Connect to database
- Verify connection successful
- Return status with database connection info

---

## 6. PROJECT INTEGRATION SPECIFICATIONS

### 6.1 Server-to-Server Communication

**Requirement:** Frontend (http://localhost:5173) can call Backend (http://localhost:5000)

**Verification Steps:**
1. Frontend dev server running: `npm run dev` (in client/)
2. Backend dev server running: `npm run dev` (in server/)
3. Open browser: http://localhost:5173
4. Make test API call to /api/health from frontend
5. Verify CORS headers in response
6. Verify response is JSON with success: true

### 6.2 CORS Configuration

**Backend (server/src/middleware/cors.js):**
- Allow origin: http://localhost:5173 (dev)
- Allow credentials: true
- Allow methods: GET, POST, PUT, DELETE, OPTIONS
- Allow headers: Content-Type, Authorization

**Verification:**
- OPTIONS request responds 200
- CORS headers present in response:
  - Access-Control-Allow-Origin: http://localhost:5173
  - Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
  - Access-Control-Allow-Credentials: true

---

## 7. DEVELOPMENT WORKFLOW SPECIFICATIONS

### 7.1 Backend Development

**Commands:**
```bash
# Development (auto-reload on file changes)
npm run dev

# Production (no auto-reload)
npm start

# Install dependencies
npm install [package-name]
```

**Folder Convention:**
- Models go in: `src/models/`
- Controllers go in: `src/controllers/`
- Routes go in: `src/routes/`
- Utilities go in: `src/utils/`

### 7.2 Frontend Development

**Commands:**
```bash
# Development (Vite dev server with HMR)
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Install dependencies
npm install [package-name]
```

**Folder Convention:**
- Pages go in: `src/pages/`
- Reusable components go in: `src/components/`
- API calls go in: `src/services/`
- State management go in: `src/stores/`
- Custom hooks go in: `src/hooks/`

### 7.3 Git Configuration

**Backend .gitignore:**
```
node_modules/
.env
.env.local
.DS_Store
uploads/
logs/
dist/
*.log
npm-debug.log*
```

**Frontend .gitignore:**
```
node_modules/
.env.local
.DS_Store
dist/
dist-ssr/
*.local
npm-debug.log*
.vscode/*
!.vscode/extensions.json
```

---

## 8. TESTING & VERIFICATION CHECKLIST

### Backend Verification
- [ ] `npm install` completes successfully
- [ ] All dependencies listed in package.json
- [ ] `.env` file created with all required variables
- [ ] `npm run dev` starts nodemon without errors
- [ ] Server logs: "GMP_LIVE Backend Server Started"
- [ ] Server running on http://localhost:5000
- [ ] CORS middleware loaded
- [ ] Error handler middleware loaded
- [ ] Auth middleware loaded
- [ ] Database connection established (check logs)
- [ ] GET /api/health returns 200 with JSON response
  ```json
  {
    "success": true,
    "message": "Success",
    "data": { "status": "healthy", ... },
    "timestamp": "2026-03-04T..."
  }
  ```
- [ ] GET /api/version returns version info
- [ ] No console errors or warnings

### Frontend Verification
- [ ] `npm install` completes successfully
- [ ] Vite config properly loaded
- [ ] Tailwind CSS initialized
- [ ] `npm run dev` starts dev server without errors
- [ ] Dev server running on http://localhost:5173
- [ ] Browser auto-opens to localhost:5173
- [ ] App.jsx renders without errors
- [ ] Login page displays
- [ ] Dashboard placeholder page displays
- [ ] React Router working (can navigate routes)
- [ ] No console errors or warnings

### Integration Verification
- [ ] Both servers running simultaneously
- [ ] Frontend can call backend /api/health
- [ ] CORS headers present in response
- [ ] No CORS errors in browser console
- [ ] Token/Auth store initializes
- [ ] API interceptor adds Authorization header
- [ ] Response from backend displays as JSON in frontend

### Database Verification
- [ ] MariaDB running on localhost:3306
- [ ] infinextg_ricon database exists
- [ ] Authentication works (root user can connect)
- [ ] GET /api/health returns db connection status
- [ ] No database errors in logs

---

## 9. FILE SUMMARY TABLE

### Backend Files
| File | Purpose | Lines | Priority |
|------|---------|-------|----------|
| server/src/index.js | Express app startup | 50-70 | CRITICAL |
| server/src/config/database.js | DB connection | 30-50 | CRITICAL |
| server/src/config/constants.js | App constants | 30-40 | HIGH |
| server/src/middleware/auth.js | JWT auth/authz | 40-60 | HIGH |
| server/src/middleware/cors.js | CORS setup | 10-15 | HIGH |
| server/src/middleware/errorHandler.js | Error handling | 40-50 | HIGH |
| server/src/routes/health.js | Health checks | 15-20 | MEDIUM |
| server/src/utils/responseHandler.js | Response format | 20-30 | HIGH |
| server/package.json | Dependencies | 30-40 | CRITICAL |
| server/.env | Configuration | 20-25 | CRITICAL |
| **Total Backend** | | **300-400 lines** | |

### Frontend Files
| File | Purpose | Lines | Priority |
|------|---------|-------|----------|
| client/src/main.jsx | React entry | 10-15 | CRITICAL |
| client/src/App.jsx | App component | 30-40 | CRITICAL |
| client/src/index.css | Global styles | 20-30 | HIGH |
| client/src/stores/authStore.js | Zustand store | 40-60 | HIGH |
| client/src/services/api.js | Axios setup | 30-40 | HIGH |
| client/src/hooks/useAuth.js | Auth hook | 20-30 | MEDIUM |
| client/src/components/ProtectedRoute.jsx | Route guard | 20-25 | HIGH |
| client/src/pages/Login.jsx | Login page | 50-70 | MEDIUM |
| client/src/pages/Dashboard.jsx | Dashboard | 30-40 | MEDIUM |
| client/vite.config.js | Vite config | 15-20 | CRITICAL |
| client/package.json | Dependencies | 30-40 | CRITICAL |
| **Total Frontend** | | **300-400 lines** | |

---

## 10. COMMON ISSUES & TROUBLESHOOTING

### Backend Issues
| Issue | Solution |
|-------|----------|
| Port 5000 already in use | Change PORT in .env or kill process on port 5000 |
| Database connection fails | Check DB_HOST, DB_USER, DB_PASSWORD in .env |
| CORS errors | Verify CORS_ORIGIN in .env matches frontend URL |
| Module not found | Run `npm install` in server/ directory |
| nodemon not working | Install globally: `npm install -g nodemon` |

### Frontend Issues
| Issue | Solution |
|-------|----------|
| Port 5173 already in use | Vite will auto-use next available port |
| Module not found | Run `npm install` in client/ directory |
| Tailwind not styling | Check tailwind.config.js has correct template paths |
| API calls fail | Verify backend is running and VITE_API_URL is correct |
| Blank page | Check browser console for errors |

### Database Issues
| Issue | Solution |
|-------|----------|
| Cannot connect to DB | Verify MariaDB running: `mysql -u root -p` |
| Authentication fails | Check credentials in .env |
| Database not found | Create: `CREATE DATABASE infinextg_ricon;` |

---

## 11. PERFORMANCE BASELINE

### Expected Performance
- Backend startup: < 2 seconds
- Frontend dev build: < 3 seconds
- Database connection: < 500ms
- API response time: < 100ms (for health check)
- Page load: < 1 second (dev)

### Resource Usage (Expected)
- Backend memory: 50-100 MB
- Frontend dev server memory: 150-300 MB
- Total with Browser: 500-800 MB RAM

---

## 12. DOCUMENTATION REQUIREMENTS

### README.md (Backend)
Should include:
- Project name and description
- Tech stack
- Installation instructions
- Running development/production servers
- API documentation link
- Environment variables list
- Troubleshooting section

### README.md (Frontend)
Should include:
- Project name and description
- Tech stack
- Installation instructions
- Running dev/build servers
- Project structure overview
- Component architecture
- State management explanation

---

## 13. PHASE 0 COMPLETION CHECKLIST

### Before Starting
- [ ] Node.js v18+ installed (`node --version`)
- [ ] npm installed (`npm --version`)
- [ ] MariaDB running (`mysql -u root`)
- [ ] Git initialized (optional but recommended)
- [ ] Code editor ready (VS Code recommended)

### Backend Setup
- [ ] Create server/ directory structure
- [ ] Create package.json
- [ ] Install all dependencies (8 packages)
- [ ] Create .env file from template
- [ ] Create all 8 core backend files
- [ ] Create .gitignore
- [ ] `npm run dev` starts without errors
- [ ] Terminal logs show successful startup
- [ ] Can access http://localhost:5000/api/health

### Frontend Setup
- [ ] Create client/ directory using Vite
- [ ] Install all dependencies (10 packages)
- [ ] Initialize Tailwind CSS
- [ ] Create .env.development and .env.production
- [ ] Create all 12 core frontend files
- [ ] Create .gitignore
- [ ] `npm run dev` starts without errors
- [ ] Browser opens to http://localhost:5173
- [ ] App displays without JavaScript errors

### Integration Testing
- [ ] Both servers running simultaneously
- [ ] Frontend can call /api/health successfully
- [ ] Response includes CORS headers
- [ ] Browser console clean (no errors)
- [ ] API response time < 100ms
- [ ] Database connection verified in logs

### Documentation
- [ ] Backend README.md created
- [ ] Frontend README.md created
- [ ] .env.example files created
- [ ] Project structure documented
- [ ] Quick start guide written

### Final Verification
- [ ] All 20 core files created
- [ ] Both servers running on correct ports
- [ ] Backend and frontend communicating
- [ ] No critical errors in logs
- [ ] Ready to start Phase 1

---

## 14. NEXT PHASE

After Phase 0 completion, proceed to **Phase 1: Authentication & User Management**

**Key transition points:**
- Phase 1 builds on auth middleware created in Phase 0
- Phase 1 uses database connection from Phase 0
- Phase 1 uses response handler utilities from Phase 0
- Phase 1 uses Zustand store pattern from Phase 0

---

## 15. INFRASTRUCTURE DIAGRAM

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Browser                        │
│              (http://localhost:5173)                         │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  React App (Vite)                                    │  │
│  │  - App.jsx (Router)                                  │  │
│  │  - DashboardPage (placeholder)                       │  │
│  │  - LoginPage                                         │  │
│  │  - ProtectedRoute                                    │  │
│  │  - Zustand Auth Store                               │  │
│  └───────────┬──────────────────────────────────────────┘  │
│              │                                               │
│              │ HTTP + CORS                                  │
│              │ Authorization: Bearer {token}               │
│              │                                               │
└──────────────┼───────────────────────────────────────────────┘
               │
      ┌────────▼─────────┐                    ┌──────────────┐
      │   Express API    │  Database Query    │  MariaDB     │
      │ (localhost:5000) ├───────────────────►│  infinextg   │
      │                  │                    │  (port:3306) │
      ├──────────────────┤                    └──────────────┘
      │ Routes:          │
      │ /api/health      │
      │ /api/version     │
      │ (Phase 1+)       │
      │                  │
      │ Middleware:      │
      │ - CORS           │
      │ - Auth           │
      │ - Error Handler  │
      │ - Body Parser    │
      └──────────────────┘
```

---

**status:** Ready for implementation  
**Estimated Time:** 2-3 days  
**Team Size:** 1-2 developers  
**Blocker for:** All other phases (Phase 1-9)


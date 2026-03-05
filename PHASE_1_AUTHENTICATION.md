# PHASE 1: AUTHENTICATION & USER MANAGEMENT 🔐

**Phase Duration:** 3-4 days  
**Depends On:** Phase 0 (Infrastructure Setup)  
**Priority:** CRITICAL - Foundation for all other phases  
**Status:** [ ] Not Started | [ ] In Progress | [ ] Complete

---

## 1. OVERVIEW

This phase implements complete user authentication and management system, migrating from PHP sessions to JWT-based token authentication. All subsequent phases depend on this working correctly.

### Key Goals
- Secure user authentication with JWT tokens
- User profile management
- Password management (change, reset)
- Role-based access foundation
- Login history tracking
- Token refresh mechanism

---

## 2. DATABASE REFERENCE

### Tables Used
- `application_users` - Core user records
- `application_user_logins` - Login history/audit trail
- `roles` - Role definitions and permissions
- `proxy_users` - Proxy user access (future enhancement)

### Key Fields from `application_users`
```
id, company_id, username, email, password, role
user_image, is_active, current_status, status_date
from_date, to_date, created_date, created_by
updated_date, updated_by
```

### Key Fields from `application_user_logins`
```
id, user_id, login_date, logout_date, ip_address
```

---

## 3. BACKEND SPECIFICATIONS

### 3.1 Directory Structure
```
server/
├── src/
│   ├── routes/
│   │   └── auth.js              # NEW - Authentication routes
│   │   └── users.js             # NEW - User management routes
│   ├── controllers/
│   │   └── authController.js    # NEW - Auth logic
│   │   └── userController.js    # NEW - User logic
│   ├── models/
│   │   └── userModel.js         # NEW - Database queries
│   └── utils/
│       └── passwordUtils.js     # NEW - Password hashing/validation
```

### 3.2 Backend Dependencies

**No new dependencies needed** - All required packages installed in Phase 0:
- `jsonwebtoken` - Already installed
- `bcryptjs` - Already installed
- `mysql2` - Already installed

### 3.3 Backend API Endpoints

#### Authentication Endpoints

**1. POST `/api/auth/login`**
- **Purpose:** User login with credentials
- **Request Body:**
  ```json
  {
    "username": "string",
    "password": "string"
  }
  ```
- **Success Response (200):**
  ```json
  {
    "success": true,
    "message": "Login successful",
    "data": {
      "token": "eyJhbGc...",
      "user_id": 1,
      "company_id": 5,
      "username": "john_doe",
      "email": "john@example.com",
      "role": "manager",
      "user_name": "John Doe"
    },
    "timestamp": "2026-03-04T10:30:00Z"
  }
  ```
- **Error Responses:**
  - Invalid credentials (401)
  - User not found (404)
  - User inactive (403)
  - Database error (500)
- **Database Operations:**
  - Query: `SELECT * FROM application_users WHERE username = ? AND is_active = 0`
  - Compare password hash using bcryptjs
  - On success: Insert into `application_user_logins` with login_date, ip_address
  - Generate JWT token with userId, companyId, role (expires: 24h)
  - Return user data with token

---

**2. POST `/api/auth/logout`**
- **Purpose:** Logout user and end session
- **Requirements:** Bearer token in Authorization header
- **Request Body:** Empty or `{}`
- **Success Response (200):**
  ```json
  {
    "success": true,
    "message": "Logout successful",
    "data": null,
    "timestamp": "2026-03-04T10:30:00Z"
  }
  ```
- **Database Operations:**
  - Update `application_user_logins` set logout_date = NOW() WHERE user_id = ? AND logout_date IS NULL
  - Clear token on frontend

---

**3. POST `/api/auth/refresh-token`**
- **Purpose:** Refresh expired JWT token
- **Requirements:** Refresh token (to be stored in httpOnly cookie or localStorage)
- **Request Body:**
  ```json
  {
    "refreshToken": "string"
  }
  ```
- **Success Response (200):**
  ```json
  {
    "success": true,
    "message": "Token refreshed",
    "data": {
      "token": "eyJhbGc...",
      "expiresIn": "24h"
    },
    "timestamp": "2026-03-04T10:30:00Z"
  }
  ```
- **Logic:**
  - Verify refresh token validity
  - Generate new access token
  - Return new token

---

**4. POST `/api/auth/forgot-password`**
- **Purpose:** Request password reset link
- **Request Body:**
  ```json
  {
    "email": "user@example.com"
  }
  ```
- **Success Response (200):**
  ```json
  {
    "success": true,
    "message": "Password reset link sent to email",
    "data": null,
    "timestamp": "2026-03-04T10:30:00Z"
  }
  ```
- **Error Response:** 
  - Email not found (404)
  - Email service error (500)
- **Database Operations:**
  - Query: `SELECT id, email FROM application_users WHERE email = ?`
  - Generate password reset token (JWT with short expiry: 1h)
  - Store token in database or send via email (implementation choice)
  - Send email with reset link: `{FRONTEND_URL}/reset-password?token={token}`

---

**5. POST `/api/auth/reset-password`**
- **Purpose:** Reset password with token
- **Request Body:**
  ```json
  {
    "token": "eyJhbGc...",
    "newPassword": "string"
  }
  ```
- **Success Response (200):**
  ```json
  {
    "success": true,
    "message": "Password reset successful",
    "data": null,
    "timestamp": "2026-03-04T10:30:00Z"
  }
  ```
- **Validation:**
  - Token must be valid and not expired
  - Password must meet requirements (min 8 chars, mix case, number recommended)
  - Cannot reuse old password
- **Database Operations:**
  - Verify token
  - Hash new password
  - Update: `UPDATE application_users SET password = ? WHERE id = ?`
  - Optionally invalidate existing refresh tokens

---

#### User Management Endpoints

**6. GET `/api/users/profile`**
- **Purpose:** Get current logged-in user profile
- **Requirements:** Bearer token (authenticated)
- **Success Response (200):**
  ```json
  {
    "success": true,
    "message": "Profile retrieved",
    "data": {
      "user_id": 1,
      "username": "john_doe",
      "email": "john@example.com",
      "role": "manager",
      "company_id": 5,
      "user_name": "John Doe",
      "user_image": null,
      "from_date": "2025-01-01",
      "to_date": "2026-12-31",
      "is_active": 0,
      "current_status": "active"
    },
    "timestamp": "2026-03-04T10:30:00Z"
  }
  ```
- **Database Operations:**
  - Query: `SELECT * FROM application_users WHERE id = ? AND company_id = ?`
  - Return user data (excluding password hash)

---

**7. PUT `/api/users/profile`**
- **Purpose:** Update user profile (email, name, etc.)
- **Requirements:** Bearer token (authenticated)
- **Request Body:**
  ```json
  {
    "email": "newemail@example.com",
    "user_name": "John Updated",
    "user_image": "base64_encoded_image_or_url"
  }
  ```
- **Success Response (200):**
  ```json
  {
    "success": true,
    "message": "Profile updated successfully",
    "data": { "user_id": 1 },
    "timestamp": "2026-03-04T10:30:00Z"
  }
  ```
- **Validation:**
  - Email must be unique (if changing)
  - Email format validation
  - Image size validation (if uploading)
- **Database Operations:**
  - Update: `UPDATE application_users SET email = ?, user_name = ? WHERE id = ?`
  - Set updated_date = NOW(), updated_by = current_user_id

---

**8. PUT `/api/users/change-password`**
- **Purpose:** Change password (authenticated user)
- **Requirements:** Bearer token (authenticated)
- **Request Body:**
  ```json
  {
    "oldPassword": "string",
    "newPassword": "string"
  }
  ```
- **Success Response (200):**
  ```json
  {
    "success": true,
    "message": "Password changed successfully",
    "data": null,
    "timestamp": "2026-03-04T10:30:00Z"
  }
  ```
- **Validation:**
  - Old password must be correct
  - New password must be different from old
  - New password meets requirements
- **Database Operations:**
  - Query: `SELECT password FROM application_users WHERE id = ?`
  - Verify old password hash
  - Hash new password
  - Update: `UPDATE application_users SET password = ? WHERE id = ?`

---

**9. GET `/api/users/roles`**
- **Purpose:** Get all available roles (for admin/setup)
- **Requirements:** Bearer token (admin or manager)
- **Success Response (200):**
  ```json
  {
    "success": true,
    "message": "Roles retrieved",
    "data": [
      {
        "id": 1,
        "role": "admin",
        "description": "Administrator with full access",
        "permissions": ["create_user", "edit_user", "delete_user", ...]
      },
      {
        "id": 2,
        "role": "manager",
        "description": "Manager with department access",
        "permissions": ["view_reports", "approve_requests", ...]
      },
      ...
    ],
    "timestamp": "2026-03-04T10:30:00Z"
  }
  ```
- **Database Operations:**
  - Query: `SELECT * FROM roles WHERE is_active = 0`

---

**10. GET `/api/users/login-history`**
- **Purpose:** Get login history for current user
- **Requirements:** Bearer token (authenticated)
- **Query Parameters:**
  - `limit=20` - Number of records
  - `offset=0` - Pagination offset
- **Success Response (200):**
  ```json
  {
    "success": true,
    "message": "Login history retrieved",
    "data": [
      {
        "id": 1,
        "login_date": "2026-03-04T09:30:00Z",
        "logout_date": "2026-03-04T17:00:00Z",
        "ip_address": "192.168.1.100",
        "duration_minutes": 450
      },
      ...
    ],
    "total": 150,
    "timestamp": "2026-03-04T10:30:00Z"
  }
  ```
- **Database Operations:**
  - Query: `SELECT * FROM application_user_logins WHERE user_id = ? ORDER BY login_date DESC LIMIT ? OFFSET ?`

---

### 3.4 Error Response Codes

| Error Code | HTTP Status | Meaning |
|-----------|-------------|---------|
| `ERR_INVALID_CREDENTIALS` | 401 | Username/password incorrect |
| `ERR_USER_NOT_FOUND` | 404 | User doesn't exist |
| `ERR_USER_INACTIVE` | 403 | User account inactive |
| `ERR_UNAUTHORIZED` | 401 | Missing or invalid token |
| `ERR_FORBIDDEN` | 403 | Insufficient permissions |
| `ERR_TOKEN_EXPIRED` | 401 | Token expired |
| `ERR_INVALID_TOKEN` | 401 | Token format/structure invalid |
| `ERR_VALIDATION_ERROR` | 400 | Input validation failed |
| `ERR_DATABASE_ERROR` | 500 | Database operation failed |
| `ERR_DUPLICATE_ENTRY` | 409 | Email/username already exists |

---

### 3.5 Middleware Requirements

**1. Authentication Middleware (`server/src/middleware/auth.js` - update existing)**
- Verify JWT token from `Authorization: Bearer <token>` header
- Extract user info from token payload
- Attach user object to `req.user`
- Return 401 if token missing or invalid
- Handle token expiration gracefully

**2. Role Authorization Middleware**
- Check if user role matches required role(s)
- Return 403 if unauthorized
- Support multiple roles (e.g., admin OR manager)

---

### 3.6 Utility Functions

**1. Password Hashing Utility (`server/src/utils/passwordUtils.js`)**
- `hashPassword(plainPassword)` - Hash password with bcrypt (salt rounds: 10)
- `comparePassword(plainPassword, hash)` - Compare password with hash
- `validatePasswordStrength(password)` - Check password requirements
  - Minimum 8 characters
  - At least 1 uppercase letter
  - At least 1 lowercase letter
  - At least 1 number

**2. JWT Utility (`server/src/utils/jwtUtils.js` - Optional)**
- `generateToken(payload)` - Create JWT token (24h expiry)
- `generateRefreshToken(payload)` - Create refresh token (7d expiry)
- `verifyToken(token)` - Verify and decode token
- `decodeToken(token)` - Decode without verification

**3. Email Utility (`server/src/utils/emailUtils.js` - Optional for Phase 1.5)**
- `sendPasswordResetEmail(email, resetToken)` - Send reset link
- `sendLoginNotification(email)` - Notify on login

---

## 4. FRONTEND SPECIFICATIONS

### 4.1 Directory Structure
```
client/
├── src/
│   ├── pages/
│   │   ├── Login.jsx                    # ALREADY CREATED - Update/enhance
│   │   ├── Profile.jsx                  # NEW - User profile page
│   │   ├── ChangePassword.jsx           # NEW - Change password page
│   │   ├── ForgotPassword.jsx           # NEW - Password reset request
│   │   └── ResetPassword.jsx            # NEW - Password reset form
│   ├── stores/
│   │   └── authStore.js                 # ALREADY CREATED - Ensure complete
│   ├── services/
│   │   ├── api.js                       # ALREADY CREATED - Ensure interceptors work
│   │   └── authService.js               # NEW - Auth API calls
│   ├── components/
│   │   ├── ProtectedRoute.jsx           # ALREADY CREATED - Verify works
│   │   ├── Header.jsx                   # NEW - Navigation header
│   │   ├── Alert.jsx                    # NEW - Error/success alerts
│   │   └── LoadingSpinner.jsx           # NEW - Loading indicator
│   └── hooks/
│       └── useAuth.js                   # ALREADY CREATED - Ensure complete
```

### 4.2 Frontend Dependencies

**No new dependencies needed** - All installed in Phase 0:
- `react-router-dom` - Already installed
- `zustand` - Already installed
- `axios` - Already installed
- `tailwindcss` - Already installed

### 4.3 Frontend Pages

#### 1. Login Page (`client/src/pages/Login.jsx`)
**Current state:** Already created in Phase 0  
**Enhancements needed:**
- Remember username checkbox (optional)
- Forgot password link
- Loading state with spinner
- Error message display (specific vs generic)
- Form validation before submission
- Enter key submits form
- Redirect to dashboard on successful login
- Redirect to login if already authenticated

**Form Fields:**
- Username (required, text input)
- Password (required, password input)
- Remember Me (optional, checkbox)

**UI Elements:**
- Login button (disabled while loading)
- Forgot Password link
- Sign up link (if enabled)
- Error alert (red background)
- Success message (if redirecting)

---

#### 2. Profile Page (`client/src/pages/Profile.jsx`) - NEW
**Purpose:** Display and edit user profile information

**Sections:**
1. **User Information (Read-only or Edit)**
   - Username (readonly)
   - Email (editable)
   - Full Name (editable)
   - Role (readonly)
   - Company (readonly)
   - User Status (readonly)
   - Valid From Date (readonly)
   - Valid To Date (readonly)

2. **Profile Picture**
   - Current image display
   - Upload new image button
   - Image preview
   - Remove image option

3. **Account Activity**
   - Last login date/time
   - Last logout date/time
   - Current session IP address
   - Login history link

4. **Action Buttons**
   - Edit Profile
   - Save Changes
   - Change Password
   - Cancel/Back

**Functionality:**
- Fetch user profile on page load
- Display all user information
- Edit mode toggle
- Save changes with validation
- Show success/error messages
- Prevent editing while saving
- Handle image upload

---

#### 3. Change Password Page (`client/src/pages/ChangePassword.jsx`) - NEW
**Purpose:** Securely change user password

**Form Fields:**
- Current Password (password input, required)
- New Password (password input, required)
- Confirm New Password (password input, required)

**Validation Rules:**
- Current password must be correct
- New password must differ from current
- New password must meet strength requirements:
  - Min 8 characters
  - At least 1 uppercase (A-Z)
  - At least 1 lowercase (a-z)
  - At least 1 number (0-9)
  - Optional: At least 1 special character
- Confirm password must match new password
- Show password strength indicator (Weak/Fair/Good/Strong)

**UI Elements:**
- Password strength meter/indicator
- Show/hide password toggle
- Requirements checklist (updates live)
- Change Password button (disabled while loading)
- Cancel button
- Success/error messages

---

#### 4. Forgot Password Page (`client/src/pages/ForgotPassword.jsx`) - NEW
**Purpose:** Request password reset via email

**Form Fields:**
- Email (email input, required)

**Workflow:**
1. User enters email
2. Submit triggers API call to `/api/auth/forgot-password`
3. Show loading state
4. On success: Show message "Check your email for reset link"
5. On error: Show specific error (email not found, etc.)
6. Link to go back to login

**UI Elements:**
- Email input
- Submit button (disabled while loading)
- Back to Login link
- Success message with instructions
- Error alert

---

#### 5. Reset Password Page (`client/src/pages/ResetPassword.jsx`) - NEW
**Purpose:** Reset password using token from email

**Form Fields:**
- New Password (password input, required)
- Confirm Password (password input, required)

**Workflow:**
1. Extract token from URL query parameter: `?token={token}`
2. Validate token format
3. User enters new password
4. Submit triggers API call to `/api/auth/reset-password`
5. On success: Redirect to login with message "Password reset successful"
6. On error: Show error (token expired, invalid, etc.)

**Validations:**
- Token must be present in URL
- Password strength requirements (same as Change Password)
- Passwords must match

**UI Elements:**
- Password input with strength meter
- Confirm password input
- Reset Password button
- Error messages
- Success redirect

---

### 4.4 Frontend Services

#### Auth Service (`client/src/services/authService.js`) - NEW
**Purpose:** Centralized API calls for authentication

**Functions:**
- `login(username, password)` → Promise
  - Call: `POST /api/auth/login`
  - Return: { token, user_id, role, company_id, ... }

- `logout()` → Promise
  - Call: `POST /api/auth/logout`
  - Clear localStorage/Zustand

- `getProfile()` → Promise
  - Call: `GET /api/users/profile`
  - Return: User profile data

- `updateProfile(updateData)` → Promise
  - Call: `PUT /api/users/profile`
  - Params: { email, user_name, user_image }

- `changePassword(oldPassword, newPassword)` → Promise
  - Call: `PUT /api/users/change-password`

- `forgotPassword(email)` → Promise
  - Call: `POST /api/auth/forgot-password`

- `resetPassword(token, newPassword)` → Promise
  - Call: `POST /api/auth/reset-password`

- `refreshToken()` → Promise
  - Call: `POST /api/auth/refresh-token`

- `getLoginHistory(limit=20, offset=0)` → Promise
  - Call: `GET /api/users/login-history`

---

### 4.5 Frontend Components

#### 1. Header Component (`client/src/components/Header.jsx`) - NEW
**Purpose:** Navigation header across all pages

**Display:**
- Logo/App name on left
- User information (name, role) in center/right
- Logout button on right
- Mobile menu toggle (responsive)

**Features:**
- Dropdown menu for profile/settings (optional)
- Notification bell (if implementing notifications)
- Theme toggle (optional)
- Responsive design

---

#### 2. Alert Component (`client/src/components/Alert.jsx`) - NEW
**Purpose:** Reusable alert/notification component

**Types:**
- `success` - Green background
- `error` - Red background
- `warning` - Yellow background
- `info` - Blue background

**Props:**
- `type` - Alert type
- `message` - Alert text
- `onClose` - Callback to dismiss
- `autoClose` - Auto-dismiss after 5s (optional)

---

#### 3. Loading Spinner Component (`client/src/components/LoadingSpinner.jsx`) - NEW
**Purpose:** Loading indicator

**Variants:**
- Full page spinner (for initial page load)
- Inline spinner (for buttons, form submissions)
- Overlay spinner (for blocking UI during async operations)

---

### 4.6 Zustand Store Updates

**Auth Store (`client/src/stores/authStore.js`)** - Already created, verify:
- State: `isAuthenticated`, `userId`, `token`, `role`, `companyId`, `userName`, `userEmail`, `loading`, `error`
- Actions: `setAuthData()`, `clearAuth()`, `setLoading()`, `setError()`, `getToken()`
- Persistence: Save to localStorage (except token, for security - or use httpOnly cookie)

---

### 4.7 Navigation & Routing

**Update `client/src/App.jsx`:**
- Login route: `/login` (public)
- Dashboard route: `/dashboard` (protected)
- Profile route: `/profile` (protected)
- Change Password route: `/change-password` (protected)
- Forgot Password route: `/forgot-password` (public)
- Reset Password route: `/reset-password` (public)
- Default route: `/` redirects to `/dashboard` or `/login` based on auth state

**Redirect Logic:**
- If authenticated and on `/login`, redirect to `/dashboard`
- If not authenticated and on protected route, redirect to `/login`
- If trying to reset password without token, redirect to `/forgot-password`

---

## 5. AUTHENTICATION FLOW DIAGRAMS

### 5.1 Login Flow
```
User logs in (username/password)
         ↓
Frontend validates input
         ↓
POST /api/auth/login
         ↓
Backend: Verify user exists & is active
         ↓
Backend: Compare password hash
         ↓
Backend: Insert login record in application_user_logins
         ↓
Backend: Generate JWT token (24h expiry)
         ↓
Frontend: Receive token & user data
         ↓
Frontend: Store token in localStorage/Zustand
         ↓
Frontend: Redirect to /dashboard
         ↓
(Subsequent requests include token in Authorization header)
```

### 5.2 Token Refresh Flow
```
API call returns 401 (Unauthorized)
         ↓
Check if refresh token available
         ↓
POST /api/auth/refresh-token
         ↓
Backend: Verify refresh token
         ↓
Backend: Generate new access token
         ↓
Frontend: Update token in store
         ↓
Retry original API call with new token
```

### 5.3 Password Reset Flow
```
User clicks "Forgot Password"
         ↓
Enter email address
         ↓
POST /api/auth/forgot-password
         ↓
Backend: Find user by email
         ↓
Backend: Generate password reset token (1h expiry)
         ↓
Backend: Send email with reset link
         ↓
User clicks link in email: /reset-password?token=xyz
         ↓
Frontend: Validates token format
         ↓
User enters new password
         ↓
POST /api/auth/reset-password (with token)
         ↓
Backend: Verify token
         ↓
Backend: Hash new password
         ↓
Backend: Update user password
         ↓
Frontend: Redirect to login with success message
```

---

## 6. SECURITY CONSIDERATIONS

### 6.1 Password Security
- [ ] Passwords hashed with bcryptjs (salt rounds: 10)
- [ ] Never return password in API responses
- [ ] Never log passwords
- [ ] Enforce minimum password requirements
- [ ] Prevent password reuse (check against old hash)
- [ ] Password reset token expires after 1 hour
- [ ] Old tokens invalidated on password change

### 6.2 Token Security
- [ ] JWT tokens signed with strong secret (min 32 chars)
- [ ] Access token expiry: 24 hours
- [ ] Refresh token expiry: 7 days
- [ ] Store refresh token securely (httpOnly cookie preferred)
- [ ] Validate token signature on every API call
- [ ] Invalidate tokens on logout

### 6.3 Account Security
- [ ] Rate limit login attempts (max 5 attempts per 15 min per IP)
- [ ] Log all login attempts (failed & successful)
- [ ] Log password changes
- [ ] Prevent sequential login after logout (new session)
- [ ] Soft delete user accounts (is_active flag)
- [ ] Track user validity dates (from_date, to_date)

### 6.4 Data Privacy
- [ ] SQL injection prevention: Parameterized queries
- [ ] XSS prevention: Sanitize user input
- [ ] CSRF protection: (Optional in Phase 2)
- [ ] CORS configured to allowed domains only
- [ ] Sensitive API responses exclude unnecessary data

---

## 7. DATABASE OPERATIONS CHECKLIST

### Create Operations
- [ ] `INSERT INTO application_users` - For user registration (Phase 1.5)
- [ ] `INSERT INTO application_user_logins` - On every login

### Read Operations
- [ ] `SELECT FROM application_users WHERE username = ?`
- [ ] `SELECT FROM application_users WHERE id = ? AND company_id = ?`
- [ ] `SELECT FROM application_users WHERE email = ?`
- [ ] `SELECT FROM roles`
- [ ] `SELECT FROM application_user_logins WHERE user_id = ?`

### Update Operations
- [ ] `UPDATE application_users SET password = ?` - Change password
- [ ] `UPDATE application_users SET email = ? WHERE id = ?` - Update profile
- [ ] `UPDATE application_user_logins SET logout_date = ?` - End session

---

## 8. ERROR HANDLING SCENARIOS

### Login Errors
- [ ] Username not found → 404
- [ ] Password incorrect → 401
- [ ] Account inactive (is_active = 1) → 403
- [ ] Account date range invalid (outside from_date/to_date) → 403
- [ ] Database connection error → 500
- [ ] Rate limit exceeded → 429 (optional)

### Password Change Errors
- [ ] Old password incorrect → 401
- [ ] New password too weak → 400
- [ ] Passwords don't match → 400
- [ ] Same as old password → 400

### Profile Update Errors
- [ ] Email already taken → 409
- [ ] Invalid email format → 400
- [ ] Image file too large → 413
- [ ] Invalid image format → 400

---

## 9. TESTING CHECKLIST

### Manual Testing
- [ ] Login with valid credentials → Success with token
- [ ] Login with invalid username → Error message
- [ ] Login with wrong password → Error message
- [ ] Login with inactive user → Forbidden error
- [ ] Logout → Clears token, redirects to login
- [ ] Access protected route without token → Redirects to login
- [ ] Access protected route with expired token → Redirects to login
- [ ] Refresh token generates new access token → Can use new token
- [ ] Change password with wrong old password → Error
- [ ] Change password with weak new password → Error or warning
- [ ] Change password successfully → Can login with new password
- [ ] Request password reset → Email sent (check logs/email service)
- [ ] Reset password with token → Works and can login
- [ ] Reset password with expired token → Error
- [ ] Update profile information → Changes saved
- [ ] Upload profile picture → Image stored and retrieved
- [ ] View login history → Shows past logins with IP, time, duration

### API Testing
- [ ] POST /api/auth/login - All error codes
- [ ] POST /api/auth/logout - With/without token
- [ ] GET /api/users/profile - Authenticated
- [ ] PUT /api/users/profile - Validation errors
- [ ] PUT /api/users/change-password - All validators
- [ ] GET /api/users/login-history - Pagination
- [ ] Response format consistent for all endpoints
- [ ] Error codes match specification

### Security Testing
- [ ] SQL injection attempt in login → Blocked
- [ ] XSS injection in password field → Handled
- [ ] Token from another user doesn't work → 403
- [ ] Modified token rejected → 401
- [ ] Very old token rejected → 401
- [ ] Password not returned in profile response → Verified
- [ ] Password hashes different each time → Verified (bcrypt salt)

---

## 10. PHASE 1 COMPLETION CHECKLIST

### Backend
- [ ] Auth routes created (auth.js)
- [ ] User routes created (users.js)
- [ ] Auth controller with login logic
- [ ] User controller with profile/password logic
- [ ] Password utilities (hash, compare, validate)
- [ ] JWT utilities (generate, verify)
- [ ] Error handler middleware updated
- [ ] Auth middleware (authenticateToken, authorizeRole)
- [ ] All 10 API endpoints working
- [ ] Error responses match specification
- [ ] Login history tracking works
- [ ] Password hashing implemented (bcrypt)
- [ ] Token generation/verification works

### Frontend
- [ ] Login page enhanced with validation
- [ ] Profile page created
- [ ] Change Password page created
- [ ] Forgot Password page created
- [ ] Reset Password page created
- [ ] Auth service with all API calls
- [ ] Header component with logout
- [ ] Alert component for messages
- [ ] Loading spinner component
- [ ] Zustand auth store complete
- [ ] Protected routes working
- [ ] Token persists on refresh
- [ ] Routing configured correctly
- [ ] UI responsive and styled

### Integration
- [ ] Frontend login → Backend authorize
- [ ] Token in header on subsequent requests
- [ ] Protected routes redirect unauthenticated users
- [ ] Logout clears everything
- [ ] Password change works end-to-end
- [ ] Profile update works end-to-end
- [ ] Error messages display properly

### Testing
- [ ] Manual login/logout workflow
- [ ] API endpoints tested (Postman/curl)
- [ ] Error scenarios tested
- [ ] Security review completed

---

## 11. KNOWN LIMITATIONS & FUTURE ENHANCEMENTS

### Phase 1 Limitations
- No email service for forgot password (mock/placeholder in Phase 1.5)
- No proxy user support (Phase 2+)
- No two-factor authentication (Phase 3+)
- No device/session management UI (Phase 2+)
- No audit logging for sensitive actions (optional enhancement)

### Phase 1.5 Enhancements (Optional)
- Email feedback for login attempts
- Session device tracking
- Parallel session limit
- Suspicious activity alerts

---

## 12. DELIVERABLES SUMMARY

### Backend Deliverables
1. POST `/api/auth/login` - Login endpoint
2. POST `/api/auth/logout` - Logout endpoint
3. POST `/api/auth/refresh-token` - Token refresh
4. POST `/api/auth/forgot-password` - Reset request
5. POST `/api/auth/reset-password` - Password reset
6. GET `/api/users/profile` - Get profile
7. PUT `/api/users/profile` - Update profile
8. PUT `/api/users/change-password` - Change password
9. GET `/api/users/roles` - List roles
10. GET `/api/users/login-history` - Login history

### Frontend Deliverables
1. Enhanced Login Page
2. Profile Page
3. Change Password Page
4. Forgot Password Page
5. Reset Password Page
6. Auth Service
7. Header Component
8. Alert Component
9. Loading Spinner Component
10. Zustand Auth Store (updated)
11. Protected Routes
12. App Navigation Structure

---

## 13. QUICK REFERENCE

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| /api/auth/login | POST | No | User login |
| /api/auth/logout | POST | Yes | User logout |
| /api/auth/refresh-token | POST | No | Refresh token |
| /api/auth/forgot-password | POST | No | Reset request |
| /api/auth/reset-password | POST | No | Reset password |
| /api/users/profile | GET | Yes | Get profile |
| /api/users/profile | PUT | Yes | Update profile |
| /api/users/change-password | PUT | Yes | Change password |
| /api/users/roles | GET | Yes | List roles |
| /api/users/login-history | GET | Yes | Login history |

---

## 14. MIGRATION REFERENCE FROM PHP

### Session → JWT
**Old (PHP):**
```
$_SESSION['userid'] = $user_id;
$_SESSION['company_id'] = $company_id;
$_SESSION['role'] = $role;
```

**New (Node):**
```
JWT token payload: { userId, companyId, role }
Stored in localStorage/cookie
Sent in Authorization header
```

### mysqli → MySQL2
**Old (PHP):**
```
$conn = new mysqli(...);
$result = $conn->query("SELECT ...");
```

**New (Node):**
```
pool.query("SELECT ...", [params], callback);
Or use promise wrapper
```

---

## 15. NEXT PHASE PREPARATION

After Phase 1 completion:
- Authentication foundation is solid
- Ready to implement Phase 2: Master Data (Items)
- All subsequent phases use auth middleware
- User context (userId, companyId) available in all requests

---

**Status:** Ready for implementation by Codex  
**Last Updated:** March 4, 2026  
**Prepared for:** GMP_LIVE Authentication Migration  
**Questions/Clarifications:** Refer to original [PROJECT_DOCUMENTATION.md](../GMP_LIVE/PROJECT_DOCUMENTATION.md) or [MIGRATION_PHASES.md](./MIGRATION_PHASES.md)

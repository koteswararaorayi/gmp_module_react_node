# GMP_LIVE MIGRATION TO REACT+VITE + NODE+EXPRESS - PHASE INDEX

**Migration Plan Created:** March 4, 2026  
**Total Phases:** 10 (Phase 0 Infrastructure + Phase 1-9 Implementation)  
**Estimated Duration:** 10-12 weeks  
**Tech Stack:** Node.js (Express) + React (Vite) + MariaDB + Zustand

---

## 📋 PHASE OVERVIEW & LINKS

### Phase 0: Infrastructure Setup ⚙️
**Duration:** 2-3 days | **Dependencies:** None | **Status:** Ready to Start

Create project structure, initialize Node.js backend, React frontend, configure databases, and verify communication.

📄 **See:** [PHASE_0_INFRASTRUCTURE.md](./PHASE_0_INFRASTRUCTURE.md) *(Created during initial setup)*

**Deliverables:**
- Backend project structure with Express, middleware, utilities
- Frontend project structure with Vite, routing, state management
- Health check endpoint working
- Both servers running and communicating

---

### Phase 1: Authentication & User Management 🔐
**Duration:** 3-4 days | **Dependencies:** Phase 0 | **Priority:** CRITICAL

User login, profile management, password reset, JWT tokens, role-based access control, login history tracking.

📄 **Specification:** [PHASE_1_AUTHENTICATION.md](./PHASE_1_AUTHENTICATION.md)

**Backend Deliverables:**
- 10 API endpoints (login, logout, reset password, profile, change password, roles, history)
- Password hashing with bcryptjs
- JWT token generation/verification
- Middleware for authentication & authorization
- Login history logging

**Frontend Deliverables:**
- Enhanced login page
- User profile page
- Change password page
- Forgot/reset password pages
- Protected routes
- Header component with logout
- Zustand auth store
- API service for auth calls

**Key Features:**
- Secure password reset via email link
- Token refresh mechanism
- Rate limiting on login (recommended)
- Session tracking

---

### Phase 2: Master Data Management - Items 📦
**Duration:** 4-5 days | **Dependencies:** Phase 1 | **Priority:** HIGH

Item master, categories, types, UOM, manufacturers, suppliers with full CRUD operations.

📄 **Specification:** [PHASE_2_MASTER_ITEMS.md](./PHASE_2_MASTER_ITEMS.md)

**Backend Deliverables:**
- 26 API endpoints (Items, Categories, Types, UOMs, Manufacturers, Suppliers)
- Item master CRUD with unique validation
- Cascading categories and types
- List with search, filter, sort, pagination
- CSV export functionality

**Frontend Deliverables:**
- Items management dashboard
- Create/edit item pages with form validation
- Master data list pages (categories, types, etc.)
- Search and filter UI
- Pagination and sorting
- Export to CSV button
- Responsive table components

**Key Features:**
- Item code uniqueness per company
- Cascading dropdown selectors
- Bulk import/export (Phase 2.5)
- Master data caching

---

### Phase 3: Master Data Management - Warehouses & Locations 🏭
**Duration:** 2-3 days | **Dependencies:** Phase 1, 2 | **Priority:** HIGH

Warehouse master and storage location management with capacity tracking.

📄 **Specification:** [PHASE_3_WAREHOUSES.md](./PHASE_3_WAREHOUSES.md)

**Backend Deliverables:**
- 12 API endpoints (Warehouses, Locations)
- Warehouse CRUD with capacity
- Location CRUD with warehouse relationship
- Cascading location selection

**Frontend Deliverables:**
- Warehouse list and management
- Location management (filtered by warehouse)
- Cascading selectors for warehouse → location
- Capacity visualization

**Key Features:**
- Location code unique per warehouse (not globally)
- Warehouse-location relationship enforced
- Capacity tracking

---

### Phase 4: Transaction Management - GRN (Goods Received) 📥
**Duration:** 5-6 days | **Dependencies:** Phase 1, 2, 3 | **Priority:** CRITICAL

Goods Received Notes (GRN) master-detail transaction with workflow approval and stock updates.

📄 **Specification:** [PHASE_4_GRN.md](./PHASE_4_GRN.md)

**Backend Deliverables:**
- 9 API endpoints (GRN CRUD, status change, approval history, export)
- GRN number auto-generation (GRN/YYYY/NNN)
- Status workflow enforcement (NEW → PENDING → APPROVED/REJECTED)
- Stock ledger updates on approval
- Line items management
- Action logging for audit trail

**Frontend Deliverables:**
- GRN list with filters and status colors
- Create GRN page with dynamic line items table
- Edit GRN page (with edit restrictions)
- GRN details page with approval workflow
- Approval modal for approvers
- Line items reusable component
- Supplier/item/location selectors

**Key Features:**
- Master-detail transaction pattern
- Workflow approval rules
- Stock ledger integration
- Approval history tracking
- Cannot edit approved GRN

---

### Phase 5: Transaction Management - Material Requests & Issues 📤
**Duration:** 4-5 days | **Dependencies:** Phase 1-4 | **Priority:** HIGH

Material Requests (demand) and Material Issues (fulfillment) with approval workflow.

📄 **Specification:** [PHASE_5_MATERIAL_REQUESTS.md](./PHASE_5_MATERIAL_REQUESTS.md)

**Backend Deliverables:**
- 12 API endpoints (Requests & Issues CRUD, status changes)
- Request number generation
- Issue number generation
- Quantity approval in requests
- Stock validation before issue
- Location availability checks

**Frontend Deliverables:**
- Material request list and CRUD
- Material issue list and CRUD
- Request approval UI
- Issue completion workflow
- Link request to issue creation

**Key Features:**
- Cannot issue more than approved qty
- Stock availability verification
- Batch tracking in issues
- Location capacity checking

---

### Phase 6: Stock Reporting & Ledger Management 📊
**Duration:** 3-4 days | **Dependencies:** Phase 1-5 | **Priority:** HIGH

Stock reports, ledger viewing, expiry tracking, low stock alerts.

📄 **Specification:** [PHASE_6_STOCK_REPORTS.md](./PHASE_6_STOCK_REPORTS.md)

**Backend Deliverables:**
- 8 API endpoints (Stock ledger, stock report, expiry alerts, low stock, export)
- Stock on hand calculation
- Stock movement history
- Expiry tracking with alert thresholds
- Low stock identification
- Stock valuation report

**Frontend Deliverables:**
- Stock ledger viewer page
- Stock on hand report page
- Expiry alerts with visual warnings
- Low stock alert page
- Historical movement view
- Dashboard metrics cards

**Key Features:**
- Real-time stock balance
- Batch tracking in reports
- Expiry calculations
- Stock value calculations
- Export to CSV

---

### Phase 7: Production Management 🏗️
**Duration:** 6-7 days | **Dependencies:** Phase 1-3 | **Priority:** HIGH

Production note management with material consumption, waste tracking, QA sampling.

📄 **Specification:** [PHASE_7_PRODUCTION.md](./PHASE_7_PRODUCTION.md)

**Backend Deliverables:**
- 15 API endpoints (Production CRUD, composition, discard, samples, studies)
- Production number generation (PN/YYYY/NNN)
- Yield calculation (produced vs consumed)
- Material reconciliation
- Stability study linking

**Frontend Deliverables:**
- Production list page
- Create/edit production note with multi-section form
- Material composition dynamic table
- Waste/discard tracking
- QA sampling section
- Production details page
- Yield calculation display

**Key Features:**
- Master-detail with multiple sub-sections
- Yield % calculation
- Material reconciliation check
- Batch tracking
- Cannot edit completed production

---

### Phase 8: Analytical Testing & Stability Studies 🧪
**Duration:** 4-5 days | **Dependencies:** Phase 1, 2, 3, 7 | **Priority:** HIGH

Analytical test requests and stability study protocols with result entry and pass/fail automation.

📄 **Specification:** [PHASE_8_TESTING.md](./PHASE_8_TESTING.md)

**Backend Deliverables:**
- 13 API endpoints (Test requests CRUD, test results, stability studies)
- Test result evaluation (auto pass/fail)
- Specification range checking
- Stability protocol management
- Test schedule generation
- Result compliance checking

**Frontend Deliverables:**
- Test request list and CRUD
- Test results entry form
- Specification validator UI
- Stability protocol creation
- Test schedule timeline view
- Results entry for each test point
- Pass/fail visual indicators

**Key Features:**
- Automatic pass/fail evaluation
- Specification parsing (ranges, comparisons)
- Stability protocol types (oral solids, parental)
- Timeline visualization
- Test result certificates

---

### Phase 9: Dashboards, Reports & Workflow Automation 📈
**Duration:** 5-6 days | **Dependencies:** Phase 1-8 (ALL) | **Priority:** CRITICAL

Comprehensive dashboards for all roles, business reports, approval workflows, notifications.

📄 **Specification:** [PHASE_9_DASHBOARDS.md](./PHASE_9_DASHBOARDS.md)

**Backend Deliverables:**
- 20 API endpoints (Dashboards, reports, approvals, notifications, audit)
- Role-based dashboard data
- Report generation (inventory, production, quality, transactions)
- Approval queue management
- Notification system
- Audit trail logging
- Export functionality (CSV, PDF)

**Frontend Deliverables:**
- 4 role-based dashboards (user, manager, reviewer, admin)
- 15+ report pages (inventory, production, quality, transactions)
- Notifications center
- Approval queue UI
- Charts and visualizations (using Chart.js or Recharts)
- Export buttons for all reports

**Key Features:**
- Real-time pending approvals
- Multi-format exports
- Role-based data filtering
- Workflow automation
- Complete audit trail
- Compliance reporting

---

## 📊 PHASE DEPENDENCIES DIAGRAM

```
Phase 0: Infrastructure
    ↓
Phase 1: Authentication (CRITICAL)
    ├─→ Phase 2: Master Items
    │   ├─→ Phase 3: Warehouses
    │   │   ├─→ Phase 4: GRN (CRITICAL)
    │   │   │   ├─→ Phase 5: Requests & Issues
    │   │   │   │   └─→ Phase 6: Stock Reports
    │   │   │   └─→ Phase 7: Production
    │   │   │       └─→ Phase 8: Testing
    │   │   │           └─→ Phase 9: Dashboards (CRITICAL)
```

---

## 🎯 QUICK START LINKS

### For Codex Implementation:
1. **Start Here:** [PHASE_1_AUTHENTICATION.md](./PHASE_1_AUTHENTICATION.md)
2. **Next:** [PHASE_2_MASTER_ITEMS.md](./PHASE_2_MASTER_ITEMS.md)
3. **Then:** [PHASE_3_WAREHOUSES.md](./PHASE_3_WAREHOUSES.md)
4. **Continue with:** [PHASE_4_GRN.md](./PHASE_4_GRN.md)
5. **And:** [PHASE_5_MATERIAL_REQUESTS.md](./PHASE_5_MATERIAL_REQUESTS.md)
6. **Follow with:** [PHASE_6_STOCK_REPORTS.md](./PHASE_6_STOCK_REPORTS.md)
7. **Then:** [PHASE_7_PRODUCTION.md](./PHASE_7_PRODUCTION.md)
8. **Next:** [PHASE_8_TESTING.md](./PHASE_8_TESTING.md)
9. **Finally:** [PHASE_9_DASHBOARDS.md](./PHASE_9_DASHBOARDS.md)

---

## 📈 TESTING STRATEGY

### Per Phase
- Unit tests for API endpoints
- Integration tests for workflows
- Manual testing of UI pages
- Error scenario testing
- Security testing

### Cross-Phase
- End-to-end workflows (GRN → Issue → Stock Report)
- Permission enforcement
- Data consistency
- Audit trail completeness

### Pre-Deployment
- Performance testing with large datasets
- Load testing on APIs
- Security audit
- Compliance review

---

## 🔄 ROLLBACK STRATEGY

### Database
- Migrations with down scripts
- Schema versioning
- Test migrations on staging first

### API
- Feature flags for gradual rollout
- Version support (v1, v2)
- Backward compatibility

### Frontend
- Feature flags (show/hide features)
- Progressive rollout
- Canary deployment

---

## 📋 CROSS-CUTTING CONCERNS (ALL PHASES)

### Security (Phase-by-phase)
- ✓ SQL injection prevention (parameterized queries)
- ✓ XSS prevention (input sanitization)
- ✓ CSRF prevention (optional, Phase 2+)
- ✓ Authentication middleware
- ✓ Authorization checks
- ✓ Rate limiting (recommended Phase 1+)
- ✓ Audit logging (all phases)
- ✓ Encryption for sensitive data (passwords, tokens)

### Performance (Phase-by-phase)
- ✓ Database indexing on frequently filtered columns
- ✓ Query optimization (avoid N+1)
- ✓ Pagination (default 20, max 100)
- ✓ Caching (master data)
- ✓ Frontend loading states
- ✓ API request debouncing

### Error Handling (Phase-by-phase)
- ✓ Consistent error response format
- ✓ Proper HTTP status codes
- ✓ User-friendly error messages
- ✓ Error logging for debugging
- ✓ Graceful degradation

### Documentation (Phase-by-phase)
- ✓ API endpoint documentation
- ✓ Database schema comments
- ✓ Frontend component comments
- ✓ Business logic documentation
- ✓ Known issues/limitations

---

## 🚀 DEPLOYMENT CHECKLIST

### Pre-Deployment (Before Each Phase)
- [ ] Code review completed
- [ ] Unit tests passing
- [ ] Integration tests passing
- [ ] Security review passed
- [ ] Performance testing done
- [ ] Database schema changes migrated
- [ ] Environment variables configured
- [ ] Error handling complete

### Deployment
- [ ] Backup current database
- [ ] Run migrations
- [ ] Deploy backend API
- [ ] Deploy frontend
- [ ] Smoke test critical flows
- [ ] Monitor for errors

### Post-Deployment
- [ ] Verify all endpoints working
- [ ] Check error logs
- [ ] Monitor performance
- [ ] Gather user feedback
- [ ] Document any issues

---

## 📞 REFERENCE

### Database
- Original DB: `infinextg_ricon` (MariaDB 10.4)
- Tables: 70+
- Schema: [infinextg_ricon.sql](../GMP_LIVE/infinextg_ricon.sql)

### Original Documentation
- [GMP_LIVE PROJECT_DOCUMENTATION.md](../GMP_LIVE/PROJECT_DOCUMENTATION.md)
- [GMP_LIVE MIGRATION_PHASES.md](./MIGRATION_PHASES.md)

### Tech Stack Documentation
- **Backend:** Express.js, Node.js
- **Frontend:** React, Vite, Zustand, Tailwind CSS
- **Database:** MariaDB, Raw SQL queries
- **Tools:** Git, npm/yarn, Postman (for API testing)

---

## 📝 NOTES

1. Each phase **includes only specifications** - NO implementation code
2. All phases are designed to be **given to Codex or similar AI for implementation**
3. Phases can be **executed in parallel** by different developers where dependencies allow
4. All phases **build on Phase 0 infrastructure** - ensure it's solid before starting Phase 1
5. **Phase 1 (Authentication) is BLOCKING** - all other phases depend on it
6. **Phase 4 (GRN) is BLOCKING** for inventory modules - start early
7. Estimated **10-12 weeks total** for complete migration

---

## 🎓 LEARNING PATH

**Backend Developer:**
- Focus: Phases 1-9 (all backend endpoints)
- Start with: Phase 1 authentication
- Priority: GRN (Phase 4) and workflow logic

**Frontend Developer:**
- Focus: Phases 1-9 (all UI pages)
- Start with: Phase 1 login/auth pages
- Priority: Dashboard and reports (Phase 9)

**Full Stack:**
- Follow phases sequentially ensuring backend and frontend sync
- Test end-to-end at each phase

---

**Created:** March 4, 2026  
**Status:** Specification Complete - Ready for Implementation  
**Next Action:** Begin Phase 0 Setup (if not already done) or Phase 1 Implementation


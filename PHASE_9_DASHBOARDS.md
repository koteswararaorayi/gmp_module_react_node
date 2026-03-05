# PHASE 9: DASHBOARDS, REPORTS & WORKFLOW AUTOMATION 📈

**Phase Duration:** 5-6 days  
**Depends On:** Phase 1-8  
**Priority:** CRITICAL - Management visibility and automation  
**Status:** [ ] Not Started | [ ] In Progress | [ ] Complete

---

## 1. OVERVIEW

Implement comprehensive dashboards for all user roles, generate business reports, and automate workflow notifications/approvals.

---

## 2. BACKEND API ENDPOINTS

### Dashboard Endpoints

**1. GET `/api/dashboard/user`** - User/Standard dashboard
- Response:
  ```json
  {
    "data": {
      "pending_approvals": 5,
      "my_pending_requests": 3,
      "recent_transactions": [...],
      "stock_alerts": {
        "expiry_soon": 12,
        "low_stock": 8,
        "stockouts": 2
      },
      "inventory_summary": {
        "total_items": 250,
        "active_items": 245,
        "total_value": 50000
      },
      "recent_grns": [...],
      "recent_productions": [...]
    }
  }
  ```

**2. GET `/api/dashboard/manager`** - Manager dashboard
- Includes team performance metrics
- Department-wise overview
- Approval queue
- Budget tracking
- Performance KPIs

**3. GET `/api/dashboard/reviewer`** - Reviewer/QA dashboard
- Pending review items
- Test results summary
- Non-conformances
- Stability study status

**4. GET `/api/dashboard/admin`** - Admin dashboard
- System overview
- User activity
- System health
- Configuration status
- Audit trail summary

---

### Report Endpoints

**5. GET `/api/reports/inventory-summary`** - Inventory overview
- Total items, stock value, item count by category
- Query: date_range, warehouse, category

**6. GET `/api/reports/stock-valuation`** - Stock value report
- Item-wise inventory value
- Query: warehouse, category, sort by value/qty

**7. GET `/api/reports/production-summary`** - Production report
- Production count, yields, waste %
- Query: date_range, product, status

**8. GET `/api/reports/quality-summary`** - QA report
- Test results, failures, compliance
- Query: date_range, product, test_type

**9. GET `/api/reports/expiry-tracking`** - Expiry schedule
- Items expiring by month
- Quantity per item
- Action required summary

**10. GET `/api/reports/transaction-summary`** - Transaction volumes
- GRN, Request, Issue count by period
- Query: date_range, type

**11. GET `/api/reports/user-activity`** - User activity audit
- Transactions by user, date, type
- Query: user_id, date_range

**12. POST `/api/reports/export`** - Export any report to CSV/PDF
- Query: report_type, filters
- Response: File download

---

### Workflow/Notification Endpoints

**13. GET `/api/approvals/pending`** - Get pending approvals for user
- Response:
  ```json
  {
    "data": [
      {
        "id": 1,
        "type": "GRN",
        "reference": "GRN/2026/001",
        "pending_since": "2026-03-02",
        "submitted_by": "John Doe",
        "summary": "GRN for 100 items from Supplier A",
        "priority": "normal"
      }
    ],
    "total": 5
  }
  ```

**14. POST `/api/approvals/:id/approve`** - Approve transaction
- Request: { comments: "string" }
- Updates transaction status
- Sends notification to requester

**15. POST `/api/approvals/:id/reject`** - Reject transaction
- Request: { reason: "string", comments: "string" }
- Updates status
- Sends notification

**16. GET `/api/notifications`** - Get user notifications
- Query: type (approval, alert, info), limit
- Response: List of notifications with timestamps

**17. POST `/api/notifications/:id/read`** - Mark notification as read

**18. DELETE `/api/notifications/:id`** - Delete notification

---

### Audit & Compliance

**19. GET `/api/audit-trail`** - Complete audit log
- Query: user_id, date_range, object_type, action
- Response: All user actions with before/after values

**20. GET `/api/compliance-summary`** - Compliance status
- Response: Audit status, pending items, compliance score

---

## 3. FRONTEND PAGES

### Dashboards

#### User Dashboard
- **Layout:** 4-column grid with cards
- **Cards:**
  1. Pending Approvals (count, link to approvals)
  2. My Pending Requests (count, recent list)
  3. Stock Alerts (expiry, low stock, stockouts)
  4. Inventory Summary (total items, total value)
  5. Recent Transactions (last 5 GRN/Issues/Productions)
  6. Quick Actions (Create GRN, Create Request, View Reports buttons)

#### Manager Dashboard
- Overview of team activities
- Department performance metrics
- Approval queue as manager
- Budget/cost tracking
- KPI dashboard
- Charts: GRN trend, inventory value, transaction volumes

#### Reviewer/QA Dashboard
- Pending test request count
- Recent test results
- Failed tests requiring review
- Stability study status
- Non-conformance items
- Charts: Pass/fail rate, test turnaround time

#### Admin Dashboard
- System statistics
- User login activity (recent logins)
- Database health
- API usage
- Configuration status
- Backup status
- Security alerts

---

### Reports Pages

#### Inventory Reports
- Stock On Hand (table: item, qty, warehouse, location, value)
- Stock Valuation (summary: total value, qty, comparisons)
- Expiry Schedule (calendar view or table)
- Low Stock Alert
- Stockout Report

#### Production Reports
- Production Summary (count, dates, yields)
- Production Details (batch info, materials used, waste)
- Production vs Plan (if targets exist)
- Yield Analysis

#### Quality Reports
- Test Results Summary (pass/fail count)
- Test Trend (pass rate over time)
- Failed Tests Detail
- Stability Study Status
- Compliance Certificate

#### Transaction Reports
- GRN Dashboard (volume, supplier, items)
- Material Request Analysis
- Issues Report
- Transaction Audit Trail

#### User Activity Reports
- Login Activity (frequency, times)
- Transaction History per user
- Modification Log
- Access Control Audit

---

### Notifications Center Page
- List of all notifications
- Filter: type, date, read/unread
- Notification detail on click
- Mark as read, delete, archive

---

### Approval Queue Page
- All pending approvals for current user
- Card layout showing:
  - Reference number
  - Type (GRN, Production, Test, etc.)
  - Submitted by
  - Date submitted
  - Pending duration
  - Quick approve/reject buttons
- Detail modal for full information
- Bulk approval option

---

## 4. FRONTEND COMPONENTS

### Dashboard Components
- DashboardCard (metric display card)
- AlertCard (alert items)
- TrendChart (line chart for trends)
- InventorySummary (table summary)
- QuickActions (button grid)
- RecentTransactions (list view)
- ApprovalQueue (pending items)
- NotificationBell (header notification)

### Report Components
- ReportFilter (filter controls)
- ReportTable (data grid with export)
- ReportChart (various chart types)
- DateRangeSelector (date filter)
- CategorySelector (filter by category)

---

## 5. CHARTS & VISUALIZATIONS

### Dashboard Charts
- Pie chart: Inventory by category
- Line chart: Stock trend over time
- Bar chart: Top items by value
- Gauge chart: Compliance score
- Calendar heat map: Activity by date

### Report Charts
- Bar chart: Transactions by type
- Line chart: Trend over period
- Pie chart: Distribution (pass/fail, by category)
- Area chart: Inventory value trend

**Chart Library:** Chart.js or Recharts

---

## 6. NOTIFICATION SYSTEM

### Notification Types
1. **Approval Requested** - New item needs approval
2. **Status Changed** - Transaction approved/rejected
3. **Alert** - Expiry soon, low stock, quality issue
4. **Action Required** - Test results pending, production insight needed
5. **Info** - System messages

### Notification Delivery
- In-app notifications (database)
- Email notifications (optional Phase 9.5)
- Push notifications (optional Phase 9.5)

### Notification Rules Engine
- User gets notified when:
  - Item awaiting their approval
  - Their transaction approved/rejected
  - Stock alert threshold exceeded
  - Test results ready for review
  - Production variance > threshold

---

## 7. SCHEDULED TASKS (Backend)

### Daily Jobs
- Generate expiry alerts (items expiring within 30 days)
- Generate low stock alerts
- Generate pending approval reminders
- Compile daily dashboard data

### Weekly Jobs
- Generate compliance summary
- Generate inventory reconciliation report
- Generate user activity summary

### Monthly Jobs
- Generate financial reports
- Generate production summary
- Archive old logs

---

## 8. BUSINESS LOGIC - APPROVAL WORKFLOW

### Workflow Engine
```
For each transaction:
  1. Check work_flow_config for current_status
  2. Get next_status_id(s)
  3. For each possible transition:
     - Check if user has required_role
     - Determine if approval_logic satisfied
     - If yes, add to allowed_actions
  4. User selects action (approve/reject)
  5. Execute action:
     - Update transaction status
     - Create audit_trail entry
     - Create notification for original creator
     - Trigger any dependent actions (stock update, etc.)
```

---

## 9. EXPORT FUNCTIONALITY

### Format Support
- CSV (all tables)
- PDF (reports, certificates)
- Excel (optional, for complex layouts)

### Export Features
- Include filters applied
- Include metadata (generated date, generated by)
- Formatting (headers, totals)
- Multiple sheets for related data

---

## 10. PERFORMANCE OPTIMIZATION

### Caching
- Cache dashboard data (5 min refresh)
- Cache summary reports (1 hour)
- Cache master data (unlimited, invalidate on change)

### Query Optimization
- Aggregation queries with indexes
- Materialized views for complex reports (if using MySQL 8.0+)
- Summary tables updated by scheduled job

### Frontend Optimization
- Lazy load charts (only when scrolled into view)
- Paginate large tables
- Virtual scrolling for long lists

---

## 11. TESTING CHECKLIST

### Dashboards
- [ ] User dashboard loads all cards
- [ ] Manager dashboard shows team metrics
- [ ] Charts render correctly
- [ ] Click-through to details works
- [ ] Real-time refresh (pending approvals)
- [ ] Responsive on mobile

### Reports
- [ ] All report types generate data
- [ ] Filters work correctly (combinations)
- [ ] Export to CSV works
- [ ] Export to PDF works
- [ ] Charts display correctly
- [ ] Totals and calculations accurate
- [ ] Large datasets handle pagination

### Notifications
- [ ] Create notification triggers correctly
- [ ] Notification list shows all items
- [ ] Mark as read works
- [ ] Delete notification works
- [ ] Filter notifications works
- [ ] Notification bell badge updates
- [ ] Email notifications send (if enabled)

### Approvals
- [ ] Pending approvals list shows correct items
- [ ] Only approver sees items
- [ ] Approve action updates status
- [ ] Reject action with reason
- [ ] Notification sent to original creator
- [ ] Cannot approve own items (optional rule)

### Audit
- [ ] All user actions logged
- [ ] Audit trail shows before/after values
- [ ] Timestamps accurate
- [ ] IP address logged
- [ ] Cannot modify audit trail

---

## 12. SECURITY & COMPLIANCE

### Authorization
- Dashboard only shows data user has access to (company_id)
- Reports filtered by company and user role
- Cannot view other user's personal data
- Audit trail access restricted to admin/compliance

### Data Protection
- PII filtered in reports (names, emails hidden unless admin)
- Export files encrypted if containing sensitive data
- Audit trail immutable (no delete, only add)

### Compliance Features
- Complete audit trail for all transactions
- User action attribution
- Timestamp all actions
- Export audit trail for compliance

---

## 13. TESTING CHECKLIST - INTEGRATION

- [ ] Dashboard aggregates data from all modules
- [ ] Approval workflow enforces permissions
- [ ] Notifications trigger on correct events
- [ ] Reports include data from all phases
- [ ] Audit trail comprehensive
- [ ] Export includes all necessary data
- [ ] Charts and metrics accurate
- [ ] Performance acceptable with large datasets

---

## 14. PHASE 9 COMPLETION CHECKLIST

### Backend
- [ ] All 20 API endpoints implemented
- [ ] Dashboard data aggregation
- [ ] Report data generation
- [ ] Workflow approval rules
- [ ] Notification creation logic
- [ ] Scheduled jobs (if applicable)
- [ ] Audit trail complete
- [ ] Export functionality
- [ ] Performance optimized

### Frontend
- [ ] 4 role-based dashboards
- [ ] All report pages
- [ ] Approval queue
- [ ] Notifications center
- [ ] Charts and visualizations
- [ ] Export buttons
- [ ] Responsive design
- [ ] Real-time refresh (websocket optional)

### Integration
- [ ] End-to-end workflow (create → approve → complete)
- [ ] All data flows correctly to dashboards/reports
- [ ] Notifications working
- [ ] Permissions enforced
- [ ] Audit trail comprehensive

---

## 15. OPTIONAL PHASE 9.5 ENHANCEMENTS

- Email notifications for approvals
- Push notifications
- SMS alerts for critical items
- Scheduled report delivery
- Custom report builder
- Real-time dashboards (WebSocket)
- Machine learning predictions (demand, expiry)
- Automated approval for low-risk items
- Batch approval workflows

---

## 16. DELIVERABLES

### Backend
- 20 API endpoints
- Dashboard data services
- Report generation services
- Notification system
- Audit trail system
- Approval workflow engine

### Frontend
- 4 dashboards (user, manager, reviewer, admin)
- 15+ report pages
- Notifications UI
- Approval queue UI
- Charts and visualizations
- Export functionality

### Database
- Materialized views for report queries (optional)
- Indexes for performance
- Scheduled job tables (optional)

---

**Status:** Ready for implementation  
**Depends On:** Phase 1-8 (ALL)  
**Completion Signifies:** Full system migration complete

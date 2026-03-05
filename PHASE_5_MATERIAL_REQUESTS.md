# PHASE 5: TRANSACTION MANAGEMENT - MATERIAL REQUESTS & ISSUES 📤

**Phase Duration:** 4-5 days  
**Depends On:** Phase 1, 2, 3, 4  
**Priority:** HIGH - Core inventory movement  
**Status:** [ ] Not Started | [ ] In Progress | [ ] Complete

---

## 1. OVERVIEW

Implement Material Requests and Material Issues - core inventory movement transactions. Material Requests capture demand, Material Issues track fulfillment.

---

## 2. DATABASE REFERENCE

### Tables
```
item_requests:
  id, company_id, request_number, request_date, requested_by, 
  department, current_status, total_items, is_active, created_date, created_by

item_request_items:
  id, req_id, item_id, quantity_requested, quantity_approved, 
  quantity_issued, warehouse_id, remarks

item_issues:
  id, company_id, issue_number, issue_date, issued_to, 
  department, purpose, current_status, total_items, is_active, created_date, created_by

item_issues_items:
  id, issue_id, item_id, quantity_issued, warehouse_id, location_id, 
  batch_no, remarks

action_log, item_ledger (Used for tracking)
```

---

## 3. BACKEND API ENDPOINTS - MATERIAL REQUESTS

**1. GET `/api/item-requests`** - List requests
- Query: page, limit, status, department, date_range
- Response: Requests with requester, department, status, item count

**2. GET `/api/item-requests/:id`** - Get request details
- Response: Full request with line items and current approvals

**3. POST `/api/item-requests`** - Create request
- Fields: department, items (array with item_id, quantity_requested, remarks), purpose
- Validation: Items valid, quantities >0
- Status: NEW (0)

**4. PUT `/api/item-requests/:id`** - Update request
- Only if status NEW

**5. DELETE `/api/item-requests/:id`** - Soft delete
- Only if status NEW

**6. PUT `/api/item-requests/:id/status`** - Approve/Reject request
- Workflow: NEW → APPROVED or REJECTED
- On approve: quantity_approved set to quantity_requested

---

## 4. BACKEND API ENDPOINTS - MATERIAL ISSUES

**7. GET `/api/item-issues`** - List issues
- Query: page, limit, status, issued_to, date_range
- Response: Issues with issuee, status, item count

**8. GET `/api/item-issues/:id`** - Get issue details

**9. POST `/api/item-issues`** - Create issue (from approved request or direct)
- Either:
  - Link to approved request: req_id
  - Or direct issue: item_id, quantity, purpose
- Fields: issued_to, department, purpose, items, remarks
- Validation: Items with quantity >0, warehouse location available
- Status: NEW

**10. PUT `/api/item-issues/:id`** - Update issue
- Only if status NEW

**11. DELETE `/api/item-issues/:id`** - Soft delete
- Only if status NEW

**12. PUT `/api/item-issues/:id/status`** - Complete/Cancel issue
- On complete: 
  - Update item_ledger (OUT transactions)
  - Reduce stock from warehouse/location
  - Update location quantity

---

## 5. MATERIAL RETURN (Optional Phase 5.5)

**Endpoints:**
- Similar structure to Issues
- Record returns with reason
- Stock-in when item returned
- Link to original issue

---

## 6. FRONTEND - MATERIAL REQUESTS

### Pages
- Requests List
- Create Request
- Request Details
- Request Approval (if approver)

### Form Fields
- Department (dropdown)
- Purpose (textarea)
- Items: (dynamic table)
  - Item (dropdown)
  - Quantity (number)
  - Remarks (text)

### Features
- Status tracking (NEW, APPROVED, REJECTED)
- Request number auto-generated
- Approval workflow UI
- Link from request to issue creation

---

## 7. FRONTEND - MATERIAL ISSUES

### Pages
- Issues List
- Create Issue
- Issue Details
- Complete Issue

### Form Fields
- Issued To (user/department)
- Purpose (textarea)
- Items from approved request OR manual entry
- Location selection (filtered by warehouse)

### Features
- Number generation: ISSUE/YYYY/NNN
- Link to original request if applicable
- Stock reduction on completion
- Batch tracking

---

## 8. VALIDATION RULES

### Material Requests
- Quantity > 0
- Item must exist and be active
- Department required

### Material Issues
- Cannot issue more than approved quantity from request
- Warehouse must have available stock
- Location must have capacity
- Cannot issue to self (optional check)

---

## 9. WORKFLOW & APPROVAL

### Material Requests
```
NEW → APPROVED/REJECTED
(Optional: PENDING_APPROVAL state)
```

### Material Issues
```
NEW → COMPLETED/CANCELLED
(Can complete directly, no approval step)
```

---

## 10. STOCK IMPACT

### On Approve Request
- No stock impact (just approval)

### On Complete Issue
- For each item:
  - Update item_ledger:
    - transaction_type = "ISSUE"
    - out_qty = quantity_issued
    - closing_qty = previous_closing - out_qty
  - Update location availability

---

## 11. TESTING CHECKLIST

### Requests
- [ ] Create request with multiple items
- [ ] Request number unique
- [ ] Get items from dropdown
- [ ] Quantity validation
- [ ] Request status workflow
- [ ] Approve request
- [ ] Reject request

### Issues
- [ ] Create issue from approved request
- [ ] Create direct issue
- [ ] Issue number generation
- [ ] Cannot issue more than approved qty
- [ ] Cannot issue from empty warehouse
- [ ] Stock ledger updated on complete
- [ ] Location availability updated
- [ ] Batch tracking for issues

### Integration
- [ ] Create request → Approve → Create issue from request
- [ ] Stock verification on issue completion
- [ ] Ledger entries match expected
- [ ] Request/Issue relationship maintained

---

## 12. COMPLETION CHECKLIST

### Backend
- [ ] Material Request endpoints (6 APIs)
- [ ] Material Issue endpoints (6 APIs)
- [ ] Workflow enforcement
- [ ] Stock ledger updates
- [ ] Location availability updates
- [ ] Number generation
- [ ] Error handling

### Frontend
- [ ] Requests list and crud
- [ ] Issues list and crud
- [ ] Workflow UI
- [ ] Form validation
- [ ] Dropdown cascading
- [ ] Stock checking UI elements

### Integration
- [ ] Request to Issue workflow
- [ ] Stock impact verification
- [ ] Proper error messages

---

**Status:** Ready for implementation  
**Depends On:** Phase 1-4  
**Required For:** Phase 6

# PHASE 4: TRANSACTION MANAGEMENT - GRN (GOODS RECEIVED NOTES) 📥

**Phase Duration:** 5-6 days  
**Depends On:** Phase 1, 2, 3  
**Priority:** CRITICAL - Core inventory transaction  
**Status:** [ ] Not Started | [ ] In Progress | [ ] Complete

---

## 1. OVERVIEW

Implement GRN (Goods Received Notes) - the primary transaction for recording goods received from suppliers. This is a master-detail transaction with workflow approval.

### Key Goals
- Record goods received
- Track supplier details
- Manage line items (Qty, warehouse, location)
- Workflow approval mechanism
- Stock ledger updates
- Action logging

---

## 2. DATABASE REFERENCE

### Tables
```
grn:
  id, company_id, grn_number, grn_date, supplier_id, 
  warehouse_id, total_items, received_by, 
  current_status (0=new, 1=pending_approval, 2=approved, 3=rejected),
  status_date, remarks, is_active, created_date, created_by, updated_date, updated_by

grn_items:
  id, grn_id, item_id, quantity_ordered, quantity_received, 
  unit_price, batch_no, expiry_date, warehouse_id, location_id,
  remarks, received_date, received_by

action_log:
  (Existing table - log all GRN operations)

item_ledger:
  (Existing table - update stock on approval)

work_flow_config:
  (Existing reference - workflow rules)
```

---

## 3. BACKEND API ENDPOINTS

### GRN Management

**1. GET `/api/grn`** - List GRNs
- Query: page, limit, search, status, supplier_id, date_from, date_to, warehouse_id
- Response: GRN list with supplier, warehouse, status, total items
- Filters: Status (pending, approved, rejected), date range, supplier

---

**2. GET `/api/grn/:id`** - Get GRN details
- Response: 
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "grn_number": "GRN/2026/001",
      "grn_date": "2026-03-04",
      "supplier": { "id": 1, "name": "Supplier A" },
      "warehouse": { "id": 5, "name": "Warehouse 1" },
      "total_items": 3,
      "current_status": 0,
      "status_name": "New",
      "created_by": 1,
      "created_date": "2026-03-04T10:00:00Z",
      "items": [
        {
          "id": 1,
          "item": { "id": 1, "code": "ITEM001", "name": "Paracetamol" },
          "quantity_ordered": 100,
          "quantity_received": 100,
          "batch_no": "BATCH123",
          "expiry_date": "2027-03-04",
          "location": { "id": 5, "name": "LOC-001" },
          "unit_price": 10.5,
          "remarks": ""
        }
      ],
      "total_amount": 1050.00,
      "remarks": "GRN remarks",
      "can_edit": false,
      "can_approve": true,
      "approval_history": [...]
    }
  }
  ```

---

**3. POST `/api/grn`** - Create GRN
- Request:
  ```json
  {
    "grn_date": "2026-03-04",
    "supplier_id": 1,
    "warehouse_id": 5,
    "items": [
      {
        "item_id": 1,
        "quantity_received": 100,
        "batch_no": "BATCH123",
        "expiry_date": "2027-03-04",
        "location_id": 5,
        "unit_price": 10.5,
        "remarks": ""
      }
    ],
    "remarks": "GRN remarks"
  }
  ```

- Validation:
  - supplier_id valid and active
  - warehouse_id valid
  - items not empty (at least 1)
  - item_id valid and active
  - location_id belongs to warehouse_id
  - quantity_received > 0
  - batch_no not empty
  - expiry_date valid (future date)
  - unit_price valid (positive)

- Database Operations:
  - Generate GRN number: Format GRN/YYYY/NNN (auto-increment)
  - Insert into `grn` with status=0, created_by, created_date
  - Insert into `grn_items` for each item
  - Log to `action_log` table
  - Return GRN ID and GRN number

- Success Response (201):
  ```json
  {
    "success": true,
    "message": "GRN created successfully",
    "data": { "grn_id": 1, "grn_number": "GRN/2026/001" }
  }
  ```

---

**4. PUT `/api/grn/:id`** - Update GRN (only if editable status)
- Only editable if status = 0 (new) or 3 (rejected)
- Same validation as POST
- Update `grn` and `grn_items` (delete old items, insert new)
- Log to action_log
- On further GRN update, previous status stays

---

**5. DELETE `/api/grn/:id`** - Soft delete GRN
- Only if status = 0 (new) or 3 (rejected)
- Set is_active = 1

---

**6. PUT `/api/grn/:id/status`** - Update GRN status (workflow)
- Request:
  ```json
  {
    "action": "approve" or "reject",
    "new_status": 2 or 3,
    "comments": "Approval comments"
  }
  ```

- Business Logic:
  - Check work_flow_config for valid transitions
  - Verify user role has approval permission
  - If approve (status=2):
    - Update item_ledger with IN quantities
    - Update item stock (closing_qty calculation)
    - Set is_active status in line items if needed
  - If reject (status=3):
    - No stock update
    - Notify original creator
  - Log approval action to action_log
  - Create notification record

- Response:
  ```json
  {
    "success": true,
    "message": "GRN approved successfully",
    "data": { "new_status": 2, "status_name": "Approved" }
  }
  ```

---

**7. GET `/api/grn/:id/approval-history`** - Get approval workflow history
- Response: Array of approval actions with user, date, action, comments

---

**8. POST `/api/grn/export`** - Export GRN to CSV/PDF
- Query: id (single) or multiple GRN IDs
- Response: File download

---

### Stock Ledger Integration

**9. GET `/api/stock-ledger?item_id=1`** - View stock movements
- Used to verify stock impact of approved GRN
- Response: All transactions affecting stock

---

## 4. FRONTEND PAGES

### 4.1 GRN List Page
- Table: GRN#, Date, Supplier, Warehouse, Item Count, Status, Amount, Actions
- Filters: Status dropdown, supplier dropdown, date range, warehouse filter
- Search: By GRN number
- Action buttons: View, Edit (if editable), Approve (if approver), Reject, Delete, Print, Download
- Bulk actions: Approve multiple, Delete multiple
- Status badge colors: New=blue, Pending=yellow, Approved=green, Rejected=red

---

### 4.2 Create GRN Page
**Form Structure:**
1. **Header Section:**
   - GRN Date (date picker, default today)
   - Supplier (dropdown, single select, searchable)
   - Warehouse (dropdown, single select)

2. **Line Items Section:**
   - Dynamic table where user can add/edit/remove rows
   - Each row:
     - Item (searchable dropdown with autocomplete)
     - Quantity Received (number input, required, >0)
     - Batch No (text input)
     - Expiry Date (date picker)
     - Location (dropdown filtered by warehouse)
     - Unit Price (currency input)
     - Remarks (text area)
   - Add Row button
   - Remove Row button per row

3. **Summary Section:**
   - Total Items Count (auto-calculated)
   - Total Amount (auto-calculated sum of qty*price)

4. **Remarks Section:**
   - General remarks textarea

5. **Action Buttons:**
   - Save as Draft
   - Submit for Approval
   - Cancel

**Features:**
- Real-time calculation of totals
- Item autocomplete with item code and name
- Quantity validation (>0)
- Price formatting
- Prevent duplicate items (optional)
- Add new supplier/item inline (optional)

---

### 4.3 Edit GRN Page
- Same form as Create
- Pre-filled with existing data
- Same validation
- Only editable if status = new or rejected
- Show warning if status not editable
- Show approval history below form

---

### 4.4 GRN Details Page
- Readonly display of GRN
- Two-column layout: Header info (left), Items table (right)
- Show all details including: GRN#, Supplier, Warehouse, Dates, Totals
- Audit trail: Created by/date, Updated by/date
- Action buttons: Edit, Approve, Reject, Print, Download
- Show approval history
- Show stock impact (after approval)

---

### 4.5 GRN Approval Modal/Page
- Show GRN summary
- Comments textarea
- Approve button (green)
- Reject button (red)
- Cancel button
- Confirmation dialog before action

---

## 5. FRONTEND COMPONENTS

### 5.1 Reusable Components
- LineItemsTable (generic table for master-detail transactions)
- ItemSearchInput (searchable dropdown)
- SupplierSelector (dropdown)
- WarehouseSelector (dropdown)
- LocationSelector (cascading on warehouse)
- StatusBadge (color-coded status display)
- AmountFormatter (currency display)
- ApprovalHistoryPanel (show approval workflow)

---

## 6. ZUSTAND STORE - `grnStore.js`

```javascript
State:
- grns: [],
- currentGRN: null,
- grnItems: [],
- pagination: { page, limit, total },
- filters: { status, supplier_id, date_from, date_to },
- loading: false,
- error: null,
- formData: { grn_date, supplier_id, warehouse_id, items, remarks }

Actions:
- fetchGRNs(filters, page, limit)
- fetchGRNById(id)
- createGRN(data)
- updateGRN(id, data)
- deleteGRN(id)
- updateGRNStatus(id, action, comments)
- exportGRN(ids)
- setFilters(filters)
- setFormData(data)
- addLineItem(item)
- removeLineItem(index)
- updateLineItem(index, data)
- calculateTotals()
```

---

## 7. API SERVICES

### `grnService.js`
```
- getGRNs(filters, page, limit)
- getGRN(id)
- createGRN(data)
- updateGRN(id, data)
- deleteGRN(id)
- approveGRN(id, comments)
- rejectGRN(id, comments)
- exportGRN(ids)
- getApprovalHistory(id)
```

---

## 8. WORKFLOW RULES

### Status Transitions
```
NEW (0)
  ├─→ PENDING_APPROVAL (1) [Submit]
  └─→ DELETED

PENDING_APPROVAL (1)
  ├─→ APPROVED (2) [By Approver]
  └─→ REJECTED (3) [By Approver]

APPROVED (2) - Final State
REJECTED (3) - Can be edited and resubmitted
```

### Permissions
- **Create/Edit GRN:** Any user
- **Submit for Approval:** Creator or admin
- **Approve/Reject:** Users with role in work_flow_config
- **Delete:** Only admin or creator

---

## 9. BUSINESS LOGIC

### GRN Number Generation
- Format: `GRN/YYYY/NNN` (e.g., GRN/2026/001)
- NNN resets annually
- Sequential numbering per company

### Stock Updates on Approval
- For each item in approved GRN:
  - Update `item_ledger`:
    - opening_qty = previous closing_qty
    - in_qty = quantity_received
    - closing_qty = opening_qty + in_qty
    - transaction_type = "GRN"
    - reference_id = grn_id
    - reference_table = "grn"
    - transaction_date = now()

### Validation Rules
- Batch expiry date must be future date
- Warehouse must have sufficient location capacity
- Supplier must be active
- Item must be active

---

## 10. ERROR HANDLING

### Error Codes
- `ERR_GRN_NOT_FOUND` (404)
- `ERR_INVALID_SUPPLIER` (400)
- `ERR_INVALID_ITEM` (400)
- `ERR_INVALID_LOCATION` (400)
- `ERR_GRN_NOT_EDITABLE` (409)
- `ERR_INVALID_STATUS_TRANSITION` (409)
- `ERR_INSUFFICIENT_PERMISSIONS` (403)

---

## 11. TESTING CHECKLIST

### Create GRN
- [ ] Minimum one item required
- [ ] All suppliers available in dropdown
- [ ] All items searchable
- [ ] Location filtered by warehouse
- [ ] Quantity validation (>0)
- [ ] Batch no required
- [ ] Expiry date validation
- [ ] Total calculation correct
- [ ] GRN number unique
- [ ] Created in correct company context

### Approval Workflow
- [ ] Submit button changes status to pending
- [ ] Only approver can approve
- [ ] Approve updates status to approved
- [ ] Stock ledger updated on approve
- [ ] Reject keeps status rejected
- [ ] Rejected GRN can be edited and resubmitted
- [ ] Approval history logged

### GRN List
- [ ] Filter by status works
- [ ] Filter by supplier works
- [ ] Filter by date range works
- [ ] Search by GRN number works
- [ ] Pagination works
- [ ] Status badge colors correct
- [ ] Edit button only shows if editable

### Stock Impact
- [ ] Item ledger records created
- [ ] Stock quantities correct
- [ ] Multiple items handled correctly
- [ ] Batch tracking correct

---

## 12. PHASE 4 COMPLETION CHECKLIST

### Backend
- [ ] All 9 API endpoints working
- [ ] GRN number generation implemented
- [ ] Status workflow transitions validated
- [ ] Stock ledger updates on approval
- [ ] Action logging for all operations
- [ ] Approval history tracked
- [ ] Permissions checked correctly
- [ ] Error handling complete
- [ ] Database indexes optimized

### Frontend
- [ ] GRN list page with all filters
- [ ] Create GRN page with dynamic line items
- [ ] Edit GRN page with restrictions
- [ ] GRN details page
- [ ] Approval workflow UI
- [ ] Status badges with correct colors
- [ ] Line items table reusable
- [ ] All dropdowns working
- [ ] Form validation
- [ ] Loading states
- [ ] Error messages

### Integration
- [ ] End-to-end GRN creation to approval
- [ ] Stock ledger updates verified
- [ ] Workflow rules enforced
- [ ] Permissions enforced
- [ ] Error handling working

---

## 13. DELIVERABLES

- 9 API endpoints
- 5 frontend pages
- 6 reusable components
- API service
- Zustand store
- Stock integration logic
- Workflow engine integration
- Action logging integration

---

**Status:** Ready for implementation  
**Depends On:** Phase 1, 2, 3  
**Required For:** Phase 5, 6

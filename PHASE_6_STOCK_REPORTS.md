# PHASE 6: STOCK REPORTING & LEDGER MANAGEMENT 📊

**Phase Duration:** 3-4 days  
**Depends On:** Phase 1-5  
**Priority:** HIGH - Critical for management visibility  
**Status:** [ ] Not Started | [ ] In Progress | [ ] Complete

---

## 1. OVERVIEW

Implement stock reporting and ledger viewing. Consolidates all inventory movements into readable reports.

---

## 2. BACKEND API ENDPOINTS

### Stock Reports

**1. GET `/api/stock-ledger`** - View all stock movements
- Query: item_id, warehouse_id, date_from, date_to, transaction_type, page, limit
- Response: 
  ```json
  {
    "data": [
      {
        "date": "2026-03-04",
        "transaction_type": "GRN",
        "reference": "GRN/2026/001",
        "item": "Paracetamol",
        "warehouse": "Warehouse 1",
        "opening_qty": 100,
        "in_qty": 50,
        "out_qty": 0,
        "closing_qty": 150,
        "batch_no": "BATCH123"
      }
    ]
  }
  ```

**2. GET `/api/stock-report`** - Current stock on hand
- Query: warehouse_id, category_id, item_id, include_inactive=false
- Response: Item-wise stock by warehouse/location
  ```json
  {
    "data": [
      {
        "item_code": "ITEM001",
        "item_name": "Paracetamol 500mg",
        "category": "Analgesic",
        "uom": "Strip",
        "warehouse": "Warehouse 1",
        "location": "LOC-001",
        "available_qty": 150,
        "reserved_qty": 20,
        "net_available": 130,
        "batch_no": "BATCH123",
        "expiry_date": "2027-03-04",
        "status": "OK"
      }
    ]
  }
  ```

**3. GET `/api/stock-report/expiry-alerts`** - Items expiring soon
- Query: days=30 (expiring within 30 days)
- Response: Items with expiry dates, batch info
- Show alert status: Warning (< 30 days), Critical (< 7 days)

**4. GET `/api/stock-report/low-stock`** - Low stock items
- Query: warehouse_id, threshold_percentage=20
- Response: Items below threshold

**5. GET `/api/stock-report/discrepancies`** - Stock discrepancies
- Query: warehouse_id, date_range
- Response: Physical vs system stock differences

**6. GET `/api/stock-movement/:item_id`** - Historical movement for item
- Query: date_from, date_to, warehouse_id
- Response: All transactions for item with details

**7. POST `/api/stock-report/export`** - Export reports to CSV
- Query: report_type (ledger, onhand, expiry, lowstock), filters
- Response: File download

**8. GET `/api/stock-report/dashboard-summary`** - Dashboard metrics
- Response: Total value, item count, expiry alerts, low stock alerts

---

## 3. DATABASE OPERATIONS

### Queries Needed
- `item_ledger` aggregations (opening, in, out, closing)
- Batch expiry calculations
- Location capacity vs usage
- Stock movement patterns

---

## 4. FRONTEND PAGES

### Stock Ledger Viewer
- Filter: Item, warehouse, date range, transaction type
- Table: Date, Type, Reference, Item, Qty In/Out, Balance, Batch
- Detail view per row
- Export button

### Stock Report
- Filter: Warehouse, category, status
- Tabbed view:
  - Current Stock (table: item, warehouse, location, qty, expiry)
  - Expiry Alerts (highlighted, sorted by expiry date)
  - Low Stock (flagged items)
  - Stock Movement (historical)

### Stock Dashboard
- Cards showing:
  - Total items in stock
  - Total stock value
  - Items expiring soon (count)
  - Low stock alerts (count)
  - Warehouses overview

### Reconciliation Tools (Optional)
- Physical count entry form
- Compare physical vs system
- Adjustment entry
- Discrepancy report

---

## 5. COMPONENTS

- StockTable (reusable ledger table)
- ExpiryAlert (visual alert component)
- StockMetricsCard (dashboard card)
- ReportFilter (filter controls)

---

## 6. TESTING CHECKLIST

- [ ] Stock ledger shows all transactions
- [ ] Quantities calculated correctly
- [ ] Filters work correctly
- [ ] Export generates proper CSV
- [ ] Expiry calculations accurate
- [ ] Low stock detection works
- [ ] Batch tracking in reports
- [ ] Historical movement complete
- [ ] Dashboard metrics accurate

---

**Status:** Ready for implementation  
**Depends On:** Phase 1-5

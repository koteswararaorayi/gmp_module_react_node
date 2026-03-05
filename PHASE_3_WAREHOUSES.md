# PHASE 3: MASTER DATA MANAGEMENT - WAREHOUSES & LOCATIONS 🏭

**Phase Duration:** 2-3 days  
**Depends On:** Phase 1, 2  
**Priority:** HIGH - Required for GRN and stock operations  
**Status:** [ ] Not Started | [ ] In Progress | [ ] Complete

---

## 1. OVERVIEW

Implement warehouse and storage location management. This is critical for tracking physical storage and inventory movements in later phases.

---

## 2. DATABASE REFERENCE

### Tables
- `warehouses` - Warehouse/storage facility master
- `locations` - Physical storage locations within warehouses

### Fields
```
warehouses: id, company_id, warehouse_name, warehouse_type, address, 
           manager_id, capacity, is_active, created_date, created_by

locations: id, company_id, warehouse_id, location_code, location_name, 
          row, column, shelf, zone, capacity, is_active, created_date
```

---

## 3. BACKEND API ENDPOINTS

### Warehouses Management

**1. GET `/api/warehouses`**
- Query: page, limit, search, is_active
- Response: List of warehouses with basic detail

**2. GET `/api/warehouses/:id`**
- Include: warehouse details + count of locations
- Response: Full warehouse data

**3. POST `/api/warehouses`**
- Fields: warehouse_name, warehouse_type, address, manager_id, capacity
- Validation: Name unique per company

**4. PUT `/api/warehouses/:id`**
- Update warehouse details

**5. DELETE `/api/warehouses/:id`**
- Soft delete (is_active = 1)

---

### Locations Management

**6. GET `/api/locations`**
- Query: warehouse_id (required), page, limit, search
- Response: Locations filtered by warehouse
- Include: location_code, name, row, column, shelf, capacity

**7. GET `/api/locations/:id`**
- Response: Full location details

**8. POST `/api/locations`**
- Fields: warehouse_id (required), location_code, location_name, row, column, shelf, zone, capacity
- Validation: 
  - location_code unique per warehouse
  - warehouse_id must exist

**9. PUT `/api/locations/:id`**
- Update location

**10. DELETE `/api/locations/:id`**
- Soft delete

---

### Utility Endpoints

**11. GET `/api/warehouses/:id/locations`**
- Get all locations for a warehouse (no pagination)
- Used for dropdowns

**12. GET `/api/warehouses/:id/capacity-status`**
- Response: Current utilization, available capacity
- Used for dashboard

---

## 4. FRONTEND PAGES

### Warehouses List
- Table: warehouse_name, type, address, location_count, manager, capacity
- CRUD buttons

### Create/Edit Warehouse
- Form with warehouse details
- Manager dropdown (from users)
- Capacity input

### Warehouse Details
- Show warehouse overview
- Show locations grid/list
- Show occupancy/capacity
- Manage locations button

### Locations List (Warehouse-specific)
- Filter by warehouse from dropdown
- Table: location_code, row, column, shelf, capacity
- CRUD buttons

### Create/Edit Location
- Warehouse selector (cascading)
- Location code, name, coordinates
- Capacity input

---

## 5. VALIDATION RULES

- Warehouse name unique per company
- Location code unique per warehouse
- Warehouse must exist before adding locations
- Capacity values must be positive numbers

---

## 6. FRONTEND COMPONENTS

- WarehouseSelector (dropdown)
- LocationSelector (dropdown, cascading on warehouse)
- WarehouseGrid (optional - visual warehouse layout)
- CapacityBar (visual capacity indicator)

---

## 7. INTEGRATION FEATURES

- Show location count on warehouse list
- Show warehouse name when managing locations
- Pre-select warehouse when coming from warehouse details
- Cascading dropdowns for warehouse → location selection

---

## 8. TESTING CHECKLIST

- [ ] Create warehouse
- [ ] Create location within warehouse
- [ ] Cannot create location for non-existent warehouse
- [ ] Location code unique per warehouse (same code different warehouse OK)
- [ ] Warehouse capacity display
- [ ] Cascading dropdown works
- [ ] Warehouse-location relationship maintained on delete

---

**Status:** Ready for implementation  
**Depends On:** Phase 1, 2  
**Required For:** Phase 4 (GRN)

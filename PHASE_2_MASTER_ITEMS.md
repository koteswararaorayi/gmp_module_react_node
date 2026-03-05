# PHASE 2: MASTER DATA MANAGEMENT - ITEMS 📦

**Phase Duration:** 4-5 days  
**Depends On:** Phase 1 (Authentication)  
**Priority:** HIGH - Core inventory foundation  
**Status:** [ ] Not Started | [ ] In Progress | [ ] Complete

---

## 1. OVERVIEW

Implement comprehensive items master management system. This is the foundation for all inventory operations in subsequent phases (GRN, Material Requests, Issues, etc.).

### Key Goals
- Create, Read, Update, Delete items
- Item categorization and classification
- Item type management
- Unit of measurement (UOM) management
- Manufacturer management
- Supplier management
- Item search and filtering
- Bulk operations (import, export)

---

## 2. DATABASE REFERENCE

### Tables Used
- `items` - Item master (primary)
- `item_types` - Item type classifications
- `items_categories` - Item categories
- `unit_of_measurements` - UOM (Kg, L, Pcs, etc.)
- `manufacturers` - Manufacturer details
- `suppliers` - Supplier details

### Key Fields Summary
```
items: id, company_id, item_code, item_name, item_type_id, category_id, 
       uom_id, supplier_id, manufacturer_id, description, is_active, 
       created_date, created_by, updated_date, updated_by

item_types: id, company_id, item_type_name, description, is_active
items_categories: id, company_id, category_name, description, is_active
unit_of_measurements: id, uom_code, uom_name, is_active
manufacturers: id, company_id, manufacturer_name, address, contact, is_active
suppliers: id, company_id, supplier_name, address, contact, email, is_active
```

---

## 3. BACKEND SPECIFICATIONS

### 3.1 Directory Structure
```
server/src/
├── routes/
│   ├── items.js              # NEW - Item CRUD endpoints
│   ├── itemTypes.js          # NEW - Item type endpoints
│   ├── categories.js         # NEW - Item category endpoints
│   ├── uom.js                # NEW - Unit of measurement endpoints
│   ├── manufacturers.js      # NEW - Manufacturer endpoints
│   └── suppliers.js          # NEW - Supplier endpoints
├── controllers/
│   ├── itemController.js     # NEW - Item business logic
│   ├── itemTypeController.js # NEW
│   ├── categoryController.js # NEW
│   ├── uomController.js      # NEW
│   ├── manufacturerController.js # NEW
│   └── supplierController.js # NEW
├── models/
│   ├── itemModel.js          # NEW - Database queries
│   ├── itemTypeModel.js      # NEW
│   ├── categoryModel.js      # NEW
│   ├── uomModel.js           # NEW
│   ├── manufacturerModel.js  # NEW
│   └── supplierModel.js      # NEW
└── utils/
    └── validationRules.js    # NEW/UPDATE - Add item validation rules
```

### 3.2 Backend API Endpoints

#### Items Management

**1. GET `/api/items`** - List items with filtering
- Query Parameters:
  - `page=1` - Page number
  - `limit=20` - Records per page
  - `search=?` - Search by item_code or item_name
  - `category_id=?` - Filter by category
  - `item_type_id=?` - Filter by type
  - `supplier_id=?` - Filter by supplier
  - `is_active=0` - Only active items (default)
  - `sort=field:asc` - Sort by field

- Success Response:
  ```json
  {
    "success": true,
    "message": "Items retrieved",
    "data": [
      {
        "id": 1,
        "item_code": "ITEM001",
        "item_name": "Paracetamol 500mg",
        "item_type": "Tablet",
        "category": "Analgesic",
        "uom": "Strip",
        "supplier": "Supplier A",
        "manufacturer": "Manufacturer X",
        "description": "...",
        "created_date": "2026-02-01T10:00:00Z"
      }
    ],
    "pagination": {
      "total": 150,
      "page": 1,
      "limit": 20,
      "pages": 8
    }
  }
  ```

---

**2. GET `/api/items/:id`** - Get single item details
- Success Response:
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "item_code": "ITEM001",
      "item_name": "Paracetamol 500mg",
      "item_type_id": 2,
      "item_type_name": "Tablet",
      "category_id": 5,
      "category_name": "Analgesic",
      "uom_id": 3,
      "uom_name": "Strip",
      "supplier_id": 1,
      "supplier_name": "Supplier A",
      "manufacturer_id": 2,
      "manufacturer_name": "Manufacturer X",
      "description": "500mg paracetamol tablet",
      "sku": "SKU123",
      "is_active": 0,
      "created_date": "2026-02-01T10:00:00Z",
      "created_by": 1,
      "updated_date": "2026-02-15T14:30:00Z",
      "updated_by": 2
    }
  }
  ```

---

**3. POST `/api/items`** - Create new item
- Authorization: Required (any authenticated user)
- Request Body:
  ```json
  {
    "item_code": "ITEM001",
    "item_name": "Paracetamol 500mg",
    "item_type_id": 2,
    "category_id": 5,
    "uom_id": 3,
    "supplier_id": 1,
    "manufacturer_id": 2,
    "description": "500mg paracetamol tablet",
    "sku": "SKU123"
  }
  ```

- Validation:
  - `item_code` must be unique per company
  - `item_name` required (max 255 chars)
  - `item_type_id` required and valid
  - `category_id` required and valid
  - `uom_id` required and valid
  - `supplier_id` valid if provided
  - `manufacturer_id` valid if provided
  - No SQL injection vulnerabilities

- Success Response (201):
  ```json
  {
    "success": true,
    "message": "Item created successfully",
    "data": { "item_id": 150 }
  }
  ```

- Error Cases:
  - Duplicate item_code (409)
  - Invalid category/type/uom IDs (400)
  - Missing required fields (400)
  - Validation failed (400)

- Database Operations:
  - Insert into `items` with company_id, created_by, created_date
  - Set is_active = 0 (active by default)
  - Return new item_id

---

**4. PUT `/api/items/:id`** - Update item
- Validation: Same as POST (except item_code can be same if not duplicated)
- Database Operations:
  - Update `items` set updated_by, updated_date
  - Set is_active = 0 (keep active unless explicitly deactivated)

- Success Response (200):
  ```json
  {
    "success": true,
    "message": "Item updated successfully",
    "data": { "item_id": 150 }
  }
  ```

---

**5. DELETE `/api/items/:id`** - Soft delete item
- Soft Delete: Set is_active = 1
- Success Response:
  ```json
  {
    "success": true,
    "message": "Item deleted successfully"
  }
  ```

---

**6. GET `/api/items/export` or POST `/api/items/export`** - Export items to CSV
- Query Parameters: Same filters as GET /items
- Response: CSV file download
- Fields: item_code, item_name, type, category, uom, supplier, manufacturer, created_date

---

#### Item Types Management

**7. GET `/api/item-types`** - List all item types
- Response: Array of { id, item_type_name, description, is_active }

**8. POST `/api/item-types`** - Create item type
- Request: { item_type_name, description }
- Validations: Name unique, required

**9. PUT `/api/item-types/:id`** - Update item type

**10. DELETE `/api/item-types/:id`** - Delete item type (soft)

---

#### Item Categories Management

**11. GET `/api/categories`** - List all categories
**12. POST `/api/categories`** - Create category
**13. PUT `/api/categories/:id`** - Update category
**14. DELETE `/api/categories/:id`** - Delete category

Same pattern as Item Types with fields: category_name, description

---

#### Unit of Measurement (UOM)

**15. GET `/api/uom`** - List all UOMs
- Response includes: id, uom_code (kg, L, pcs, etc.), uom_name

**16. POST `/api/uom`** - Create UOM
- Fields: uom_code (unique), uom_name
- Validations: Code unique, both required

**17. PUT `/api/uom/:id`** - Update UOM

**18. DELETE `/api/uom/:id`** - Delete UOM

---

#### Manufacturers Management

**19. GET `/api/manufacturers`** - List manufacturers
- Response: id, manufacturer_name, address, contact, email, is_active

**20. POST `/api/manufacturers`** - Create manufacturer
- Fields: manufacturer_name, address, contact, email
- Validations: Name required and unique per company

**21. PUT `/api/manufacturers/:id`** - Update manufacturer

**22. DELETE `/api/manufacturers/:id`** - Delete manufacturer

---

#### Suppliers Management

**23. GET `/api/suppliers`** - List suppliers
- Response: id, supplier_name, address, contact, email, phone, is_active

**24. POST `/api/suppliers`** - Create supplier
- Fields: supplier_name, address, contact, email, phone
- Validations: Name required and unique per company

**25. PUT `/api/suppliers/:id`** - Update supplier

**26. DELETE `/api/suppliers/:id`** - Delete supplier

---

### 3.3 Validation Rules

#### Item Code
- Pattern: Alphanumeric, hyphens, underscores allowed
- Unique per company
- Max 50 characters
- Not changeable after creation (optional restriction)

#### Item Name
- Required
- Max 255 characters
- Can contain special characters

#### Category/Type/UOM
- All must exist and be active (is_active = 0)
- Return 400 if invalid ID provided

#### Supplier/Manufacturer
- Must exist and be active if provided
- Optional fields

---

### 3.4 Database Query Patterns

```sql
-- Get items with related data
SELECT i.*, it.item_type_name, ic.category_name, u.uom_name, 
       s.supplier_name, m.manufacturer_name
FROM items i
LEFT JOIN item_types it ON i.item_type_id = it.id
LEFT JOIN items_categories ic ON i.category_id = ic.id
LEFT JOIN unit_of_measurements u ON i.uom_id = u.id
LEFT JOIN suppliers s ON i.supplier_id = s.id
LEFT JOIN manufacturers m ON i.manufacturer_id = m.id
WHERE i.company_id = ? AND i.is_active = 0
ORDER BY i.created_date DESC
LIMIT ? OFFSET ?
```

---

## 4. FRONTEND SPECIFICATIONS

### 4.1 Directory Structure
```
client/src/
├── pages/
│   ├── Items/
│   │   ├── ItemsList.jsx           # NEW - Items list page
│   │   ├── CreateItem.jsx          # NEW - Create item form
│   │   ├── EditItem.jsx            # NEW - Edit item form
│   │   ├── ItemDetails.jsx         # NEW - Item detail view
│   │   └── ItemsManagement.jsx     # NEW - Main items section
│   ├── Categories/
│   │   ├── CategoriesList.jsx      # NEW
│   │   ├── CategoryForm.jsx        # NEW
│   ├── ItemTypes/
│   │   ├── ItemTypesList.jsx       # NEW
│   │   ├── ItemTypeForm.jsx        # NEW
│   ├── Manufacturers/
│   │   ├── ManufacturersList.jsx   # NEW
│   │   ├── ManufacturerForm.jsx    # NEW
│   ├── Suppliers/
│   │   ├── SuppliersList.jsx       # NEW
│   │   ├── SupplierForm.jsx        # NEW
│   └── UOM/
│       ├── UOMList.jsx             # NEW
│       └── UOMForm.jsx             # NEW
├── components/
│   ├── ItemsTable.jsx              # NEW - Reusable items table
│   ├── ItemForm.jsx                # NEW - Reusable item form
│   ├── MasterDataForm.jsx          # NEW - Generic form for categories, types, etc.
│   ├── SearchFilter.jsx            # NEW - Search and filter component
│   ├── Pagination.jsx              # NEW - Pagination component
│   ├── ExportButton.jsx            # NEW - Export to CSV
│   └── BulkActions.jsx             # NEW - Bulk delete, etc.
├── stores/
│   └── itemsStore.js               # NEW - Zustand store for items data
├── services/
│   ├── itemService.js              # NEW - Items API calls
│   ├── categoryService.js          # NEW - Categories API calls
│   ├── manufacturerService.js      # NEW - Manufacturers API calls
│   └── supplierService.js          # NEW - Suppliers API calls
└── hooks/
    ├── useItems.js                 # NEW - Items data management hook
    └── useMasterData.js            # NEW - Generic master data hook
```

### 4.2 Frontend Pages

#### 1. Items List Page (`ItemsList.jsx`)
**Components:**
- Search bar (item_code, item_name)
- Filter dropdowns (category, type, supplier, manufacturer)
- Sort options (name, code, date)
- Pagination (20/50/100 per page)
- Items table with columns:
  - Item Code
  - Item Name
  - Category
  - Type
  - UOM
  - Supplier
  - Manufacturer
  - Created Date
  - Actions (View, Edit, Delete)

**Features:**
- Click row to view details
- Action buttons: Edit, Delete, View
- Bulk select checkbox
- Bulk actions: Delete, Export
- Loading state while fetching
- Empty state when no items found
- Error handling with retry button

---

#### 2. Create Item Page (`CreateItem.jsx`)
**Form Fields:**
- Item Code (required, unique)
- Item Name (required)
- Item Type (required, dropdown)
- Category (required, dropdown)
- UOM (required, dropdown)
- Supplier (optional, dropdown)
- Manufacturer (optional, dropdown)
- Description (optional, textarea)
- SKU (optional)

**Features:**
- Validation before submit
- Show required field indicators
- Dropdowns load from API
- Submit button disabled while loading
- Success/error messages
- Redirect to list or edit page on success
- Cancel button

---

#### 3. Edit Item Page (`EditItem.jsx`)
**Features:**
- Load item data on mount
- Pre-fill all fields
- Same validation as Create
- Cannot change item_code (optional lock)
- Save button
- Delete button
- Show audit trail (created_by, created_date, updated_by, updated_date)
- Revert/Reset changes button

---

#### 4. Item Details Page (`ItemDetails.jsx`)
**Display:**
- All item information (readonly)
- Related information (suppliers, manufacturers)
- Creation and update audit info
- Action buttons: Edit, Delete, Back

---

#### 5. Categories Management Page (`CategoriesList.jsx`)
**Features:**
- Simple table with category names and descriptions
- Add New button
- Edit/Delete buttons
- Modal or inline form for add/edit
- Validation

---

#### 6. Similar Pages for ItemTypes, Manufacturers, Suppliers
Follow same pattern as Categories

### 4.3 Zustand Store (`itemsStore.js`)

```javascript
State:
- items: [],
- categories: [],
- itemTypes: [],
- uoms: [],
- manufacturers: [],
- suppliers: [],
- currentItem: null,
- loading: false,
- error: null,
- pagination: { page, limit, total },
- filters: { search, category_id, supplier_id, ... }

Actions:
- fetchItems(filters, page, limit)
- fetchItemById(id)
- createItem(data)
- updateItem(id, data)
- deleteItem(id)
- setFilters(filters)
- setCurrentPage(page)

- fetchCategories()
- fetchItemTypes()
- fetchUOMs()
- fetchManufacturers()
- fetchSuppliers()

- setLoading(bool)
- setError(error)
- clearError()
```

### 4.4 Services

#### Items Service (`itemService.js`)
```
- getItems(filters, page, limit)
- getItem(id)
- createItem(data)
- updateItem(id, data)
- deleteItem(id)
- exportItems(filters)
```

#### Category Service (`categoryService.js`)
```
- getCategories()
- createCategory(data)
- updateCategory(id, data)
- deleteCategory(id)
```

Similar for: ItemTypes, Manufacturers, Suppliers Services

### 4.5 UI Components

#### ItemsTable Component
- Reusable table for displaying items
- Supports sorting, filtering
- Action buttons in columns
- Checkbox selection for bulk actions

#### ItemForm Component
- Reusable form for create/edit
- Dynamic field rendering
- Validation messages
- Submit and cancel buttons

#### MasterDataForm Component
- Generic form for simple master data (categories, types)
- Field name, description, is_active
- Reusable for all master data types

#### SearchFilter Component
- Combined search and filter UI
- Search input for text search
- Dropdown filters
- Apply/Reset buttons

#### Pagination Component
- Page numbers with prev/next
- Records per page selector
- Total count display
- Current page indicator

---

## 5. FEATURE SPECIFICATIONS

### 5.1 Search & Filter
- Search by item_code and item_name (case-insensitive)
- Filter by category, type, supplier, manufacturer
- Multiple filters can be combined
- Filters persist in URL query params (for sharing)
- Real-time filtering (or with Apply button)

### 5.2 Sorting
- Sort by: code, name, category, created_date
- Ascending/Descending toggle
- Sort state persists in store

### 5.3 Pagination
- Default: 20 items per page
- Options: 20, 50, 100
- Show: "Showing 1-20 of 150"
- Prev/Next buttons

### 5.4 Export
- Export to CSV
- Include: code, name, type, category, uom, supplier, manufacturer, created_date
- Filters apply to export
- File naming: items_export_YYYYMMDD.csv

### 5.5 Responsive Design
- Mobile: Single column list with swipe actions
- Tablet: Two column layout
- Desktop: Full table view

---

## 6. VALIDATION RULES

### Frontend Validation
- Required fields marked with asterisk
- Real-time validation feedback
- Error messages under fields
- Disable submit if validation fails

### Backend Validation
- All frontend validations duplicated
- SQL injection prevention
- Type checking
- Range checking

### Business Logic Validation
- item_code uniqueness per company
- Category/type/UOM must exist and be active
- Supplier/manufacturer must exist if provided

---

## 7. ERROR HANDLING

### API Error Codes
- `ERR_DUPLICATE_ITEM_CODE` (409) - Item code already exists
- `ERR_INVALID_CATEGORY` (400) - Category not found or inactive
- `ERR_INVALID_ITEM_TYPE` (400) - Item type not found
- `ERR_INVALID_UOM` (400) - UOM not found
- `ERR_VALIDATION_ERROR` (400) - Validation failed
- `ERR_NOT_FOUND` (404) - Item not found

### User-Facing Messages
- Show friendly error messages
- Suggest actions (retry, check input, etc.)
- Log detailed errors to console (dev mode only)

---

## 8. PERFORMANCE CONSIDERATIONS

### Frontend
- Debounce search input (500ms)
- Lazy load dropdowns (fetch on demand)
- Pagination to prevent loading too many items
- Cache master data (categories, UOMs) in store

### Backend
- Index on: company_id, item_code, is_active, created_date
- Use LEFT JOIN for related data (avoid N+1)
- Paginate results
- Cache frequently accessed masters (optional redis)

---

## 9. TESTING CHECKLIST

### Manual Testing
- [ ] Create item with all fields
- [ ] Create item with minimum fields
- [ ] Duplicate item_code rejected
- [ ] Edit item details
- [ ] Cannot edit item_code
- [ ] Delete item (soft delete verification)
- [ ] Search by code
- [ ] Search by name
- [ ] Filter by category
- [ ] Filter by supplier
- [ ] Sort by name ascending/descending
- [ ] Pagination works
- [ ] Export to CSV
- [ ] Categories CRUD
- [ ] Types CRUD
- [ ] UOM CRUD
- [ ] Manufacturers CRUD
- [ ] Suppliers CRUD

### API Testing
- [ ] GET /api/items with all filter combinations
- [ ] GET /api/items/:id returns complete data
- [ ] POST /api/items validation errors
- [ ] PUT /api/items/:id updates correctly
- [ ] DELETE /api/items/:id soft deletes
- [ ] All related tests for categories, types, etc.

### Edge Cases
- [ ] Very long item name (255+ chars)
- [ ] Special characters in item_code
- [ ] Empty result set
- [ ] Large dataset pagination
- [ ] Rapid successive API calls (debounce check)

---

## 10. PHASE 2 COMPLETION CHECKLIST

### Backend
- [ ] All 26 API endpoints created
- [ ] Items CRUD + related tables CRUD
- [ ] Validation rules implemented
- [ ] Error handling complete
- [ ] Query optimization (indexes, joins)
- [ ] Company_id filtering in all queries
- [ ] Pagination implemented
- [ ] Export functionality
- [ ] Database queries parameterized

### Frontend
- [ ] Items list page with table
- [ ] Create/Edit item pages
- [ ] All master data management pages
- [ ] Search and filter working
- [ ] Sorting working
- [ ] Pagination working
- [ ] Export button working
- [ ] Form validation
- [ ] Error messages display
- [ ] Loading states
- [ ] Responsive design
- [ ] Zustand store managing state

### Integration
- [ ] API calls from frontend to backend working
- [ ] Token included in all requests
- [ ] Error responses handled properly
- [ ] Filters persist and work correctly

---

## 11. DELIVERABLES SUMMARY

### Backend
- 26 API endpoints (Items, Categories, Types, UOMs, Manufacturers, Suppliers)
- Database models for all tables
- Controllers for business logic
- Validation and error handling
- CSV export functionality

### Frontend
- 10+ pages for master data management
- 5+ reusable components
- Zustand store for state management
- API services for all endpoints
- Search, filter, sort, pagination
- Responsive, user-friendly UI

---

**Status:** Ready for implementation by Codex  
**Depends On:** Phase 1 (Authentication)  
**Required For:** Phase 4 (GRN), Phase 5 (Material Issues), etc.

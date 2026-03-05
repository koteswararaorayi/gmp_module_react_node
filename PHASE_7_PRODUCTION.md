# PHASE 7: PRODUCTION MANAGEMENT 🏗️

**Phase Duration:** 6-7 days  
**Depends On:** Phase 1-3  
**Priority:** HIGH - Core manufacturing process  
**Status:** [ ] Not Started | [ ] In Progress | [ ] Complete

---

## 1. OVERVIEW

Implement production note management for recording manufacturing details, material consumption, waste, and QA sampling.

---

## 2. DATABASE REFERENCE

### Tables
```
production_note:
  id, company_id, pn_number, product_id, batch_no, lot_no, 
  mfg_date, exp_date, quantity_produced, uom, current_status,
  created_date, created_by

production_note_composition:
  id, pn_id, item_id, quantity_used, warehouse_id, batch_no

production_note_discard:
  id, pn_id, quantity_discarded, reason, warehouse_id, discard_date

production_note_packaging_material:
  id, pn_id, package_item_id, quantity_used, supplier

production_note_sample:
  id, pn_id, quantity_sampled, location, storage_condition, sample_date

production_note_other_batches: (References to related batches)
production_note_other_studies: (Links to stability studies)
```

---

## 3. BACKEND API ENDPOINTS

### Production Notes

**1. GET `/api/production-notes`** - List production notes
- Query: page, limit, status, product_id, date_range
- Response: PN list with product, batch, date, status

**2. GET `/api/production-notes/:id`** - Get PN details
- Response: Full PN with all compositions, discard, samples, etc.

**3. POST `/api/production-notes`** - Create production note
- Fields:
  ```json
  {
    "product_id": 1,
    "batch_no": "BATCH123",
    "lot_no": "LOT456",
    "mfg_date": "2026-03-04",
    "exp_date": "2027-03-04",
    "quantity_produced": 1000,
    "uom": "Strip",
    "compositions": [
      { "item_id": 1, "quantity_used": 500, "warehouse_id": 1, "batch_no": "BATCH001" }
    ],
    "discard": [
      { "quantity_discarded": 50, "reason": "Broken", "warehouse_id": 1 }
    ],
    "packaging_materials": [
      { "package_item_id": 5, "quantity_used": 1000, "supplier_id": 1 }
    ],
    "samples": [
      { "quantity_sampled": 10, "location_id": 5, "storage_condition": "Room Temp" }
    ]
  }
  ```

- Validation:
  - Product must exist
  - Batch/lot numbers unique or allow duplicates (business rule)
  - Compositions total cannot exceed available stock
  - Exp date > Mfg date
  
- Business Logic:
  - Generate PN number: PN/YYYY/NNN
  - Calculate yield: (qty_produced / total_ingredients) ratio

**4. PUT `/api/production-notes/:id`** - Update PN
- Only if status NEW

**5. DELETE `/api/production-notes/:id`** - Soft delete

**6. PUT `/api/production-notes/:id/status`** - Change status
- Workflow: NEW → IN_PROGRESS → COMPLETED
- On completion: Lock from editing

---

### Production Details

**7. POST `/api/production-notes/:id/composition`** - Add material composition
**8. PUT `/api/production-notes/:id/composition/:comp_id`** - Update composition
**9. DELETE `/api/production-notes/:id/composition/:comp_id`** - Remove composition

**10. POST `/api/production-notes/:id/discard`** - Record discarded quantity
**11. PUT `/api/production-notes/:id/discard/:discard_id`** - Update discard
**12. DELETE `/api/production-notes/:id/discard/:discard_id`** - Remove discard

**13. POST `/api/production-notes/:id/samples`** - Record QA sample
**14. PUT `/api/production-notes/:id/samples/:sample_id`** - Update sample
**15. DELETE `/api/production-notes/:id/samples/:sample_id`** - Remove sample

---

### Stability Studies Link

**16. POST `/api/production-notes/:id/stability-studies`** - Link stability protocol
**17. GET `/api/production-notes/:id/stability-studies`** - Get linked studies

---

## 4. FRONTEND PAGES

### Production Notes List
- Filter: Product, status, date range
- Search: Batch no, PN number
- Table: PN#, Product, Batch, Mfg Date, Qty, Status, Actions
- Status badges

### Create/Edit Production Note
**Multi-section form:**

1. **Header:**
   - Product (dropdown)
   - Batch No (text)
   - Lot No (text)
   - Mfg Date (date picker)
   - Exp Date (date picker)
   - Quantity Produced (number)

2. **Material Composition:**
   - Dynamic table: Item, Qty Used, Warehouse, Batch No, Remarks
   - Add/Remove rows
   - Auto-calculate total used vs available

3. **Waste/Discard:**
   - Dynamic table: Qty Discarded, Reason, Warehouse
   - Running total

4. **Packaging Material:**
   - Dynamic table: Package Item, Qty, Supplier
   - Add/remove rows

5. **QA Samples:**
   - Dynamic table: Qty Sampled, Location, Storage Condition
   - Add/remove rows

6. **Related Batches/Studies:**
   - Link to other batches or stability protocols
   - Dropdown for selection

7. **Summary:**
   - Total produced, total consumed, total discarded
   - Yield %
   - Material reconciliation check

---

### Production Note Details
- Readonly display with all sections
- Audit trail
- Link to stability studies
- Action buttons: Edit, Complete, Print, Export

---

## 5. COMPONENTS

- CompositionTable (material inputs)
- DiscardTable (waste tracking)
- SamplesTable (QA samples)
- ProductSelector (product dropdown)
- MaterialReconciliation (visual stock check)
- YieldCalculator (display yield %)

---

## 6. BUSINESS LOGIC

### Yield Calculation
```
Yield % = (Qty_Produced / Combined_Qty_Used) * 100
```

### Material Reconciliation
```
Produced Qty = Consumed Qty + Discarded Qty + Variance
```

### Stock Impact (Optional)
- Material consumption reduces warehouse stock (on completion)
- Update item_ledger for each material used

---

## 7. VALIDATIONS

- Exp date must be after mfg date
- Quantities must be positive
- Total consumed cannot exceed available stock (warning or error)
- Cannot edit if completed

---

## 8. TESTING CHECKLIST

- [ ] Create PN with all sections
- [ ] PN number unique
- [ ] Material reconciliation calculated
- [ ] Yield calculation correct
- [ ] Add/remove rows works
- [ ] Dropdown cascading works
- [ ] Stock availability check
- [ ] Waste tracking accurate
- [ ] Status transitions work
- [ ] Cannot edit completed PN
- [ ] Link stability studies works
- [ ] Export PN to PDF

---

## 9. FUTURE ENHANCEMENTS

- Equipment tracking
- Temperature/humidity logging
- In-process testing results
- Quality metrics
- Batch hold/release

---

**Status:** Ready for implementation  
**Depends On:** Phase 1-3  
**Required For:** Phase 8

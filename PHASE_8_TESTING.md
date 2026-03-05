# PHASE 8: ANALYTICAL TESTING & STABILITY STUDIES 🧪

**Phase Duration:** 4-5 days  
**Depends On:** Phase 1, 2, 3, 7  
**Priority:** HIGH - QA and compliance critical  
**Status:** [ ] Not Started | [ ] In Progress | [ ] Complete

---

## 1. OVERVIEW

Implement analytical test request management and stability study tracking for QA compliance.

---

## 2. DATABASE REFERENCE

### Tables
```
analytical_test_requests:
  id, company_id, tr_no, lot_no, batch_no, manufacturer, 
  mfg_date, exp_date, sample_qty, status, test_date, 
  received_date, analyzed_date, checked_date, results, remarks

parental_stability (Injectable):
  id, company_id, pn_id, protocol_id, batch_no, 
  start_date, end_date, test_parameters, results, analysis_date

oral_solids_stability (Tablet/Capsule):
  id, company_id, protocol_id, batch_no, pn_id,
  start_date, end_date, test_parameters, results
```

---

## 3. BACKEND API ENDPOINTS

### Analytical Test Requests

**1. GET `/api/test-requests`** - List test requests
- Query: page, limit, status, date_range, batch_no
- Response: Test requests with status, batch, product

**2. GET `/api/test-requests/:id`** - Get test details
- Response: Full request with test parameters and results

**3. POST `/api/test-requests`** - Create test request
- Fields:
  ```json
  {
    "product_name": "Paracetamol",
    "lot_no": "LOT123",
    "batch_no": "BATCH456",
    "manufacturer": "Manufacturer X",
    "mfg_date": "2026-02-01",
    "exp_date": "2027-02-01",
    "sample_qty": 10,
    "sample_details": "10 Strips",
    "pack_details": "Blister Pack",
    "label_claim": "500mg",
    "tests_required": ["Assay", "Dissolution", "Moisture"],
    "remarks": "Routine analysis",
    "submitted_date": "2026-03-04"
  }
  ```

- Validation: All required fields present

**4. PUT `/api/test-requests/:id`** - Update test request
- Editable fields before test starts

**5. PUT `/api/test-requests/:id/results`** - Enter test results
- Fields:
  ```json
  {
    "test_results": [
      { "test_name": "Assay", "result": "98.5%", "specification": "95-105%", "status": "Pass" },
      { "test_name": "Dissolution", "result": "85%", "specification": ">80%", "status": "Pass" }
    ],
    "overall_result": "Pass",
    "analyzed_date": "2026-03-05",
    "checked_date": "2026-03-06",
    "remarks": "All tests passed"
  }
  ```

**6. PUT `/api/test-requests/:id/status`** - Update status
- Workflow: NEW → TEST_IN_PROGRESS → COMPLETED

**7. DELETE `/api/test-requests/:id`** - Soft delete

---

### Stability Studies

**8. GET `/api/stability-studies`** - List stability protocols
- Query: page, limit, status, type (parental/oral_solids)
- Response: Protocol list with batch, schedule, status

**9. GET `/api/stability-studies/:id`** - Get protocol details
- Response: Full protocol with test schedule and results

**10. POST `/api/stability-studies`** - Create stability protocol
- Fields:
  ```json
  {
    "study_type": "oral_solids" or "parental",
    "pn_id": 1,
    "batch_no": "BATCH123",
    "start_date": "2026-03-04",
    "end_date": "2027-03-04",
    "storage_condition": "25°C/60% RH",
    "test_points": [
      { "months": 0, "test_date": "2026-03-04" },
      { "months": 3, "test_date": "2026-06-04" },
      { "months": 6, "test_date": "2026-09-04" },
      { "months": 12, "test_date": "2027-03-04" }
    ],
    "test_parameters": ["Assay", "Dissolution", "Moisture", "Color"]
  }
  ```

**11. POST `/api/stability-studies/:id/results`** - Enter study results
- Fields:
  ```json
  {
    "test_point_month": 0,
    "test_date": "2026-03-04",
    "test_results": [
      { "parameter": "Assay", "result": "99.2%", "specification": "90-110%", "status": "Pass" }
    ],
    "remarks": "Initial test point results"
  }
  ```

**12. GET `/api/stability-studies/:id/schedule`** - Get test schedule
- Response: Array of test points with dates and status

**13. PUT `/api/stability-studies/:id/status`** - Complete study
- Finalize study and lock

---

## 4. FRONTEND PAGES

### Test Request List
- Filter: Status, date range, product
- Search: Batch no, test request no
- Table: TR#, Product, Batch, Sample Qty, Status, Test Date, Results, Actions
- Status colors: New=blue, In Progress=yellow, Completed=green, Failed=red

### Create Test Request
- Form fields: Product name, batch, lot, manufacturer, dates, sample qty, tests required
- Multi-select for tests
- Upload sample image (optional)

### Test Request Details
- Display request info
- Test results input section (editable if in_progress)
- Result entry table: Test name, result, specification, pass/fail
- Overall result determination (All passed = PASS)

### Stability Study List
- Filter: Type, status, product
- Table: Study ID, Batch, Type, Start Date, End Date, Next Test Point, Status

### Create Stability Protocol
- Study type selector (Oral Solids vs Parental)
- Link to production note
- Batch selection
- Storage condition
- Test points generation (Month 0, 3, 6, 12, 24, 36 - customizable)
- Test parameters selection

### Stability Study Schedule
- Timeline view showing test points
- Calendar with test dates
- Results entry for each point
- Visual indicator of completed vs pending

---

## 5. COMPONENTS

- TestRequestTable (reusable test list)
- TestResultsForm (results data entry)
- TestParameterSelector (multi-select tests)
- SpecificationChecker (validate result vs spec)
- StabilityTimeline (visual schedule)
- StudyStatusBadge (color-coded status)

---

## 6. ZUSTAND STORE

```javascript
State:
- testRequests: [],
- stabilityStudies: [],
- currentTestRequest: null,
- currentStudy: null,
- filters: { status, date_range, product },
- loading: false,
- error: null

Actions:
- fetchTestRequests(filters, page, limit)
- fetchTestById(id)
- createTestRequest(data)
- updateTestResults(id, results)
- updateTestStatus(id, status)

- fetchStabilityStudies(filters, page, limit)
- fetchStudyById(id)
- createStudy(data)
- addStudyResults(id, point_month, results)
- updateStudyStatus(id, status)
```

---

## 7. VALIDATION RULES

### Test Requests
- Sample quantity > 0
- Test dates logical (received < analyzed)
- At least one test required
- Results must match specified tests

### Stability Studies
- Storage condition required
- Start date < End date
- Test points must be chronologically ordered
- Results must match test parameters

---

## 8. RESULT EVALUATION

### Automatic Pass/Fail Logic
```
For each test:
  IF result is within specification THEN Pass
  ELSE Fail

Overall Result:
  IF all tests Pass THEN Pass
  ELSE Fail
```

### Specification Ranges
- Parse specification (e.g., "90-105%", ">98%", "<2%")
- Compare result automatically
- Flag out-of-spec results

---

## 9. TESTING CHECKLIST

- [ ] Create test request with multiple tests
- [ ] Enter test results
- [ ] Specification validation working
- [ ] Result evaluation correct
- [ ] Status transitions working
- [ ] Cannot edit completed tests
- [ ] Stability protocol creation (oral solids)
- [ ] Stability protocol creation (parental)
- [ ] Add results to test point
- [ ] Schedule generation correct
- [ ] Timeline view displays accurately
- [ ] Export test results

---

## 10. REPORTING FEATURES (Optional)

- Test Results Certificate (generate PDF)
- Stability Protocol Summary
- Batch Release Summary (all tests passed)
- Non-Conformance Report (if any failures)

---

**Status:** Ready for implementation  
**Depends On:** Phase 1, 2, 3, 7  
**Required For:** Phase 9

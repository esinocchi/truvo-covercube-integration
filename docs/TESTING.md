# Testing Documentation

## Overview

Comprehensive test suite for the Truvo-Covercube integration built with **Vitest**. All tests can be run without live API credentials by mocking external dependencies.

## Test Statistics

✅ **57 Tests Passing**
- 23 unit tests for `buildRequest.ts`
- 18 unit tests for `parseResponse.ts`
- 16 integration tests for `/api/quote` route

## Running Tests

```bash
# Run all tests
npm run test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

---

## Test Files

### 1. `buildRequest.test.ts` - Core Business Logic (23 tests)

**Location:** `src/__tests__/lib/buildRequest.test.ts`

#### Arizona Policy Tests (8 tests)
- ✅ Builds valid AZ request with infrastructure fields
- ✅ Includes plate information for AZ vehicles
- ✅ Preserves all AZ coverage fields
- ✅ Throws error if AZ has PIP coverage
- ✅ Throws error if AZ has UMPD coverage
- ✅ Throws error if AZ has IsNonOwner flag
- ✅ Throws error if AZ has no vehicles
- ✅ Throws error if AZ vehicle has TX-specific fields

#### Texas Regular Policy Tests (4 tests)
- ✅ Builds valid TX request with all required fields
- ✅ Preserves TX prior insurance fields
- ✅ Throws error if TX has no vehicles
- ✅ Throws error if TX has no PIP

#### Texas Non-Owner Policy Tests (5 tests)
- ✅ Builds valid TX non-owner request
- ✅ Throws error if TX non-owner has vehicles
- ✅ Throws error if TX non-owner has roadsideAssistance
- ✅ Throws error if TX non-owner missing PIP
- ✅ Throws error if TX non-owner missing UMPD

#### Common Fields Tests (4 tests)
- ✅ Passes through all policyholder fields
- ✅ Passes through all drivers
- ✅ Passes through discount flags
- ✅ Passes through prior insurance data

#### Producer Code Tests (2 tests)
- ✅ Uses correct producer code for Arizona (AZ1198)
- ✅ Uses correct producer code for Texas (TX1199)

---

### 2. `parseResponse.test.ts` - Response Validation (18 tests)

**Location:** `src/__tests__/lib/parseResponse.test.ts`

#### Valid Response Tests (4 tests)
- ✅ Parses valid Arizona response
- ✅ Parses valid Texas response
- ✅ Parses valid Texas non-owner response
- ✅ Returns unchanged response when valid

#### Missing Required Fields Tests (7 tests)
- ✅ Throws error if quoteCode missing
- ✅ Throws error if quotePremium not a number
- ✅ Throws error if quotePremium missing
- ✅ Throws error if quoteTotal not a number
- ✅ Throws error if drivers not an array
- ✅ Throws error if coverages not an array
- ✅ Throws error if payplan not an array

#### Edge Cases Tests (3 tests)
- ✅ Accepts empty arrays for drivers/coverages/payplan
- ✅ Accepts zero values for premiums
- ✅ Accepts negative values (discounts/refunds)

#### Structure Validation Tests (4 tests)
- ✅ Validates driver objects structure
- ✅ Validates coverage objects structure
- ✅ Validates payplan objects structure
- ✅ Includes viewQuote and consumerBridge URLs

---

### 3. `quote.test.ts` - API Integration (16 tests)

**Location:** `src/__tests__/api/quote.test.ts`

#### Successful Request Tests (6 tests)
- ✅ Processes Arizona quote successfully
- ✅ Processes Texas quote successfully
- ✅ Processes Texas non-owner quote successfully
- ✅ Injects authentication credentials
- ✅ Uses correct producer code for state
- ✅ Returns 200 with valid quote data

#### Validation Error Tests (4 tests)
- ✅ Returns 500 for AZ with PIP coverage
- ✅ Returns 500 for TX without vehicles
- ✅ Returns 500 for TX non-owner with vehicles
- ✅ Returns 500 for TX non-owner without PIP

#### API Error Handling Tests (4 tests)
- ✅ Handles Covercube API 500 error
- ✅ Handles network errors
- ✅ Handles invalid JSON response
- ✅ Handles missing required fields in response

#### Request Processing Tests (3 tests)
- ✅ Strips TX-only fields from AZ requests
- ✅ Includes TX-specific fields in TX requests
- ✅ Removes vehicles/roadsideAssistance for TX non-owner

---

## Test Fixtures

### Quote Input Fixtures

**Location:** `src/__tests__/fixtures/quoteInputs.ts`

Three comprehensive test fixtures based on Postman collection:

1. **`arizonaQuoteInput`**
   - 2 vehicles (Toyota Camry, Mitsubishi Mirage)
   - 2 drivers
   - AZ-specific coverages
   - Prior insurance data

2. **`texasQuoteInput`**
   - 1 vehicle (Toyota Camry)
   - 1 driver
   - TX-specific coverages (PIP, UMPD)
   - TX-specific vehicle fields

3. **`texasNonOwnerQuoteInput`**
   - No vehicles
   - 1 driver
   - IsNonOwner flag set
   - TX non-owner coverages

### Response Fixtures

**Location:** `src/__tests__/fixtures/covercubeResponses.ts`

Three mock Covercube API responses:

1. **`mockArizonaResponse`** - 5 coverages, 2 drivers, 2 payment plans
2. **`mockTexasResponse`** - 6 coverages (includes PIP/UMPD), 1 driver
3. **`mockTexasNonOwnerResponse`** - 4 coverages (no vehicle coverages)

---

## What's Tested

### ✅ State-Specific Validation

| Scenario | Test Coverage |
|----------|---------------|
| AZ cannot have PIP | ✅ Validated |
| AZ cannot have UMPD | ✅ Validated |
| AZ cannot be non-owner | ✅ Validated |
| AZ must have vehicles | ✅ Validated |
| TX must have PIP | ✅ Validated |
| TX must have vehicles (regular) | ✅ Validated |
| TX non-owner cannot have vehicles | ✅ Validated |
| TX non-owner must have PIP & UMPD | ✅ Validated |

### ✅ Field Transformations

| Transformation | Test Coverage |
|----------------|---------------|
| Inject auth credentials | ✅ Validated |
| Add producer code | ✅ Validated |
| Set transType to "NB" | ✅ Validated |
| Strip TX fields from AZ | ✅ Validated |
| Remove vehicles for TX non-owner | ✅ Validated |
| Remove roadsideAssistance for TX non-owner | ✅ Validated |

### ✅ Error Handling

| Error Type | Test Coverage |
|------------|---------------|
| Validation errors return 500 | ✅ Validated |
| API 500 errors handled | ✅ Validated |
| Network errors handled | ✅ Validated |
| Invalid JSON handled | ✅ Validated |
| Missing response fields detected | ✅ Validated |

### ✅ Response Parsing

| Check | Test Coverage |
|-------|---------------|
| quoteCode required | ✅ Validated |
| quotePremium must be number | ✅ Validated |
| quoteTotal must be number | ✅ Validated |
| drivers must be array | ✅ Validated |
| coverages must be array | ✅ Validated |
| payplan must be array | ✅ Validated |

---

## What's NOT Tested (Requires Live Credentials)

The following scenarios require live API access and **cannot be tested** until credentials are provided:

### ❌ Live API Integration
- Actual HTTP calls to Covercube endpoint
- Real authentication against Covercube servers
- Actual quote generation and premium calculation
- Real producer code validation
- Live response structure validation

### ❌ End-to-End Scenarios
- Complete quote flow from input → API → response
- Actual Covercube error responses
- Real-world edge cases from Covercube
- Performance under load
- Rate limiting behavior

### ❌ Data Validation
- Whether Covercube actually accepts documented coverage limits
- Whether undocumented Postman values work (see `DISCREPANCIES.md`)
- Real occupation code validation
- Real payplan code validation

---

## Testing Strategy for Live Credentials

Once live credentials are available, add these tests:

### Phase 1: Smoke Tests
```typescript
describe("Live API Smoke Tests", () => {
  it("should successfully get a real AZ quote", async () => {
    // Use arizonaQuoteInput fixture
    // Call real API
    // Validate real response structure
  });
  
  it("should successfully get a real TX quote", async () => {
    // Use texasQuoteInput fixture
  });
  
  it("should successfully get a real TX non-owner quote", async () => {
    // Use texasNonOwnerQuoteInput fixture
  });
});
```

### Phase 2: Discrepancy Resolution
```typescript
describe("Discrepancy Testing", () => {
  it("should test if 30/60 BI works for Arizona", async () => {
    // Test undocumented value from Postman
  });
  
  it("should test occupation text vs codes", async () => {
    // Test "Electrician/Linesman" vs "ELECTRICIAN"
  });
  
  it("should test MP='None' for Texas", async () => {
    // Test undocumented "None" value
  });
});
```

### Phase 3: Error Scenarios
```typescript
describe("Live Error Handling", () => {
  it("should handle invalid producer code gracefully", async () => {
    // Test with wrong producer code
  });
  
  it("should handle invalid coverage limits gracefully", async () => {
    // Test with out-of-range values
  });
});
```

---

## Mocking Strategy

### Current Mocks

1. **Config Module** - Mocked to provide test credentials
2. **Fetch API** - Mocked to return test responses
3. **Covercube API** - Fully mocked, no real HTTP calls

### Mock Configuration

```typescript
vi.mock("@/config", () => ({
  config: {
    covercube: {
      url: "https://test-api.example.com",
      username: "test@example.com",
      password: "testpass123",
      producerCodes: {
        AZ: "AZ1198",
        TX: "TX1199",
      },
    },
  },
}));

global.fetch = vi.fn();
```

---

## Coverage Goals

Current coverage (estimated):
- **buildRequest.ts**: ~95% (all branches tested)
- **parseResponse.ts**: ~100% (all error paths tested)
- **API route**: ~90% (main flows + error handling)

---

## Running Tests During Development

```bash
# Watch mode for TDD
npm run test

# Run specific test file
npx vitest src/__tests__/lib/buildRequest.test.ts

# Run tests matching pattern
npx vitest -t "Arizona"

# Interactive UI
npm run test:ui
```

---

## Continuous Integration

For CI/CD pipelines:

```yaml
# Example GitHub Actions
- name: Run Tests
  run: npm run test
  
- name: Generate Coverage
  run: npm run test:coverage
```

---

## Test Data Sources

All test data is derived from:
1. **Postman Collection** (`docs/truvo/Truvo Dev.postman_collection.json`)
2. **API Documentation** (`docs/covercube/api.md`)
3. **Business Rules** (documented in `docs/DISCREPANCIES.md`)

**Important:** Test fixtures use **documented values**, not Postman discrepancies (see `DISCREPANCIES.md` for details).

---

## Next Steps

1. ✅ All unit tests passing
2. ✅ All integration tests passing (with mocks)
3. ⏳ **Awaiting live credentials** for end-to-end testing
4. ⏳ Performance testing once live
5. ⏳ Resolve discrepancies with Covercube support

---

**Last Updated:** 2025-11-04  
**Test Framework:** Vitest 4.0.7  
**Total Tests:** 57 ✅


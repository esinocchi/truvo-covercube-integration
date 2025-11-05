# Truvo Covercube Integration

Backend-only Next.js (TypeScript) integration with the Covercube Rate Quote API with full runtime type validation using Zod.

## Overview

This project implements a single API endpoint (`/api/quote`) that:
1. Receives a quote request with policy details
2. Validates the input using Zod schemas (runtime + compile-time)
3. Transforms the input into Covercube's required format
4. Calls the Covercube API
5. Validates and returns the rate quote data

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Covercube API Configuration
COVERCUBE_URL=https://pi-cc-dev-th.azurewebsites.net/api/truvo/rate/action
COVERCUBE_USERNAME=test@truvoinsurance.com
COVERCUBE_PASSWORD=Truvo$2025
COVERCUBE_PRODUCER_AZ=AZ1198
COVERCUBE_PRODUCER_TX=TX1199
```

### 3. Run the Development Server

```bash
npm run dev
```

The API will be available at `http://localhost:3000/api/quote`

### 4. Run Tests

```bash
npm test                # Run tests in watch mode
npm run test:ui         # Run tests with UI
npm run test:coverage   # Run tests with coverage report
```

## Project Structure

```
src/
├── app/
│   └── api/
│       └── quote/
│           └── route.ts              # Main API endpoint
├── lib/
│   ├── buildRequest.ts               # Builds Covercube request
│   ├── covercubeClient.ts            # HTTP client for Covercube
│   ├── validateResponse.ts           # Validates API responses
│   └── constants.ts                  # Mappings and constants
├── zod-schemas/
│   └── covercube.ts                  # Zod schemas for validation
├── config/
│   └── index.ts                      # Environment config
└── __tests__/
    ├── api/
    │   └── quote.test.ts             # API endpoint tests
    ├── lib/
    │   ├── buildRequest.test.ts      # Request builder tests
    │   └── validateResponse.test.ts  # Response validation tests
    ├── fixtures/
    │   ├── quoteInputs.ts            # Test data fixtures
    │   └── covercubeResponses.ts     # Response fixtures
    └── zod-validation.test.ts        # Schema validation tests
```

## API Usage

### Request

**Endpoint:** `POST /api/quote`

**Body:** JSON matching the `QuoteInput` type (validated by Zod schemas in `src/zod-schemas/covercube.ts`)

Example request for an Arizona policy:

```json
{
  "state": "AZ",
  "policyTerm": "6 Months",
  "inceptionDate": "2025/11/01",
  "effectiveDate": "2025/11/01",
  "rateDate": "2024/11/28",
  "holderFirstName": "John",
  "holderLastName": "Doe",
  "address": "123 Main St",
  "city": "Phoenix",
  "zipCode": "85001",
  "BI": "25/50",
  "PD": "15",
  "payplan": "EFTCC",
  "drivers": [
    {
      "firstName": "John",
      "lastName": "Doe",
      "dob": "1990/01/01",
      "gender": "M",
      "licenseState": "AZ",
      "licenseStatus": "VALID"
    }
  ],
  "vehicles": [
    {
      "year": 2020,
      "make": "TOYOTA",
      "model": "CAMRY",
      "vehicleUse": "PLS"
    }
  ]
}
```

### Response

Returns a `CovercubeResponse` with quote details:

```json
{
  "quoteCode": "ABC123",
  "quotePremium": 450.00,
  "quoteTotal": 475.00,
  "policyFee": 25.00,
  "drivers": [...],
  "coverages": [...],
  "payplan": [...]
}
```

## Key Features

### Runtime Type Validation with Zod
- All input and output data is validated using Zod schemas
- Provides both compile-time TypeScript types and runtime validation
- Automatically strips invalid fields and transforms data
- Separate schemas for Arizona and Texas (including non-owner policies)
- Detailed error messages for invalid requests

### Comprehensive Testing
- Unit tests for all core functions (`buildRequest`, `validateResponse`)
- Integration tests for the API endpoint
- Test fixtures for realistic data scenarios
- Vitest with UI and coverage reporting
- Testing Library integration for React components (future use)

### State-Specific Handling
The Zod schemas automatically handle state-specific requirements:
- **Arizona (AZ)**: Standard auto policies with required vehicles and drivers
- **Texas Owned (TX)**: Standard auto policies with optional plate/ownership fields
- **Texas Non-Owner (TX)**: Policies without vehicles (requires `IsNonOwner: "Y"`)

## State-Specific Features

### Arizona (AZ)
- Standard auto policies
- Requires vehicles array
- Required driver fields: `married`, `licenseNumber`, `sr22`
- Automatically strips TX-specific fields

### Texas (TX)
- **Standard Auto Policies**: Includes vehicles array with optional TX-specific fields
  - Optional fields: `platenumber`, `platestate`, `vehiclepurchasedate`, `estimatemilage`, `ownershiplength`
  - Additional coverages: `PIP`, `UMPD`
- **Non-Owner Policies**: For drivers without owned vehicles
  - Set `IsNonOwner: "Y"` and omit vehicles array
  - Most driver fields are optional

## Type Definitions

All types are exported from `src/zod-schemas/covercube.ts`:

```typescript
import type {
  QuoteInput,           // Union of all input types
  ArizonaQuoteInput,    // AZ-specific input
  TexasQuoteInput,      // TX owned vehicle input
  CovercubeResponse,    // API response type
  State,                // "AZ" | "TX"
  VehicleUse,           // Vehicle use codes
  LicenseStatus,        // License status codes
  // ... and many more
} from "@/zod-schemas/covercube";
```

### Validation Examples

The Zod schemas provide automatic validation with helpful error messages:

```typescript
// ✅ Valid Arizona request
const azRequest = {
  state: "AZ",
  drivers: [{ /* required fields */ }],
  vehicles: [{ /* required fields */ }]
};

// ❌ Invalid: Missing required fields
const invalid = {
  state: "AZ",
  // Missing drivers and vehicles - Zod will reject
};

// ✅ Texas Non-Owner: automatically validated
const txNonOwner = {
  state: "TX",
  IsNonOwner: "Y",
  drivers: [{ /* fields */ }]
  // No vehicles needed - schema enforces this
};

// ❌ Invalid: TX Non-Owner with vehicles
const invalid2 = {
  state: "TX",
  IsNonOwner: "Y",
  vehicles: [{ /* ... */ }] // Error: Non-Owner cannot have vehicles
};
```

## Tech Stack

- **Next.js 16**: App Router with TypeScript
- **Zod 4**: Runtime schema validation and type inference
- **Vitest 4**: Fast unit testing framework
- **Testing Library**: React component testing utilities
- **Node 20+**: Modern JavaScript runtime

## Documentation

- **Postman Collection:** `docs/truvo/Truvo Dev.postman_collection.json`
- **API Spec:** `docs/covercube/api.md`
- **Project Context:** `.cursor/rules/context.mdc`

## Development Notes

- This is a **backend-only** project (no UI/frontend)
- All credentials are read from environment variables
- Type-safe throughout with TypeScript and Zod
- Follows Next.js App Router conventions
- Comprehensive test coverage with Vitest
- Error handling with detailed validation messages


# Truvo Covercube Integration

Backend-only Next.js (TypeScript) integration with the Covercube Rate Quote API.

## Overview

This project implements a single API endpoint (`/api/quote`) that:
1. Receives a quote request with policy details
2. Transforms the input into Covercube's required format
3. Calls the Covercube API
4. Returns the rate quote data

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

## Project Structure

```
src/
├── app/
│   └── api/
│       └── quote/
│           └── route.ts         # Main API endpoint
├── lib/
│   ├── buildRequest.ts          # Builds Covercube request
│   ├── covercubeClient.ts       # HTTP client for Covercube
│   ├── parseResponse.ts         # Validates responses
│   └── constants.ts             # Mappings and constants
├── types/
│   ├── covercube.d.ts           # Covercube API types
│   └── api.d.ts                 # Internal API types
├── config/
│   └── index.ts                 # Environment config
└── utils/
    └── (future validation logic)
```

## API Usage

### Request

**Endpoint:** `POST /api/quote`

**Body:** JSON matching the `QuoteInput` interface (see `src/types/api.d.ts`)

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

## State-Specific Features

### Arizona (AZ)
- Standard auto policies
- Requires vehicles array

### Texas (TX)
- Supports standard auto policies with vehicles
- Supports non-owner policies (set `IsNonOwner: "Y"`, omit vehicles)
- Additional fields: `PIP`, `UMPD`

## Documentation

- **Postman Collection:** `docs/truvo/Truvo Dev.postman_collection.json`
- **API Spec:** `docs/covercube/api.md`
- **Project Context:** `.cursor/rules/context.mdc`

## Development Notes

- This is a **backend-only** project (no UI/frontend)
- All credentials are read from environment variables
- Type-safe throughout with TypeScript
- Follows Next.js App Router conventions


# Covercube Rate Quote API Documentation

## Table of Contents
- [Arizona (AZ)](#arizona-az)
- [Texas (TX)](#texas-tx)
- [Texas (TX) Non-Owner Policy](#texas-tx-non-owner-policy)
- [Mapping Data Tables](#mapping-data-tables)

---

## Base Endpoint

```
POST https://pi-cc-dev-th.azurewebsites.net/api/truvo/rate/action
```

## Overview

Generates an insurance rate quote based on applicant, vehicle, and driver information. Returns detailed quote information including coverages, payment plans, and premium breakdowns.

## HTTP Method

`POST`

## Authentication

All requests must include valid authentication credentials in the request body.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `action` | string | ✅ | Action type (e.g., `RATEQUOTE`) |
| `username` | string | ✅ | Authorized username for API access |
| `password` | string | ✅ | Password associated with the username |
| `producerCode` | string | ✅ | Agency or producer identification code |

---

## Arizona (AZ)

### Request Body Example

```json
{
  "action": "RATEQUOTE",
  "username": "XXXXXX",
  "password": "XXXXXX",
  "producerCode": "XXXXXX",
  "transType": "NB",
  "policyTerm": "6 Months",
  "inceptionDate": "2025/10/30",
  "effectiveDate": "2025/10/30",
  "rateDate": "2024/11/28",
  "holderFirstName": "Test4",
  "holderMiddleInitial": "A",
  "holderLastName": "ITC0307",
  "address": "235 S 190th Ave",
  "city": "BUCKEYE",
  "state": "AZ",
  "zipCode": "85326",
  "email": "Test.AZ@zywave.com",
  "cellPhone": "9999999999",
  "mailSame": "Y",
  "BI": "30/60",
  "PD": "15",
  "UMBI": "25/50",
  "UIMBI": "25/50",
  "MP": "500",
  "roadsideAssistance": "Y",
  "unacceptableRisk": "N",
  "renewalDiscount": "N",
  "advanceDiscount": "N",
  "payplan": "EFTCC",
  "homeownerDiscount": "Y",
  "ispriorpolicy": "YES",
  "priordayslapse": "10",
  "priorexpirationdate": "2025/06/28",
  "monthsinprior": "5",
  "ispriorinsameagency": "YES",
  "vehicles": [
    {
      "year": 2022,
      "make": "TOYOTA",
      "model": "CAMRY",
      "trim": "SE",
      "vin": "4T1G11AK9NU630788",
      "SE": "N",
      "TR": "Y",
      "COM": "500",
      "COL": "500",
      "vehicleUse": "WRK",
      "antitheft": "PAA",
      "braking": "ABSS",
      "price": 27245.0,
      "drivetype": "2WD"
    }
  ],
  "drivers": [
    {
      "firstName": "Test4",
      "lastName": "ITC0307",
      "dob": "1979/11/26",
      "gender": "M",
      "married": "Y",
      "licenseNumber": "A53454557",
      "licenseState": "AZ",
      "licenseStatus": "RVKD",
      "sr22": "Y",
      "Sr22Date": "2022/11/11"
    }
  ]
}
```

### Request Body Properties

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `action` | string | ✅ | API action identifier (must be `RATEQUOTE`) |
| `username` | string | ✅ | API username credential |
| `password` | string | ✅ | API password credential |
| `producerCode` | string | ✅ | Producer or agency code |
| `transType` | string | ✅ | Transaction type (e.g., `NB` for New Business) |
| `policyTerm` | string | ✅ | Duration of policy (e.g., `6 Months`) |
| `inceptionDate` | string | ✅ | Policy inception date (YYYY/MM/DD) |
| `effectiveDate` | string | ✅ | Policy effective date |
| `rateDate` | string | ✅ | Date quote is rated on |
| `holderFirstName` | string | ✅ | Policyholder first name |
| `holderMiddleInitial` | string | ❌ | Policyholder middle initial |
| `holderLastName` | string | ✅ | Policyholder last name |
| `address` | string | ✅ | Street address of policyholder |
| `city` | string | ✅ | City of policyholder |
| `state` | string | ✅ | Two-letter state code |
| `zipCode` | string | ✅ | ZIP/postal code |
| `email` | string | ❌ | Policyholder's email address |
| `cellPhone` | string | ❌ | Policyholder's contact number |
| `mailSame` | string | ❌ | Indicates if mailing address is same as physical (Y/N) |
| `BI` | string | ✅ | Bodily Injury liability limits |
| `PD` | string | ✅ | Property Damage limit |
| `UMBI` | string | ❌ | Uninsured Motorist Bodily Injury limit |
| `UIMBI` | string | ❌ | Underinsured Motorist Bodily Injury limit |
| `MP` | string | ❌ | Medical Payments limit |
| `roadsideAssistance` | string | ❌ | Y/N – Whether roadside assistance is included |
| `unacceptableRisk` | string | ❌ | Indicates if the risk is unacceptable |
| `renewalDiscount` | string | ❌ | Applies renewal discount if Y |
| `advanceDiscount` | string | ❌ | Applies advance quote discount if Y |
| `payplan` | string | ✅ | Payment plan preference (e.g., `EFTCC`) |
| `homeownerDiscount` | string | ❌ | Indicates if homeowner discount applies |
| `ispriorpolicy` | string | ❌ | Indicates if insured had prior policy (YES/NO) |
| `priordayslapse` | string | ❌ | Days lapsed since last policy |
| `priorexpirationdate` | string | ❌ | Expiration date of prior policy |
| `monthsinprior` | string | ❌ | Number of months prior insurance was active |
| `ispriorinsameagency` | string | ❌ | Whether the prior policy was with the same agency |
| `vehicles` | array | ✅ | List of vehicles to be rated |
| `drivers` | array | ✅ | List of drivers included in the quote |

### Vehicle Object Properties

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `year` | int | ✅ | Vehicle year |
| `make` | string | ✅ | Manufacturer name |
| `model` | string | ✅ | Vehicle model name |
| `trim` | string | ❌ | Trim level |
| `vin` | string | ❌ | Vehicle Identification Number |
| `SE` | string | ❌ | Safety Equipment |
| `TR` | string | ❌ | Towing and Rental |
| `COM` | string | ❌ | Comprehensive deductible amount |
| `COL` | string | ❌ | Collision deductible amount |
| `vehicleUse` | string | ✅ | Usage type (e.g., WRK, SCH, PLS, ART, BUS) |
| `antitheft` | string | ❌ | Anti-theft system code |
| `braking` | string | ❌ | Braking system type (e.g., ABSS) |
| `price` | decimal | ❌ | Vehicle value or MSRP |
| `drivetype` | string | ❌ | Drivetrain type (2WD/4WD) |

### Driver Object Properties

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `firstName` | string | ✅ | Driver's first name |
| `lastName` | string | ✅ | Driver's last name |
| `dob` | string | ✅ | Date of birth (YYYY/MM/DD) |
| `gender` | string | ✅ | Gender (M/F) |
| `married` | string | ✅ | Marital status (Y/N) |
| `licenseNumber` | string | ✅ | Driver's license number |
| `licenseState` | string | ✅ | State that issued the license |
| `licenseStatus` | string | ✅ | Current license status (MX, INT, SUSP, EX, RVKD, VALID, etc.) |
| `sr22` | string | ✅ | Indicates if SR-22 filing is required (Y/N) |
| `Sr22Date` | string | ❌ | SR-22 effective date |

### Response Example

```json
{
  "quoteCode": "53499",
  "quotePremium": 855.54,
  "quoteFeesTotal": 130.00,
  "quoteTotal": 985.54,
  "policyFee": 85.00,
  "drivers": [
    {
      "firstName": "Cctx",
      "lastName": "Txtest",
      "driverAge": 32,
      "rateOrder": 1
    }
  ],
  "coverages": [
    { "coverageCode": "BI", "coverageLimit": "30/60", "coverageTotal": 205.43 },
    { "coverageCode": "PD", "coverageLimit": "25", "coverageTotal": 100.22 },
    { "coverageCode": "UMBI", "coverageLimit": "30/60", "coverageTotal": 180.76 }
  ],
  "payplan": [
    {
      "description": "6 Monthly Payments-Direct Billing",
      "downPayment": 251.25,
      "downPercent": 20.00,
      "totalPremium": 1136.50,
      "instalments": 6,
      "refCode": "6P2"
    }
  ],
  "viewQuote": "https://pi-cc-dev.azurewebsites.net/quote/bridge/.../",
  "consumerBridge": "https://pi-consumer-dev.azurewebsites.net/quote/.../"
}
```

### Response Properties

| Field | Type | Description |
|-------|------|-------------|
| `quoteCode` | string | Unique identifier for the generated quote |
| `quotePremium` | decimal | Base premium before additional fees |
| `quoteFeesTotal` | decimal | Total amount of applicable fees |
| `quoteTotal` | decimal | Combined total of premium and fees |
| `policyFee` | decimal | Flat fee applied per policy |
| `drivers` | array | List of rated driver objects |
| `coverages` | array | List of coverages and their limits/premiums |
| `payplan` | array | Available payment plan options |
| `viewQuote` | string | URL to view quote in agent portal |
| `consumerBridge` | string | URL to open quote in consumer portal |

### Coverage Object Properties

| Field | Type | Description |
|-------|------|-------------|
| `coverageCode` | string | Coverage type code (e.g., BI, PD) |
| `coverageLimit` | string | Coverage limits |
| `coverageTotal` | decimal | Premium amount for the coverage |

### Payplan Object Properties

| Field | Type | Description |
|-------|------|-------------|
| `description` | string | Payment plan description |
| `downPayment` | decimal | Initial down payment required |
| `downPercent` | decimal | Down payment as a percentage of total |
| `totalPremium` | decimal | Total policy premium under this plan |
| `instalments` | int | Number of instalments in the plan |
| `refCode` | string | Reference code for the plan |

### Notes
- Dates must be formatted as `YYYY/MM/DD`
- All monetary values are in decimal format
- The `vehicles` and `drivers` arrays must contain at least one object each
- The `action` field in the request must always be set to `"RATEQUOTE"` for this API call

---

## Texas (TX)

### Request Body Example

```json
{
  "action": "RATEQUOTE",
  "username": "XXXXXXX",
  "password": "XXXXXXX",
  "producerCode": "XXXXXXX",
  "transType": "NB",
  "policyTerm": "6 Months",
  "inceptionDate": "2025/11/01",
  "effectiveDate": "2025/11/01",
  "rateDate": "2025/08/28",
  "holderFirstName": "CCTX",
  "holderMiddleInitial": "",
  "holderLastName": "TXTest",
  "address": "13808 Tercel Trce",
  "address2": "",
  "city": "MANOR",
  "state": "TX",
  "zipCode": "78653",
  "email": "fdeliva@zywave.com",
  "cellPhone": "1234567891",
  "mailSame": "Y",
  "mailAddress": "",
  "mailAddress2": "",
  "mailCity": "",
  "mailState": "",
  "mailZipCode": "",
  "BI": "30/60",
  "PD": "25",
  "UMBI": "30/60",
  "UIMBI": "30/60",
  "UMPD": "25",
  "MP": "None",
  "PIP": "2500",
  "roadsideAssistance": "Y",
  "unacceptableRisk": "N",
  "renewalDiscount": "N",
  "advanceDiscount": "N",
  "payplan": "EFTCC",
  "homeownerDiscount": "Y",
  "ispriorpolicy": "YES",
  "priorpolicynumber": "",
  "priordayslapse": 27,
  "priorexpirationdate": "2025/08/01",
  "monthsinprior": 15,
  "priorbicoveragelimit": "30/60",
  "priorpipcoveragelimit": 30,
  "vehicles": [
    {
      "year": 2022,
      "make": "TOYOTA",
      "model": "CAMRY",
      "trim": "NIGHT SHADE",
      "vin": "4T1S11BK0N",
      "roadsideAssistance": "Y",
      "SE": "N",
      "TR": "Y",
      "COM": "1000",
      "COL": "1000",
      "vehicleUse": "WRK",
      "platenumber": "1234567",
      "platestate": "TX",
      "antitheft": "PAA",
      "braking": "ABSS",
      "price": 28785.0,
      "weight": 0,
      "drivetype": "2WD",
      "ridesharing": "N",
      "vehiclepurchasedate": "2025/01/01",
      "estimatemilage": 100000,
      "ownershiplength": "NOREG"
    }
  ],
  "drivers": [
    {
      "firstName": "CCTX",
      "lastName": "TXTest",
      "dob": "1993/04/23",
      "gender": "F",
      "married": "N",
      "points": 0,
      "licenseNumber": "",
      "licenseState": "TX",
      "licenseStatus": "DUSA",
      "employerName": "",
      "occupation": "Other",
      "businessPhone": "",
      "sr22": "N",
      "excludeFromCoverage": "N",
      "av12": 0,
      "av24": 0,
      "av36": 0,
      "driverDNA": 10,
      "violations": [
        {
          "date": "2022/11/26",
          "code": "ADMOV",
          "description": "Driving Too Slow for Conditions",
          "points": "0"
        }
      ]
    }
  ]
}
```

### Request Body Parameters

All common parameters are identical to Arizona, with the following Texas-specific additions:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `address2` | string | ❌ | Additional address line (optional) |
| `UMPD` | string | ❌ | Uninsured Motorist Property Damage coverage limit |
| `PIP` | string | ❌ | Personal Injury Protection coverage limit |
| `priorpolicynumber` | string | ❌ | Prior policy number, if applicable |
| `priorbicoveragelimit` | string | ❌ | Prior Bodily Injury coverage limit |
| `priorpipcoveragelimit` | decimal | ❌ | Prior Personal Injury Protection coverage limit |

### Vehicle Object Properties (Texas)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `year` | int | ✅ | Vehicle model year |
| `make` | string | ✅ | Manufacturer name |
| `model` | string | ✅ | Vehicle model name |
| `trim` | string | ❌ | Vehicle trim or variant |
| `vin` | string | ❌ | Vehicle Identification Number |
| `roadsideAssistance` | string | ❌ | Indicates roadside coverage (Y/N) |
| `SE` | string | ❌ | Safety Equipment indicator |
| `TR` | string | ❌ | Towing and Rental coverage indicator |
| `COM` | string | ❌ | Comprehensive deductible amount |
| `COL` | string | ❌ | Collision deductible amount |
| `vehicleUse` | string | ✅ | Vehicle use type (WRK, BUS, SCH, PLS, ART) |
| `platenumber` | string | ❌ | Vehicle's license plate number |
| `platestate` | string | ❌ | State associated with the plate |
| `antitheft` | string | ❌ | Anti-theft system type or code |
| `braking` | string | ❌ | Braking system type (e.g., ABSS) |
| `price` | decimal | ❌ | Market value or MSRP of the vehicle |
| `weight` | decimal | ❌ | Vehicle weight in pounds or kilograms |
| `drivetype` | string | ❌ | Drivetrain configuration (2WD, 4WD) |
| `ridesharing` | string | ❌ | Indicates if vehicle is used for ride-sharing (Y/N) |
| `vehiclepurchasedate` | string | ❌ | Date the vehicle was purchased (YYYY/MM/DD) |
| `estimatemilage` | int | ❌ | Estimated vehicle mileage |
| `ownershiplength` | string | ❌ | Duration of vehicle ownership (NOREG, etc.) |

### Driver Object Properties (Texas)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `firstName` | string | ✅ | Driver's first name |
| `lastName` | string | ✅ | Driver's last name |
| `dob` | string | ✅ | Date of birth (YYYY/MM/DD) |
| `gender` | string | ✅ | Gender (M or F) |
| `married` | string | ❌ | Marital status (Y/N) |
| `points` | int | ❌ | Driver's current point total |
| `licenseNumber` | string | ❌ | Driver's license number |
| `licenseState` | string | ✅ | State of license issuance |
| `licenseStatus` | string | ❌ | License status (VALID, SUSP, etc.) |
| `employerName` | string | ❌ | Employer name (if applicable) |
| `occupation` | string | ❌ | Driver's occupation |
| `businessPhone` | string | ❌ | Employer contact number |
| `sr22` | string | ❌ | Indicates if SR-22 filing is required (Y/N) |
| `excludeFromCoverage` | string | ❌ | Whether the driver is excluded from coverage (Y/N) |
| `av12` | int | ❌ | Number of accidents/violations in past 12 months |
| `av24` | int | ❌ | Number of accidents/violations in past 24 months |
| `av36` | int | ❌ | Number of accidents/violations in past 36 months |
| `driverDNA` | int | ❌ | Risk factor score for driver |
| `violations` | array | ❌ | List of violations or infractions |

### Violation Object

| Field | Type | Description |
|-------|------|-------------|
| `date` | string | Date of violation (YYYY/MM/DD) |
| `code` | string | Violation code (e.g., ADMOV) |
| `description` | string | Description of the violation |
| `points` | string | Points assigned for the violation |

### Response Example

```json
{
  "quoteCode": "TX-122345",
  "quotePremium": 920.75,
  "quoteFeesTotal": 140.00,
  "quoteTotal": 1060.75,
  "policyFee": 85.00,
  "drivers": [
    {
      "firstName": "CCTX",
      "lastName": "TXTest",
      "driverAge": 32,
      "rateOrder": 1
    }
  ],
  "coverages": [
    { "coverageCode": "BI", "coverageLimit": "30/60", "coverageTotal": 225.43 },
    { "coverageCode": "PD", "coverageLimit": "25", "coverageTotal": 110.22 },
    { "coverageCode": "UMBI", "coverageLimit": "30/60", "coverageTotal": 190.76 },
    { "coverageCode": "PIP", "coverageLimit": "2500", "coverageTotal": 85.12 }
  ],
  "payplan": [
    {
      "description": "6 Monthly Payments - Direct Billing",
      "downPayment": 260.25,
      "downPercent": 20.00,
      "totalPremium": 1060.75,
      "instalments": 6,
      "refCode": "6P2"
    }
  ],
  "viewQuote": "https://pi-cc-dev.azurewebsites.net/quote/bridge/...",
  "consumerBridge": "https://pi-consumer-dev.azurewebsites.net/quote/..."
}
```

### Response Properties

| Field | Type | Description |
|-------|------|-------------|
| `quoteCode` | string | Unique identifier for the generated quote |
| `quotePremium` | decimal | Base premium before additional fees |
| `quoteFeesTotal` | decimal | Total applicable fees |
| `quoteTotal` | decimal | Combined total of premium and fees |
| `policyFee` | decimal | Flat policy-level fee |
| `drivers` | array | List of rated driver details |
| `coverages` | array | Coverage types, limits, and premium amounts |
| `payplan` | array | Available payment plan options |
| `viewQuote` | string | URL to view quote in the agent portal |
| `consumerBridge` | string | URL for consumer access to quote |

### Coverage Object Properties

| Field | Type | Description |
|-------|------|-------------|
| `coverageCode` | string | Coverage type (e.g., BI, PD, UMPD, PIP) |
| `coverageLimit` | string | Coverage limit values |
| `coverageTotal` | decimal | Premium amount for the specific coverage |

### Payplan Object Properties

| Field | Type | Description |
|-------|------|-------------|
| `description` | string | Payment plan description |
| `downPayment` | decimal | Initial down payment |
| `downPercent` | decimal | Percentage of total as down payment |
| `totalPremium` | decimal | Total premium amount under this plan |
| `instalments` | int | Number of instalment payments |
| `refCode` | string | Reference code identifying payment plan |

### Note
- All dates should be formatted as `YYYY/MM/DD`
- Fields marked with ✅ are required
- Fields marked with ❌ are optional
- The `vehicles` and `drivers` arrays must contain at least one object each

---

## Texas (TX) Non-Owner Policy

### Request Body Example

```json
{
  "action": "RATEQUOTE",
  "username": "test@ochoinsurance.com",
  "password": "Ocho$2025",
  "producerCode": "TX1136",
  "transType": "NB",
  "policyTerm": "6 Months",
  "inceptionDate": "2025/11/01",
  "effectiveDate": "2025/11/01",
  "rateDate": "2025/08/28",
  "holderFirstName": "CCTX",
  "holderMiddleInitial": "",
  "holderLastName": "TXTest",
  "address": "13808 Tercel Trce",
  "address2": "",
  "city": "MANOR",
  "state": "TX",
  "zipCode": "78653",
  "email": "fdeliva@zywave.com",
  "cellPhone": "1234567891",
  "mailSame": "Y",
  "mailAddress": "",
  "mailAddress2": "",
  "mailCity": "",
  "mailState": "",
  "mailZipCode": "",
  "BI": "30/60",
  "PD": "25",
  "UMBI": "30/60",
  "UIMBI": "30/60",
  "UMPD": "25",
  "MP": "None",
  "PIP": "2500",
  "unacceptableRisk": "N",
  "renewalDiscount": "N",
  "advanceDiscount": "N",
  "payplan": "EFTCC",
  "homeownerDiscount": "Y",
  "ispriorpolicy": "YES",
  "priorpolicynumber": "",
  "priordayslapse": 27,
  "priorexpirationdate": "2025/08/01",
  "monthsinprior": 15,
  "priorbicoveragelimit": "30/60",
  "priorpipcoveragelimit": 30,
  "IsNonOwner": "Y",
  "drivers": [
    {
      "firstName": "CCTX",
      "lastName": "TXTest",
      "dob": "1993/04/23",
      "gender": "F",
      "married": "N",
      "points": 0,
      "licenseNumber": "",
      "licenseState": "TX",
      "licenseStatus": "DUSA",
      "employerName": "",
      "occupation": "Other",
      "businessPhone": "",
      "sr22": "N",
      "excludeFromCoverage": "N",
      "av12": 0,
      "av24": 0,
      "av36": 0,
      "driverDNA": 10,
      "violations": [
        {
          "date": "2022/11/26",
          "code": "ADMOV",
          "description": "Driving Too Slow for Conditions",
          "points": "0"
        }
      ]
    }
  ]
}
```

### Request Body Parameters

#### General Parameters

All base parameters remain consistent with the Texas (Owned Vehicle) request, except:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `IsNonOwner` | string | ✅ | Indicates the policy type. Set to `"Y"` for Non-Owner policies |
| `vehicles` | array | ❌ | Excluded for Non-Owner policies. No vehicle information should be sent |

Other fields such as `BI`, `PD`, `UMBI`, `UIMBI`, `UMPD`, `MP`, `PIP`, and prior insurance details apply the same as standard Texas quote requests.

### Driver Object Properties (Texas – Non-Owner)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `firstName` | string | ✅ | Driver's first name |
| `lastName` | string | ✅ | Driver's last name |
| `dob` | string | ✅ | Date of birth (YYYY/MM/DD) |
| `gender` | string | ✅ | Gender (M or F) |
| `married` | string | ❌ | Marital status (Y/N) |
| `points` | int | ❌ | Driver's total violation points |
| `licenseNumber` | string | ❌ | Driver's license number |
| `licenseState` | string | ✅ | State of license issuance |
| `licenseStatus` | string | ❌ | License status (VALID, SUSP, etc.) |
| `employerName` | string | ❌ | Driver's employer name |
| `occupation` | string | ❌ | Driver's occupation or industry |
| `businessPhone` | string | ❌ | Employer or driver's work phone |
| `sr22` | string | ❌ | Indicates if SR-22 filing is required (Y/N) |
| `excludeFromCoverage` | string | ❌ | Whether the driver is excluded from coverage (Y/N) |
| `av12` | int | ❌ | Violations in past 12 months |
| `av24` | int | ❌ | Violations in past 24 months |
| `av36` | int | ❌ | Violations in past 36 months |
| `driverDNA` | int | ❌ | Risk factor or internal scoring metric |
| `violations` | array | ❌ | List of recent traffic or license violations |

### Violation Object

| Field | Type | Description |
|-------|------|-------------|
| `date` | string | Date of violation (YYYY/MM/DD) |
| `code` | string | Violation code (e.g., ADMOV) |
| `description` | string | Description of the violation |
| `points` | string | Points assigned for the violation |

### Response Example

```json
{
  "quoteCode": "TXNO-88221",
  "quotePremium": 412.50,
  "quoteFeesTotal": 80.00,
  "quoteTotal": 492.50,
  "policyFee": 60.00,
  "drivers": [
    {
      "firstName": "CCTX",
      "lastName": "TXTest",
      "driverAge": 32,
      "rateOrder": 1
    }
  ],
  "coverages": [
    { "coverageCode": "BI", "coverageLimit": "30/60", "coverageTotal": 160.00 },
    { "coverageCode": "PD", "coverageLimit": "25", "coverageTotal": 95.50 },
    { "coverageCode": "UMBI", "coverageLimit": "30/60", "coverageTotal": 110.75 },
    { "coverageCode": "PIP", "coverageLimit": "2500", "coverageTotal": 46.25 }
  ],
  "payplan": [
    {
      "description": "6 Monthly Payments - Direct Billing",
      "downPayment": 98.50,
      "downPercent": 20.00,
      "totalPremium": 492.50,
      "instalments": 6,
      "refCode": "6P2"
    }
  ],
  "viewQuote": "https://pi-cc-dev.azurewebsites.net/quote/bridge/...",
  "consumerBridge": "https://pi-consumer-dev.azurewebsites.net/quote/..."
}
```

### Response Properties

| Field | Type | Description |
|-------|------|-------------|
| `quoteCode` | string | Unique identifier for the Non-Owner quote |
| `quotePremium` | decimal | Base premium before fees |
| `quoteFeesTotal` | decimal | Total of all applicable fees |
| `quoteTotal` | decimal | Final total premium (premium + fees) |
| `policyFee` | decimal | Flat fee per issued policy |
| `drivers` | array | List of rated drivers (non-owner insured) |
| `coverages` | array | Selected coverages with limits and premiums |
| `payplan` | array | Available payment plan options |
| `viewQuote` | string | URL for agent portal quote view |
| `consumerBridge` | string | URL for consumer quote access |

### Coverage Object Properties

| Field | Type | Description |
|-------|------|-------------|
| `coverageCode` | string | Type of coverage (e.g., BI, PD, UMPD, PIP) |
| `coverageLimit` | string | Coverage limits or amount |
| `coverageTotal` | decimal | Premium associated with each coverage |

### Payplan Object Properties

| Field | Type | Description |
|-------|------|-------------|
| `description` | string | Payment plan description |
| `downPayment` | decimal | Initial down payment required |
| `downPercent` | decimal | Percentage of total premium as down payment |
| `totalPremium` | decimal | Total premium under this plan |
| `instalments` | int | Number of instalment payments |
| `refCode` | string | Payment plan reference code |

### Notes
- The `vehicles` array must not be included in the request for Non-Owner policies
- The `IsNonOwner` field must be set to `"Y"` to indicate a Non-Owner policy
- All date fields use the format `YYYY/MM/DD`
- The API requires authentication credentials in every request body
- Coverage codes such as BI, PD, UMBI, UIMBI, UMPD, MP, and PIP correspond to specific coverage types and limits applicable to Texas insurance policies

---

## Mapping Data Tables

### 1. Arizona Coverage Limits

| Code | Limit Code | Limit |
|------|------------|-------|
| BI | 25/50 | 25,000/50,000 |
| BI | 50/100 | 50,000/100,000 |
| BI | 100/300 | 100,000/300,000 |
| PD | 15 | $15,000 |
| PD | 25 | $25,000 |
| PD | 50 | $50,000 |
| UMBI | 25/50 | 25,000/50,000 |
| UMBI | 50/100 | 50,000/100,000 |
| UMBI | 100/300 | 100,000/300,000 |
| UIMBI | 25/50 | 25,000/50,000 |
| UIMBI | 50/100 | 50,000/100,000 |
| UIMBI | 100/300 | 100,000/300,000 |
| MP | 500 | $500 |
| MP | 1000 | $1,000 |
| MP | 2000 | $2,000 |
| MP | 5000 | $5,000 |
| COM | 500 | $500 |
| COM | 1000 | $1,000 |
| COL | 500 | $500 |
| COL | 1000 | $1,000 |
| TR | Y | Yes |
| TR | N | No |
| SE | Y | Yes |
| SE | N | No |

**Description:**  
This table lists the coverage limits available for Arizona insurance policies, including Bodily Injury (BI), Property Damage (PD), Uninsured Motorist Bodily Injury (UMBI), Underinsured Motorist Bodily Injury (UIMBI), Medical Payments (MP), Comprehensive (COM), Collision (COL), Towing and Labor (TR), and Special Equipment (SE).

### 2. Vehicle Usage Types

| Usage Type | Code |
|------------|------|
| Work | WRK |
| School | SCH |
| Pleasure | PLS |
| Artisan | ART |
| Business | BUS |

**Description:**  
Defines the codes used to specify the primary usage type of a vehicle.

### 3. Occupation Types

| Code | Description |
|------|-------------|
| OTHER | Other |
| ADMINISTRATIVE | Administrative |
| ARTISAN | Artisan |
| ATHLETE | Athlete |
| CARPENTER | Carpenter |
| CELEBRITY | Celebrity |
| CLERGY | Clergy |
| CLERICAL | Clerical |
| CONSULTANT | Consultant |
| CUSTODIANJANITOR | Custodian/Janitor |
| DRIVER | Driver |
| EMERGENCYSERVICES | Emergency Services |
| ELECTRICIAN | Electrician |
| GENERALCONTRACTOR | General Contractor |
| GENERALLABOR | General Labor |
| HEALTHCAREPROVIDER | Healthcare Provider |
| HOMEMAKER | Homemaker |
| MILITARY | Military |
| NOTEMPLOYED | Not Employed |
| PAINTER | Painter |
| PROFESSIONAL | Professional - College Level or Greater |
| SALESMARKETINGAGENT | Sales/Marketing/Agent |
| STUDENT | Student |
| LABOR | Technical/Skilled Labor |

**Description:**  
Lists occupation codes and their corresponding descriptions used for insurance or employment classification.

### 4. Pay Plan Types

| Code | Description |
|------|-------------|
| FP | Full premium payment |
| 6P | 6 Monthly Payments - EFT or Recurring CC |
| 6P2 | 6 Monthly Payments - Direct Billing |

**Description:**  
Specifies the payment plan options available for insurance premiums.

### 5. Relation Types

| Code | Description |
|------|-------------|
| INSURED | Insured |
| SPOUSE | Spouse |
| PARENT | Parent |
| RELATIVE | Relative |
| CHILD | Child |
| OTHER | Other |

**Description:**  
Defines relationship codes used to specify the relation of a person to the insured.

### 6. Texas Coverage Display Table

| Code | DisplayTextValue | CoverageValue |
|------|------------------|---------------|
| BI | 30,000/60,000 | 30/60 |
| PD | $25,000 | 25 |
| UMBI | 30,000/60,000 | 30/60 |
| UIMBI | 30,000/60,000 | 30/60 |
| MP | $500 | 500 |
| MP | $1,000 | 1000 |
| MP | $2,000 | 2000 |
| MP | $5,000 | 5000 |
| COLL | $250 | 250 |
| COLL | $500 | 500 |
| COLL | $1,000 | 1000 |
| CMP | $250 | 250 |
| CMP | $500 | 500 |
| CMP | $1,000 | 1000 |
| TR | Yes | Yes |
| TR | No | No |
| PIP | $2,500 | 2500 |
| UMPD | $25,000 | 25 |

**Description:**  
Coverage limits and display values for Texas insurance policies.

### 7. Ownership Length

| Name | Code |
|------|------|
| Not registered in my name | NOREG |
| 1–60 days | 60DAY |
| 61 days – 6 months | 6MON |
| 6 months – 1 year | 1YR |
| 1 year – 2 years | 2YR |
| 2 years – 3 years | 3YR |
| 3 years – 5 years | 5YR |
| 5 years+ | 5YRP |
| Unknown | UNK |

**Description:**  
Codes representing the length of vehicle ownership.


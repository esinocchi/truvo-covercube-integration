// Test fixtures for QuoteInput based on Postman collection examples
// Updated to match requirements JSON exactly

import type { 
  ArizonaQuoteInput, 
  TexasQuoteInput, 
  TexasNonOwnerQuoteInput 
} from "@/zod-schemas/covercube";

/**
 * Arizona policy example
 * Based on Postman "AZ" request
 * Compliant with AZ requirements (excludes all TX-only fields)
 */
export const arizonaQuoteInput: ArizonaQuoteInput = {
  // Transaction details
  policyTerm: "6 Months",
  inceptionDate: "2025/11/01",
  effectiveDate: "2025/11/01",
  rateDate: "2024/11/28",

  // Policyholder info
  holderFirstName: "Test4",
  holderMiddleInitial: "A",
  holderLastName: "ITC0307",
  address: "235 S 190th Ave",
  city: "BUCKEYE",
  state: "AZ",
  zipCode: "85326",
  email: "Test.AZ@zywave.com",
  cellPhone: "9999999999",
  mailSame: "Y",

  // Coverage (using documented AZ limits)
  BI: "25/50",
  PD: "15",
  UMBI: "25/50",
  UIMBI: "25/50",
  MP: "500",
  roadsideAssistance: "Y",

  // Discounts & flags
  unacceptableRisk: "N",
  renewalDiscount: "N",
  advanceDiscount: "N",
  payplan: "EFTCC",
  homeownerDiscount: "Y",

  // Prior insurance
  ispriorpolicy: "YES",
  priordayslapse: "10",
  priorexpirationdate: "2025/06/28",
  monthsinprior: "5",
  ispriorinsameagency: "YES",

  // Vehicles (AZ-compliant: no plate fields, no TX-specific fields)
  vehicles: [
    {
      year: 2022,
      make: "TOYOTA",
      model: "CAMRY",
      trim: "SE",
      vin: "4T1G11AK9NU630788",
      SE: "N",
      TR: "Y",
      COM: "500",
      COL: "500",
      vehicleUse: "WRK",
      antitheft: "PAA",
      braking: "ABSS",
      price: 27245.0,
      drivetype: "2WD",
    },
    {
      year: 2022,
      make: "MITSUBISHI",
      model: "MIRAGE",
      trim: "G4 BLACK EDIT",
      vin: "ML32FUFJ7N",
      SE: "N",
      TR: "N",
      COM: "500",
      COL: "500",
      vehicleUse: "WRK",
      antitheft: "PAA",
      braking: "ABSS",
      price: 15645.0,
      drivetype: "2WD",
      parties: [
        {
          partyName: "Bank of America (Auto)",
          partyType: "Additional Interest",
          address1: "Waffle",
          address2: "Wef",
          city: "Wef",
          state: "DE",
          zip: "12312",
        },
      ],
    },
  ],

  // Drivers (AZ-compliant: required fields for AZ)
  drivers: [
    {
      firstName: "Test4",
      lastName: "ITC0307",
      dob: "1979/11/26",
      gender: "M",
      married: "Y",
      licenseNumber: "A53454557",
      licenseState: "AZ",
      licenseStatus: "RVKD",
      sr22: "Y",
      Sr22Date: "2022/11/11",
    },
    {
      firstName: "FeTest",
      lastName: "AZ",
      dob: "1980/11/26",
      gender: "F",
      married: "Y",
      licenseNumber: "D55654588",
      licenseState: "AZ",
      licenseStatus: "INT",
      sr22: "N",
      Sr22Date: "2022/11/26",
    },
  ],
};

/**
 * Texas regular policy example
 * Based on Postman "TX" request
 * Compliant with TX requirements (includes TX-optional fields)
 */
export const texasQuoteInput: TexasQuoteInput = {
  // Transaction details
  policyTerm: "6 Months",
  inceptionDate: "2025/11/01",
  effectiveDate: "2025/11/01",
  rateDate: "2025/08/28",

  // Policyholder info
  holderFirstName: "CCTX",
  holderMiddleInitial: "",
  holderLastName: "TXTest",
  address: "13808 Tercel Trce",
  address2: "Apt 123",
  city: "MANOR",
  state: "TX",
  zipCode: "78653",
  email: "fdeliva@zywave.com",
  cellPhone: "1234567891",
  mailSame: "Y",
  mailAddress: "PO Box 123",
  mailAddress2: "",
  mailCity: "MANOR",
  mailState: "TX",
  mailZipCode: "78653",

  // Coverage
  BI: "30/60",
  PD: "25",
  UMBI: "30/60",
  UIMBI: "30/60",
  UMPD: "25",
  MP: "500",
  PIP: "2500",
  roadsideAssistance: "Y",

  // Discounts & flags
  unacceptableRisk: "N",
  renewalDiscount: "N",
  advanceDiscount: "N",
  payplan: "EFTCC",
  homeownerDiscount: "Y",

  // Prior insurance (TX-specific fields)
  ispriorpolicy: "YES",
  priorpolicynumber: "TX123456",
  priordayslapse: 27,
  priorexpirationdate: "2025/08/01",
  monthsinprior: 15,
  priorbicoveragelimit: "30/60",
  priorpipcoveragelimit: 30,

  // Vehicles (TX-compliant: includes TX-optional fields)
  vehicles: [
    {
      year: 2022,
      make: "TOYOTA",
      model: "CAMRY",
      trim: "NIGHT SHADE",
      vin: "4T1S11BK0N",
      roadsideAssistance: "Y",
      SE: "N",
      TR: "Y",
      COM: "1000",
      COL: "1000",
      vehicleUse: "WRK",
      platenumber: "1234567",
      platestate: "TX",
      antitheft: "PAA",
      braking: "ABSS",
      price: 28785.0,
      weight: 3500,
      drivetype: "2WD",
      ridesharing: "N",
      vehiclepurchasedate: "2025/01/01",
      estimatemilage: 100000,
      ownershiplength: "NOREG",
    },
  ],

  // Drivers (TX-compliant: optional TX fields)
  drivers: [
    {
      firstName: "CCTX",
      lastName: "TXTest",
      dob: "1993/04/23",
      gender: "F",
      licenseState: "TX",
      married: "N",
      points: 0,
      licenseNumber: "TX123456",
      licenseStatus: "DUSA",
      employerName: "Acme Corp",
      occupation: "OTHER",
      businessPhone: "5551234567",
      sr22: "N",
      excludeFromCoverage: "N",
      av12: 0,
      av24: 0,
      av36: 0,
      driverDNA: 10,
      violations: [
        {
          date: "2022/11/26",
          code: "ADMOV",
          description: "Driving Too Slow for Conditions",
          points: "0",
        },
      ],
    },
  ],
};

/**
 * Texas non-owner policy example
 * Based on Postman "TX No-Owner" request
 * Compliant with TX non-owner requirements
 */
export const texasNonOwnerQuoteInput: TexasNonOwnerQuoteInput = {
  // Transaction details
  policyTerm: "6 Months",
  inceptionDate: "2025/11/01",
  effectiveDate: "2025/11/01",
  rateDate: "2025/08/28",

  // Policyholder info
  holderFirstName: "CCTX",
  holderMiddleInitial: "",
  holderLastName: "TXTest",
  address: "13808 Tercel Trce",
  address2: "",
  city: "MANOR",
  state: "TX",
  zipCode: "78653",
  email: "fdeliva@zywave.com",
  cellPhone: "1234567891",
  mailSame: "Y",
  mailAddress: "",
  mailAddress2: "",
  mailCity: "",
  mailState: "",
  mailZipCode: "",

  // Coverage (PIP and UMPD are optional per requirements)
  BI: "30/60",
  PD: "25",
  UMBI: "30/60",
  UIMBI: "30/60",
  UMPD: "25",
  MP: "500",
  PIP: "2500",

  // Discounts & flags
  unacceptableRisk: "N",
  renewalDiscount: "N",
  advanceDiscount: "N",
  payplan: "EFTCC",
  homeownerDiscount: "Y",

  // Prior insurance
  ispriorpolicy: "YES",
  priorpolicynumber: "",
  priordayslapse: 27,
  priorexpirationdate: "2025/08/01",
  monthsinprior: 15,
  priorbicoveragelimit: "30/60",
  priorpipcoveragelimit: 30,

  // Non-owner flag (required for non-owner)
  IsNonOwner: "Y",

  // Drivers (TX-compliant: optional TX fields)
  drivers: [
    {
      firstName: "CCTX",
      lastName: "TXTest",
      dob: "1993/04/23",
      gender: "F",
      licenseState: "TX",
      married: "N",
      points: 0,
      licenseNumber: "",
      licenseStatus: "DUSA",
      employerName: "",
      occupation: "OTHER",
      businessPhone: "",
      sr22: "N",
      excludeFromCoverage: "N",
      av12: 0,
      av24: 0,
      av36: 0,
      driverDNA: 10,
      violations: [
        {
          date: "2022/11/26",
          code: "ADMOV",
          description: "Driving Too Slow for Conditions",
          points: "0",
        },
      ],
    },
  ],
};

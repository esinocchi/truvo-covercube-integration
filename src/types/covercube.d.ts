// src/types/covercube.d.ts

/**
 * Type definitions for Covercube Rate Quote API
 * 
 * This file uses discriminated unions to enforce state-specific requirements
 * at compile-time. Each policy type (AZ, TX, TX Non-Owner) has its own
 * strictly-typed request interface.
 * 
 * Field requirements legend:
 * - Required fields: no `?` modifier
 * - Optional fields: `?` modifier
 * - Excluded fields: not present in the interface
 */

// ============================================
// UTILITY TYPES
// ============================================

export type State = "AZ" | "TX";

export type YesNo = "Y" | "N";

export type VehicleUse = "WRK" | "SCH" | "PLS" | "ART" | "BUS";

export type LicenseStatus = 
  | "VALID" 
  | "SUSP" 
  | "RVKD" 
  | "EX" 
  | "MX" 
  | "INT" 
  | "DUSA";

export type OwnershipLength = 
  | "NOREG" 
  | "60DAY" 
  | "6MON" 
  | "1YR" 
  | "2YR" 
  | "3YR" 
  | "5YR" 
  | "5YRP" 
  | "UNK";

export type Occupation =
  | "OTHER"
  | "ADMINISTRATIVE"
  | "ARTISAN"
  | "ATHLETE"
  | "CARPENTER"
  | "CELEBRITY"
  | "CLERGY"
  | "CLERICAL"
  | "CONSULTANT"
  | "CUSTODIANJANITOR"
  | "DRIVER"
  | "EMERGENCYSERVICES"
  | "ELECTRICIAN"
  | "GENERALCONTRACTOR"
  | "GENERALLABOR"
  | "HEALTHCAREPROVIDER"
  | "HOMEMAKER"
  | "MILITARY"
  | "NOTEMPLOYED"
  | "PAINTER"
  | "PROFESSIONAL"
  | "SALESMARKETINGAGENT"
  | "STUDENT"
  | "LABOR";

// ============================================
// SHARED/BASE TYPES
// ============================================

/**
 * Universal fields required by all policy types
 */
interface BaseCovercubeRequest {
  // Authentication & infrastructure (required)
  action: "RATEQUOTE";
  username: string;
  password: string;
  producerCode: string;
  transType: "NB" | "RN";
  
  // Policy dates (required)
  policyTerm: string;
  inceptionDate: string;
  effectiveDate: string;
  rateDate: string;
  
  // Policyholder info (required)
  holderFirstName: string;
  holderLastName: string;
  address: string;
  city: string;
  zipCode: string;
  
  // Coverage (required)
  BI: string;
  PD: string;
  payplan: string;
  
  // Drivers (required)
  drivers: Driver[];
  
  // Universal optional fields (optional for all states)
  holderMiddleInitial?: string;
  email?: string;
  cellPhone?: string;
  mailSame?: YesNo;
  UMBI?: string;
  UIMBI?: string;
  MP?: string;
  roadsideAssistance?: YesNo;
  unacceptableRisk?: YesNo;
  renewalDiscount?: YesNo;
  advanceDiscount?: YesNo;
  homeownerDiscount?: YesNo;
  ispriorpolicy?: "YES" | "NO";
  priordayslapse?: number | string;
  priorexpirationdate?: string;
  monthsinprior?: number | string;
  ispriorinsameagency?: "YES" | "NO";
}

/**
 * Shared vehicle fields present in both states
 */
interface BaseVehicle {
  // Required for all vehicles
  year: number;
  make: string;
  model: string;
  vehicleUse: VehicleUse;
  
  // Optional for all vehicles
  trim?: string;
  vin?: string;
  SE?: YesNo;
  TR?: YesNo;
  COM?: string;
  COL?: string;
  antitheft?: string;
  braking?: string;
  price?: number;
  drivetype?: "2WD" | "4WD";
  parties?: Party[];
}

/**
 * Base driver fields shared across states
 */
interface BaseDriver {
  // Required for all drivers
  firstName: string;
  lastName: string;
  dob: string;
  gender: "M" | "F";
  licenseState: string;
}

/**
 * Party/Lienholder information
 */
export interface Party {
  partyName: string;
  partyType: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zip: string;
}

/**
 * Violation record
 */
export interface Violation {
  date: string;
  code: string;
  description: string;
  points: string;
}

// ============================================
// ARIZONA-SPECIFIC TYPES
// ============================================

/**
 * Arizona vehicle - excludes TX-specific fields
 */
export interface ArizonaVehicle extends BaseVehicle {
  // No platenumber, platestate, weight, ridesharing, vehiclepurchasedate, 
  // estimatemilage, ownershiplength (all marked as 0 in requirements)
}

/**
 * Arizona driver - has different required fields than TX
 */
export interface ArizonaDriver extends BaseDriver {
  // Required for Arizona (2)
  married: YesNo;
  licenseNumber: string;
  licenseStatus: LicenseStatus;
  sr22: YesNo;
  
  // Optional for Arizona (1)
  Sr22Date?: string;
  
  // TX fields excluded (0): points, employerName, occupation, businessPhone,
  // excludeFromCoverage, av12, av24, av36, driverDNA, violations
}

/**
 * Arizona policy request
 */
export interface ArizonaCovercubeRequest extends BaseCovercubeRequest {
  state: "AZ";
  vehicles: ArizonaVehicle[]; // Required (2)
  drivers: ArizonaDriver[];
  
  // All TX-specific fields excluded (0):
  // address2, UMPD, PIP, priorpolicynumber, priorbicoveragelimit,
  // priorpipcoveragelimit, IsNonOwner
}

// ============================================
// TEXAS-SPECIFIC TYPES
// ============================================

/**
 * Texas vehicle - includes TX-specific optional fields
 */
export interface TexasVehicle extends BaseVehicle {
  // Optional for Texas vehicles (1)
  platenumber?: string;
  platestate?: string;
  weight?: number;
  ridesharing?: YesNo;
  vehiclepurchasedate?: string;
  estimatemilage?: number;
  ownershiplength?: OwnershipLength;
  roadsideAssistance?: YesNo;
}

/**
 * Texas driver - includes TX-specific optional fields
 */
export interface TexasDriver extends BaseDriver {
  // Optional for Texas (1)
  married?: YesNo;
  licenseNumber?: string;
  licenseStatus?: LicenseStatus;
  sr22?: YesNo;
  points?: number;
  employerName?: string;
  occupation?: Occupation;
  businessPhone?: string;
  excludeFromCoverage?: YesNo;
  av12?: number;
  av24?: number;
  av36?: number;
  driverDNA?: number;
  violations?: Violation[];
  
  // Sr22Date excluded for TX (0)
}

/**
 * Texas regular (with vehicles) policy request
 */
export interface TexasCovercubeRequest extends BaseCovercubeRequest {
  state: "TX";
  vehicles: TexasVehicle[]; // Required (2)
  drivers: TexasDriver[];
  
  // Optional for TX regular (1)
  address2?: string;
  UMPD?: string;
  PIP?: string;
  priorpolicynumber?: string;
  priorbicoveragelimit?: string;
  priorpipcoveragelimit?: number;
  
  // Mail address fields (1)
  mailAddress?: string;
  mailAddress2?: string;
  mailCity?: string;
  mailState?: string;
  mailZipCode?: string;
  
  // IsNonOwner excluded for regular TX (0)
}

/**
 * Texas non-owner policy request
 */
export interface TexasNonOwnerCovercubeRequest extends Omit<BaseCovercubeRequest, 'roadsideAssistance'> {
  state: "TX";
  IsNonOwner: "Y"; // Required (2)
  drivers: TexasDriver[];
  
  // Optional for TX non-owner (1)
  address2?: string;
  UMPD?: string;
  PIP?: string;
  priorpolicynumber?: string;
  priorbicoveragelimit?: string;
  priorpipcoveragelimit?: number;
  
  // Mail address fields (1)
  mailAddress?: string;
  mailAddress2?: string;
  mailCity?: string;
  mailState?: string;
  mailZipCode?: string;
  
  // Excluded for TX non-owner (0):
  // vehicles and roadsideAssistance (removed via Omit and not re-added)
}

// ============================================
// DISCRIMINATED UNION
// ============================================

/**
 * Covercube request - discriminated union of all policy types
 * 
 * TypeScript will narrow the type based on the `state` and `IsNonOwner` fields:
 * - state: "AZ" → ArizonaCovercubeRequest
 * - state: "TX" + no IsNonOwner → TexasCovercubeRequest  
 * - state: "TX" + IsNonOwner: "Y" → TexasNonOwnerCovercubeRequest
 */
export type CovercubeRequest = 
  | ArizonaCovercubeRequest 
  | TexasCovercubeRequest 
  | TexasNonOwnerCovercubeRequest;

/**
 * Generic vehicle type (union of all vehicle types)
 */
export type Vehicle = ArizonaVehicle | TexasVehicle;

/**
 * Generic driver type (union of all driver types)
 */
export type Driver = ArizonaDriver | TexasDriver;

// ============================================
// RESPONSE TYPES
// ============================================

/**
 * Covercube API response
 */
export interface CovercubeResponse {
  quoteCode: string;
  quotePremium: number;
  quoteFeesTotal: number;
  quoteTotal: number;
  policyFee: number;
  drivers: RatedDriver[];
  coverages: Coverage[];
  payplan: PayPlan[];
  viewQuote: string;
  consumerBridge: string;
}

/**
 * Rated driver information in response
 */
export interface RatedDriver {
  firstName: string;
  lastName: string;
  driverAge: number;
  rateOrder: number;
}

/**
 * Coverage item in response
 */
export interface Coverage {
  coverageCode: string;
  coverageLimit: string;
  coverageTotal: number;
}

/**
 * Payment plan option in response
 */
export interface PayPlan {
  description: string;
  downPayment: number;
  downPercent: number;
  totalPremium: number;
  instalments: number;
  refCode: string;
}

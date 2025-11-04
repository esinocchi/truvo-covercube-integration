// src/lib/constants.ts

import type { State, VehicleUse, Occupation, OwnershipLength, LicenseStatus } from "@/types/covercube";

// ============================================
// STATES
// ============================================

export const STATES: Record<State, State> = {
  AZ: "AZ",
  TX: "TX",
} as const;

// ============================================
// TRANSACTION TYPES
// ============================================

export const TRANS_TYPES = {
  NEW_BUSINESS: "NB"
} as const;

// ============================================
// POLICY TERMS
// ============================================

export const POLICY_TERMS = {
  SIX_MONTHS: "6 Months",
  TWELVE_MONTHS: "12 Months",
} as const;

// ============================================
// COVERAGE LIMITS - ARIZONA
// ============================================

export const AZ_COVERAGE_LIMITS = {
  BI: ["25/50", "50/100", "100/300"],
  PD: ["15", "25", "50"],
  UMBI: ["25/50", "50/100", "100/300"],
  UIMBI: ["25/50", "50/100", "100/300"],
  MP: ["500", "1000", "2000", "5000"],
  COM: ["500", "1000"],
  COL: ["500", "1000"],
} as const;

// ============================================
// COVERAGE LIMITS - TEXAS
// ============================================

export const TX_COVERAGE_LIMITS = {
  BI: ["30/60", "50/100", "100/300"],
  PD: ["25", "50", "100"],
  UMBI: ["30/60", "50/100", "100/300"],
  UIMBI: ["30/60", "50/100", "100/300"],
  UMPD: ["25"],
  MP: ["500", "1000", "2000", "5000"],
  PIP: ["2500"],
  COLL: ["250", "500", "1000"],
  CMP: ["250", "500", "1000"],
} as const;

// ============================================
// VEHICLE USAGE TYPES
// ============================================

export const VEHICLE_USAGE: Record<VehicleUse, string> = {
  WRK: "Work",
  SCH: "School",
  PLS: "Pleasure",
  ART: "Artisan",
  BUS: "Business",
} as const;

// ============================================
// OCCUPATION TYPES
// ============================================

export const OCCUPATIONS: Record<Occupation, string> = {
  OTHER: "Other",
  ADMINISTRATIVE: "Administrative",
  ARTISAN: "Artisan",
  ATHLETE: "Athlete",
  CARPENTER: "Carpenter",
  CELEBRITY: "Celebrity",
  CLERGY: "Clergy",
  CLERICAL: "Clerical",
  CONSULTANT: "Consultant",
  CUSTODIANJANITOR: "Custodian/Janitor",
  DRIVER: "Driver",
  EMERGENCYSERVICES: "Emergency Services",
  ELECTRICIAN: "Electrician",
  GENERALCONTRACTOR: "General Contractor",
  GENERALLABOR: "General Labor",
  HEALTHCAREPROVIDER: "Healthcare Provider",
  HOMEMAKER: "Homemaker",
  MILITARY: "Military",
  NOTEMPLOYED: "Not Employed",
  PAINTER: "Painter",
  PROFESSIONAL: "Professional - College Level or Greater",
  SALESMARKETINGAGENT: "Sales/Marketing/Agent",
  STUDENT: "Student",
  LABOR: "Technical/Skilled Labor",
} as const;

// ============================================
// LICENSE STATUS
// ============================================

export const LICENSE_STATUS_MAP: Record<LicenseStatus, string> = {
  VALID: "Valid",
  SUSP: "Suspended",
  RVKD: "Revoked",
  EX: "Expired",
  MX: "Mexico",
  INT: "International",
  DUSA: "DUSA",
} as const;

// ============================================
// OWNERSHIP LENGTH
// ============================================

export const OWNERSHIP_LENGTH_MAP: Record<OwnershipLength, string> = {
  NOREG: "Not registered in my name",
  "60DAY": "1-60 days",
  "6MON": "61 days - 6 months",
  "1YR": "6 months - 1 year",
  "2YR": "1 year - 2 years",
  "3YR": "2 years - 3 years",
  "5YR": "3 years - 5 years",
  "5YRP": "5 years+",
  UNK: "Unknown",
} as const;

// ============================================
// PAY PLAN TYPES
// ============================================

export const PAY_PLAN_TYPES = {
  FULL: "FP",
  SIX_MONTHLY: "6P",
  SIX_MONTHLY_DIRECT: "6P2",
} as const;

// ============================================
// YES/NO FLAGS
// ============================================

export const YES_NO = {
  YES: "Y",
  NO: "N",
} as const;

// ============================================
// DRIVE TYPES
// ============================================

export const DRIVE_TYPES = {
  TWO_WHEEL: "2WD",
  FOUR_WHEEL: "4WD",
} as const;

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get producer code for a given state
 */
export function getProducerCodeForState(state: State, producerCodes: Record<State, string>): string {
  return producerCodes[state];
}

/**
 * Check if a state requires specific TX-only fields
 */
export function isTexasState(state: State): boolean {
  return state === "TX";
}

/**
 * Validate coverage limit for a given state
 */
export function isValidCoverageLimit(
  state: State,
  coverageType: keyof typeof AZ_COVERAGE_LIMITS | keyof typeof TX_COVERAGE_LIMITS,
  limit: string
): boolean {
  const limits = state === "AZ" ? AZ_COVERAGE_LIMITS : TX_COVERAGE_LIMITS;
  return limits[coverageType as keyof typeof limits]?.includes(limit as never) ?? false;
}
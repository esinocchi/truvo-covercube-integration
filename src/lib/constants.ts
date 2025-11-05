import type { State, VehicleUse, Occupation, OwnershipLength, LicenseStatus } from "@/zod-schemas/covercube";

export const STATES: Record<State, State> = {
  AZ: "AZ",
  TX: "TX",
} as const;

export const TRANS_TYPES = {
  NEW_BUSINESS: "NB"
} as const;

export const POLICY_TERMS = {
  SIX_MONTHS: "6 Months",
  TWELVE_MONTHS: "12 Months",
} as const;

export const AZ_COVERAGE_LIMITS = {
  BI: ["25/50", "50/100", "100/300"],
  PD: ["15", "25", "50"],
  UMBI: ["25/50", "50/100", "100/300"],
  UIMBI: ["25/50", "50/100", "100/300"],
  MP: ["500", "1000", "2000", "5000"],
  COM: ["500", "1000"],
  COL: ["500", "1000"],
} as const;

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

export const VEHICLE_USAGE: Record<VehicleUse, string> = {
  WRK: "Work",
  SCH: "School",
  PLS: "Pleasure",
  ART: "Artisan",
  BUS: "Business",
} as const;

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

export const LICENSE_STATUS_MAP: Record<LicenseStatus, string> = {
  VALID: "Valid",
  SUSP: "Suspended",
  RVKD: "Revoked",
  EX: "Expired",
  MX: "Mexico",
  INT: "International",
  DUSA: "DUSA",
} as const;

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

export const PAY_PLAN_TYPES = {
  FULL: "FP",
  SIX_MONTHLY: "6P",
  SIX_MONTHLY_DIRECT: "6P2",
} as const;

export const YES_NO = {
  YES: "Y",
  NO: "N",
} as const;

export const DRIVE_TYPES = {
  TWO_WHEEL: "2WD",
  FOUR_WHEEL: "4WD",
} as const;

/**
 * Retrieves state-specific producer code required by Covercube for authentication
 *
 * Each state requires its own producer code to ensure quotes are generated under
 * the correct insurance license and regulatory framework.
 */
export function getProducerCodeForState(state: State, producerCodes: Record<State, string>): string {
  return producerCodes[state];
}

/**
 * Determines if state requires Texas-specific fields (UMPD, PIP, IsNonOwner)
 *
 * Used for request routing to ensure TX non-owner policies exclude vehicles
 * and TX regular policies exclude the IsNonOwner flag, as Covercube will
 * reject requests with inappropriate fields for the state.
 */
export function isTexasState(state: State): boolean {
  return state === "TX";
}

/**
 * Validates coverage limit against state-specific allowed values
 *
 * Prevents API errors by ensuring client-provided coverage limits match
 * Covercube's state-specific requirements before building the request.
 */
export function isValidCoverageLimit(
  state: State,
  coverageType: keyof typeof AZ_COVERAGE_LIMITS | keyof typeof TX_COVERAGE_LIMITS,
  limit: string
): boolean {
  const limits = state === "AZ" ? AZ_COVERAGE_LIMITS : TX_COVERAGE_LIMITS;
  return limits[coverageType as keyof typeof limits]?.includes(limit as never) ?? false;
}
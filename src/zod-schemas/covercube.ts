// zod-schemas/covercube.ts

import { z } from "zod";

/** Common enums & helpers */
export const YesNo = z.enum(["Y", "N"]);
export const YesNoUpper = z.enum(["YES", "NO"]); // e.g., ispriorpolicy
export const StateEnum = z.enum(["AZ", "TX"]);
export const VehicleUseEnum = z.enum(["WRK", "SCH", "PLS", "ART", "BUS"]); // mapping table
// Ownership length codes (TX)
export const OwnershipLengthEnum = z.enum([
  "NOREG", "60DAY", "6MON", "1YR", "2YR", "3YR", "5YR", "5YRP", "UNK",
]);

// License status codes
export const LicenseStatusEnum = z.enum([
  "VALID", "SUSP", "RVKD", "EX", "MX", "INT", "DUSA"
]);

// Occupation codes
export const OccupationEnum = z.enum([
  "OTHER", "ADMINISTRATIVE", "ARTISAN", "ATHLETE", "CARPENTER", "CELEBRITY",
  "CLERGY", "CLERICAL", "CONSULTANT", "CUSTODIANJANITOR", "DRIVER",
  "EMERGENCYSERVICES", "ELECTRICIAN", "GENERALCONTRACTOR", "GENERALLABOR",
  "HEALTHCAREPROVIDER", "HOMEMAKER", "MILITARY", "NOTEMPLOYED", "PAINTER",
  "PROFESSIONAL", "SALESMARKETINGAGENT", "STUDENT", "LABOR"
]);

const yyyymmdd = /^\d{4}\/\d{2}\/\d{2}$/;
export const DateString = z.string().regex(yyyymmdd, "Use YYYY/MM/DD");

/** Shared: lienholder / additional interest (as seen in Postman) */
export const PartySchema = z.object({
  partyName: z.string().min(1),
  partyType: z.string().min(1),
  address1: z.string().min(1),
  address2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().min(2),
  zip: z.string().min(3),
}).strict();

/** Shared: driver violation object (doc + Postman) */
export const ViolationSchema = z.object({
  date: DateString,
  code: z.string().min(1),
  description: z.string().min(1),
  points: z.union([z.string(), z.number()]),
}).strict();

/** Shared: base vehicle (items common to AZ & TX) */
export const BaseVehicleSchema = z.object({
  year: z.number().int(),
  make: z.string().min(1),
  model: z.string().min(1),
  trim: z.string().optional(),
  vin: z.string().optional(),
  SE: z.string().optional(),           // Special Equipment (Y/N in tables; left as string per examples)
  TR: z.string().optional(),           // Towing & Rental (Y/N)
  COM: z.union([z.string(), z.number()]).optional(),
  COL: z.union([z.string(), z.number()]).optional(),
  vehicleUse: VehicleUseEnum,
  antitheft: z.string().optional(),
  braking: z.string().optional(),
  price: z.number().optional(),
  weight: z.number().optional(),       // present in Postman (AZ/TX), optional everywhere
  drivetype: z.string().optional(),
  ridesharing: YesNo.optional(),       // Postman uses "Y"/"N"
  roadsideAssistance: YesNo.optional(),// vehicle-level roadside (TX docs; tolerated for AZ per Postman)
  parties: z.array(PartySchema).optional(),
}).strict();

/** Arizona vehicle — allow plate fields (optional) but we strip them in sanitize */
export const ArizonaVehicleSchema = BaseVehicleSchema.extend({
  platenumber: z.string().optional(),  // not in AZ docs; appears in Postman → accept & strip
  platestate: z.string().optional(),
  // Also allow TX-specific fields so they can be stripped by transform
  vehiclepurchasedate: DateString.optional(),
  estimatemilage: z.number().optional(),
  ownershiplength: OwnershipLengthEnum.optional(),
});

/** Texas vehicle — TX-specific fields per docs */
export const TexasVehicleSchema = BaseVehicleSchema.extend({
  platenumber: z.string().optional(),
  platestate: z.string().optional(),
  vehiclepurchasedate: DateString.optional(),
  estimatemilage: z.number().optional(),
  ownershiplength: OwnershipLengthEnum.optional(),
}).strict();

/** AZ driver — all required in docs; Postman extras optional */
export const ArizonaDriverSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  dob: DateString,
  gender: z.enum(["M", "F"]),
  married: YesNo,                      // required in AZ
  licenseNumber: z.string().min(1),
  licenseState: z.literal("AZ"),
  licenseStatus: z.string().min(1),    // (VALID/SUSP/INT/RVKD/etc.) keep flexible
  sr22: YesNo,                         // required in AZ
  Sr22Date: DateString.optional(),
  // Postman-only / cross-state optionals:
  points: z.number().optional(),
  employerName: z.string().optional(),
  occupation: z.string().optional(),
  businessPhone: z.string().optional(),
  excludeFromCoverage: YesNo.optional(),
  av12: z.number().optional(),
  av24: z.number().optional(),
  av36: z.number().optional(),
  driverDNA: z.number().optional(),
  violations: z.array(ViolationSchema).optional(),
}).strict();

/** TX driver — many fields optional per docs */
export const TexasDriverSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  dob: DateString,
  gender: z.enum(["M", "F"]),
  married: YesNo.optional(),
  points: z.number().optional(),
  licenseNumber: z.string().optional(),
  licenseState: z.literal("TX"),
  licenseStatus: z.string().optional(),
  employerName: z.string().optional(),
  occupation: z.string().optional(),   // Postman sends human-readable values
  businessPhone: z.string().optional(),
  sr22: YesNo.optional(),
  excludeFromCoverage: YesNo.optional(),
  av12: z.number().optional(),
  av24: z.number().optional(),
  av36: z.number().optional(),
  driverDNA: z.number().optional(),
  violations: z.array(ViolationSchema).optional(),
}).strict();

/** Common top-level policy fields (AZ + TX) */
export const BasePolicySchema = z.object({
  // Backend-injected fields (optional in input, added by buildRequest)
  action: z.literal("RATEQUOTE").optional(),
  username: z.string().min(1).optional(),
  password: z.string().min(1).optional(),
  producerCode: z.string().min(1).optional(),
  transType: z.enum(["NB", "RN"]).optional(),
  
  policyTerm: z.string().min(1),
  inceptionDate: DateString,
  effectiveDate: DateString,
  rateDate: DateString,
  holderFirstName: z.string().min(1),
  holderMiddleInitial: z.string().optional(),
  holderLastName: z.string().min(1),
  address: z.string().min(1),
  address2: z.string().optional(),     // TX docs + AZ Postman
  city: z.string().min(1),
  state: StateEnum,
  zipCode: z.string().min(3),
  email: z.string().email().optional(),
  cellPhone: z.string().optional(),
  mailSame: YesNo.optional(),
  // Mailing fields (Postman)
  mailAddress: z.string().optional(),
  mailAddress2: z.string().optional(),
  mailCity: z.string().optional(),
  mailState: z.string().optional(),
  mailZipCode: z.string().optional(),

  // Coverages (common)
  BI: z.string().min(1),
  PD: z.string().min(1),
  UMBI: z.string().optional(),
  UIMBI: z.string().optional(),
  MP: z.union([z.string(), z.number()]).optional(), // allow "None" or numeric strings

  roadsideAssistance: YesNo.optional(), // policy-level toggle (in AZ & TX examples)

  unacceptableRisk: YesNo.optional(),
  renewalDiscount: YesNo.optional(),
  advanceDiscount: YesNo.optional(),
  payplan: z.string().min(1),
  homeownerDiscount: YesNo.optional(),

  // Prior insurance (common keys present in both examples)
  ispriorpolicy: YesNoUpper.optional(),
  priordayslapse: z.union([z.string(), z.number()]).optional(),
  priorexpirationdate: DateString.optional(),
  monthsinprior: z.union([z.string(), z.number()]).optional(),
  ispriorinsameagency: YesNoUpper.optional(),

  // TX-only top-level fields (will be stripped if AZ)
  UMPD: z.string().optional(),
  PIP: z.union([z.string(), z.number()]).optional(),
  priorpolicynumber: z.string().optional(),
  priorbicoveragelimit: z.string().optional(),
  priorpipcoveragelimit: z.union([z.string(), z.number()]).optional(),

  // Non-owner switch (TX only; error if AZ)
  IsNonOwner: YesNo.optional(),
}).strict();

/** ---------- State-specific request shapes ---------- */

/** Arizona request */
export const ArizonaRequestSchema = BasePolicySchema.extend({
  state: z.literal("AZ"),
  vehicles: z.array(ArizonaVehicleSchema).min(1),
  drivers: z.array(ArizonaDriverSchema).min(1),
}).superRefine((obj, ctx) => {
  // If someone sends IsNonOwner on AZ, quietly drop it later.
  // No hard errors here to keep parity with your tolerant builder.
  // placeholder for future validation
}).transform((obj) => {
  // Strip TX-only top-level fields for AZ
  const {
    UMPD, PIP, priorpolicynumber, priorbicoveragelimit, priorpipcoveragelimit, IsNonOwner,
    ...rest
  } = obj as any;

  // Strip plate/purchase/mileage/ownership TX fields if they sneak into AZ
  const vehicles = rest.vehicles.map((v: any) => {
    const { platenumber, platestate, vehiclepurchasedate, estimatemilage, ownershiplength, ...keep } = v;
    return keep;
  });

  return { ...rest, vehicles };
});

/** Texas (owned vehicle) request */
export const TexasOwnedRequestSchema = BasePolicySchema.extend({
  state: z.literal("TX"),
  IsNonOwner: z.literal("Y").optional(), // ignore if accidentally present without intent
  vehicles: z.array(TexasVehicleSchema).min(1),
  drivers: z.array(TexasDriverSchema).min(1),
}).strict();

/** Texas (Non-Owner) request — MUST have IsNonOwner:"Y" and NO vehicles */
export const TexasNonOwnerRequestSchema = BasePolicySchema.extend({
  state: z.literal("TX"),
  IsNonOwner: z.literal("Y"), // required
  // vehicles excluded — enforce absence
  vehicles: z.undefined().optional(),
  drivers: z.array(TexasDriverSchema).min(1),
}).superRefine((obj, ctx) => {
  // If any vehicles sneak in, throw (docs explicitly exclude vehicles for Non-Owner)
  const raw = obj as any;
  if (Array.isArray(raw.vehicles) && raw.vehicles.length > 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Non-Owner policies must not include vehicles.",
      path: ["vehicles"],
    });
  }
});

/** ---------- Unified entry point ---------- */

/**
 * parseAndSanitizeQuote:
 *  - Detects which schema to use (AZ, TX Owned, TX Non-Owner).
 *  - Returns a sanitized object ready for your build step.
 *
 * Usage:
 *   const parsed = parseAndSanitizeQuote(input);
 * @param input - The input to parse and sanitize
 * @returns The sanitized object
 * @throws Error if the input is invalid or unsupported
 */
export function parseAndSanitizeQuote(input: unknown) {
  // Lightweight pre-checks to choose schema
  const state = (input as any)?.state;
  const isNonOwner = (input as any)?.IsNonOwner === "Y";

  if (state === "AZ") {
    return ArizonaRequestSchema.parse(input);
  }
  if (state === "TX" && isNonOwner) {
    return TexasNonOwnerRequestSchema.parse(input);
  }
  if (state === "TX") {
    return TexasOwnedRequestSchema.parse(input);
  }
  throw new Error("Invalid or unsupported state. Must be 'AZ' or 'TX'.");
}

/** ---------- Response schema (optional but recommended) ---------- */

export const CoverageSchema = z.object({
  coverageCode: z.string(),
  coverageLimit: z.string(),
  coverageTotal: z.number(),
}).strict();

export const PayplanSchema = z.object({
  description: z.string(),
  downPayment: z.number(),
  downPercent: z.number(),
  totalPremium: z.number(),
  instalments: z.number().int(),
  refCode: z.string(),
}).strict();

export const DriverOutSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  driverAge: z.number(),
  rateOrder: z.number(),
}).strict();

export const CovercubeResponseSchema = z.object({
  quoteCode: z.string().min(1),
  quotePremium: z.number(),
  quoteFeesTotal: z.number(),
  quoteTotal: z.number(),
  policyFee: z.number(),
  drivers: z.array(DriverOutSchema),
  coverages: z.array(CoverageSchema),
  payplan: z.array(PayplanSchema),
  viewQuote: z.string().url(),
  consumerBridge: z.string().url(),
}).strict();

/** Types */
export type ArizonaQuoteRequest = z.infer<typeof ArizonaRequestSchema>;
export type TexasQuoteRequest = z.infer<typeof TexasOwnedRequestSchema>;
export type TexasNonOwnerQuoteRequest = z.infer<typeof TexasNonOwnerRequestSchema>;
export type CovercubeResponse = z.infer<typeof CovercubeResponseSchema>;

/** Utility Types */
export type State = z.infer<typeof StateEnum>;
export type VehicleUse = z.infer<typeof VehicleUseEnum>;
export type OwnershipLength = z.infer<typeof OwnershipLengthEnum>;
export type LicenseStatus = z.infer<typeof LicenseStatusEnum>;
export type Occupation = z.infer<typeof OccupationEnum>;
export type YesNoType = z.infer<typeof YesNo>;
export type YesNoUpperType = z.infer<typeof YesNoUpper>;

/** Entity Types */
export type Party = z.infer<typeof PartySchema>;
export type Violation = z.infer<typeof ViolationSchema>;
export type ArizonaVehicle = z.infer<typeof ArizonaVehicleSchema>;
export type TexasVehicle = z.infer<typeof TexasVehicleSchema>;
export type ArizonaDriver = z.infer<typeof ArizonaDriverSchema>;
export type TexasDriver = z.infer<typeof TexasDriverSchema>;

/** Union Types */
export type Vehicle = ArizonaVehicle | TexasVehicle;
export type Driver = ArizonaDriver | TexasDriver;
export type CovercubeRequest = 
  | ArizonaQuoteRequest 
  | TexasQuoteRequest 
  | TexasNonOwnerQuoteRequest;

/** Response Entity Types */
export type Coverage = z.infer<typeof CoverageSchema>;
export type Payplan = z.infer<typeof PayplanSchema>;
export type RatedDriver = z.infer<typeof DriverOutSchema>;

/** Input Types (without backend-injected fields) */
export type ArizonaQuoteInput = Omit<ArizonaQuoteRequest, 'action' | 'username' | 'password' | 'producerCode' | 'transType'>;
export type TexasQuoteInput = Omit<TexasQuoteRequest, 'action' | 'username' | 'password' | 'producerCode' | 'transType'>;
export type TexasNonOwnerQuoteInput = Omit<TexasNonOwnerQuoteRequest, 'action' | 'username' | 'password' | 'producerCode' | 'transType'>;

export type QuoteInput = 
  | ArizonaQuoteInput 
  | TexasQuoteInput 
  | TexasNonOwnerQuoteInput;


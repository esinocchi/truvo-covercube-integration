// src/types/api.d.ts

import type { 
  ArizonaVehicle, 
  TexasVehicle, 
  ArizonaDriver, 
  TexasDriver,
  State, 
  YesNo 
} from "./covercube";

/**
 * Base quote input fields shared across all policy types
 * Excludes backend-injected fields (auth credentials, action, producer code)
 */
interface BaseQuoteInput {
  // Transaction details (required)
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
  drivers: ArizonaDriver[] | TexasDriver[];
  
  // Universal optional fields
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
 * Arizona quote input
 */
export interface ArizonaQuoteInput extends BaseQuoteInput {
  state: "AZ";
  vehicles: ArizonaVehicle[];
  drivers: ArizonaDriver[];
  
  // TX-specific fields excluded
}

/**
 * Texas regular (with vehicles) quote input
 */
export interface TexasQuoteInput extends BaseQuoteInput {
  state: "TX";
  vehicles: TexasVehicle[];
  drivers: TexasDriver[];
  
  // Optional for TX
  address2?: string;
  UMPD?: string;
  PIP?: string;
  priorpolicynumber?: string;
  priorbicoveragelimit?: string;
  priorpipcoveragelimit?: number;
  
  // Mail address fields
  mailAddress?: string;
  mailAddress2?: string;
  mailCity?: string;
  mailState?: string;
  mailZipCode?: string;
  
  // IsNonOwner excluded for regular TX
}

/**
 * Texas non-owner quote input
 */
export interface TexasNonOwnerQuoteInput extends Omit<BaseQuoteInput, 'roadsideAssistance'> {
  state: "TX";
  IsNonOwner: "Y";
  drivers: TexasDriver[];
  
  // Optional for TX non-owner
  address2?: string;
  UMPD?: string;
  PIP?: string;
  priorpolicynumber?: string;
  priorbicoveragelimit?: string;
  priorpipcoveragelimit?: number;
  
  // Mail address fields
  mailAddress?: string;
  mailAddress2?: string;
  mailCity?: string;
  mailState?: string;
  mailZipCode?: string;
  
  // vehicles and roadsideAssistance excluded
}

/**
 * Quote input - discriminated union of all input types
 * 
 * This is the input type for the /api/quote endpoint.
 * It excludes backend-injected fields (auth, producer code, etc.)
 */
export type QuoteInput = 
  | ArizonaQuoteInput 
  | TexasQuoteInput 
  | TexasNonOwnerQuoteInput;

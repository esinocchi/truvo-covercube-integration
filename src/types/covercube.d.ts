// src/types/covercube.d.ts

// ============================================
// REQUEST TYPES
// ============================================

export interface CovercubeRequest {
    // Authentication
    action: "RATEQUOTE";
    username: string;
    password: string;
    producerCode: string;
    
    // Transaction details
    transType: "NB" | "RN";
    policyTerm: string;
    inceptionDate: string;
    effectiveDate: string;
    rateDate: string;
    
    // Policyholder info
    holderFirstName: string;
    holderMiddleInitial?: string;
    holderLastName: string;
    address: string;
    address2?: string;
    city: string;
    state: State;
    zipCode: string;
    email?: string;
    cellPhone?: string;
    mailSame?: YesNo;
    mailAddress?: string;
    mailAddress2?: string;
    mailCity?: string;
    mailState?: string;
    mailZipCode?: string;
    
    // Coverage
    BI: string;
    PD: string;
    UMBI?: string;
    UIMBI?: string;
    UMPD?: string; // TX only
    MP?: string;
    PIP?: string; // TX only
    roadsideAssistance?: YesNo;
    
    // Discounts & flags
    unacceptableRisk?: YesNo;
    renewalDiscount?: YesNo;
    advanceDiscount?: YesNo;
    homeownerDiscount?: YesNo;
    payplan: string;
    
    // Prior insurance
    ispriorpolicy?: "YES" | "NO";
    priorpolicynumber?: string;
    priordayslapse?: number | string;
    priorexpirationdate?: string;
    monthsinprior?: number | string;
    ispriorinsameagency?: "YES" | "NO";
    priorbicoveragelimit?: string;
    priorpipcoveragelimit?: number;
    
    // Non-owner flag (TX only)
    IsNonOwner?: YesNo;
    
    // Arrays
    vehicles?: Vehicle[];
    drivers: Driver[];
  }
  
  export interface Vehicle {
    year: number;
    make: string;
    model: string;
    trim?: string;
    vin?: string;
    SE?: YesNo;
    TR?: YesNo;
    COM?: string;
    COL?: string;
    vehicleUse: VehicleUse;
    antitheft?: string;
    braking?: string;
    price?: number;
    drivetype?: "2WD" | "4WD";
    
    // TX specific
    roadsideAssistance?: YesNo;
    platenumber?: string;
    platestate?: string;
    weight?: number;
    ridesharing?: YesNo;
    vehiclepurchasedate?: string;
    estimatemilage?: number;
    ownershiplength?: OwnershipLength;
    
    // Additional interested parties (lien holders, etc.)
    parties?: Party[];
  }
  
  export interface Party {
    partyName: string;
    partyType: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    zip: string;
  }
  
  export interface Driver {
    firstName: string;
    lastName: string;
    dob: string;
    gender: "M" | "F";
    married?: YesNo;
    licenseNumber?: string;
    licenseState: string;
    licenseStatus: LicenseStatus;
    sr22?: YesNo;
    Sr22Date?: string;
    
    // TX specific
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
  }
  
  export interface Violation {
    date: string;
    code: string;
    description: string;
    points: string;
  }
  
  // ============================================
  // RESPONSE TYPES
  // ============================================
  
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
  
  export interface RatedDriver {
    firstName: string;
    lastName: string;
    driverAge: number;
    rateOrder: number;
  }
  
  export interface Coverage {
    coverageCode: string;
    coverageLimit: string;
    coverageTotal: number;
  }
  
  export interface PayPlan {
    description: string;
    downPayment: number;
    downPercent: number;
    totalPremium: number;
    instalments: number;
    refCode: string;
  }
  
  // ============================================
  // UTILITY TYPES
  // ============================================
  
  export type State = "AZ" | "TX";
  
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

  export type YesNo = "Y" | "N";
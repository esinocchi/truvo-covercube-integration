import type { 
  CovercubeRequest, 
  ArizonaCovercubeRequest,
  TexasCovercubeRequest,
  TexasNonOwnerCovercubeRequest,
  YesNo 
} from "@/types/covercube";
import type { QuoteInput } from "@/types/api";
import { config } from "@/config";
import { getProducerCodeForState, isTexasState, TRANS_TYPES, YES_NO } from "@/lib/constants";

/**
 * Build a complete Covercube request from simplified input
 *
 * This function:
 * 1. Injects authentication credentials from config
 * 2. Adds the producer code based on state
 * 3. Sets transaction type to "NB" (New Business)
 * 4. Validates state-specific requirements
 * 5. Handles state-specific logic (TX non-owner vs regular policies)
 * 6. Strips out state-inappropriate fields
 *
 * @param input - The simplified quote input from the client
 * @returns A complete CovercubeRequest payload ready to send to the Covercube API
 * @throws Error if state-specific validation fails (e.g., missing required fields, invalid coverage combinations)
 */
export function buildCovercubeRequest(input: QuoteInput): CovercubeRequest {
  // Validate state-specific requirements
  validateStateRequirements(input);

  // Get state-specific producer code
  const producerCode = getProducerCodeForState(
    input.state,
    config.covercube.producerCodes
  );
  
  // Build base request with auth & infrastructure fields
  const baseRequest = {
    // Auth & infrastructure (injected by backend)
    action: "RATEQUOTE" as const,
    username: config.covercube.username,
    password: config.covercube.password,
    producerCode: producerCode,
    transType: TRANS_TYPES.NEW_BUSINESS,
    
    // Pass through all input fields
    ...input,
  };

  // Handle state-specific logic
  if (isTexasState(input.state)) {
    // Check if this is a non-owner policy
    if ('IsNonOwner' in input && input.IsNonOwner === YES_NO.YES) {
      return buildTexasNonOwnerRequest(baseRequest, input);
    } else {
      return buildTexasRequest(baseRequest, input);
    }
  } else {
    return buildArizonaRequest(baseRequest);
  }
}

/**
 * Validates that the input meets state-specific requirements
 *
 * Arizona Requirements:
 * - Must have at least one vehicle
 * - Cannot be a non-owner policy
 * - Cannot have TX-only coverages (PIP, UMPD)
 * - Cannot have TX-only prior insurance fields
 * - Vehicles cannot have TX-only fields (vehiclepurchasedate, estimatemilage, ownershiplength)
 * - Vehicles cannot have plate fields (platenumber, platestate)
 *
 * Texas Requirements:
 * - Regular policies: Must have at least one vehicle
 * - Non-owner policies: Cannot have vehicles or roadsideAssistance
 *
 * @param input - The quote input to validate
 * @throws Error if the input violates state-specific requirements
 */
function validateStateRequirements(input: QuoteInput): void {
  if (isTexasState(input.state)) {
    // Texas validation
    if ('IsNonOwner' in input && input.IsNonOwner === YES_NO.YES) {
      // TX Non-Owner specific validation
      if ('vehicles' in input && input.vehicles && Array.isArray(input.vehicles) && input.vehicles.length > 0) {
        throw new Error("Texas non-owner policies cannot have vehicles");
      }
      
      // TX Non-Owner must NOT have roadsideAssistance at policy level
      if ('roadsideAssistance' in input && input.roadsideAssistance !== undefined) {
        throw new Error("Texas non-owner policies cannot have roadsideAssistance");
      }
    } else {
      // TX Regular (with vehicles)
      if (!('vehicles' in input) || !input.vehicles || !Array.isArray(input.vehicles) || input.vehicles.length === 0) {
        throw new Error("Texas policies require at least one vehicle (or set IsNonOwner='Y')");
      }
    }
  } else {
    // Arizona validation
    if (!('vehicles' in input) || !input.vehicles || input.vehicles.length === 0) {
      throw new Error("Arizona policies require at least one vehicle");
    }

    if ('IsNonOwner' in input && input.IsNonOwner === YES_NO.YES) {
      throw new Error("Arizona does not support non-owner policies");
    }

    // Arizona should NOT have TX-only coverage fields
    if ('PIP' in input && input.PIP) {
      throw new Error("Arizona policies do not support PIP coverage");
    }
    if ('UMPD' in input && input.UMPD) {
      throw new Error("Arizona policies do not support UMPD coverage");
    }
    if ('priorbicoveragelimit' in input && input.priorbicoveragelimit) {
      throw new Error("Arizona policies do not use priorbicoveragelimit");
    }
    if ('priorpipcoveragelimit' in input && input.priorpipcoveragelimit) {
      throw new Error("Arizona policies do not use priorpipcoveragelimit");
    }

    // Validate no TX-only vehicle fields
    if ('vehicles' in input && input.vehicles) {
      input.vehicles.forEach((vehicle, index) => {
        if ('vehiclepurchasedate' in vehicle && vehicle.vehiclepurchasedate) {
          throw new Error(`Vehicle ${index + 1} should not have vehiclepurchasedate for Arizona`);
        }
        if ('estimatemilage' in vehicle && vehicle.estimatemilage) {
          throw new Error(`Vehicle ${index + 1} should not have estimatemilage for Arizona`);
        }
        if ('ownershiplength' in vehicle && vehicle.ownershiplength) {
          throw new Error(`Vehicle ${index + 1} should not have ownershiplength for Arizona`);
        }
        // Validate no plate fields for Arizona
        if ('platenumber' in vehicle && vehicle.platenumber) {
          throw new Error(`Vehicle ${index + 1} should not have platenumber for Arizona`);
        }
        if ('platestate' in vehicle && vehicle.platestate) {
          throw new Error(`Vehicle ${index + 1} should not have platestate for Arizona`);
        }
      });
    }
  }
}

/**
 * Build a Texas regular (with vehicles) request
 *
 * @param baseRequest - The base request with auth credentials and all input fields
 * @param input - The original quote input
 * @returns A Texas-compliant CovercubeRequest
 */
function buildTexasRequest(
  baseRequest: Record<string, unknown>,
  input: QuoteInput
): TexasCovercubeRequest {
  // Remove IsNonOwner field (requirement: 0 - not included for regular TX)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { IsNonOwner: _IsNonOwner, ...requestWithoutNonOwner } = baseRequest;
  
  // Type assertion is safe here because:
  // 1. baseRequest contains all required fields from input + auth fields
  // 2. We've validated the input meets Texas requirements
  return requestWithoutNonOwner as unknown as TexasCovercubeRequest;
}

/**
 * Build a Texas non-owner request
 *
 * @param baseRequest - The base request with auth credentials and all input fields
 * @param input - The original quote input
 * @returns A Texas non-owner compliant CovercubeRequest
 */
function buildTexasNonOwnerRequest(
  baseRequest: Record<string, unknown>,
  input: QuoteInput
): TexasNonOwnerCovercubeRequest {
  // Remove vehicles and roadsideAssistance (requirement: 0 - not included for non-owner)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { 
    vehicles: _vehicles, 
    roadsideAssistance: _roadsideAssistance, 
    ...restRequest 
  } = baseRequest;
  
  // Type assertion is safe here because:
  // 1. baseRequest contains all required fields from input + auth fields
  // 2. We've validated the input meets Texas non-owner requirements
  // 3. We've explicitly set IsNonOwner to 'Y'
  return {
    ...restRequest,
    IsNonOwner: YES_NO.YES,
  } as unknown as TexasNonOwnerCovercubeRequest;
}

/**
 * Build an Arizona-specific request
 *
 * Strips all TX-only fields at both policy and vehicle levels
 *
 * @param baseRequest - The base request with auth credentials and all input fields
 * @returns An Arizona-compliant CovercubeRequest
 */
function buildArizonaRequest(baseRequest: Record<string, unknown>): ArizonaCovercubeRequest {
  // Strip out TX-only policy-level fields
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const {
    PIP: _PIP,
    UMPD: _UMPD,
    IsNonOwner: _IsNonOwner,
    priorbicoveragelimit: _priorbicoveragelimit,
    priorpipcoveragelimit: _priorpipcoveragelimit,
    address2: _address2,
    priorpolicynumber: _priorpolicynumber,
    mailAddress: _mailAddress,
    mailAddress2: _mailAddress2,
    mailCity: _mailCity,
    mailState: _mailState,
    mailZipCode: _mailZipCode,
    ...cleanRequest
  } = baseRequest;

  // Strip TX-only vehicle fields (including plate info per requirements)
  const cleanVehicles = Array.isArray(cleanRequest.vehicles)
    ? cleanRequest.vehicles.map((vehicle: Record<string, unknown>) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const {
          vehiclepurchasedate: _vehiclepurchasedate,
          estimatemilage: _estimatemilage,
          ownershiplength: _ownershiplength,
          platenumber: _platenumber,
          platestate: _platestate,
          weight: _weight,
          ridesharing: _ridesharing,
          roadsideAssistance: _roadsideAssistance,
          ...cleanVehicle
        } = vehicle;
        return cleanVehicle;
      })
    : [];

  // Type assertion is safe here because:
  // 1. baseRequest contains all required fields from input + auth fields
  // 2. We've validated the input meets Arizona requirements
  // 3. We've stripped all TX-only fields
  return {
    ...cleanRequest,
    vehicles: cleanVehicles,
  } as unknown as ArizonaCovercubeRequest;
}

import type { CovercubeRequest } from "@/types/covercube";
import type { QuoteInput } from "@/types/api";
import { config } from "@/config";
import { getProducerCodeForState, isTexasState, TRANS_TYPES } from "@/lib/constants";

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
  const baseRequest: CovercubeRequest = {
    // Auth & infrastructure (injected by backend)
    action: "RATEQUOTE",
    username: config.covercube.username,
    password: config.covercube.password,
    producerCode,
    transType: TRANS_TYPES.NEW_BUSINESS,
    
    // Pass through all input fields
    ...input,
  };

  // Handle state-specific logic
  if (isTexasState(input.state)) {
    return buildTexasRequest(baseRequest, input);
  } else {
    return buildArizonaRequest(baseRequest);
  }
}

/**
 * Validates that the input meets state-specific requirements
 */
function validateStateRequirements(input: QuoteInput): void {
  if (isTexasState(input.state)) {
    // Texas validation
    if (input.IsNonOwner === "Y") {
      // TX Non-Owner specific validation
      if (input.vehicles && input.vehicles.length > 0) {
        throw new Error("Texas non-owner policies cannot have vehicles");
      }
      
      // TX Non-Owner must NOT have roadsideAssistance at policy level
      if (input.roadsideAssistance !== undefined) {
        throw new Error("Texas non-owner policies cannot have roadsideAssistance");
      }

      // TX Non-Owner requires PIP and UMPD
      if (!input.PIP) {
        throw new Error("Texas non-owner policies require PIP coverage");
      }
      if (!input.UMPD) {
        throw new Error("Texas non-owner policies require UMPD coverage");
      }
    } else {
      // TX Regular (with vehicles)
      if (!input.vehicles || input.vehicles.length === 0) {
        throw new Error("Texas policies require at least one vehicle (or set IsNonOwner='Y')");
      }

      // TX requires PIP for regular policies
      if (!input.PIP) {
        throw new Error("Texas policies require PIP coverage");
      }
    }

    // Note: TX-specific prior insurance fields (priorbicoveragelimit, priorpipcoveragelimit)
    // are optional even when ispriorpolicy is "YES", so no validation needed
  } else {
    // Arizona validation
    if (!input.vehicles || input.vehicles.length === 0) {
      throw new Error("Arizona policies require at least one vehicle");
    }

    if (input.IsNonOwner === "Y") {
      throw new Error("Arizona does not support non-owner policies");
    }

    // Arizona should NOT have TX-only coverage fields
    if (input.PIP) {
      throw new Error("Arizona policies do not support PIP coverage");
    }
    if (input.UMPD) {
      throw new Error("Arizona policies do not support UMPD coverage");
    }
    if (input.priorbicoveragelimit) {
      throw new Error("Arizona policies do not use priorbicoveragelimit");
    }
    if (input.priorpipcoveragelimit) {
      throw new Error("Arizona policies do not use priorpipcoveragelimit");
    }

    // Validate no TX-only vehicle fields (note: plate info is allowed in both states)
    input.vehicles.forEach((vehicle, index) => {
      if (vehicle.vehiclepurchasedate) {
        throw new Error(`Vehicle ${index + 1} should not have vehiclepurchasedate for Arizona`);
      }
      if (vehicle.estimatemilage) {
        throw new Error(`Vehicle ${index + 1} should not have estimatemilage for Arizona`);
      }
      if (vehicle.ownershiplength) {
        throw new Error(`Vehicle ${index + 1} should not have ownershiplength for Arizona`);
      }
    });
  }
}

/**
 * Build a Texas-specific request
 */
function buildTexasRequest(
  baseRequest: CovercubeRequest,
  input: QuoteInput
): CovercubeRequest {
  if (input.IsNonOwner === "Y") {
    // TX Non-Owner: remove vehicles and roadsideAssistance, ensure required coverages
    const { vehicles, roadsideAssistance, ...restRequest } = baseRequest;
    
    return {
      ...restRequest,
      IsNonOwner: "Y",
      // Ensure TX non-owner required fields
      PIP: input.PIP!,
      UMPD: input.UMPD!,
    };
  } else {
    // TX Regular: include vehicles with all TX-specific fields
    return {
      ...baseRequest,
      // Ensure TX required fields
      PIP: input.PIP!,
      UMPD: input.UMPD,
      // Include vehicles array
      vehicles: input.vehicles,
    };
  }
}

/**
 * Build an Arizona-specific request
 */
function buildArizonaRequest(baseRequest: CovercubeRequest): CovercubeRequest {
  // Strip out TX-only policy-level fields to keep the request clean
  const {
    PIP,
    UMPD,
    IsNonOwner,
    priorbicoveragelimit,
    priorpipcoveragelimit,
    ...cleanRequest
  } = baseRequest;

  // Strip TX-only vehicle fields (but keep plate info - it's allowed in both states)
  const cleanVehicles = cleanRequest.vehicles?.map((vehicle) => {
    const {
      vehiclepurchasedate,
      estimatemilage,
      ownershiplength,
      ...cleanVehicle
    } = vehicle;
    return cleanVehicle;
  });

  return {
    ...cleanRequest,
    vehicles: cleanVehicles,
  };
}
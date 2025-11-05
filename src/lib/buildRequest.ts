import type { 
  CovercubeRequest, 
  ArizonaQuoteRequest,
  TexasQuoteRequest,
  TexasNonOwnerQuoteRequest,
} from "@/zod-schemas/covercube";
import { parseAndSanitizeQuote } from "@/zod-schemas/covercube";
import { ZodError } from "zod";
import { config } from "@/config";
import { getProducerCodeForState, isTexasState, TRANS_TYPES, YES_NO } from "@/lib/constants";

/**
 * Build a complete Covercube request from simplified input
 *
 * This function:
 * 1. Validates and sanitizes input using Zod schemas
 * 2. Injects authentication credentials from config
 * 3. Adds the producer code based on state
 * 4. Sets transaction type to "NB" (New Business)
 * 5. Handles state-specific logic (TX non-owner vs regular policies)
 * 6. Strips out state-inappropriate fields (via Zod transforms)
 *
 * @param input - The quote input from the client (will be validated)
 * @returns A complete CovercubeRequest payload ready to send to the Covercube API
 * @throws Error if validation fails or state-specific requirements are not met
 */
export function buildCovercubeRequest(input: unknown): CovercubeRequest {
  // Validate and sanitize input using Zod
  let sanitized: ReturnType<typeof parseAndSanitizeQuote>;
  try {
    sanitized = parseAndSanitizeQuote(input);
  } catch (e) {
    if (e instanceof ZodError) {
      const summary = e.issues.map(i => `${i.path.join(".")}: ${i.message}`).join("; ");
      throw new Error(`Invalid quote request: ${summary}`);
    }
    throw e;
  }

  // Get state-specific producer code
  const producerCode = getProducerCodeForState(
    sanitized.state,
    config.covercube.producerCodes
  );
  
  // Build base request with auth & infrastructure fields
  // Zod has already sanitized and validated the input
  const baseRequest = {
    ...sanitized,
    // Inject backend-only fields
    action: "RATEQUOTE" as const,
    username: config.covercube.username,
    password: config.covercube.password,
    producerCode: producerCode,
    transType: TRANS_TYPES.NEW_BUSINESS,
  };

  // Handle state-specific logic
  if (isTexasState(sanitized.state)) {
    // Check if this is a non-owner policy
    if ('IsNonOwner' in sanitized && sanitized.IsNonOwner === YES_NO.YES) {
      return buildTexasNonOwnerRequest(baseRequest, sanitized);
    } else {
      return buildTexasRequest(baseRequest, sanitized);
    }
  } else {
    return buildArizonaRequest(baseRequest);
  }
}


/**
 * Build a Texas regular (with vehicles) request
 *
 * @param baseRequest - The base request with auth credentials and all input fields
 * @param sanitized - The validated and sanitized quote input from Zod
 * @returns A Texas-compliant CovercubeRequest
 */
function buildTexasRequest(
  baseRequest: Record<string, unknown>,
  sanitized: any
): TexasQuoteRequest {
  // Remove IsNonOwner field (requirement: 0 - not included for regular TX)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { IsNonOwner: _IsNonOwner, ...requestWithoutNonOwner } = baseRequest;
  
  // Type assertion is safe here because:
  // 1. Zod has validated all required fields
  // 2. baseRequest contains all required fields from sanitized + auth fields
  return requestWithoutNonOwner as unknown as TexasQuoteRequest;
}

/**
 * Build a Texas non-owner request
 *
 * @param baseRequest - The base request with auth credentials and all input fields
 * @param sanitized - The validated and sanitized quote input from Zod
 * @returns A Texas non-owner compliant CovercubeRequest
 */
function buildTexasNonOwnerRequest(
  baseRequest: Record<string, unknown>,
  sanitized: any
): TexasNonOwnerQuoteRequest {
  // Remove vehicles (requirement: 0 - not included for non-owner)
  // Zod has already validated that vehicles is not present or is empty
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { vehicles: _vehicles, ...restRequest } = baseRequest;
  return restRequest as unknown as TexasNonOwnerQuoteRequest;
}

/**
 * Build an Arizona-specific request
 *
 * Zod transform has already stripped TX-only fields at both policy and vehicle levels
 *
 * @param baseRequest - The base request with auth credentials and all sanitized fields
 * @returns An Arizona-compliant CovercubeRequest
 */
function buildArizonaRequest(baseRequest: Record<string, unknown>): ArizonaQuoteRequest {
  // Zod ArizonaRequestSchema transform has already:
  // - Stripped TX-only top-level fields (UMPD, PIP, IsNonOwner, etc.)
  // - Stripped TX-only vehicle fields (platenumber, platestate, vehiclepurchasedate, etc.)
  // So we can just return the baseRequest as-is
  return baseRequest as unknown as ArizonaQuoteRequest;
}

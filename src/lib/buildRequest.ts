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
 * Transforms client quote input into a state-compliant Covercube API request
 *
 * Zod schemas handle validation and sanitization to ensure data integrity before
 * backend credentials are injected. This separation prevents exposing sensitive
 * config to the client while maintaining type safety throughout the pipeline.
 *
 * State-specific routing ensures TX non-owner policies omit vehicle data and
 * TX regular policies exclude the IsNonOwner flag, as required by Covercube.
 *
 * @param input - Untrusted quote input from client
 * @returns State-compliant CovercubeRequest with injected credentials
 * @throws Error with formatted Zod validation details if input is invalid
 */
export function buildCovercubeRequest(input: unknown): CovercubeRequest {
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

  const producerCode = getProducerCodeForState(
    sanitized.state,
    config.covercube.producerCodes
  );

  // Inject backend-only fields after Zod validation to prevent client tampering
  const baseRequest = {
    ...sanitized,
    action: "RATEQUOTE" as const,
    username: config.covercube.username,
    password: config.covercube.password,
    producerCode: producerCode,
    transType: TRANS_TYPES.NEW_BUSINESS,
  };

  if (isTexasState(sanitized.state)) {
    if ('IsNonOwner' in sanitized && sanitized.IsNonOwner === YES_NO.YES) {
      return buildTexasNonOwnerRequest(baseRequest);
    } else {
      return buildTexasRequest(baseRequest);
    }
  } else {
    return buildArizonaRequest(baseRequest);
  }
}


// Covercube requires IsNonOwner field to be absent (not just falsy) for TX regular policies
function buildTexasRequest(
  baseRequest: Record<string, unknown>
): TexasQuoteRequest {
  const { IsNonOwner: _IsNonOwner, ...requestWithoutNonOwner } = baseRequest;

  // Type assertion is safe: Zod has validated structure and baseRequest includes required auth fields
  return requestWithoutNonOwner as unknown as TexasQuoteRequest;
}

// Covercube requires vehicles field to be absent (not just empty) for TX non-owner policies
function buildTexasNonOwnerRequest(
  baseRequest: Record<string, unknown>,
): TexasNonOwnerQuoteRequest {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { vehicles: _vehicles, ...restRequest } = baseRequest;
  return restRequest as unknown as TexasNonOwnerQuoteRequest;
}

// Zod transform strips TX-only fields (UMPD, PIP, IsNonOwner) to prevent Covercube validation errors
function buildArizonaRequest(baseRequest: Record<string, unknown>): ArizonaQuoteRequest {
  return baseRequest as unknown as ArizonaQuoteRequest;
}

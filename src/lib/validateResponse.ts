// src/lib/validateResponse.ts

import { CovercubeResponseSchema } from "@/zod-schemas/covercube";
import type { CovercubeResponse } from "@/zod-schemas/covercube";
import { ZodError } from "zod";

/**
 * Validates the Covercube API response structure using Zod
 *
 * Ensures the response contains all required fields with correct types.
 * Uses the CovercubeResponseSchema for comprehensive validation.
 *
 * @param rawResponse - The raw response from Covercube API (unknown type)
 * @returns The validated and typed response object
 * @throws Error if required fields are missing or have invalid types
 */
export function validateCovercubeResponse(
  rawResponse: unknown
): CovercubeResponse {
  try {
    return CovercubeResponseSchema.parse(rawResponse);
  } catch (e) {
    if (e instanceof ZodError) {
      // Format Zod errors into developer-friendly messages
      const summary = e.issues.map(i => `${i.path.join(".")}: ${i.message}`).join("; ");
      throw new Error(`Invalid Covercube response: ${summary}`);
    }
    throw e;
  }
}


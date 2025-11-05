// src/lib/parseResponse.ts

import type { CovercubeResponse } from "@/types/covercube";

/**
 * Validates the Covercube API response structure
 *
 * Ensures the response contains all required fields with correct types.
 * Returns the response unchanged after validation.
 *
 * @param rawResponse - The raw response from Covercube API
 * @returns The same response object after successful validation
 * @throws Error if required fields are missing or have invalid types
 */
export function validateCovercubeResponse(
  rawResponse: CovercubeResponse
): CovercubeResponse {
  if (!rawResponse.quoteCode) {
    throw new Error("Missing quoteCode in Covercube response");
  }

  if (typeof rawResponse.quotePremium !== "number") {
    throw new Error("Invalid or missing quotePremium in Covercube response");
  }

  if (typeof rawResponse.quoteTotal !== "number") {
    throw new Error("Invalid or missing quoteTotal in Covercube response");
  }

  if (!Array.isArray(rawResponse.drivers)) {
    throw new Error("Invalid or missing drivers array in Covercube response");
  }

  if (!Array.isArray(rawResponse.coverages)) {
    throw new Error("Invalid or missing coverages array in Covercube response");
  }

  if (!Array.isArray(rawResponse.payplan)) {
    throw new Error("Invalid or missing payplan array in Covercube response");
  }

  return rawResponse;
}


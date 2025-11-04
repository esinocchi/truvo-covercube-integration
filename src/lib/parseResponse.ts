// src/lib/parseResponse.ts

import type { CovercubeResponse } from "@/types/covercube";

/**
 * Validates and parses the Covercube API response
 * 
 * This function ensures the response contains all required fields
 * and can be extended to normalize or transform the data as needed
 * 
 * @param rawResponse - The raw response from Covercube
 * @returns The validated response
 * @throws Error if required fields are missing
 */
export function parseCovercubeResponse(
  rawResponse: CovercubeResponse
): CovercubeResponse {
  // Validate required fields
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

  // Return the validated response
  // In the future, you could transform/normalize the data here
  return rawResponse;
}


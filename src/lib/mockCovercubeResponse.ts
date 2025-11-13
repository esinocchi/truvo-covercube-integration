import type { CovercubeRequest, CovercubeResponse } from "@/zod-schemas/covercube";
import { mockArizonaResponse, mockTexasResponse, mockTexasNonOwnerResponse } from "@/__tests__/fixtures/covercubeResponses";

/**
 * Generates a realistic mock Covercube API response for testing without credentials
 *
 * Returns appropriate mock data based on the request state and type (AZ, TX owned, TX non-owner).
 * Uses the same fixtures as unit tests to ensure consistency.
 *
 * @param request - The Covercube request payload
 * @returns Mock CovercubeResponse matching the request type
 */
export function generateMockResponse(request: CovercubeRequest): CovercubeResponse {
  const state = request.state;
  const isNonOwner = 'IsNonOwner' in request && request.IsNonOwner === 'Y';

  console.log(`[MOCK MODE] Generating mock response for ${state}${isNonOwner ? ' Non-Owner' : ''} quote`);

  if (state === 'AZ') {
    return mockArizonaResponse;
  }

  if (state === 'TX' && isNonOwner) {
    return mockTexasNonOwnerResponse;
  }

  // TX owned vehicle (default)
  return mockTexasResponse;
}

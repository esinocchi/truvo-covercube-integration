import type { CovercubeRequest, CovercubeResponse } from "@/zod-schemas/covercube";
import { config } from "@/config";
import { generateMockResponse } from "./mockCovercubeResponse";

/**
 * Sends rate quote request to Covercube API with error context preservation
 *
 * Isolated in a separate module to enable easy mocking in tests and maintain
 * separation of concerns between request building and external API communication.
 *
 * When MOCK_COVERCUBE=true, returns realistic mock data without calling the real API.
 * This is useful for testing the complete flow without valid API credentials.
 *
 * @param payload - Validated and state-compliant Covercube request
 * @returns Raw API response for Zod validation
 * @throws Error with HTTP status and response text for debugging failed requests
 */
export async function callCovercubeAPI(
  payload: CovercubeRequest
): Promise<CovercubeResponse> {
  console.log('Covercube payload:', JSON.stringify(payload, null, 2));

  // Mock mode - return test data without calling the real API
  if (config.covercube.mockMode) {
    console.log('[MOCK MODE] Bypassing real API call, returning mock data');
    const mockResponse = generateMockResponse(payload);
    console.log('Covercube response (MOCK):', JSON.stringify(mockResponse, null, 2));
    return mockResponse;
  }

  // Real API call
  try {
    const response = await fetch(config.covercube.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Covercube API error (${response.status}): ${errorText}`
      );
    }

    const data = await response.json();
    console.log('Covercube response:', JSON.stringify(data, null, 2));

    return data as CovercubeResponse;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to call Covercube API: ${error.message}`);
    }
    throw new Error("Failed to call Covercube API: Unknown error");
  }
}


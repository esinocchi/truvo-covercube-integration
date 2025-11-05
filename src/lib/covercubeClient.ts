import type { CovercubeRequest, CovercubeResponse } from "@/zod-schemas/covercube";
import { config } from "@/config";

/**
 * Sends rate quote request to Covercube API with error context preservation
 *
 * Isolated in a separate module to enable easy mocking in tests and maintain
 * separation of concerns between request building and external API communication.
 *
 * @param payload - Validated and state-compliant Covercube request
 * @returns Raw API response for Zod validation
 * @throws Error with HTTP status and response text for debugging failed requests
 */
export async function callCovercubeAPI(
  payload: CovercubeRequest
): Promise<CovercubeResponse> {
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
    return data as CovercubeResponse;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to call Covercube API: ${error.message}`);
    }
    throw new Error("Failed to call Covercube API: Unknown error");
  }
}


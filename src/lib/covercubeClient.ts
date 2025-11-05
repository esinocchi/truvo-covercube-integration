// src/lib/covercubeClient.ts

import type { CovercubeRequest, CovercubeResponse } from "@/zod-schemas/covercube";
import { config } from "@/config";

/**
 * Sends a rate quote request to the Covercube API
 * 
 * @param payload - The complete Covercube request payload
 * @returns The parsed response from Covercube
 * @throws Error if the request fails or returns a non-200 status
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


// src/app/api/quote/route.ts

import { NextRequest, NextResponse } from "next/server";
import type { QuoteInput } from "@/zod-schemas/covercube";
import { buildCovercubeRequest } from "@/lib/buildRequest";
import { callCovercubeAPI } from "@/lib/covercubeClient";
import { validateCovercubeResponse } from "@/lib/validateResponse";

/**
 * POST /api/quote
 *
 * Main endpoint for requesting auto insurance rate quotes
 *
 * Flow:
 * 1. Receives QuoteInput from client
 * 2. Builds complete Covercube request (adds auth, producer code, etc.)
 * 3. Sends request to Covercube API
 * 4. Validates and parses the response
 * 5. Returns the quote data to the client
 * 
 * @param request - The incoming HTTP request
 * @returns The response from the Covercube API
 * @throws Error if the request is invalid or the response is invalid
 */
export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.json();

    // Validation is handled through Zod schemas
    const covercubePayload = buildCovercubeRequest(rawBody as QuoteInput);
    const rawResponse = await callCovercubeAPI(covercubePayload);
    const validatedResponse = validateCovercubeResponse(rawResponse);

    return NextResponse.json(validatedResponse, { status: 200 });
  } catch (error) {
    console.error("Error in /api/quote:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}


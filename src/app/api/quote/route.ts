// src/app/api/quote/route.ts

import { NextRequest, NextResponse } from "next/server";
import type { QuoteInput } from "@/types/api";
import { buildCovercubeRequest } from "@/lib/buildRequest";
import { callCovercubeAPI } from "@/lib/covercubeClient";
import { parseCovercubeResponse } from "@/lib/parseResponse";

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
 */
export async function POST(request: NextRequest) {
  try {
    // Parse the incoming request body
    const input: QuoteInput = await request.json();

    // TODO: Add input validation here (e.g., using Zod)
    // For now, we trust the input matches the QuoteInput interface

    // Build the Covercube request
    const covercubePayload = buildCovercubeRequest(input);

    // Call the Covercube API
    const rawResponse = await callCovercubeAPI(covercubePayload);

    // Validate and parse the response
    const parsedResponse = parseCovercubeResponse(rawResponse);

    // Return the quote data
    return NextResponse.json(parsedResponse, { status: 200 });
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


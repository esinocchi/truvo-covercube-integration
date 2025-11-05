import { CovercubeResponseSchema } from "@/zod-schemas/covercube";
import type { CovercubeResponse } from "@/zod-schemas/covercube";
import { ZodError } from "zod";

/**
 * Validates untrusted Covercube API response with Zod schema enforcement
 *
 * Prevents runtime errors from malformed API responses by validating structure
 * before data reaches business logic. Converts Zod validation errors into
 * actionable debugging messages with field paths and failure reasons.
 *
 * @param rawResponse - Untrusted raw API response
 * @returns Type-safe validated response
 * @throws Error with formatted field-level validation details
 */
export function validateCovercubeResponse(
  rawResponse: unknown
): CovercubeResponse {
  try {
    return CovercubeResponseSchema.parse(rawResponse);
  } catch (e) {
    if (e instanceof ZodError) {
      const summary = e.issues.map(i => `${i.path.join(".")}: ${i.message}`).join("; ");
      throw new Error(`Invalid Covercube response: ${summary}`);
    }
    throw e;
  }
}


/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from "vitest";
import { validateCovercubeResponse } from "@/lib/validateResponse";
import type { CovercubeResponse } from "@/zod-schemas/covercube";
import {
  mockArizonaResponse,
  mockTexasResponse,
  mockTexasNonOwnerResponse,
} from "../fixtures/covercubeResponses";

describe("validateCovercubeResponse", () => {
  describe("Valid Responses", () => {
    it("should validate a valid Arizona response", () => {
      const result = validateCovercubeResponse(mockArizonaResponse);

      expect(result.quoteCode).toBe("AZ-123456");
      expect(result.quotePremium).toBe(855.54);
      expect(result.quoteTotal).toBe(985.54);
      expect(result.drivers).toHaveLength(2);
      expect(result.coverages).toHaveLength(5);
      expect(result.payplan).toHaveLength(2);
    });

    it("should validate a valid Texas response", () => {
      const result = validateCovercubeResponse(mockTexasResponse);

      expect(result.quoteCode).toBe("TX-789012");
      expect(result.quotePremium).toBe(920.75);
      expect(result.quoteTotal).toBe(1060.75);
      expect(result.drivers).toHaveLength(1);
      expect(result.coverages).toHaveLength(6); // Includes PIP & UMPD
      expect(result.payplan).toHaveLength(1);
    });

    it("should validate a valid Texas non-owner response", () => {
      const result = validateCovercubeResponse(mockTexasNonOwnerResponse);

      expect(result.quoteCode).toBe("TXNO-345678");
      expect(result.quotePremium).toBe(412.5);
      expect(result.quoteTotal).toBe(492.5);
      expect(result.drivers).toHaveLength(1);
      expect(result.coverages).toHaveLength(4); // No vehicle coverages
    });

    it("should return unchanged response when valid", () => {
      const result = validateCovercubeResponse(mockArizonaResponse);

      // Should be the same object (not transformed)
      expect(result).toEqual(mockArizonaResponse);
    });
  });

  describe("Missing Required Fields (Zod Validation)", () => {
    it("should throw error if quoteCode is missing", () => {
      const invalidResponse = {
        ...mockArizonaResponse,
        quoteCode: "",
      };

      // Zod validates string min length
      expect(() => validateCovercubeResponse(invalidResponse)).toThrow(
        "Invalid Covercube response"
      );
    });

    it("should throw error if quotePremium is not a number", () => {
      const invalidResponse = {
        ...mockArizonaResponse,
        quotePremium: "not a number" as any,
      };

      // Zod validates type
      expect(() => validateCovercubeResponse(invalidResponse)).toThrow(
        "Invalid Covercube response"
      );
    });

    it("should throw error if quotePremium is missing", () => {
      const invalidResponse = {
        ...mockArizonaResponse,
        quotePremium: undefined as any,
      };

      // Zod validates required fields
      expect(() => validateCovercubeResponse(invalidResponse)).toThrow(
        "Invalid Covercube response"
      );
    });

    it("should throw error if quoteTotal is not a number", () => {
      const invalidResponse = {
        ...mockArizonaResponse,
        quoteTotal: null as any,
      };

      // Zod validates type
      expect(() => validateCovercubeResponse(invalidResponse)).toThrow(
        "Invalid Covercube response"
      );
    });

    it("should throw error if drivers is not an array", () => {
      const invalidResponse = {
        ...mockArizonaResponse,
        drivers: "not an array" as any,
      };

      // Zod validates array type
      expect(() => validateCovercubeResponse(invalidResponse)).toThrow(
        "Invalid Covercube response"
      );
    });

    it("should throw error if coverages is not an array", () => {
      const invalidResponse = {
        ...mockArizonaResponse,
        coverages: null as any,
      };

      // Zod validates array type
      expect(() => validateCovercubeResponse(invalidResponse)).toThrow(
        "Invalid Covercube response"
      );
    });

    it("should throw error if payplan is not an array", () => {
      const invalidResponse = {
        ...mockArizonaResponse,
        payplan: {} as any,
      };

      // Zod validates array type
      expect(() => validateCovercubeResponse(invalidResponse)).toThrow(
        "Invalid Covercube response"
      );
    });
  });

  describe("Edge Cases", () => {
    it("should accept empty arrays for drivers, coverages, payplan", () => {
      const responseWithEmptyArrays: CovercubeResponse = {
        ...mockArizonaResponse,
        drivers: [],
        coverages: [],
        payplan: [],
      };

      const result = validateCovercubeResponse(responseWithEmptyArrays);

      expect(result.drivers).toEqual([]);
      expect(result.coverages).toEqual([]);
      expect(result.payplan).toEqual([]);
    });

    it("should accept zero values for premiums", () => {
      const responseWithZeros: CovercubeResponse = {
        ...mockArizonaResponse,
        quotePremium: 0,
        quoteTotal: 0,
        policyFee: 0,
        quoteFeesTotal: 0,
      };

      const result = validateCovercubeResponse(responseWithZeros);

      expect(result.quotePremium).toBe(0);
      expect(result.quoteTotal).toBe(0);
    });

    it("should accept negative values for premiums (discounts/refunds)", () => {
      const responseWithNegatives: CovercubeResponse = {
        ...mockArizonaResponse,
        quotePremium: -100.0,
        quoteTotal: -50.0,
      };

      const result = validateCovercubeResponse(responseWithNegatives);

      expect(result.quotePremium).toBe(-100.0);
      expect(result.quoteTotal).toBe(-50.0);
    });
  });

  describe("Response Structure Validation", () => {
    it("should validate driver objects structure", () => {
      const result = validateCovercubeResponse(mockArizonaResponse);

      result.drivers.forEach((driver) => {
        expect(driver).toHaveProperty("firstName");
        expect(driver).toHaveProperty("lastName");
        expect(driver).toHaveProperty("driverAge");
        expect(driver).toHaveProperty("rateOrder");
      });
    });

    it("should validate coverage objects structure", () => {
      const result = validateCovercubeResponse(mockTexasResponse);

      result.coverages.forEach((coverage) => {
        expect(coverage).toHaveProperty("coverageCode");
        expect(coverage).toHaveProperty("coverageLimit");
        expect(coverage).toHaveProperty("coverageTotal");
        expect(typeof coverage.coverageTotal).toBe("number");
      });
    });

    it("should validate payplan objects structure", () => {
      const result = validateCovercubeResponse(mockArizonaResponse);

      result.payplan.forEach((plan) => {
        expect(plan).toHaveProperty("description");
        expect(plan).toHaveProperty("downPayment");
        expect(plan).toHaveProperty("downPercent");
        expect(plan).toHaveProperty("totalPremium");
        expect(plan).toHaveProperty("instalments");
        expect(plan).toHaveProperty("refCode");
      });
    });

    it("should include viewQuote and consumerBridge URLs", () => {
      const result = validateCovercubeResponse(mockArizonaResponse);

      expect(result.viewQuote).toContain("https://");
      expect(result.consumerBridge).toContain("https://");
      expect(result.viewQuote).toContain(result.quoteCode);
    });
  });
});


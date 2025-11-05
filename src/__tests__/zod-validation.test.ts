// Tests for Zod validation and sanitization

import { describe, it, expect } from "vitest";
import { 
  parseAndSanitizeQuote,
  CovercubeResponseSchema,
  type ArizonaQuoteRequest,
  type TexasQuoteRequest,
  type TexasNonOwnerQuoteRequest,
} from "@/zod-schemas/covercube";
import { ZodError } from "zod";
import {
  arizonaQuoteInput,
  texasQuoteInput,
  texasNonOwnerQuoteInput,
} from "./fixtures/quoteInputs";
import {
  mockArizonaResponse,
  mockTexasResponse,
  mockTexasNonOwnerResponse,
} from "./fixtures/covercubeResponses";

describe("Zod Request Validation - Arizona", () => {
  it("should parse and validate a valid Arizona quote", () => {
    const result = parseAndSanitizeQuote(arizonaQuoteInput);

    expect(result.state).toBe("AZ");
    expect(result.vehicles).toHaveLength(2);
    expect(result.drivers).toHaveLength(2);
    expect(result.BI).toBe("25/50");
    expect(result.PD).toBe("15");
  });

  it("should strip TX-only fields from Arizona requests", () => {
    const inputWithTxFields = {
      ...arizonaQuoteInput,
      // Add TX-only fields that should be stripped
      UMPD: "25",
      PIP: "2500",
      priorpolicynumber: "TX123456",
      priorbicoveragelimit: "30/60",
      priorpipcoveragelimit: 30,
      IsNonOwner: "Y",
    };

    const result = parseAndSanitizeQuote(inputWithTxFields) as any;

    // Verify TX-only fields are stripped
    expect(result.UMPD).toBeUndefined();
    expect(result.PIP).toBeUndefined();
    expect(result.priorpolicynumber).toBeUndefined();
    expect(result.priorbicoveragelimit).toBeUndefined();
    expect(result.priorpipcoveragelimit).toBeUndefined();
    expect(result.IsNonOwner).toBeUndefined();
  });

  it("should strip plate fields from Arizona vehicles", () => {
    const inputWithPlateFields = {
      ...arizonaQuoteInput,
      vehicles: [
        {
          ...arizonaQuoteInput.vehicles[0],
          platenumber: "ABC123",
          platestate: "AZ",
          vehiclepurchasedate: "2025/01/01",
          estimatemilage: 50000,
          ownershiplength: "1YR",
        },
      ],
    };

    const result = parseAndSanitizeQuote(inputWithPlateFields) as any;

    // Verify vehicle TX-only fields are stripped
    const vehicle = result.vehicles[0];
    expect(vehicle.platenumber).toBeUndefined();
    expect(vehicle.platestate).toBeUndefined();
    expect(vehicle.vehiclepurchasedate).toBeUndefined();
    expect(vehicle.estimatemilage).toBeUndefined();
    expect(vehicle.ownershiplength).toBeUndefined();
  });

  it("should reject Arizona quote with missing required fields", () => {
    const invalidInput = {
      ...arizonaQuoteInput,
      BI: undefined, // Required field
    };

    expect(() => parseAndSanitizeQuote(invalidInput)).toThrow(ZodError);
  });

  it("should reject Arizona quote with missing vehicles", () => {
    const invalidInput = {
      ...arizonaQuoteInput,
      vehicles: [],
    };

    expect(() => parseAndSanitizeQuote(invalidInput)).toThrow(ZodError);
  });

  it("should reject Arizona quote with invalid date format", () => {
    const invalidInput = {
      ...arizonaQuoteInput,
      inceptionDate: "11/01/2025", // Wrong format (should be YYYY/MM/DD)
    };

    expect(() => parseAndSanitizeQuote(invalidInput)).toThrow(ZodError);
  });

  it("should validate Arizona driver with required AZ fields", () => {
    const result = parseAndSanitizeQuote(arizonaQuoteInput) as ArizonaQuoteRequest;

    const driver = result.drivers[0];
    expect(driver.firstName).toBe("Test4");
    expect(driver.married).toBe("Y");
    expect(driver.licenseNumber).toBe("A53454557");
    expect(driver.licenseState).toBe("AZ");
    expect(driver.sr22).toBe("Y");
  });
});

describe("Zod Request Validation - Texas Owned", () => {
  it("should parse and validate a valid Texas owned-vehicle quote", () => {
    const result = parseAndSanitizeQuote(texasQuoteInput);

    expect(result.state).toBe("TX");
    expect(result.vehicles).toHaveLength(1);
    expect(result.drivers).toHaveLength(1);
    expect(result.BI).toBe("30/60");
    expect(result.PD).toBe("25");
  });

  it("should accept TX-specific fields in Texas requests", () => {
    const result = parseAndSanitizeQuote(texasQuoteInput) as any;

    // Verify TX-specific fields are preserved
    expect(result.UMPD).toBe("25");
    expect(result.PIP).toBe("2500");
    expect(result.priorpolicynumber).toBe("TX123456");
    expect(result.priorbicoveragelimit).toBe("30/60");
    expect(result.priorpipcoveragelimit).toBe(30);
  });

  it("should accept TX vehicle-specific fields", () => {
    const result = parseAndSanitizeQuote(texasQuoteInput) as any;

    const vehicle = result.vehicles[0];
    expect(vehicle.platenumber).toBe("1234567");
    expect(vehicle.platestate).toBe("TX");
    expect(vehicle.vehiclepurchasedate).toBe("2025/01/01");
    expect(vehicle.estimatemilage).toBe(100000);
    expect(vehicle.ownershiplength).toBe("NOREG");
    expect(vehicle.roadsideAssistance).toBe("Y");
  });

  it("should reject Texas quote with missing vehicles", () => {
    const invalidInput = {
      ...texasQuoteInput,
      vehicles: [],
    };

    expect(() => parseAndSanitizeQuote(invalidInput)).toThrow(ZodError);
  });

  it("should validate Texas driver with optional TX fields", () => {
    const result = parseAndSanitizeQuote(texasQuoteInput) as TexasQuoteRequest;

    const driver = result.drivers[0];
    expect(driver.firstName).toBe("CCTX");
    expect(driver.licenseState).toBe("TX");
    expect(driver.occupation).toBe("OTHER");
    expect(driver.violations).toHaveLength(1);
    expect(driver.violations![0].code).toBe("ADMOV");
  });
});

describe("Zod Request Validation - Texas Non-Owner", () => {
  it("should parse and validate a valid Texas non-owner quote", () => {
    const result = parseAndSanitizeQuote(texasNonOwnerQuoteInput);

    expect(result.state).toBe("TX");
    expect(result.IsNonOwner).toBe("Y");
    expect(result.drivers).toHaveLength(1);
    expect((result as any).vehicles).toBeUndefined();
  });

  it("should reject non-owner quote with vehicles", () => {
    const invalidInput = {
      ...texasNonOwnerQuoteInput,
      vehicles: [
        {
          year: 2022,
          make: "TOYOTA",
          model: "CAMRY",
          vehicleUse: "WRK",
        },
      ],
    };

    expect(() => parseAndSanitizeQuote(invalidInput)).toThrow(ZodError);
  });

  it("should require IsNonOwner='Y' for non-owner policies", () => {
    const invalidInput = {
      ...texasNonOwnerQuoteInput,
      IsNonOwner: "N",
    };

    // Should fail because IsNonOwner must be "Y" for non-owner schema
    expect(() => parseAndSanitizeQuote(invalidInput)).toThrow();
  });

  it("should accept TX fields in non-owner requests", () => {
    const result = parseAndSanitizeQuote(texasNonOwnerQuoteInput) as any;

    expect(result.UMPD).toBe("25");
    expect(result.PIP).toBe("2500");
    expect(result.address2).toBe("");
  });
});

describe("Zod Request Validation - Common Rules", () => {
  it("should reject unsupported state", () => {
    const invalidInput = {
      ...arizonaQuoteInput,
      state: "CA", // Unsupported state
    };

    expect(() => parseAndSanitizeQuote(invalidInput)).toThrow();
  });

  it("should validate email format", () => {
    const invalidInput = {
      ...arizonaQuoteInput,
      email: "not-an-email",
    };

    expect(() => parseAndSanitizeQuote(invalidInput)).toThrow(ZodError);
  });

  it("should accept valid email", () => {
    const validInput = {
      ...arizonaQuoteInput,
      email: "test@example.com",
    };

    const result = parseAndSanitizeQuote(validInput);
    expect(result.email).toBe("test@example.com");
  });

  it("should validate YesNo enum values", () => {
    const invalidInput = {
      ...arizonaQuoteInput,
      mailSame: "YES", // Should be "Y" or "N"
    };

    expect(() => parseAndSanitizeQuote(invalidInput)).toThrow(ZodError);
  });

  it("should validate vehicle party/lienholder information", () => {
    const result = parseAndSanitizeQuote(arizonaQuoteInput) as ArizonaQuoteRequest;

    const party = result.vehicles[1].parties![0];
    expect(party.partyName).toBe("Bank of America (Auto)");
    expect(party.partyType).toBe("Additional Interest");
    expect(party.address1).toBe("Waffle");
    expect(party.address2).toBe("Wef");
    expect(party.city).toBe("Wef");
    expect(party.state).toBe("DE");
    expect(party.zip).toBe("12312");
  });
});

describe("Zod Response Validation", () => {
  it("should validate a valid Arizona response", () => {
    const result = CovercubeResponseSchema.parse(mockArizonaResponse);

    expect(result.quoteCode).toBe("AZ-123456");
    expect(result.quotePremium).toBe(855.54);
    expect(result.quoteTotal).toBe(985.54);
    expect(result.drivers).toHaveLength(2);
    expect(result.coverages).toHaveLength(5);
    expect(result.payplan).toHaveLength(2);
  });

  it("should validate a valid Texas response", () => {
    const result = CovercubeResponseSchema.parse(mockTexasResponse);

    expect(result.quoteCode).toBe("TX-789012");
    expect(result.quotePremium).toBe(920.75);
    expect(result.coverages).toHaveLength(6); // Includes PIP and UMPD
  });

  it("should validate a valid Texas non-owner response", () => {
    const result = CovercubeResponseSchema.parse(mockTexasNonOwnerResponse);

    expect(result.quoteCode).toBe("TXNO-345678");
    expect(result.quotePremium).toBe(412.5);
    expect(result.coverages).toHaveLength(4); // No vehicle coverages
  });

  it("should reject response with missing required fields", () => {
    const invalidResponse = {
      ...mockArizonaResponse,
      quoteCode: undefined, // Required field
    };

    expect(() => CovercubeResponseSchema.parse(invalidResponse)).toThrow(ZodError);
  });

  it("should reject response with invalid types", () => {
    const invalidResponse = {
      ...mockArizonaResponse,
      quotePremium: "855.54", // Should be number
    };

    expect(() => CovercubeResponseSchema.parse(invalidResponse)).toThrow(ZodError);
  });

  it("should validate response URL fields", () => {
    const result = CovercubeResponseSchema.parse(mockArizonaResponse);

    expect(result.viewQuote).toMatch(/^https?:\/\//);
    expect(result.consumerBridge).toMatch(/^https?:\/\//);
  });

  it("should reject response with invalid URL format", () => {
    const invalidResponse = {
      ...mockArizonaResponse,
      viewQuote: "not-a-url",
    };

    expect(() => CovercubeResponseSchema.parse(invalidResponse)).toThrow(ZodError);
  });

  it("should validate driver information in response", () => {
    const result = CovercubeResponseSchema.parse(mockArizonaResponse);

    const driver = result.drivers[0];
    expect(driver.firstName).toBe("Test4");
    expect(driver.lastName).toBe("ITC0307");
    expect(driver.driverAge).toBe(45);
    expect(driver.rateOrder).toBe(1);
  });

  it("should validate coverage information in response", () => {
    const result = CovercubeResponseSchema.parse(mockArizonaResponse);

    const coverage = result.coverages[0];
    expect(coverage.coverageCode).toBe("BI");
    expect(coverage.coverageLimit).toBe("25/50");
    expect(coverage.coverageTotal).toBe(205.43);
  });

  it("should validate payplan information in response", () => {
    const result = CovercubeResponseSchema.parse(mockArizonaResponse);

    const payplan = result.payplan[0];
    expect(payplan.description).toBe("6 Monthly Payments-Direct Billing");
    expect(payplan.downPayment).toBe(251.25);
    expect(payplan.instalments).toBe(6);
    expect(payplan.refCode).toBe("6P2");
  });
});

describe("Zod Sanitization", () => {
  it("should transform and remove specific fields for AZ", () => {
    const inputWithExtras = {
      ...arizonaQuoteInput,
      UMPD: "25",
      PIP: "2500",
      vehicles: [
        {
          ...arizonaQuoteInput.vehicles[0],
          platenumber: "ABC123",
          platestate: "AZ",
        },
      ],
    };

    const result = parseAndSanitizeQuote(inputWithExtras) as any;

    // Top-level TX fields should be removed
    expect(result.UMPD).toBeUndefined();
    expect(result.PIP).toBeUndefined();

    // Vehicle TX fields should be removed
    expect(result.vehicles[0].platenumber).toBeUndefined();
    expect(result.vehicles[0].platestate).toBeUndefined();

    // Valid fields should remain
    expect(result.state).toBe("AZ");
    expect(result.vehicles[0].year).toBe(2022);
  });

  it("should preserve all valid fields for TX owned", () => {
    const result = parseAndSanitizeQuote(texasQuoteInput) as any;

    // All TX fields should be preserved
    expect(result.UMPD).toBe("25");
    expect(result.PIP).toBe("2500");
    expect(result.vehicles[0].platenumber).toBe("1234567");
    expect(result.vehicles[0].vehiclepurchasedate).toBe("2025/01/01");
  });

  it("should handle optional fields correctly", () => {
    const minimalAzInput = {
      action: "RATEQUOTE",
      username: "test@example.com",
      password: "password",
      producerCode: "AZ1198",
      transType: "NB",
      state: "AZ",
      policyTerm: "6 Months",
      inceptionDate: "2025/11/01",
      effectiveDate: "2025/11/01",
      rateDate: "2025/11/01",
      holderFirstName: "Test",
      holderLastName: "User",
      address: "123 Main St",
      city: "Phoenix",
      zipCode: "85001",
      BI: "25/50",
      PD: "15",
      payplan: "FP",
      vehicles: [
        {
          year: 2022,
          make: "TOYOTA",
          model: "CAMRY",
          vehicleUse: "WRK",
        },
      ],
      drivers: [
        {
          firstName: "Test",
          lastName: "User",
          dob: "1990/01/01",
          gender: "M",
          married: "N",
          licenseNumber: "12345",
          licenseState: "AZ",
          licenseStatus: "VALID",
          sr22: "N",
        },
      ],
    };

    const result = parseAndSanitizeQuote(minimalAzInput);
    expect(result).toBeDefined();
    expect(result.state).toBe("AZ");
  });
});


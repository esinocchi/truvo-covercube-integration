import { describe, it, expect, beforeEach, vi } from "vitest";
import { buildCovercubeRequest } from "@/lib/buildRequest";
import type { QuoteInput } from "@/types/api";
import {
  arizonaQuoteInput,
  texasQuoteInput,
  texasNonOwnerQuoteInput,
} from "../fixtures/quoteInputs";

// Mock the config module
vi.mock("@/config", () => ({
  config: {
    covercube: {
      url: "https://test-api.example.com",
      username: "test@example.com",
      password: "testpass123",
      producerCodes: {
        AZ: "AZ1198",
        TX: "TX1199",
      },
    },
  },
}));

describe("buildCovercubeRequest", () => {
  describe("Arizona Policies", () => {
    it("should build a valid Arizona request with all required fields", () => {
      const result = buildCovercubeRequest(arizonaQuoteInput);

      // Check infrastructure fields are injected
      expect(result.action).toBe("RATEQUOTE");
      expect(result.username).toBe("test@example.com");
      expect(result.password).toBe("testpass123");
      expect(result.producerCode).toBe("AZ1198");
      expect(result.transType).toBe("NB");

      // Check state-specific data
      expect(result.state).toBe("AZ");
      expect(result.vehicles).toBeDefined();
      expect(result.vehicles).toHaveLength(2);

      // Ensure TX-only fields are stripped
      expect(result.PIP).toBeUndefined();
      expect(result.UMPD).toBeUndefined();
      expect(result.IsNonOwner).toBeUndefined();
      expect(result.priorbicoveragelimit).toBeUndefined();

      // Check vehicles don't have TX-only fields
      result.vehicles?.forEach((vehicle) => {
        expect(vehicle.vehiclepurchasedate).toBeUndefined();
        expect(vehicle.estimatemilage).toBeUndefined();
        expect(vehicle.ownershiplength).toBeUndefined();
      });
    });

    it("should include plate information for Arizona vehicles", () => {
      const result = buildCovercubeRequest(arizonaQuoteInput);

      // Vehicle 2 has plate info
      expect(result.vehicles?.[1].platenumber).toBe("7896541");
      expect(result.vehicles?.[1].platestate).toBe("AZ");
    });

    it("should preserve all AZ coverage fields", () => {
      const result = buildCovercubeRequest(arizonaQuoteInput);

      expect(result.BI).toBe("25/50");
      expect(result.PD).toBe("15");
      expect(result.UMBI).toBe("25/50");
      expect(result.UIMBI).toBe("25/50");
      expect(result.MP).toBe("500");
      expect(result.roadsideAssistance).toBe("Y");
    });

    it("should throw error if Arizona input has PIP coverage", () => {
      const invalidInput: QuoteInput = {
        ...arizonaQuoteInput,
        PIP: "2500",
      };

      expect(() => buildCovercubeRequest(invalidInput)).toThrow(
        "Arizona policies do not support PIP coverage"
      );
    });

    it("should throw error if Arizona input has UMPD coverage", () => {
      const invalidInput: QuoteInput = {
        ...arizonaQuoteInput,
        UMPD: "25",
      };

      expect(() => buildCovercubeRequest(invalidInput)).toThrow(
        "Arizona policies do not support UMPD coverage"
      );
    });

    it("should throw error if Arizona input has IsNonOwner flag", () => {
      const invalidInput: QuoteInput = {
        ...arizonaQuoteInput,
        IsNonOwner: "Y",
      };

      expect(() => buildCovercubeRequest(invalidInput)).toThrow(
        "Arizona does not support non-owner policies"
      );
    });

    it("should throw error if Arizona input has no vehicles", () => {
      const invalidInput: QuoteInput = {
        ...arizonaQuoteInput,
        vehicles: [],
      };

      expect(() => buildCovercubeRequest(invalidInput)).toThrow(
        "Arizona policies require at least one vehicle"
      );
    });

    it("should throw error if Arizona vehicle has TX-specific fields", () => {
      const invalidInput: QuoteInput = {
        ...arizonaQuoteInput,
        vehicles: [
          {
            ...arizonaQuoteInput.vehicles![0],
            vehiclepurchasedate: "2025/01/01",
          },
        ],
      };

      expect(() => buildCovercubeRequest(invalidInput)).toThrow(
        "Vehicle 1 should not have vehiclepurchasedate for Arizona"
      );
    });
  });

  describe("Texas Regular Policies", () => {
    it("should build a valid Texas request with all required fields", () => {
      const result = buildCovercubeRequest(texasQuoteInput);

      // Check infrastructure fields
      expect(result.action).toBe("RATEQUOTE");
      expect(result.producerCode).toBe("TX1199");
      expect(result.transType).toBe("NB");

      // Check TX-specific data
      expect(result.state).toBe("TX");
      expect(result.vehicles).toBeDefined();
      expect(result.vehicles).toHaveLength(1);

      // TX-required fields
      expect(result.PIP).toBe("2500");
      expect(result.UMPD).toBe("25");

      // Should include TX-specific vehicle fields
      expect(result.vehicles?.[0].platenumber).toBe("1234567");
      expect(result.vehicles?.[0].platestate).toBe("TX");
      expect(result.vehicles?.[0].vehiclepurchasedate).toBe("2025/01/01");
      expect(result.vehicles?.[0].estimatemilage).toBe(100000);
      expect(result.vehicles?.[0].ownershiplength).toBe("NOREG");
    });

    it("should preserve TX prior insurance fields", () => {
      const result = buildCovercubeRequest(texasQuoteInput);

      expect(result.priorbicoveragelimit).toBe("30/60");
      expect(result.priorpipcoveragelimit).toBe(30);
    });

    it("should throw error if Texas regular policy has no vehicles", () => {
      const invalidInput: QuoteInput = {
        ...texasQuoteInput,
        vehicles: [],
      };

      expect(() => buildCovercubeRequest(invalidInput)).toThrow(
        "Texas policies require at least one vehicle"
      );
    });

    it("should throw error if Texas regular policy has no PIP", () => {
      const invalidInput: QuoteInput = {
        ...texasQuoteInput,
        PIP: undefined,
      };

      expect(() => buildCovercubeRequest(invalidInput)).toThrow(
        "Texas policies require PIP coverage"
      );
    });
  });

  describe("Texas Non-Owner Policies", () => {
    it("should build a valid Texas non-owner request", () => {
      const result = buildCovercubeRequest(texasNonOwnerQuoteInput);

      // Check infrastructure fields
      expect(result.action).toBe("RATEQUOTE");
      expect(result.producerCode).toBe("TX1199");

      // Check non-owner specific requirements
      expect(result.IsNonOwner).toBe("Y");
      expect(result.vehicles).toBeUndefined();
      expect(result.roadsideAssistance).toBeUndefined();

      // TX Non-Owner requires PIP and UMPD
      expect(result.PIP).toBe("2500");
      expect(result.UMPD).toBe("25");
    });

    it("should throw error if TX non-owner has vehicles", () => {
      const invalidInput: QuoteInput = {
        ...texasNonOwnerQuoteInput,
        vehicles: [
          {
            year: 2020,
            make: "TOYOTA",
            model: "CAMRY",
            vehicleUse: "WRK",
          },
        ],
      };

      expect(() => buildCovercubeRequest(invalidInput)).toThrow(
        "Texas non-owner policies cannot have vehicles"
      );
    });

    it("should throw error if TX non-owner has roadsideAssistance", () => {
      const invalidInput: QuoteInput = {
        ...texasNonOwnerQuoteInput,
        roadsideAssistance: "Y",
      };

      expect(() => buildCovercubeRequest(invalidInput)).toThrow(
        "Texas non-owner policies cannot have roadsideAssistance"
      );
    });

    it("should throw error if TX non-owner missing PIP", () => {
      const invalidInput: QuoteInput = {
        ...texasNonOwnerQuoteInput,
        PIP: undefined,
      };

      expect(() => buildCovercubeRequest(invalidInput)).toThrow(
        "Texas non-owner policies require PIP coverage"
      );
    });

    it("should throw error if TX non-owner missing UMPD", () => {
      const invalidInput: QuoteInput = {
        ...texasNonOwnerQuoteInput,
        UMPD: undefined,
      };

      expect(() => buildCovercubeRequest(invalidInput)).toThrow(
        "Texas non-owner policies require UMPD coverage"
      );
    });
  });

  describe("Common Fields", () => {
    it("should pass through all common policyholder fields", () => {
      const result = buildCovercubeRequest(arizonaQuoteInput);

      expect(result.holderFirstName).toBe("Test4");
      expect(result.holderMiddleInitial).toBe("A");
      expect(result.holderLastName).toBe("ITC0307");
      expect(result.address).toBe("235 S 190th Ave");
      expect(result.city).toBe("BUCKEYE");
      expect(result.zipCode).toBe("85326");
      expect(result.email).toBe("Test.AZ@zywave.com");
      expect(result.cellPhone).toBe("9999999999");
    });

    it("should pass through all drivers", () => {
      const result = buildCovercubeRequest(arizonaQuoteInput);

      expect(result.drivers).toHaveLength(2);
      expect(result.drivers[0].firstName).toBe("Test4");
      expect(result.drivers[1].firstName).toBe("FeTest");
    });

    it("should pass through discount flags", () => {
      const result = buildCovercubeRequest(texasQuoteInput);

      expect(result.unacceptableRisk).toBe("N");
      expect(result.renewalDiscount).toBe("N");
      expect(result.advanceDiscount).toBe("N");
      expect(result.homeownerDiscount).toBe("Y");
    });

    it("should pass through prior insurance data", () => {
      const result = buildCovercubeRequest(arizonaQuoteInput);

      expect(result.ispriorpolicy).toBe("YES");
      expect(result.priordayslapse).toBe("10");
      expect(result.priorexpirationdate).toBe("2025/06/28");
      expect(result.monthsinprior).toBe("5");
      expect(result.ispriorinsameagency).toBe("YES");
    });
  });

  describe("Producer Code Selection", () => {
    it("should use correct producer code for Arizona", () => {
      const result = buildCovercubeRequest(arizonaQuoteInput);
      expect(result.producerCode).toBe("AZ1198");
    });

    it("should use correct producer code for Texas", () => {
      const result = buildCovercubeRequest(texasQuoteInput);
      expect(result.producerCode).toBe("TX1199");
    });
  });
});


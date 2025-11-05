/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/quote/route";
import { NextRequest } from "next/server";
import {
  arizonaQuoteInput,
  texasQuoteInput,
  texasNonOwnerQuoteInput,
} from "../fixtures/quoteInputs";
import {
  mockArizonaResponse,
  mockTexasResponse,
  mockTexasNonOwnerResponse,
} from "../fixtures/covercubeResponses";

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

// Mock fetch globally
global.fetch = vi.fn();

describe("POST /api/quote", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Successful Requests", () => {
    it("should successfully process an Arizona quote request", async () => {
      // Mock successful API response
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockArizonaResponse,
      });

      const request = new NextRequest("http://localhost:3000/api/quote", {
        method: "POST",
        body: JSON.stringify(arizonaQuoteInput),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.quoteCode).toBe("AZ-123456");
      expect(data.quotePremium).toBe(855.54);
      expect(data.drivers).toHaveLength(2);

      // Verify fetch was called with correct params
      expect(global.fetch).toHaveBeenCalledTimes(1);
      const fetchCall = (global.fetch as any).mock.calls[0];
      expect(fetchCall[0]).toBe("https://test-api.example.com");
      expect(fetchCall[1].method).toBe("POST");
      expect(fetchCall[1].headers["Content-Type"]).toBe("application/json");
    });

    it("should successfully process a Texas quote request", async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockTexasResponse,
      });

      const request = new NextRequest("http://localhost:3000/api/quote", {
        method: "POST",
        body: JSON.stringify(texasQuoteInput),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.quoteCode).toBe("TX-789012");
      expect(data.coverages).toHaveLength(6); // Includes PIP & UMPD
    });

    it("should successfully process a Texas non-owner quote request", async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockTexasNonOwnerResponse,
      });

      const request = new NextRequest("http://localhost:3000/api/quote", {
        method: "POST",
        body: JSON.stringify(texasNonOwnerQuoteInput),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.quoteCode).toBe("TXNO-345678");
      expect(data.coverages).toHaveLength(4); // No vehicle coverages
    });

    it("should inject authentication credentials in Covercube request", async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockArizonaResponse,
      });

      const request = new NextRequest("http://localhost:3000/api/quote", {
        method: "POST",
        body: JSON.stringify(arizonaQuoteInput),
      });

      await POST(request);

      const fetchCall = (global.fetch as any).mock.calls[0];
      const requestBody = JSON.parse(fetchCall[1].body);

      expect(requestBody.username).toBe("test@example.com");
      expect(requestBody.password).toBe("testpass123");
      expect(requestBody.action).toBe("RATEQUOTE");
      expect(requestBody.transType).toBe("NB");
    });

    it("should use correct producer code for state", async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockTexasResponse,
      });

      const request = new NextRequest("http://localhost:3000/api/quote", {
        method: "POST",
        body: JSON.stringify(texasQuoteInput),
      });

      await POST(request);

      const fetchCall = (global.fetch as any).mock.calls[0];
      const requestBody = JSON.parse(fetchCall[1].body);

      expect(requestBody.producerCode).toBe("TX1199");
    });
  });

  describe("Validation Errors", () => {
    it("should return 500 error for Arizona with PIP coverage", async () => {
      const invalidInput = {
        ...arizonaQuoteInput,
        PIP: "2500",
      };

      const request = new NextRequest("http://localhost:3000/api/quote", {
        method: "POST",
        body: JSON.stringify(invalidInput),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toContain("Arizona policies do not support PIP coverage");
    });

    it("should return 500 error for Texas without vehicles", async () => {
      const invalidInput = {
        ...texasQuoteInput,
        vehicles: [],
      };

      const request = new NextRequest("http://localhost:3000/api/quote", {
        method: "POST",
        body: JSON.stringify(invalidInput),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toContain("Texas policies require at least one vehicle");
    });

    it("should accept TX regular policy without PIP (optional)", async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockTexasResponse,
      });

      const inputWithoutPIP = {
        ...texasQuoteInput,
        PIP: undefined,
      };

      const request = new NextRequest("http://localhost:3000/api/quote", {
        method: "POST",
        body: JSON.stringify(inputWithoutPIP),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.quoteCode).toBeDefined();
    });

    it("should accept TX non-owner without PIP (optional)", async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockTexasNonOwnerResponse,
      });

      const inputWithoutPIP = {
        ...texasNonOwnerQuoteInput,
        PIP: undefined,
      };

      const request = new NextRequest("http://localhost:3000/api/quote", {
        method: "POST",
        body: JSON.stringify(inputWithoutPIP),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.quoteCode).toBeDefined();
    });

    it("should accept TX non-owner without UMPD (optional)", async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockTexasNonOwnerResponse,
      });

      const inputWithoutUMPD = {
        ...texasNonOwnerQuoteInput,
        UMPD: undefined,
      };

      const request = new NextRequest("http://localhost:3000/api/quote", {
        method: "POST",
        body: JSON.stringify(inputWithoutUMPD),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.quoteCode).toBeDefined();
    });

    it("should return 500 error for TX non-owner with vehicles", async () => {
      const invalidInput = {
        ...texasNonOwnerQuoteInput,
        vehicles: [
          {
            year: 2020,
            make: "TOYOTA",
            model: "CAMRY",
            vehicleUse: "WRK" as const,
          },
        ],
      };

      const request = new NextRequest("http://localhost:3000/api/quote", {
        method: "POST",
        body: JSON.stringify(invalidInput),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toContain("Texas non-owner policies cannot have vehicles");
    });
  });

  describe("API Errors", () => {
    it("should handle Covercube API 500 error", async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => "Internal Server Error",
      });

      const request = new NextRequest("http://localhost:3000/api/quote", {
        method: "POST",
        body: JSON.stringify(arizonaQuoteInput),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toContain("Covercube API error");
    });

    it("should handle network errors", async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error("Network error"));

      const request = new NextRequest("http://localhost:3000/api/quote", {
        method: "POST",
        body: JSON.stringify(arizonaQuoteInput),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBeDefined();
    });

    it("should handle invalid JSON response from Covercube", async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new Error("Invalid JSON");
        },
      });

      const request = new NextRequest("http://localhost:3000/api/quote", {
        method: "POST",
        body: JSON.stringify(arizonaQuoteInput),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBeDefined();
    });

    it("should handle missing required fields in Covercube response", async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ...mockArizonaResponse,
          quoteCode: "", // Missing required field
        }),
      });

      const request = new NextRequest("http://localhost:3000/api/quote", {
        method: "POST",
        body: JSON.stringify(arizonaQuoteInput),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toContain("Missing quoteCode");
    });
  });

  describe("Request Processing", () => {
    it("should strip TX-only fields from Arizona requests", async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockArizonaResponse,
      });

      const request = new NextRequest("http://localhost:3000/api/quote", {
        method: "POST",
        body: JSON.stringify(arizonaQuoteInput),
      });

      await POST(request);

      const fetchCall = (global.fetch as any).mock.calls[0];
      const requestBody = JSON.parse(fetchCall[1].body);

      // Verify TX-only policy fields are stripped
      expect(requestBody.PIP).toBeUndefined();
      expect(requestBody.UMPD).toBeUndefined();
      expect(requestBody.IsNonOwner).toBeUndefined();
      expect(requestBody.address2).toBeUndefined();
      expect(requestBody.priorbicoveragelimit).toBeUndefined();
      expect(requestBody.priorpipcoveragelimit).toBeUndefined();
      
      // Verify TX-only vehicle fields are stripped (check first vehicle)
      if (requestBody.vehicles && requestBody.vehicles.length > 0) {
        expect(requestBody.vehicles[0].platenumber).toBeUndefined();
        expect(requestBody.vehicles[0].platestate).toBeUndefined();
        expect(requestBody.vehicles[0].weight).toBeUndefined();
        expect(requestBody.vehicles[0].ridesharing).toBeUndefined();
        expect(requestBody.vehicles[0].vehiclepurchasedate).toBeUndefined();
        expect(requestBody.vehicles[0].estimatemilage).toBeUndefined();
        expect(requestBody.vehicles[0].ownershiplength).toBeUndefined();
      }
    });

    it("should include TX-specific fields in Texas requests", async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockTexasResponse,
      });

      const request = new NextRequest("http://localhost:3000/api/quote", {
        method: "POST",
        body: JSON.stringify(texasQuoteInput),
      });

      await POST(request);

      const fetchCall = (global.fetch as any).mock.calls[0];
      const requestBody = JSON.parse(fetchCall[1].body);

      // Verify TX fields are present
      expect(requestBody.PIP).toBe("2500");
      expect(requestBody.UMPD).toBe("25");
      expect(requestBody.priorbicoveragelimit).toBe("30/60");
      
      // Verify IsNonOwner is stripped for TX regular (requirement: 0)
      expect(requestBody.IsNonOwner).toBeUndefined();
    });

    it("should remove vehicles and roadsideAssistance for TX non-owner", async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockTexasNonOwnerResponse,
      });

      const request = new NextRequest("http://localhost:3000/api/quote", {
        method: "POST",
        body: JSON.stringify(texasNonOwnerQuoteInput),
      });

      await POST(request);

      const fetchCall = (global.fetch as any).mock.calls[0];
      const requestBody = JSON.parse(fetchCall[1].body);

      // Verify non-owner specifics (requirement: IsNonOwner = 2, vehicles = 0, roadsideAssistance from base = removed)
      expect(requestBody.IsNonOwner).toBe("Y");
      expect(requestBody.vehicles).toBeUndefined();
      expect(requestBody.roadsideAssistance).toBeUndefined();
    });
  });

  describe("Input Validation (validateQuoteInput)", () => {
    describe("Valid Input", () => {
      it("should accept valid Arizona quote input", async () => {
        (global.fetch as any).mockResolvedValueOnce({
          ok: true,
          json: async () => mockArizonaResponse,
        });

        const request = new NextRequest("http://localhost:3000/api/quote", {
          method: "POST",
          body: JSON.stringify(arizonaQuoteInput),
        });

        const response = await POST(request);
        expect(response.status).toBe(200);
      });

      it("should accept valid Texas quote input", async () => {
        (global.fetch as any).mockResolvedValueOnce({
          ok: true,
          json: async () => mockTexasResponse,
        });

        const request = new NextRequest("http://localhost:3000/api/quote", {
          method: "POST",
          body: JSON.stringify(texasQuoteInput),
        });

        const response = await POST(request);
        expect(response.status).toBe(200);
      });
    });

    describe("Invalid Request Body", () => {
      it("should reject null request body", async () => {
        const request = new NextRequest("http://localhost:3000/api/quote", {
          method: "POST",
          body: JSON.stringify(null),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.error).toBe("Invalid request body: expected an object");
      });

      it("should reject undefined request body", async () => {
        const request = new NextRequest("http://localhost:3000/api/quote", {
          method: "POST",
          body: JSON.stringify(undefined),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(500);
        // JSON.stringify(undefined) creates an empty body, which causes JSON parse error
        expect(data.error).toBe("Unexpected end of JSON input");
      });

      it("should reject string request body", async () => {
        const request = new NextRequest("http://localhost:3000/api/quote", {
          method: "POST",
          body: JSON.stringify("invalid string"),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.error).toBe("Invalid request body: expected an object");
      });

      it("should reject number request body", async () => {
        const request = new NextRequest("http://localhost:3000/api/quote", {
          method: "POST",
          body: JSON.stringify(123),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.error).toBe("Invalid request body: expected an object");
      });

      it("should reject array request body", async () => {
        const request = new NextRequest("http://localhost:3000/api/quote", {
          method: "POST",
          body: JSON.stringify([{ state: "AZ" }]),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(500);
        // Arrays are objects in JavaScript, so this fails on state validation
        expect(data.error).toBe("Invalid state: must be either AZ or TX");
      });
    });

    describe("State Validation", () => {
      it("should reject missing state field", async () => {
        const invalidInput = {
          ...arizonaQuoteInput,
          state: undefined,
        };

        const request = new NextRequest("http://localhost:3000/api/quote", {
          method: "POST",
          body: JSON.stringify(invalidInput),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.error).toBe("Invalid state: must be either AZ or TX");
      });

      it("should reject empty string state", async () => {
        const invalidInput = {
          ...arizonaQuoteInput,
          state: "",
        };

        const request = new NextRequest("http://localhost:3000/api/quote", {
          method: "POST",
          body: JSON.stringify(invalidInput),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.error).toBe("Invalid state: must be either AZ or TX");
      });

      it("should reject invalid state code", async () => {
        const invalidInput = {
          ...arizonaQuoteInput,
          state: "CA",
        };

        const request = new NextRequest("http://localhost:3000/api/quote", {
          method: "POST",
          body: JSON.stringify(invalidInput),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.error).toBe("Invalid state: must be either AZ or TX");
      });

      it("should reject lowercase state code", async () => {
        const invalidInput = {
          ...arizonaQuoteInput,
          state: "az",
        };

        const request = new NextRequest("http://localhost:3000/api/quote", {
          method: "POST",
          body: JSON.stringify(invalidInput),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.error).toBe("Invalid state: must be either AZ or TX");
      });
    });

    describe("Drivers Validation", () => {
      it("should reject missing drivers field", async () => {
        const invalidInput = {
          ...arizonaQuoteInput,
          drivers: undefined,
        };

        const request = new NextRequest("http://localhost:3000/api/quote", {
          method: "POST",
          body: JSON.stringify(invalidInput),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.error).toBe("At least one driver is required");
      });

      it("should reject empty drivers array", async () => {
        const invalidInput = {
          ...arizonaQuoteInput,
          drivers: [],
        };

        const request = new NextRequest("http://localhost:3000/api/quote", {
          method: "POST",
          body: JSON.stringify(invalidInput),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.error).toBe("At least one driver is required");
      });

      it("should reject drivers field that is not an array", async () => {
        const invalidInput = {
          ...arizonaQuoteInput,
          drivers: { firstName: "John" },
        };

        const request = new NextRequest("http://localhost:3000/api/quote", {
          method: "POST",
          body: JSON.stringify(invalidInput),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.error).toBe("At least one driver is required");
      });

      it("should reject drivers field as string", async () => {
        const invalidInput = {
          ...arizonaQuoteInput,
          drivers: "invalid",
        };

        const request = new NextRequest("http://localhost:3000/api/quote", {
          method: "POST",
          body: JSON.stringify(invalidInput),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.error).toBe("At least one driver is required");
      });
    });

    describe("Policyholder Name Validation", () => {
      it("should reject missing holderFirstName", async () => {
        const invalidInput = {
          ...arizonaQuoteInput,
          holderFirstName: undefined,
        };

        const request = new NextRequest("http://localhost:3000/api/quote", {
          method: "POST",
          body: JSON.stringify(invalidInput),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.error).toBe("Policyholder first name is required");
      });

      it("should reject empty holderFirstName", async () => {
        const invalidInput = {
          ...arizonaQuoteInput,
          holderFirstName: "",
        };

        const request = new NextRequest("http://localhost:3000/api/quote", {
          method: "POST",
          body: JSON.stringify(invalidInput),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.error).toBe("Policyholder first name is required");
      });

      it("should reject non-string holderFirstName", async () => {
        const invalidInput = {
          ...arizonaQuoteInput,
          holderFirstName: 123,
        };

        const request = new NextRequest("http://localhost:3000/api/quote", {
          method: "POST",
          body: JSON.stringify(invalidInput),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.error).toBe("Policyholder first name is required");
      });

      it("should reject missing holderLastName", async () => {
        const invalidInput = {
          ...arizonaQuoteInput,
          holderLastName: undefined,
        };

        const request = new NextRequest("http://localhost:3000/api/quote", {
          method: "POST",
          body: JSON.stringify(invalidInput),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.error).toBe("Policyholder last name is required");
      });

      it("should reject empty holderLastName", async () => {
        const invalidInput = {
          ...arizonaQuoteInput,
          holderLastName: "",
        };

        const request = new NextRequest("http://localhost:3000/api/quote", {
          method: "POST",
          body: JSON.stringify(invalidInput),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.error).toBe("Policyholder last name is required");
      });

      it("should reject non-string holderLastName", async () => {
        const invalidInput = {
          ...arizonaQuoteInput,
          holderLastName: { name: "Smith" },
        };

        const request = new NextRequest("http://localhost:3000/api/quote", {
          method: "POST",
          body: JSON.stringify(invalidInput),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.error).toBe("Policyholder last name is required");
      });
    });

    describe("Contact Information Validation", () => {
      it("should reject missing email", async () => {
        const invalidInput = {
          ...arizonaQuoteInput,
          email: undefined,
        };

        const request = new NextRequest("http://localhost:3000/api/quote", {
          method: "POST",
          body: JSON.stringify(invalidInput),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.error).toBe("Email address is required");
      });

      it("should reject empty email", async () => {
        const invalidInput = {
          ...arizonaQuoteInput,
          email: "",
        };

        const request = new NextRequest("http://localhost:3000/api/quote", {
          method: "POST",
          body: JSON.stringify(invalidInput),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.error).toBe("Email address is required");
      });

      it("should reject non-string email", async () => {
        const invalidInput = {
          ...arizonaQuoteInput,
          email: 123456,
        };

        const request = new NextRequest("http://localhost:3000/api/quote", {
          method: "POST",
          body: JSON.stringify(invalidInput),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.error).toBe("Email address is required");
      });

      it("should reject missing cellPhone", async () => {
        const invalidInput = {
          ...arizonaQuoteInput,
          cellPhone: undefined,
        };

        const request = new NextRequest("http://localhost:3000/api/quote", {
          method: "POST",
          body: JSON.stringify(invalidInput),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.error).toBe("Phone number is required");
      });

      it("should reject empty cellPhone", async () => {
        const invalidInput = {
          ...arizonaQuoteInput,
          cellPhone: "",
        };

        const request = new NextRequest("http://localhost:3000/api/quote", {
          method: "POST",
          body: JSON.stringify(invalidInput),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.error).toBe("Phone number is required");
      });

      it("should reject non-string cellPhone", async () => {
        const invalidInput = {
          ...arizonaQuoteInput,
          cellPhone: 9999999999,
        };

        const request = new NextRequest("http://localhost:3000/api/quote", {
          method: "POST",
          body: JSON.stringify(invalidInput),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.error).toBe("Phone number is required");
      });
    });

    describe("Address Validation", () => {
      it("should reject missing address", async () => {
        const invalidInput = {
          ...arizonaQuoteInput,
          address: undefined,
        };

        const request = new NextRequest("http://localhost:3000/api/quote", {
          method: "POST",
          body: JSON.stringify(invalidInput),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.error).toBe("Address is required");
      });

      it("should reject empty address", async () => {
        const invalidInput = {
          ...arizonaQuoteInput,
          address: "",
        };

        const request = new NextRequest("http://localhost:3000/api/quote", {
          method: "POST",
          body: JSON.stringify(invalidInput),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.error).toBe("Address is required");
      });

      it("should reject non-string address", async () => {
        const invalidInput = {
          ...arizonaQuoteInput,
          address: { street: "123 Main St" },
        };

        const request = new NextRequest("http://localhost:3000/api/quote", {
          method: "POST",
          body: JSON.stringify(invalidInput),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.error).toBe("Address is required");
      });

      it("should reject missing city", async () => {
        const invalidInput = {
          ...arizonaQuoteInput,
          city: undefined,
        };

        const request = new NextRequest("http://localhost:3000/api/quote", {
          method: "POST",
          body: JSON.stringify(invalidInput),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.error).toBe("City is required");
      });

      it("should reject empty city", async () => {
        const invalidInput = {
          ...arizonaQuoteInput,
          city: "",
        };

        const request = new NextRequest("http://localhost:3000/api/quote", {
          method: "POST",
          body: JSON.stringify(invalidInput),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.error).toBe("City is required");
      });

      it("should reject non-string city", async () => {
        const invalidInput = {
          ...arizonaQuoteInput,
          city: 12345,
        };

        const request = new NextRequest("http://localhost:3000/api/quote", {
          method: "POST",
          body: JSON.stringify(invalidInput),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.error).toBe("City is required");
      });

      it("should reject missing zipCode", async () => {
        const invalidInput = {
          ...arizonaQuoteInput,
          zipCode: undefined,
        };

        const request = new NextRequest("http://localhost:3000/api/quote", {
          method: "POST",
          body: JSON.stringify(invalidInput),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.error).toBe("Zip code is required");
      });

      it("should reject empty zipCode", async () => {
        const invalidInput = {
          ...arizonaQuoteInput,
          zipCode: "",
        };

        const request = new NextRequest("http://localhost:3000/api/quote", {
          method: "POST",
          body: JSON.stringify(invalidInput),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.error).toBe("Zip code is required");
      });

      it("should reject non-string zipCode", async () => {
        const invalidInput = {
          ...arizonaQuoteInput,
          zipCode: 85326,
        };

        const request = new NextRequest("http://localhost:3000/api/quote", {
          method: "POST",
          body: JSON.stringify(invalidInput),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.error).toBe("Zip code is required");
      });
    });

    describe("Multiple Validation Failures", () => {
      it("should fail on first validation error encountered", async () => {
        const invalidInput = {
          state: "CA", // Invalid state (first check that will fail)
          drivers: [], // Empty drivers
          holderFirstName: "", // Empty name
          email: "", // Empty email
        };

        const request = new NextRequest("http://localhost:3000/api/quote", {
          method: "POST",
          body: JSON.stringify(invalidInput),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(500);
        // Should fail on state validation first
        expect(data.error).toBe("Invalid state: must be either AZ or TX");
      });

      it("should validate in order: body, state, drivers, names, contact, address", async () => {
        // Test with null body (first check)
        const request1 = new NextRequest("http://localhost:3000/api/quote", {
          method: "POST",
          body: JSON.stringify(null),
        });
        const response1 = await POST(request1);
        const data1 = await response1.json();
        expect(data1.error).toBe("Invalid request body: expected an object");

        // Test with invalid state but valid body (second check)
        const request2 = new NextRequest("http://localhost:3000/api/quote", {
          method: "POST",
          body: JSON.stringify({ state: "NY" }),
        });
        const response2 = await POST(request2);
        const data2 = await response2.json();
        expect(data2.error).toBe("Invalid state: must be either AZ or TX");

        // Test with valid state but no drivers (third check)
        const request3 = new NextRequest("http://localhost:3000/api/quote", {
          method: "POST",
          body: JSON.stringify({ state: "AZ", drivers: [] }),
        });
        const response3 = await POST(request3);
        const data3 = await response3.json();
        expect(data3.error).toBe("At least one driver is required");
      });
    });
  });
});


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

    it("should return 500 error for TX non-owner without PIP", async () => {
      const invalidInput = {
        ...texasNonOwnerQuoteInput,
        PIP: undefined,
      };

      const request = new NextRequest("http://localhost:3000/api/quote", {
        method: "POST",
        body: JSON.stringify(invalidInput),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toContain("Texas non-owner policies require PIP coverage");
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

      // Verify TX fields are stripped
      expect(requestBody.PIP).toBeUndefined();
      expect(requestBody.UMPD).toBeUndefined();
      expect(requestBody.IsNonOwner).toBeUndefined();
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

      // Verify non-owner specifics
      expect(requestBody.IsNonOwner).toBe("Y");
      expect(requestBody.vehicles).toBeUndefined();
      expect(requestBody.roadsideAssistance).toBeUndefined();
    });
  });
});


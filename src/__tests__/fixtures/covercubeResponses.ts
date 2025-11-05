// Mock Covercube API responses for testing

import type { CovercubeResponse } from "@/zod-schemas/covercube";

export const mockArizonaResponse: CovercubeResponse = {
  quoteCode: "AZ-123456",
  quotePremium: 855.54,
  quoteFeesTotal: 130.0,
  quoteTotal: 985.54,
  policyFee: 85.0,
  drivers: [
    {
      firstName: "Test4",
      lastName: "ITC0307",
      driverAge: 45,
      rateOrder: 1,
    },
    {
      firstName: "FeTest",
      lastName: "AZ",
      driverAge: 44,
      rateOrder: 2,
    },
  ],
  coverages: [
    { coverageCode: "BI", coverageLimit: "25/50", coverageTotal: 205.43 },
    { coverageCode: "PD", coverageLimit: "15", coverageTotal: 100.22 },
    { coverageCode: "UMBI", coverageLimit: "25/50", coverageTotal: 180.76 },
    { coverageCode: "UIMBI", coverageLimit: "25/50", coverageTotal: 150.33 },
    { coverageCode: "MP", coverageLimit: "500", coverageTotal: 50.0 },
  ],
  payplan: [
    {
      description: "6 Monthly Payments-Direct Billing",
      downPayment: 251.25,
      downPercent: 20.0,
      totalPremium: 1136.5,
      instalments: 6,
      refCode: "6P2",
    },
    {
      description: "Full Payment",
      downPayment: 985.54,
      downPercent: 100.0,
      totalPremium: 985.54,
      instalments: 1,
      refCode: "FP",
    },
  ],
  viewQuote: "https://pi-cc-dev.azurewebsites.net/quote/bridge/AZ-123456",
  consumerBridge: "https://pi-consumer-dev.azurewebsites.net/quote/AZ-123456",
};

export const mockTexasResponse: CovercubeResponse = {
  quoteCode: "TX-789012",
  quotePremium: 920.75,
  quoteFeesTotal: 140.0,
  quoteTotal: 1060.75,
  policyFee: 85.0,
  drivers: [
    {
      firstName: "CCTX",
      lastName: "TXTest",
      driverAge: 32,
      rateOrder: 1,
    },
  ],
  coverages: [
    { coverageCode: "BI", coverageLimit: "30/60", coverageTotal: 225.43 },
    { coverageCode: "PD", coverageLimit: "25", coverageTotal: 110.22 },
    { coverageCode: "UMBI", coverageLimit: "30/60", coverageTotal: 190.76 },
    { coverageCode: "UIMBI", coverageLimit: "30/60", coverageTotal: 170.12 },
    { coverageCode: "PIP", coverageLimit: "2500", coverageTotal: 85.12 },
    { coverageCode: "UMPD", coverageLimit: "25", coverageTotal: 45.0 },
  ],
  payplan: [
    {
      description: "6 Monthly Payments - Direct Billing",
      downPayment: 260.25,
      downPercent: 20.0,
      totalPremium: 1060.75,
      instalments: 6,
      refCode: "6P2",
    },
  ],
  viewQuote: "https://pi-cc-dev.azurewebsites.net/quote/bridge/TX-789012",
  consumerBridge: "https://pi-consumer-dev.azurewebsites.net/quote/TX-789012",
};

export const mockTexasNonOwnerResponse: CovercubeResponse = {
  quoteCode: "TXNO-345678",
  quotePremium: 412.5,
  quoteFeesTotal: 80.0,
  quoteTotal: 492.5,
  policyFee: 60.0,
  drivers: [
    {
      firstName: "CCTX",
      lastName: "TXTest",
      driverAge: 32,
      rateOrder: 1,
    },
  ],
  coverages: [
    { coverageCode: "BI", coverageLimit: "30/60", coverageTotal: 160.0 },
    { coverageCode: "PD", coverageLimit: "25", coverageTotal: 95.5 },
    { coverageCode: "UMBI", coverageLimit: "30/60", coverageTotal: 110.75 },
    { coverageCode: "PIP", coverageLimit: "2500", coverageTotal: 46.25 },
  ],
  payplan: [
    {
      description: "6 Monthly Payments - Direct Billing",
      downPayment: 98.5,
      downPercent: 20.0,
      totalPremium: 492.5,
      instalments: 6,
      refCode: "6P2",
    },
  ],
  viewQuote: "https://pi-cc-dev.azurewebsites.net/quote/bridge/TXNO-345678",
  consumerBridge: "https://pi-consumer-dev.azurewebsites.net/quote/TXNO-345678",
};


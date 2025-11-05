// src/lib/validateInput.ts
import type { QuoteInput } from "@/types/api";

/**
 * Validates the input data for the quote request
 *
 * @param input - The quote input to validate
 * @throws Error if the input data is invalid
 */ 
export function validateQuoteInput(input: QuoteInput): void {
    if (!input || typeof input !== 'object') {
      throw new Error('Invalid request body: expected an object');
    }
    
    // Validate state
    if (!input.state || !['AZ', 'TX'].includes(input.state)) {
      throw new Error('Invalid state: must be either AZ or TX');
    }
  
    // Validate drivers array
    if (!input.drivers || !Array.isArray(input.drivers) || input.drivers.length === 0) {
      throw new Error('At least one driver is required');
    }
  
    // Validate policyholder information
    if (!input.holderFirstName || typeof input.holderFirstName !== 'string') {
      throw new Error('Policyholder first name is required');
    }
    if (!input.holderLastName || typeof input.holderLastName !== 'string') {
      throw new Error('Policyholder last name is required');
    }
  
    // Validate contact information
    if (!input.email || typeof input.email !== 'string') {
      throw new Error('Email address is required');
    }
    if (!input.cellPhone || typeof input.cellPhone !== 'string') {
      throw new Error('Phone number is required');
    }
  
    // Validate address
    if (!input.address || typeof input.address !== 'string') {
      throw new Error('Address is required');
    }
    if (!input.city || typeof input.city !== 'string') {
      throw new Error('City is required');
    }
    if (!input.zipCode || typeof input.zipCode !== 'string') {
      throw new Error('Zip code is required');
    }
  }
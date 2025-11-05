#!/bin/bash

# test-api.sh
# Quick test script for Covercube API integration
# Usage: ./test-api.sh [test-name]
# Available tests: az, tx, tx-nonowner, invalid, all

set -e

BASE_URL="http://localhost:3000"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🧪 Covercube API Test Suite${NC}\n"

# Check if server is running
if ! curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/quote" | grep -q "405"; then
    echo -e "${RED}❌ Server not running. Start with: npm run dev${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Server is running${NC}\n"

# Test 1: Arizona Quote
test_az() {
    echo -e "${YELLOW}Test 1: Arizona Basic Quote${NC}"
    curl -X POST "$BASE_URL/api/quote" \
      -H "Content-Type: application/json" \
      -d '{
        "state": "AZ",
        "policyTerm": "6 Months",
        "inceptionDate": "2025/11/15",
        "effectiveDate": "2025/11/15",
        "rateDate": "2025/11/05",
        "holderFirstName": "John",
        "holderLastName": "Doe",
        "address": "123 Main St",
        "city": "Phoenix",
        "zipCode": "85001",
        "email": "test@example.com",
        "cellPhone": "602-555-0123",
        "BI": "25/50",
        "PD": "15",
        "payplan": "EFTCC",
        "drivers": [{
          "firstName": "John",
          "lastName": "Doe",
          "dob": "1985/03/15",
          "gender": "M",
          "married": "Y",
          "licenseNumber": "D12345678",
          "licenseState": "AZ",
          "licenseStatus": "VALID",
          "sr22": "N"
        }],
        "vehicles": [{
          "year": 2020,
          "make": "TOYOTA",
          "model": "CAMRY",
          "vehicleUse": "PLS",
          "COM": 500,
          "COL": 500
        }]
      }' 2>/dev/null | jq '.' || echo -e "${RED}Failed - check response${NC}"
    echo -e "\n"
}

# Test 2: Texas Owned Vehicle
test_tx() {
    echo -e "${YELLOW}Test 2: Texas Owned Vehicle Quote${NC}"
    curl -X POST "$BASE_URL/api/quote" \
      -H "Content-Type: application/json" \
      -d '{
        "state": "TX",
        "policyTerm": "6 Months",
        "inceptionDate": "2025/11/15",
        "effectiveDate": "2025/11/15",
        "rateDate": "2025/11/05",
        "holderFirstName": "Jane",
        "holderLastName": "Smith",
        "address": "456 Oak Ave",
        "city": "Houston",
        "zipCode": "77001",
        "email": "jane@example.com",
        "cellPhone": "713-555-0123",
        "BI": "30/60",
        "PD": "25",
        "PIP": 2500,
        "payplan": "EFTCC",
        "drivers": [{
          "firstName": "Jane",
          "lastName": "Smith",
          "dob": "1990/06/20",
          "gender": "F",
          "licenseState": "TX"
        }],
        "vehicles": [{
          "year": 2019,
          "make": "HONDA",
          "model": "CIVIC",
          "vehicleUse": "WRK",
          "COM": 1000,
          "COL": 1000,
          "platenumber": "ABC1234",
          "platestate": "TX"
        }]
      }' 2>/dev/null | jq '.' || echo -e "${RED}Failed - check response${NC}"
    echo -e "\n"
}

# Test 3: Texas Non-Owner
test_tx_nonowner() {
    echo -e "${YELLOW}Test 3: Texas Non-Owner Quote${NC}"
    curl -X POST "$BASE_URL/api/quote" \
      -H "Content-Type: application/json" \
      -d '{
        "state": "TX",
        "IsNonOwner": "Y",
        "policyTerm": "6 Months",
        "inceptionDate": "2025/11/15",
        "effectiveDate": "2025/11/15",
        "rateDate": "2025/11/05",
        "holderFirstName": "Bob",
        "holderLastName": "Johnson",
        "address": "789 Elm St",
        "city": "Austin",
        "zipCode": "78701",
        "email": "bob@example.com",
        "cellPhone": "512-555-0123",
        "BI": "30/60",
        "PD": "25",
        "PIP": 2500,
        "payplan": "EFTCC",
        "drivers": [{
          "firstName": "Bob",
          "lastName": "Johnson",
          "dob": "1992/09/10",
          "gender": "M",
          "licenseState": "TX"
        }]
      }' 2>/dev/null | jq '.' || echo -e "${RED}Failed - check response${NC}"
    echo -e "\n"
}

# Test 4: Invalid Request (should fail gracefully)
test_invalid() {
    echo -e "${YELLOW}Test 4: Invalid Request (Missing Required Fields)${NC}"
    curl -X POST "$BASE_URL/api/quote" \
      -H "Content-Type: application/json" \
      -d '{
        "state": "AZ"
      }' 2>/dev/null | jq '.' || echo -e "${RED}Failed - check response${NC}"
    echo -e "${GREEN}Expected: Zod validation error${NC}\n"
}

# Run tests based on argument
case "${1:-all}" in
    az)
        test_az
        ;;
    tx)
        test_tx
        ;;
    tx-nonowner)
        test_tx_nonowner
        ;;
    invalid)
        test_invalid
        ;;
    all)
        test_az
        test_tx
        test_tx_nonowner
        test_invalid
        ;;
    *)
        echo "Usage: ./test-api.sh [az|tx|tx-nonowner|invalid|all]"
        exit 1
        ;;
esac

echo -e "${GREEN}✅ Tests complete${NC}"
# 🧾 Covercube API: Documentation vs. Postman — Discrepancies Only

**Purpose:**  
List *only* the mismatches and inconsistencies between the **Covercube Rate Quote API Documentation** and the **Truvo Dev Postman Collection** across all supported states:  
- Arizona (AZ)  
- Texas (TX – Owned Vehicle)  
- Texas (TX – Non-Owner)

> These are the differences — fields, values, formats, or behaviors that do **not** align between the two sources.

---

## 1. Global Discrepancies

| Area | Docs | Postman | Resolution |
|------|------|----------|-------------|
| **Mailing Fields** | Not listed for AZ; optional for TX | Present in all requests (`address2`, `mailAddress`, `mailAddress2`, `mailCity`, `mailState`, `mailZipCode`) | Mark optional globally. |
| **License Status** | Enumerated: `VALID`, `SUSP`, `RVKD`, `EX`, `MX`, `INT` | Adds `DUSA` | Allow any string for `licenseStatus`. |
| **License State** | “State that issued the license” | Always matches quote state | Accept any 2-letter state code. |
| **Payplan Codes** | Only `FP`, `6P`, `6P2` listed | Uses `"EFTCC"` | Accept any string for `payplan`. |
| **Date Format** | `YYYY/MM/DD` required | Sometimes empty (`Sr22Date`) | Allow empty string or omit field. |
| **Coverage Code Labels** | Uses `COLL`, `CMP` (TX coverage table) | Uses `COL`, `COM` | Normalize to `COL` / `COM`. |
| **Numeric Field Types** | `priordayslapse` and `priorpipcoveragelimit` listed as strings | Numbers in Postman | Accept both string or number. |

---

## 2. Arizona (Owned Vehicle)

### Policy-Level Differences
| Field | Docs | Postman | Resolution |
|--------|------|----------|-------------|
| `address2`, `mailAddress`, `mailAddress2`, `mailCity`, `mailState`, `mailZipCode` | Not in docs | Present | Treat as optional. |
| `roadsideAssistance` | Policy-level only | Also present at vehicle level | Allow both policy and vehicle level. |

### Vehicle-Level Differences
| Field | Docs | Postman | Resolution |
|--------|------|----------|-------------|
| `platenumber`, `platestate` | Not listed in AZ docs | Present | Optional; strip before sending. |
| `weight`, `ridesharing`, `roadsideAssistance`, `parties[]` | Not defined | Present (`parties` includes `address1`, `address2`) | Optional; tolerate. |

### Driver-Level Differences
| Field | Docs | Postman | Resolution |
|--------|------|----------|-------------|
| `points`, `employerName`, `occupation`, `businessPhone`, `excludeFromCoverage`, `av12`, `av24`, `av36`, `driverDNA`, `violations[]` | Not listed for AZ | Present | Make optional. |
| `Sr22Date` | Must follow `YYYY/MM/DD` if provided | Sometimes empty | Allow empty string. |

### Coverage Differences
| Coverage | Docs | Postman | Resolution |
|-----------|------|----------|-------------|
| `BI` | 25/50, 50/100, 100/300 | `30/60` | Accept additional `30/60` value. |

---

## 3. Texas (Owned Vehicle)

### Policy-Level Differences
| Field | Docs | Postman | Resolution |
|--------|------|----------|-------------|
| `payplan` | Lists only `FP`, `6P`, `6P2` | Uses `"EFTCC"` | Accept arbitrary string. |

### Vehicle-Level Differences
| Field | Docs | Postman | Resolution |
|--------|------|----------|-------------|
| *(none)* | — | — | All TX vehicle fields match. |

### Driver-Level Differences
| Field | Docs | Postman | Resolution |
|--------|------|----------|-------------|
| `licenseStatus` | Sample list only (VALID, SUSP, etc.) | `"DUSA"` | Accept any string. |
| `occupation` | Uppercase codes (e.g., `OTHER`, `CARPENTER`) | Human-readable (`"Other"`) | Accept free text or map later. |

### Coverage Differences
| Coverage | Docs | Postman | Resolution |
|-----------|------|----------|-------------|
| `MP` | Numeric (500, 1000, 2000, 5000) | `"None"` | Treat `"None"` as null or zero-equivalent. |

---

## 4. Texas (Non-Owner)

| Field | Docs | Postman | Resolution |
|--------|------|----------|-------------|
| `roadsideAssistance` | Not mentioned | Absent | Allow optional. |
| `MP` | Numeric value | `"None"` | Accept `"None"`. |

---

## 5. Formatting / Typing Mismatches

| Field | Docs Type | Postman Type | Resolution |
|--------|------------|---------------|-------------|
| `priordayslapse` | string | number | Accept both. |
| `priorpipcoveragelimit` | decimal | integer | Accept both. |

---

## 6. Internal Documentation Inconsistencies

| Topic | Docs Description | Resolution |
|--------|------------------|-------------|
| **Coverage Codes** | TX coverage display table uses `COLL` / `CMP`, while vehicle object uses `COL` / `COM`. | Standardize on `COL` / `COM`. |
| **Payplan Codes** | Mapping table lists `FP`, `6P`, `6P2`; examples use `"EFTCC"`. | Allow any string. |
| **Occupation Codes** | Uppercase codes in mapping table | Postman sends readable strings | Accept any string input. |
| **AZ Coverage Limits** | BI 25/50, 50/100, 100/300 only | 30/60 used in Postman | Add 30/60 to allowed set. |

---

## 7. Summary of All Postman-Only Fields

| Context | Fields |
|----------|--------|
| **AZ Policy** | `address2`, `mailAddress`, `mailAddress2`, `mailCity`, `mailState`, `mailZipCode` |
| **AZ Vehicle** | `platenumber`, `platestate`, `weight`, `ridesharing`, `roadsideAssistance`, `parties[]` |
| **AZ Driver** | `points`, `employerName`, `occupation`, `businessPhone`, `excludeFromCoverage`, `av12`, `av24`, `av36`, `driverDNA`, `violations[]` |
| **TX Driver** | `licenseStatus: "DUSA"` |
| **Cross-State Formatting** | Mixed numeric/string (`priordayslapse`, `priorpipcoveragelimit`), `MP` = `"None"`, flexible coverage limits. |

---

## 8. Coverage Limit Discrepancies (All States)

| Coverage | Docs | Postman | Resolution |
|-----------|------|----------|-------------|
| **AZ BI** | 25/50, 50/100, 100/300 | 30/60 | Accept 30/60 as valid. |
| **TX MP** | Numeric (500, 1000, etc.) | `"None"` | Treat `"None"` as no coverage. |
| **TX Code Labels** | COLL/CMP | COL/COM | Normalize to COL/COM. |

---

## 9. Implementation Notes

- All discrepancies have been handled by making the affected fields **optional** or **flexible** in the Zod schemas.  
- AZ requests automatically **strip TX-only fields** (plates, ownership length, purchase date).  
- License-related fields are **non-restrictive**.  
- Coverage limits and `payplan` are **free-form strings**.  
- TX Non-Owner policies **forbid vehicles** but retain TX fields.  

---

**Sources:**  
- *Covercube Rate Quote API Documentation* (pp. 2–26):contentReference[oaicite:0]{index=0}  
- *Truvo Dev Postman Collection* (`AZ`, `TX`, `TX No-Owner`):contentReference[oaicite:1]{index=1}  

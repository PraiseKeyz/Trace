# Economic Profile API Documentation

Base URL: `http://localhost:3000/economic-profile`

> All endpoints require authentication via the `access_token` HttpOnly cookie.

---

## Overview

The Economic Profile is the core of Trace's value proposition. It is the **living digital identity** of every user — a structured record of their economic activity, skills, risk tier, and creditworthiness.

> **How scoring works:** Scores are never manually set by the user. They are calculated by the Python AI service via gRPC using a weighted formula:
> - 40% Transaction history
> - 20% Platform activity  
> - 25% Community vouching
> - 15% Profile completeness

The profile is **auto-created with all-zero defaults** when a user completes onboarding. It grows richer as they transact, get vouched for, and engage with the platform.

---

## 1. Get My Economic Profile

Returns the full economic identity profile of the authenticated user.

* **URL:** `/me`
* **Method:** `GET`
* **Auth required:** Yes

### Success Response
* **Code:** 200 OK
```json
{
  "id": "uuid-...",
  "user_id": "uuid-...",
  "identity_score": 62,
  "transaction_score": "55.00",
  "activity_score": "70.00",
  "vouch_score": "40.00",
  "profile_completeness": "80.00",
  "skills": ["carpentry", "plumbing"],
  "trade_category": "Construction",
  "years_active": 3,
  "is_profile_verified": false,
  "total_transaction_volume": "125000.00",
  "total_transaction_count": 14,
  "avg_monthly_volume": "10416.67",
  "last_transaction_at": "2026-05-10T14:00:00.000Z",
  "vouch_count": 4,
  "verified_vouch_count": 2,
  "risk_tier": "medium",
  "is_finance_eligible": false,
  "max_recommended_loan": "0.00",
  "last_active": "2026-05-12T00:00:00.000Z",
  "updated_at": "2026-05-12T00:00:00.000Z"
}
```

### Error Responses
* **404 Not Found** — Profile does not exist (user has not completed onboarding yet)

---

## 2. Update Skills & Trade Info

Updates the user-editable fields on their economic profile — specifically the skills, trade category, and years of experience. These feed directly into the scoring calculation.

* **URL:** `/me/skills`
* **Method:** `PATCH`
* **Auth required:** Yes

### Request Body (all fields optional)
```json
{
  "skills": ["tailoring", "embroidery", "fabric trading"],
  "trade_category": "Fashion & Textiles",
  "years_active": 5
}
```

### Success Response
* **Code:** 200 OK — returns the full updated economic profile object

> **Note:** Fields like `identity_score`, `risk_tier`, `is_finance_eligible`, and all transaction/vouch fields are **read-only** — they are set exclusively by the AI scoring engine.

---

## 3. Recalculate Identity Score

Triggers the Python AI scoring engine (via gRPC) to recalculate the user's `identity_score` and `risk_tier` based on their current sub-scores. The result is persisted back to the database.

* **URL:** `/me/recalculate`
* **Method:** `POST`
* **Auth required:** Yes

### Request Body
None required.

### Success Response
* **Code:** 201 Created — returns the updated economic profile with new `identity_score` and `risk_tier`

```json
{
  "id": "uuid-...",
  "identity_score": 73,
  "risk_tier": "low",
  "is_finance_eligible": true,
  ...
}
```

### How the score is calculated
The request sends the user's current sub-scores to Python:

```
identity_score = 
  transaction_score × 0.40 +
  activity_score   × 0.20 +
  vouch_score      × 0.25 +
  profile_completeness × 0.15
```

**Risk tier mapping:**
| Score | Risk Tier | Finance Eligible |
|---|---|---|
| ≥ 75 | `very low` | ✅ Yes |
| ≥ 55 | `low` | ✅ Yes |
| ≥ 30 | `medium` | ❌ No |
| < 30 | `high` | ❌ No |

### Error Responses
* **404 Not Found** — Profile not found (complete onboarding first)
* **500 Internal Server Error** — gRPC call to AI service failed (Python service may be down)

---

## Profile Lifecycle

```
User registers
  ↓
User completes onboarding    → economic_profile row created with all-zero defaults
  ↓
User transacts via Squad     → transaction_score updated by webhook handler (future)
  ↓
User gets vouched for        → vouch_score updated (future)
  ↓
PATCH /me/skills             → skills updated, improves profile_completeness weighting
  ↓
POST /me/recalculate         → gRPC call → Python calculates → identity_score updated
  ↓
Finance partners can now query the credit profile (if data_sharing_consent = true)
```

# Transactions API Documentation

Base URL: `http://localhost:5000/api/v1/transactions`

> All endpoints require authentication via the `access_token` HttpOnly cookie.

---

## 1. Get Transaction History
Returns a list of transactions where the user is either the initiator or the counterparty.

* **URL:** `/`
* **Method:** `GET`
* **Auth required:** Yes

### Success Response
* **Code:** 200 OK
```json
[
  {
    "id": "uuid-...",
    "user_id": "uuid-...",
    "counterparty_id": null,
    "amount": "5000.00",
    "currency": "NGN",
    "type": "credit",
    "status": "successful",
    "created_at": "..."
  }
]
```

---

## 2. Record Transaction
Manually record a transaction (or used by internal services). Successful transactions automatically trigger an identity score recalculation.

* **URL:** `/`
* **Method:** `POST`
* **Auth required:** Yes

### Request Body
```json
{
  "amount": 10000,
  "type": "debit",
  "category": "Trade",
  "status": "successful",
  "metadata": { "item": "Raw Materials" }
}
```

### Success Response
* **Code:** 201 Created

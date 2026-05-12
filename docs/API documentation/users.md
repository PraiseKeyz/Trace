# Users API Documentation

Base URL: `http://localhost:3000/users`

> All endpoints require authentication via the `access_token` HttpOnly cookie.

---

## 1. Get My Profile
Returns the currently authenticated user's full profile. This uses the data already attached by the JWT strategy — no extra database call.

* **URL:** `/me`
* **Method:** `GET`
* **Auth required:** Yes

### Success Response
* **Code:** 200 OK
```json
{
  "id": "uuid-...",
  "phone": "08012345678",
  "full_name": "John Doe",
  "email": null,
  "state": "Lagos",
  "city": "Ikeja",
  "latitude": "6.524379",
  "longitude": "3.379206",
  "role": ["user"],
  "squad_customer_id": null,
  "virtual_account_no": null,
  "is_phone_verified": true,
  "languages": ["en", "yo"],
  "preferred_language": "en",
  "data_sharing_consent": false,
  "onboarding_complete": true,
  "created_at": "2026-05-12T00:00:00.000Z",
  "updated_at": "2026-05-12T00:00:00.000Z"
}
```

---

## 2. Update My Profile
Updates one or more profile fields for the authenticated user. All fields are optional — only the fields you send will be updated.

* **URL:** `/me`
* **Method:** `PATCH`
* **Auth required:** Yes

### Request Body (all fields optional)
```json
{
  "full_name": "Jane Doe",
  "email": "jane@example.com",
  "state": "Abuja",
  "city": "Wuse",
  "latitude": 9.0579,
  "longitude": 7.4951,
  "languages": ["en", "ha"],
  "preferred_language": "ha",
  "data_sharing_consent": true
}
```

### Success Response
* **Code:** 200 OK
```json
{
  "id": "uuid-...",
  "phone": "08012345678",
  "full_name": "Jane Doe",
  "email": "jane@example.com",
  ...
}
```

> **Note:** `phone`, `role`, `password`, and internal auth fields cannot be updated through this endpoint.

---

## 3. Change Password
Changes the authenticated user's password. Requires the current password for verification before setting a new one.

* **URL:** `/me/password`
* **Method:** `PATCH`
* **Auth required:** Yes

### Request Body
```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newSecurePassword456"
}
```

### Success Response
* **Code:** 200 OK
```json
{
  "message": "Password changed successfully"
}
```

### Error Responses
* **401 Unauthorized** — Current password is incorrect
* **400 Bad Request** — New password is same as current password

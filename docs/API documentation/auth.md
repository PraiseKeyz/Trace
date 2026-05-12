# Auth API Documentation

Base URL: `http://localhost:5000/api/v1/auth`

---

## 1. Register User
Creates a new user account, hashes the password, generates a 4-digit OTP, and sends the OTP to the user's phone via SMS.

* **URL:** `/register`
* **Method:** `POST`
* **Auth required:** No

### Request Body
```json
{
  "phone": "08012345678",
  "password": "securepassword123"
}
```

### Success Response
* **Code:** 201 Created
* **Set-Cookie:** `access_token=<JWT_TOKEN>` (HttpOnly)
```json
{
  "message": "Registration successful",
  "user": {
    "id": "uuid-...",
    "phone": "08012345678",
    "onboardingComplete": false
  }
}
```

---

## 2. Login User
Authenticates a user via phone and password. Sets the JWT token in an HttpOnly cookie.

* **URL:** `/login`
* **Method:** `POST`
* **Auth required:** No

### Request Body
```json
{
  "phone": "08012345678",
  "password": "securepassword123"
}
```

### Success Response
* **Code:** 201 Created (or 200 OK)
* **Set-Cookie:** `access_token=<JWT_TOKEN>` (HttpOnly)
```json
{
  "message": "Login successful",
  "user": {
    "id": "uuid-...",
    "phone": "08012345678",
    "onboardingComplete": false
  }
}
```

---

## 3. Verify OTP
Verifies the 4-digit OTP sent to the user's phone. Marks their phone as verified in the database.

* **URL:** `/verify-otp`
* **Method:** `POST`
* **Auth required:** No

### Request Body
```json
{
  "phone": "08012345678",
  "otp": "1234"
}
```

### Success Response
* **Code:** 201 Created
```json
{
  "message": "Verification successful"
}
```

---

## 4. Resend OTP
Generates a new 4-digit OTP for the user, sets a new 10-minute expiration, and texts it to them.

* **URL:** `/resend-otp`
* **Method:** `POST`
* **Auth required:** No

### Request Body
```json
{
  "phone": "08012345678"
}
```

### Success Response
* **Code:** 201 Created
```json
{
  "message": "OTP sent successfully"
}
```

---

## 5. Complete Onboarding
Updates the user's profile with additional details like full name, location, and role. Sets `onboarding_complete` to true.

* **URL:** `/onboard`
* **Method:** `POST`
* **Auth required:** Yes (Cookie: `access_token`)

### Request Body (All fields are optional)
```json
{
  "fullName": "John Doe",
  "state": "Lagos",
  "city": "Ikeja",
  "latitude": 6.5244,
  "longitude": 3.3792,
  "role": ["user"]
}
```

### Success Response
* **Code:** 201 Created
```json
{
  "message": "Onboarding completed successfully",
  "user": {
    "id": "uuid-...",
    "phone": "08012345678",
    "onboardingComplete": true
  }
}
```

---

## 6. Forgot Password
Initiates the password reset flow. Generates an OTP and sends it to the user's phone.

* **URL:** `/forgot-password`
* **Method:** `POST`
* **Auth required:** No

### Request Body
```json
{
  "phone": "08012345678"
}
```

### Success Response
* **Code:** 201 Created
```json
{
  "message": "Password reset OTP sent"
}
```

---

## 7. Reset Password
Resets the user's password if the provided OTP is valid and not expired.

* **URL:** `/reset-password`
* **Method:** `POST`
* **Auth required:** No

### Request Body
```json
{
  "phone": "08012345678",
  "otp": "1234",
  "newPassword": "newsecurepassword456"
}
```

### Success Response
* **Code:** 201 Created
```json
{
  "message": "Password has been reset successfully"
}
```

---

## 8. Logout
Clears the JWT access token cookie.
Clears the JWT access token cookie.

* **URL:** `/logout`
* **Method:** `POST`
* **Auth required:** No

### Success Response
* **Code:** 201 Created
* **Set-Cookie:** `access_token=` (Cleared)
```json
{
  "message": "Logged out successfully"
}
```

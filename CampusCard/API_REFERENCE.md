# API Reference (Complete Guide for Frontend Developers)

Base URL: `http://localhost:8080`

All endpoints return JSON unless specified. Authentication uses JWT Bearer tokens.

---

## 🔐 Authentication Endpoints

### 1. User Signup

Register a new user account.

**Endpoint:** `POST /api/signup`

**Content-Type:** `multipart/form-data`

**Authentication:** None (public endpoint)

**Request Fields:**

| Field          | Type    | Required | Validation             | Description            |
| -------------- | ------- | -------- | ---------------------- | ---------------------- |
| firstName      | string  | ✅       | max 50 chars           | User's first name      |
| lastName       | string  | ✅       | max 50 chars           | User's last name       |
| dateOfBirth    | string  | ✅       | YYYY-MM-DD, past date  | User's date of birth   |
| email          | string  | ✅       | @eng.psu.edu.eg domain | University email       |
| password       | string  | ✅       | 8-100 chars            | Account password       |
| nationalId     | string  | ✅       | exactly 14 digits      | Egyptian national ID   |
| nationalIdScan | file    | ✅       | JPEG/PNG, max 10MB     | National ID scan image |
| facultyId      | integer | ✅       | min 1                  | Faculty ID             |
| departmentId   | integer | ✅       | min 1                  | Department ID          |
| year           | integer | ✅       | min 1                  | Academic year          |

**Example Request (JavaScript):**

```javascript
const formData = new FormData();
formData.append("firstName", "Ahmed");
formData.append("lastName", "Hassan");
formData.append("dateOfBirth", "2000-05-15");
formData.append("email", "ahmed.hassan@eng.psu.edu.eg");
formData.append("password", "SecurePass123");
formData.append("nationalId", "30005150123456");
formData.append("nationalIdScan", fileInput.files[0]);
formData.append("facultyId", "1");
formData.append("departmentId", "1");
formData.append("year", "2");

const response = await fetch("http://localhost:8080/api/signup", {
  method: "POST",
  body: formData,
});
```

**Success Response (201 Created):**

```json
{
  "id": 5,
  "email": "ahmed.hassan@eng.psu.edu.eg",
  "status": "PENDING",
  "message": "User registered successfully. Awaiting admin approval."
}
```

**Error Response (400 Bad Request):**

```json
{
  "status": "ERROR",
  "message": "Validation failed",
  "errors": {
    "email": "Email must end with @eng.psu.edu.eg",
    "nationalId": "National ID must be exactly 14 digits",
    "dateOfBirth": "Date of birth must be in the past"
  }
}
```

**Notes:**

- User account created with `PENDING` status
- National ID scan uploaded to MinIO storage
- Profile automatically created (empty by default)
- User cannot login until admin approves

---

### 2. User Login

Authenticate and receive JWT token.

**Endpoint:** `POST /api/login`

**Content-Type:** `application/json`

**Authentication:** None (public endpoint)

**Request Body:**

```json
{
  "identifier": "test@eng.psu.edu.eg",
  "password": "password123"
}
```

**Field Details:**

| Field      | Type   | Required | Description          |
| ---------- | ------ | -------- | -------------------- |
| identifier | string | ✅       | Email OR national ID |
| password   | string | ✅       | User password        |

**Example Request (JavaScript):**

```javascript
const response = await fetch("http://localhost:8080/api/login", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    identifier: "test@eng.psu.edu.eg",
    password: "password123",
  }),
});

const data = await response.json();
// Store token
localStorage.setItem("token", data.token);
```

**Success Response (200 OK):**

```json
{
  "token": "eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJ0ZXN0QGVuZy5wc3UuZWR1LmVnIiwidXNlcklkIjoxLCJyb2xlIjoiU1RVREVOVCJ9...",
  "id": 1,
  "email": "test@eng.psu.edu.eg",
  "role": "student",
  "status": "APPROVED",
  "message": "Login successful"
}
```

**Error Response (401 Unauthorized):**

```json
{
  "token": "ERROR",
  "id": null,
  "email": "User with this email not found",
  "role": null,
  "status": null,
  "message": null
}
```

**Alternative Login (with National ID):**

```json
{
  "identifier": "12345678901234",
  "password": "password123"
}
```

**Notes:**

- Token expires after 24 hours
- Include token in all subsequent requests: `Authorization: Bearer <token>`
- PENDING/REJECTED users can login but have limited access

---

## 👤 Profile Endpoints

### 3. Get Current User Profile

Retrieve authenticated user's own profile.

**Endpoint:** `GET /api/profile`

**Authentication:** Required (student/admin)

**Request Headers:**

```
Authorization: Bearer eyJhbGciOiJIUzM4NCJ9...
```

**Example Request (JavaScript):**

```javascript
const response = await fetch("http://localhost:8080/api/profile", {
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});
const profile = await response.json();
```

**Success Response (200 OK):**

```json
{
  "id": 1,
  "userId": 1,
  "firstName": "Test",
  "lastName": "User",
  "birthDate": "2000-01-15",
  "bio": "Computer Science student passionate about AI",
  "phoneNumber": "+201234567890",
  "linkedinUrl": "https://linkedin.com/in/testuser",
  "githubUrl": "https://github.com/testuser",
  "interests": "Machine Learning, Web Development, Cloud Computing",
  "profilePhotoUrl": "http://localhost:9000/campuscard/photos/user1_profile.jpg",
  "visibility": "PUBLIC",
  "createdAt": "2024-01-15T10:30:00",
  "updatedAt": "2024-01-20T14:45:00"
}
```

**Notes:**

- Always returns the authenticated user's profile (cannot fail with 403)
- `firstName`, `lastName`, `birthDate` are immutable (set during registration)

---

### 4. Get User Profile by ID

View another user's profile (privacy rules apply).

**Endpoint:** `GET /api/profile/{userId}`

**Authentication:** Required (student/admin)

**Request Headers:**

```
Authorization: Bearer eyJhbGciOiJIUzM4NCJ9...
```

**Example Request:**

```javascript
const response = await fetch("http://localhost:8080/api/profile/5", {
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});
```

**Success Response (200 OK):**

```json
{
  "id": 2,
  "userId": 5,
  "firstName": "Ahmed",
  "lastName": "Hassan",
  "birthDate": "2000-05-15",
  "bio": "Software Engineering student",
  "phoneNumber": "+201098765432",
  "linkedinUrl": null,
  "githubUrl": "https://github.com/ahmedh",
  "interests": "Backend Development, DevOps",
  "profilePhotoUrl": "http://localhost:9000/campuscard/photos/user5_profile.jpg",
  "visibility": "PUBLIC",
  "createdAt": "2024-01-18T09:15:00",
  "updatedAt": "2024-01-19T11:20:00"
}
```

**Error Response (403 Forbidden - Private Profile):**

```json
{
  "error": "Access Denied",
  "message": "This profile is private"
}
```

**Error Response (403 Forbidden - Not Approved):**

```json
{
  "error": "Access Denied",
  "message": "User is not approved"
}
```

**Privacy Rules:**

- ✅ Users can always view their own profile
- ✅ Admins can view any profile
- ❌ Students cannot view PENDING/REJECTED users (403)
- ✅ Students can view APPROVED + PUBLIC profiles
- ❌ Students cannot view APPROVED + PRIVATE profiles (403)

---

### 5. Update Profile

Update profile information (bio, contacts, social links, visibility).

**Endpoint:** `PUT /api/profile`

**Authentication:** Required (student/admin)

**Content-Type:** `application/json`

**Request Body:**

```json
{
  "bio": "Updated bio - CS student specializing in Machine Learning",
  "phoneNumber": "+201234567890",
  "linkedinUrl": "https://linkedin.com/in/testuser-updated",
  "githubUrl": "https://github.com/testuser",
  "interests": "AI, Deep Learning, Python, TensorFlow",
  "visibility": "PRIVATE"
}
```

**Field Details:**

| Field       | Type   | Required | Validation     | Notes              |
| ----------- | ------ | -------- | -------------- | ------------------ |
| bio         | string | ❌       | max 500 chars  | Personal bio       |
| phoneNumber | string | ❌       | valid format   | Contact number     |
| linkedinUrl | string | ❌       | valid URL      | LinkedIn profile   |
| githubUrl   | string | ❌       | valid URL      | GitHub profile     |
| interests   | string | ❌       | max 255 chars  | Comma-separated    |
| visibility  | string | ❌       | PUBLIC/PRIVATE | Profile visibility |

**Example Request (JavaScript):**

```javascript
const response = await fetch("http://localhost:8080/api/profile", {
  method: "PUT",
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    bio: "Updated bio...",
    visibility: "PRIVATE",
  }),
});
```

**Success Response (200 OK):**

```json
{
  "id": 1,
  "userId": 1,
  "firstName": "Test",
  "lastName": "User",
  "birthDate": "2000-01-15",
  "bio": "Updated bio - CS student specializing in Machine Learning",
  "phoneNumber": "+201234567890",
  "linkedinUrl": "https://linkedin.com/in/testuser-updated",
  "githubUrl": "https://github.com/testuser",
  "interests": "AI, Deep Learning, Python, TensorFlow",
  "profilePhotoUrl": "http://localhost:9000/campuscard/photos/user1_profile.jpg",
  "visibility": "PRIVATE",
  "createdAt": "2024-01-15T10:30:00",
  "updatedAt": "2024-01-22T16:00:00"
}
```

**Error Response (400 Bad Request):**

```json
{
  "status": "ERROR",
  "message": "Validation failed",
  "errors": {
    "bio": "Bio must not exceed 500 characters",
    "linkedinUrl": "Must be a valid URL"
  }
}
```

**Notes:**

- All fields are optional (only update what you send)
- `firstName`, `lastName`, `birthDate` are **immutable** (cannot be changed)
- Partial updates supported (send only fields to update)

---

### 6. Upload Profile Photo

Upload or update profile photo.

**Endpoint:** `POST /api/profile/photo`

**Authentication:** Required (student/admin)

**Content-Type:** `multipart/form-data`

**Request Fields:**

| Field | Type | Required | Validation         |
| ----- | ---- | -------- | ------------------ |
| file  | file | ✅       | JPEG/PNG, max 10MB |

**Example Request (JavaScript):**

```javascript
const formData = new FormData();
formData.append("file", fileInput.files[0]);

const response = await fetch("http://localhost:8080/api/profile/photo", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
  body: formData,
});
```

**Success Response (200 OK):**

```json
{
  "message": "Profile photo uploaded successfully",
  "photoUrl": "http://localhost:9000/campuscard/photos/user1_profile.jpg"
}
```

**Error Response (400 Bad Request - Invalid Format):**

```json
{
  "status": "ERROR",
  "message": "Invalid file format. Only JPEG and PNG are allowed."
}
```

**Error Response (413 Payload Too Large):**

```json
{
  "status": "ERROR",
  "message": "File size exceeds 10MB limit"
}
```

---

### 7. Upload National ID Scan

Upload or update national ID scan (admin may request re-upload).

**Endpoint:** `POST /api/profile/national-id-scan`

**Authentication:** Required (student/admin)

**Content-Type:** `multipart/form-data`

**Request Fields:**

| Field | Type | Required | Validation         |
| ----- | ---- | -------- | ------------------ |
| file  | file | ✅       | JPEG/PNG, max 10MB |

**Example Request (JavaScript):**

```javascript
const formData = new FormData();
formData.append("file", nationalIdFile);

const response = await fetch(
  "http://localhost:8080/api/profile/national-id-scan",
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: formData,
  }
);
```

**Success Response (200 OK):**

```json
{
  "message": "National ID scan uploaded successfully",
  "scanUrl": "http://localhost:9000/campuscard/national-ids/user1_national_id.jpg"
}
```

**Notes:**

- Uploading a new scan does NOT reset approval status
- Admin can request re-upload if photo is unclear

---

## 🔧 Admin Endpoints

### 8. Get Dashboard Statistics

View system-wide metrics and user counts.

**Endpoint:** `GET /api/admin/dashboard/stats`

**Authentication:** Required (admin only)

**Request Headers:**

```
Authorization: Bearer eyJhbGciOiJIUzM4NCJ9...
```

**Example Request:**

```javascript
const response = await fetch(
  "http://localhost:8080/api/admin/dashboard/stats",
  {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  }
);
const stats = await response.json();
```

**Success Response (200 OK):**

```json
{
  "totalUsers": 150,
  "pendingUsers": 12,
  "approvedUsers": 130,
  "rejectedUsers": 8,
  "totalStudents": 145,
  "totalAdmins": 5,
  "emailVerifiedUsers": 140,
  "emailUnverifiedUsers": 10,
  "publicProfiles": 100,
  "privateProfiles": 50
}
```

**Error Response (403 Forbidden):**

```json
{
  "error": "Access Denied",
  "message": "Admin role required"
}
```

---

### 9. Get Pending Users

List all users awaiting approval.

**Endpoint:** `GET /api/admin/users/pending`

**Authentication:** Required (admin only)

**Request Headers:**

```
Authorization: Bearer eyJhbGciOiJIUzM4NCJ9...
```

**Example Request:**

```javascript
const response = await fetch("http://localhost:8080/api/admin/users/pending", {
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});
const pendingUsers = await response.json();
```

**Success Response (200 OK):**

```json
[
  {
    "id": 15,
    "firstName": "Mohamed",
    "lastName": "Ali",
    "email": "mohamed.ali@eng.psu.edu.eg",
    "nationalId": "30005150123456",
    "status": "PENDING",
    "emailVerified": true,
    "facultyId": 1,
    "departmentId": 2,
    "year": 3,
    "profilePhotoUrl": "http://localhost:9000/campuscard/photos/user15_profile.jpg",
    "nationalIdScanUrl": "http://localhost:9000/campuscard/national-ids/user15_national_id.jpg",
    "createdAt": "2024-01-22T08:30:00"
  },
  {
    "id": 16,
    "firstName": "Sara",
    "lastName": "Ahmed",
    "email": "sara.ahmed@eng.psu.edu.eg",
    "nationalId": "29912250234567",
    "status": "PENDING",
    "emailVerified": false,
    "facultyId": 1,
    "departmentId": 1,
    "year": 1,
    "profilePhotoUrl": "http://localhost:9000/campuscard/photos/user16_profile.jpg",
    "nationalIdScanUrl": "http://localhost:9000/campuscard/national-ids/user16_national_id.jpg",
    "createdAt": "2024-01-22T10:15:00"
  }
]
```

**Notes:**

- Only users with `status: "PENDING"` are returned
- Check `emailVerified` before approving (must be true)
- Display `profilePhotoUrl` and `nationalIdScanUrl` side-by-side for verification

---

### 10. Get All Users

List all users (for bulk management).

**Endpoint:** `GET /api/admin/users`

**Authentication:** Required (admin only)

**Request Headers:**

```
Authorization: Bearer eyJhbGciOiJIUzM4NCJ9...
```

**Example Request:**

```javascript
const response = await fetch("http://localhost:8080/api/admin/users", {
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});
const allUsers = await response.json();
```

**Success Response (200 OK):**

```json
[
  {
    "id": 1,
    "firstName": "Test",
    "lastName": "User",
    "email": "test@eng.psu.edu.eg",
    "nationalId": "12345678901234",
    "status": "APPROVED",
    "role": "student",
    "emailVerified": true,
    "createdAt": "2024-01-10T10:00:00"
  },
  {
    "id": 2,
    "firstName": "Admin",
    "lastName": "User",
    "email": "admin@eng.psu.edu.eg",
    "nationalId": "98765432109876",
    "status": "APPROVED",
    "role": "admin",
    "emailVerified": true,
    "createdAt": "2024-01-10T10:00:00"
  }
]
```

**Notes:**

- Returns users with all statuses (PENDING, APPROVED, REJECTED)
- Use for user search, filtering, and bulk operations

---

### 11. Get User Details

View detailed information for a specific user.

**Endpoint:** `GET /api/admin/users/{userId}`

**Authentication:** Required (admin only)

**Request Headers:**

```
Authorization: Bearer eyJhbGciOiJIUzM4NCJ9...
```

**Example Request:**

```javascript
const response = await fetch("http://localhost:8080/api/admin/users/15", {
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});
const userDetails = await response.json();
```

**Success Response (200 OK):**

```json
{
  "id": 15,
  "firstName": "Mohamed",
  "lastName": "Ali",
  "email": "mohamed.ali@eng.psu.edu.eg",
  "nationalId": "30005150123456",
  "dateOfBirth": "2000-05-15",
  "status": "PENDING",
  "role": "student",
  "emailVerified": true,
  "facultyId": 1,
  "departmentId": 2,
  "year": 3,
  "profile": {
    "bio": null,
    "phoneNumber": null,
    "linkedinUrl": null,
    "githubUrl": null,
    "interests": null,
    "profilePhotoUrl": "http://localhost:9000/campuscard/photos/user15_profile.jpg",
    "visibility": "PUBLIC"
  },
  "nationalIdScanUrl": "http://localhost:9000/campuscard/national-ids/user15_national_id.jpg",
  "createdAt": "2024-01-22T08:30:00",
  "updatedAt": "2024-01-22T08:30:00"
}
```

**Error Response (404 Not Found):**

```json
{
  "error": "Not Found",
  "message": "User with ID 999 not found"
}
```

---

### 12. Approve or Reject User

Approve or reject a pending user account.

**Endpoint:** `POST /api/admin/users/approve-reject`

**Authentication:** Required (admin only)

**Content-Type:** `application/json`

**Request Body (Approve):**

```json
{
  "userId": 15,
  "approved": true
}
```

**Request Body (Reject):**

```json
{
  "userId": 16,
  "approved": false,
  "rejectionReason": "National ID photo is unclear, please re-upload a clearer scan"
}
```

**Field Details:**

| Field           | Type    | Required             | Description                    |
| --------------- | ------- | -------------------- | ------------------------------ |
| userId          | integer | ✅                   | User ID to approve/reject      |
| approved        | boolean | ✅                   | true = approve, false = reject |
| rejectionReason | string  | Required if rejected | Explanation for rejection      |

**Example Request (Approve):**

```javascript
const response = await fetch(
  "http://localhost:8080/api/admin/users/approve-reject",
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userId: 15,
      approved: true,
    }),
  }
);
```

**Success Response (200 OK - Approved):**

```json
{
  "message": "User approved successfully",
  "userId": 15,
  "status": "APPROVED"
}
```

**Success Response (200 OK - Rejected):**

```json
{
  "message": "User rejected",
  "userId": 16,
  "status": "REJECTED",
  "rejectionReason": "National ID photo is unclear, please re-upload a clearer scan"
}
```

**Error Response (400 Bad Request - Email Not Verified):**

```json
{
  "status": "ERROR",
  "message": "Cannot approve user. Email not verified."
}
```

**Error Response (400 Bad Request - Missing Rejection Reason):**

```json
{
  "status": "ERROR",
  "message": "Rejection reason is required when rejecting a user"
}
```

**Notes:**

- Only approve if `emailVerified: true` and photos match
- Rejection reason is mandatory for rejected users
- User receives notification (if email service implemented)

---

### 13. Send Email Verification

Send verification email to user.

**Endpoint:** `POST /api/admin/users/{userId}/send-verification`

**Authentication:** Required (admin only)

**Request Headers:**

```
Authorization: Bearer eyJhbGciOiJIUzM4NCJ9...
```

**Example Request:**

```javascript
const response = await fetch(
  "http://localhost:8080/api/admin/users/16/send-verification",
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  }
);
```

**Success Response (200 OK):**

```json
{
  "message": "Verification email sent successfully",
  "userId": 16,
  "email": "sara.ahmed@eng.psu.edu.eg",
  "verificationToken": "a7b8c9d0-1234-5678-90ab-cdef12345678"
}
```

**Error Response (400 Bad Request - Already Verified):**

```json
{
  "status": "ERROR",
  "message": "Email is already verified"
}
```

**Notes:**

- User receives email with verification link
- Verification link format: `http://frontend.com/verify?token={token}&userId={userId}`
- Token expires after 24 hours

---

### 14. Verify Email with Token

Verify user's email using verification token.

**Endpoint:** `POST /api/admin/users/{userId}/verify-email/{token}`

**Authentication:** Required (admin only)

**Request Headers:**

```
Authorization: Bearer eyJhbGciOiJIUzM4NCJ9...
```

**Example Request:**

```javascript
const response = await fetch(
  "http://localhost:8080/api/admin/users/16/verify-email/a7b8c9d0-1234-5678-90ab-cdef12345678",
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  }
);
```

**Success Response (200 OK):**

```json
{
  "message": "Email verified successfully",
  "userId": 16,
  "emailVerified": true
}
```

**Error Response (400 Bad Request - Invalid Token):**

```json
{
  "status": "ERROR",
  "message": "Invalid or expired verification token"
}
```

**Error Response (400 Bad Request - Already Verified):**

```json
{
  "status": "ERROR",
  "message": "Email is already verified"
}
```

---

---

## 📘 Frontend Guidance

### Authentication & Token Management

**Token Storage:**

```javascript
// After successful login
const loginResponse = await fetch("/api/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ identifier, password }),
});

const data = await loginResponse.json();
if (data.token !== "ERROR") {
  localStorage.setItem("token", data.token);
  localStorage.setItem("userId", data.id);
  localStorage.setItem("userRole", data.role);
  localStorage.setItem("userEmail", data.email);
}
```

**Making Authenticated Requests:**

```javascript
// Helper function for API calls
async function apiCall(endpoint, options = {}) {
  const token = localStorage.getItem("token");

  const config = {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await fetch(`http://localhost:8080${endpoint}`, config);

  // Handle token expiration
  if (response.status === 401) {
    localStorage.clear();
    window.location.href = "/login";
    return;
  }

  return response;
}

// Usage
const profile = await apiCall("/api/profile").then((r) => r.json());
```

**Token Expiration Handling:**

```javascript
// Check token validity on app load
async function checkAuth() {
  const token = localStorage.getItem("token");
  if (!token) {
    redirectToLogin();
    return false;
  }

  try {
    const response = await fetch("http://localhost:8080/api/profile", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.status === 401) {
      localStorage.clear();
      redirectToLogin();
      return false;
    }

    return true;
  } catch (error) {
    console.error("Auth check failed:", error);
    return false;
  }
}
```

**Logout:**

```javascript
function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("userId");
  localStorage.removeItem("userRole");
  localStorage.removeItem("userEmail");
  window.location.href = "/login";
}
```

---

### File Uploads

**Profile Photo Upload with Preview:**

```javascript
async function uploadProfilePhoto(file) {
  // Validate file
  if (!file.type.match(/image\/(jpeg|jpg|png)/)) {
    alert("Only JPEG and PNG images are allowed");
    return;
  }

  if (file.size > 10 * 1024 * 1024) {
    alert("File size must be less than 10MB");
    return;
  }

  // Preview image
  const reader = new FileReader();
  reader.onload = (e) => {
    document.getElementById("photoPreview").src = e.target.result;
  };
  reader.readAsDataURL(file);

  // Upload
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("http://localhost:8080/api/profile/photo", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: formData,
  });

  const result = await response.json();
  if (response.ok) {
    console.log("Photo uploaded:", result.photoUrl);
  }
}
```

**Upload Progress Indicator:**

```javascript
async function uploadWithProgress(file, endpoint) {
  const formData = new FormData();
  formData.append("file", file);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) {
        const percentComplete = (e.loaded / e.total) * 100;
        document.getElementById("progressBar").value = percentComplete;
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status === 200) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        reject(new Error("Upload failed"));
      }
    });

    xhr.open("POST", `http://localhost:8080${endpoint}`);
    xhr.setRequestHeader(
      "Authorization",
      `Bearer ${localStorage.getItem("token")}`
    );
    xhr.send(formData);
  });
}
```

---

### Profile Visibility & Privacy

**Privacy Hierarchy:**

```
1. Status Check (highest priority)
   ↓
   PENDING/REJECTED → Blocked (403) for students
   APPROVED → Continue to step 2

2. Visibility Check
   ↓
   PRIVATE → Blocked (403) for non-owners
   PUBLIC → Allowed
```

**Handling Profile Access:**

```javascript
async function viewProfile(userId) {
  const currentUserId = localStorage.getItem("userId");
  const userRole = localStorage.getItem("userRole");

  try {
    const response = await fetch(
      `http://localhost:8080/api/profile/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    if (response.status === 403) {
      const error = await response.json();
      if (error.message.includes("not approved")) {
        showMessage("This user account is pending approval");
      } else if (error.message.includes("private")) {
        showMessage("This profile is private");
      }
      return null;
    }

    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.error("Failed to fetch profile:", error);
    return null;
  }
}
```

**User Status Indicators (UI):**

```javascript
function renderUserStatus(status) {
  const statusConfig = {
    PENDING: { color: "orange", icon: "⏳", text: "Pending Approval" },
    APPROVED: { color: "green", icon: "✓", text: "Approved" },
    REJECTED: { color: "red", icon: "✗", text: "Rejected" },
  };

  const config = statusConfig[status];
  return `
    <span style="color: ${config.color}">
      ${config.icon} ${config.text}
    </span>
  `;
}
```

---

### Admin Review Workflow

**Complete Review Process:**

```javascript
async function reviewPendingUser(userId) {
  // 1. Fetch user details
  const user = await fetch(`http://localhost:8080/api/admin/users/${userId}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  }).then((r) => r.json());

  // 2. Check email verification
  if (!user.emailVerified) {
    const sendVerification = confirm(
      "Email not verified. Send verification email?"
    );
    if (sendVerification) {
      await fetch(
        `http://localhost:8080/api/admin/users/${userId}/send-verification`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      alert("Verification email sent. Please wait for user to verify.");
      return;
    }
  }

  // 3. Display photos for comparison
  displayPhotoComparison(user.profile.profilePhotoUrl, user.nationalIdScanUrl);

  // 4. Admin decision
  const approved = confirm("Approve this user?");

  if (approved) {
    await approveUser(userId);
  } else {
    const reason = prompt("Enter rejection reason:");
    if (reason) {
      await rejectUser(userId, reason);
    }
  }
}

async function approveUser(userId) {
  const response = await fetch(
    "http://localhost:8080/api/admin/users/approve-reject",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId, approved: true }),
    }
  );

  if (response.ok) {
    alert("User approved successfully");
  }
}

async function rejectUser(userId, rejectionReason) {
  const response = await fetch(
    "http://localhost:8080/api/admin/users/approve-reject",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId, approved: false, rejectionReason }),
    }
  );

  if (response.ok) {
    alert("User rejected");
  }
}
```

**Pending Users List with Filters:**

```javascript
async function displayPendingUsers() {
  const users = await fetch("http://localhost:8080/api/admin/users/pending", {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  }).then((r) => r.json());

  // Filter options
  const verifiedOnly = document.getElementById("verifiedFilter").checked;
  const filteredUsers = verifiedOnly
    ? users.filter((u) => u.emailVerified)
    : users;

  // Render list
  const html = filteredUsers
    .map(
      (user) => `
    <div class="user-card">
      <img src="${user.profilePhotoUrl}" alt="Profile" />
      <h3>${user.firstName} ${user.lastName}</h3>
      <p>Email: ${user.email}</p>
      <p>Email Verified: ${user.emailVerified ? "✓" : "✗"}</p>
      <button onclick="reviewPendingUser(${user.id})">Review</button>
    </div>
  `
    )
    .join("");

  document.getElementById("pendingUsersList").innerHTML = html;
}
```

---

### Error Handling

**Comprehensive Error Handler:**

```javascript
async function handleApiResponse(response) {
  if (response.ok) {
    return await response.json();
  }

  switch (response.status) {
    case 400: {
      const error = await response.json();
      if (error.errors) {
        // Display field-specific errors
        Object.entries(error.errors).forEach(([field, message]) => {
          displayFieldError(field, message);
        });
      } else {
        showError(error.message);
      }
      break;
    }

    case 401:
      localStorage.clear();
      window.location.href = "/login";
      break;

    case 403:
      const forbiddenError = await response.json();
      showError(forbiddenError.message || "Access denied");
      break;

    case 404:
      showError("Resource not found");
      break;

    case 413:
      showError("File size too large (max 10MB)");
      break;

    case 500:
      showError("Server error. Please try again later.");
      break;

    default:
      showError("An unexpected error occurred");
  }

  return null;
}

// Usage
const profile = await fetch("/api/profile", {
  headers: { Authorization: `Bearer ${token}` },
}).then(handleApiResponse);
```

**Form Validation Display:**

```javascript
function displayFieldError(fieldName, errorMessage) {
  const field = document.getElementById(fieldName);
  const errorDiv = document.createElement("div");
  errorDiv.className = "error-message";
  errorDiv.textContent = errorMessage;
  errorDiv.style.color = "red";

  // Remove existing error
  const existingError = field.parentElement.querySelector(".error-message");
  if (existingError) {
    existingError.remove();
  }

  // Add new error
  field.parentElement.appendChild(errorDiv);
  field.style.borderColor = "red";
}

function clearFieldErrors() {
  document.querySelectorAll(".error-message").forEach((el) => el.remove());
  document.querySelectorAll("input, textarea").forEach((el) => {
    el.style.borderColor = "";
  });
}
```

---

### Common HTTP Status Codes

| Code | Meaning           | Action                                     |
| ---- | ----------------- | ------------------------------------------ |
| 200  | OK                | Request successful                         |
| 201  | Created           | Resource created successfully (signup)     |
| 400  | Bad Request       | Validation failed - show field errors      |
| 401  | Unauthorized      | Token invalid/expired - redirect to login  |
| 403  | Forbidden         | No permission - show access denied message |
| 404  | Not Found         | Resource doesn't exist                     |
| 413  | Payload Too Large | File size exceeds 10MB                     |
| 500  | Server Error      | Backend issue - show generic error         |

---

### Best Practices

1. **Always validate on frontend before API calls**

   - Check email format (@eng.psu.edu.eg)
   - Validate national ID (14 digits)
   - Check file size (<10MB) and type (JPEG/PNG)

2. **Handle loading states**

   ```javascript
   setLoading(true);
   try {
     const data = await apiCall("/api/profile");
     // Process data
   } finally {
     setLoading(false);
   }
   ```

3. **Debounce search inputs**

   ```javascript
   const debounce = (func, delay) => {
     let timeoutId;
     return (...args) => {
       clearTimeout(timeoutId);
       timeoutId = setTimeout(() => func(...args), delay);
     };
   };

   const searchUsers = debounce(async (query) => {
     // API call
   }, 500);
   ```

4. **Cache profile data**

   ```javascript
   const profileCache = new Map();

   async function getProfile(userId) {
     if (profileCache.has(userId)) {
       return profileCache.get(userId);
     }

     const profile = await apiCall(`/api/profile/${userId}`).then((r) =>
       r.json()
     );
     profileCache.set(userId, profile);
     return profile;
   }
   ```

5. **Display user-friendly dates**
   ```javascript
   function formatDate(isoString) {
     return new Date(isoString).toLocaleDateString("en-US", {
       year: "numeric",
       month: "long",
       day: "numeric",
     });
   }
   ```

---

### Testing with cURL

**Signup:**

```bash
curl -X POST http://localhost:8080/api/signup \
  -F "firstName=Ahmed" \
  -F "lastName=Hassan" \
  -F "dateOfBirth=2000-05-15" \
  -F "email=ahmed.hassan@eng.psu.edu.eg" \
  -F "password=SecurePass123" \
  -F "nationalId=30005150123456" \
  -F "nationalIdScan=@/path/to/id_scan.jpg" \
  -F "facultyId=1" \
  -F "departmentId=1" \
  -F "year=2"
```

**Login:**

```bash
curl -X POST http://localhost:8080/api/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"test@eng.psu.edu.eg","password":"password123"}'
```

**Get Profile:**

```bash
curl -X GET http://localhost:8080/api/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzM4NCJ9..."
```

**Update Profile:**

```bash
curl -X PUT http://localhost:8080/api/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzM4NCJ9..." \
  -H "Content-Type: application/json" \
  -d '{"bio":"Updated bio","visibility":"PRIVATE"}'
```

---

## 🔗 Quick Reference Table

- **PENDING** (⏳): Awaiting approval
- **APPROVED** (✅): Active user
- **REJECTED** (❌): Access denied

### Best Practices

- Show loading states during API calls
- Cache profile data with reasonable TTL (e.g., 5 minutes)
- Invalidate cache on profile updates
- Show meaningful error messages (not raw API errors)
- Implement optimistic UI updates for better perceived performance
```

---

## 🔗 Quick Reference Table

| # | Endpoint | Method | Auth | Description |
|---|----------|--------|------|-------------|
| 1 | `/api/signup` | POST | None | Register new user |
| 2 | `/api/login` | POST | None | Authenticate and get token |
| 3 | `/api/profile` | GET | Required | Get own profile |
| 4 | `/api/profile/{userId}` | GET | Required | Get user profile by ID |
| 5 | `/api/profile` | PUT | Required | Update profile info |
| 6 | `/api/profile/photo` | POST | Required | Upload profile photo |
| 7 | `/api/profile/national-id-scan` | POST | Required | Upload national ID scan |
| 8 | `/api/admin/dashboard/stats` | GET | Admin | Get system statistics |
| 9 | `/api/admin/users/pending` | GET | Admin | List pending users |
| 10 | `/api/admin/users` | GET | Admin | List all users |
| 11 | `/api/admin/users/{userId}` | GET | Admin | Get user details |
| 12 | `/api/admin/users/approve-reject` | POST | Admin | Approve/reject user |
| 13 | `/api/admin/users/{userId}/send-verification` | POST | Admin | Send email verification |
| 14 | `/api/admin/users/{userId}/verify-email/{token}` | POST | Admin | Verify email with token |

---

## 📋 Request/Response Content Types

| Endpoint | Request Content-Type | Response Content-Type |
|----------|---------------------|----------------------|
| POST /api/signup | multipart/form-data | application/json |
| POST /api/login | application/json | application/json |
| GET /api/profile | N/A | application/json |
| PUT /api/profile | application/json | application/json |
| POST /api/profile/photo | multipart/form-data | application/json |
| POST /api/profile/national-id-scan | multipart/form-data | application/json |
| All Admin endpoints | application/json | application/json |

---

## 🔑 Authentication Header Format

```
Authorization: Bearer eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJ0ZXN0QGVuZy5wc3UuZWR1LmVnIiwidXNlcklkIjoxLCJyb2xlIjoiU1RVREVOVCJ9...
```

---

## 📝 Important Notes

- All timestamps are in ISO 8601 format: `YYYY-MM-DDTHH:mm:ss`
- JWT token expires after 24 hours
- Maximum file upload size: 10MB
- Supported image formats: JPEG, PNG
- Email domain must be: `@eng.psu.edu.eg`
- National ID must be exactly 14 digits
- Profile fields `firstName`, `lastName`, `birthDate` are **immutable** (cannot be changed after registration)
- PENDING/REJECTED users are hidden from students (403 Forbidden)
- PRIVATE profiles are hidden from non-owners (403 Forbidden)

---

**Document Version:** 1.0  
**Last Updated:** January 22, 2024  
**API Version:** Spring Boot 4.0.0  
**Base URL:** `http://localhost:8080`

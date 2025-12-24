import { apiFetch } from "../../core/api/http";


// ✅ Login (Public)
export function loginRequest({ identifier, password }) {
  return apiFetch(
    "/api/login",
    {
      method: "POST",
      body: JSON.stringify({ identifier, password }),
    },
    { auth: false }
  );
}

// ✅ Signup (Public / multipart)
export function signupRequest(formData) {
  return apiFetch(
    "/api/signup",
    {
      method: "POST",
      body: formData,
    },
    { auth: false }
  );
}

// ✅ Upload Profile Photo (Auth required)
export function uploadProfilePhoto(file) {
  const fd = new FormData();
  fd.append("file", file);
  return apiFetch("/api/profile/photo", { method: "POST", body: fd }, { auth: true });
}

// (اختياري) لو عندكم endpoint لرفع البطاقة بعد التسجيل
export function uploadNationalIdScan(file) {
  const fd = new FormData();
  fd.append("file", file);
  return apiFetch("/api/profile/national-id-scan", { method: "POST", body: fd }, { auth: true });
}

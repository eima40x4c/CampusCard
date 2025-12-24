import { apiFetch } from "../../core/api/http";

// جلب قائمة المستخدمين (للدليل أو للأدمن)
export function getAllUsers() {
  return apiFetch("/api/admin/users", { method: "GET" }, { auth: true });
}

// جلب قائمة الانتظار
export function getPendingUsers() {
  return apiFetch("/api/admin/users/pending", { method: "GET" }, { auth: true });
}

// جلب تفاصيل مستخدم معين
export function getUserDetails(userId) {
  return apiFetch(`/api/admin/users/${userId}`, { method: "GET" }, { auth: true });
}

// جلب بروفايل الطالب (البيانات الإضافية)
export function getStudentProfile(userId) {
  return apiFetch(`/api/profile/${userId}`, { method: "GET" }, { auth: true });
}

// الموافقة أو الرفض
export function approveRejectUser(data) {
  // data = { userId, approved: true/false, rejectionReason: "..." }
  return apiFetch("/api/admin/users/approve-reject", { 
    method: "POST", 
    body: JSON.stringify(data) 
  }, { auth: true });
}

// ✅ الدالة التي كانت تسبب المشكلة (إرسال التوكن)
export function sendVerification(userId) {
  // الرابط بناءً على AdminController: /api/admin/users/{userId}/send-verification
  return apiFetch(`/api/admin/users/${userId}/send-verification`, { method: "POST" }, { auth: true });
}

// ✅ دالة التحقق اليدوي بالتوكن
export function verifyEmailWithToken(userId, token) {
  // الرابط بناءً على AdminController: /api/admin/users/{userId}/verify-email/{token}
  return apiFetch(`/api/admin/users/${userId}/verify-email/${token}`, { method: "POST" }, { auth: true });
}

// ✅ Change user role (make admin or demote to student)
export function changeUserRole(userId, role) {
  // role should be "ADMIN" or "STUDENT"
  return apiFetch(`/api/admin/users/${userId}/change-role`, {
    method: "POST",
    body: JSON.stringify({ role })
  }, { auth: true });
}
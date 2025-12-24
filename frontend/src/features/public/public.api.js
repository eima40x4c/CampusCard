import { apiRequest } from "../../core/api/apiClient";

export function getPublicUsers() {
  // ✅ التعديل: استخدام الرابط المخصص للطلاب والموجود في ProfileController
  // هذا الرابط يجلب فقط الطلاب المقبولين (Approved) والـ Public
  return apiRequest("/api/profile/public-students");
}

export function getPublicProfile(userId) {
  return apiRequest(`/api/profile/${userId}`);
}

// ✅ New: Get faculties from backend
export function getFaculties() {
  return apiRequest("/api/public/faculties", {}, { auth: false });
}

// ✅ New: Get departments from backend
export function getDepartments(facultyId = null) {
  const url = facultyId
    ? `/api/public/departments?facultyId=${facultyId}`
    : "/api/public/departments";
  return apiRequest(url, {}, { auth: false });
}

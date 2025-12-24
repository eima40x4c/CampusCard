// ⚠️ DEPRECATED: This file is no longer used
// Faculties and departments are now fetched from the backend API
// See: frontend/src/features/public/public.api.js
// 
// This file is kept only for backward compatibility in case any old code references it.
// All new code should use the backend API endpoints.

export const FACULTIES = [];
export const DEPARTMENTS = [];

export function getDepartmentsForFaculty(facultyId) {
  console.warn("getDepartmentsForFaculty is deprecated. Use getDepartments() from public.api.js instead.");
  return [];
}

export function getYearsForFaculty(facultyId) {
  console.warn("getYearsForFaculty is deprecated. Use faculty.yearsNumbers from backend API instead.");
  return [1, 2, 3, 4];
}

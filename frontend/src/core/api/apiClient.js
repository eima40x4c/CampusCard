import { env } from "../config/env";
import { authStorage } from "../auth/auth.storage";

const BASE_URL = (env.API_BASE_URL || import.meta.env.VITE_API_BASE_URL || "http://localhost:8080")
  .replace(/\/$/, "");

function joinUrl(base, path) {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}

export async function apiRequest(path, options = {}, { auth = true } = {}) {
  const headers = new Headers(options.headers || {});
  const session = authStorage.get();

  if (auth && session?.token) {
    headers.set("Authorization", `Bearer ${session.token}`);
  }

  if (options.body && !(options.body instanceof FormData)) {
    if (!headers.get("Content-Type")) headers.set("Content-Type", "application/json");
  }

  const res = await fetch(joinUrl(BASE_URL, path), { ...options, headers });

  if (res.status === 401) {
    authStorage.clear();
    window.location.href = "/login";
    return;
  }

  const contentType = res.headers.get("content-type") || "";
  const data = contentType.includes("application/json") ? await res.json() : await res.text();

  if (!res.ok) {
    const message =
      (data && data.message) ||
      (data && data.error) ||
      `Request failed: ${res.status}`;
    const err = new Error(message);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

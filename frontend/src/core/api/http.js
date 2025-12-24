import { env } from "../config/env";
import { authStorage } from "../auth/auth.storage";
import { toApiError } from "./errors";

function safeJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

export async function apiFetch(path, init = {}, opts = { auth: true }) {
  const url = `${env.API_BASE_URL}${path}`;
  const session = authStorage.get();
  const needsAuth = opts?.auth !== false;

  const headers = { ...(init.headers || {}) };
  const isFormData = init.body instanceof FormData;

  if (!isFormData && init.body && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  if (needsAuth && session?.token) {
    headers["Authorization"] = `Bearer ${session.token}`;
  }

  try {
    const res = await fetch(url, { ...init, headers });

    const text = await res.text();
    const body = text ? safeJson(text) : null;

    if (!res.ok) {
      if (res.status === 401) authStorage.clear();
      return { ok: false, error: toApiError(res.status, body) };
    }

    return { ok: true, data: body };
  } catch {
    return { ok: false, error: { kind: "network", message: "Network error" } };
  }
}

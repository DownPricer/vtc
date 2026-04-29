"use client";

import { getCentralApiConfig } from "./centralApi";

const ACCESS_TOKEN_KEY = "vtc_pro_access_token";
const USER_KEY = "vtc_pro_user";

type ProUser = {
  id: string;
  tenantId: string;
  email: string;
  role: "admin" | "agent";
};

function cfg() {
  const c = getCentralApiConfig();
  if (!c) {
    throw new Error("Configuration API manquante (NEXT_PUBLIC_API_URL / NEXT_PUBLIC_TENANT_ID).");
  }
  return c;
}

export function getStoredAccessToken(): string {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(ACCESS_TOKEN_KEY) || "";
}

export function setStoredSession(accessToken: string, user: ProUser): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearStoredSession(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
}

export function getStoredUser(): ProUser | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ProUser;
  } catch {
    return null;
  }
}

async function authFetch(path: string, init?: RequestInit, withAuth = true): Promise<Response> {
  const { baseUrl, tenantId } = cfg();
  const token = getStoredAccessToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-Tenant-ID": tenantId,
    ...(init?.headers as Record<string, string>),
  };
  if (withAuth && token) headers.Authorization = `Bearer ${token}`;

  return fetch(`${baseUrl}/api${path}`, {
    ...init,
    headers,
    credentials: "include",
  });
}

async function parseJson(res: Response): Promise<Record<string, unknown>> {
  try {
    return (await res.json()) as Record<string, unknown>;
  } catch {
    return {};
  }
}

async function tryRefresh(): Promise<boolean> {
  const res = await authFetch("/auth/refresh", { method: "POST" }, false);
  if (!res.ok) return false;
  const json = await parseJson(res);
  const data = json.data as { accessToken: string; user: ProUser } | undefined;
  if (!data?.accessToken || !data.user) return false;
  setStoredSession(data.accessToken, data.user);
  return true;
}

export async function proApi(path: string, init?: RequestInit): Promise<Record<string, unknown>> {
  let res = await authFetch(path, init, true);
  if (res.status === 401 && (await tryRefresh())) {
    res = await authFetch(path, init, true);
  }
  const json = await parseJson(res);
  if (!res.ok) {
    const msg =
      ((json.error as { message?: string } | undefined)?.message ||
        (json.message as string | undefined) ||
        "Erreur API") as string;
    throw new Error(msg);
  }
  return json;
}

export async function loginPro(email: string, password: string): Promise<ProUser> {
  const res = await authFetch(
    "/auth/login",
    { method: "POST", body: JSON.stringify({ email, password }) },
    false
  );
  const json = await parseJson(res);
  if (!res.ok) {
    const msg = ((json.error as { message?: string } | undefined)?.message || "Connexion refusée") as string;
    throw new Error(msg);
  }
  const data = json.data as { accessToken: string; user: ProUser } | undefined;
  if (!data?.accessToken || !data.user) throw new Error("Réponse login invalide");
  setStoredSession(data.accessToken, data.user);
  return data.user;
}

export async function logoutPro(): Promise<void> {
  try {
    await authFetch("/auth/logout", { method: "POST" }, false);
  } finally {
    clearStoredSession();
  }
}

export async function ensureProSession(): Promise<ProUser> {
  const current = getStoredUser();
  if (current && getStoredAccessToken()) return current;
  const refreshed = await tryRefresh();
  if (!refreshed) throw new Error("Session absente");
  const u = getStoredUser();
  if (!u) throw new Error("Session absente");
  return u;
}

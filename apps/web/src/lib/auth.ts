import { fetchApi } from "./api";

const TOKEN_KEY = "token";
const USER_KEY = "user";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string | null;
  picture?: string | null;
}

// ── Token helpers ─────────────────────────────────────────────────────────────
export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(TOKEN_KEY, token);
  }
}

export function clearToken(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(TOKEN_KEY);
  }
}

// ── User helpers ──────────────────────────────────────────────────────────────
export function getUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function setUser(user: AuthUser): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
}

export function clearUser(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(USER_KEY);
  }
}

// ── Auth actions ──────────────────────────────────────────────────────────────
export async function login(email: string, password: string): Promise<AuthUser> {
  const data = await fetchApi("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  setToken(data.accessToken);
  setUser(data.user);
  return data.user as AuthUser;
}

export async function register(
  name: string,
  email: string,
  phone: string,
  password: string,
): Promise<AuthUser> {
  const data = await fetchApi("/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, phone, password }),
  });
  setToken(data.accessToken);
  setUser(data.user);
  return data.user as AuthUser;
}

export function logout(): void {
  clearToken();
  clearUser();
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

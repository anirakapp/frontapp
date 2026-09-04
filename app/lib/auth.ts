// lib/auth.ts
// Manejo de sesión en el cliente. Simple a propósito: guardamos el JWT y
// el usuario que devuelve el backend en localStorage. Solo se usa desde
// componentes "use client".
import type { AuthUser } from "./types";

const TOKEN_KEY = "cc_token";
const USER_KEY = "cc_user";

export function saveSession(token: string, user: AuthUser): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TOKEN_KEY, token);
  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
}

export function isAdmin(): boolean {
  return getStoredUser()?.role === "admin";
}
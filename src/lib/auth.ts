"use client";

import { MEMBERS } from "./data";

const AUTH_KEY = "cf_auth";
const PENDING_KEY = "cf_pending_email";

export type AuthState = {
  memberId: string;
  email: string;
  name: string;
  loginMethod: "magic-link" | "password";
};

export function getAuth(): AuthState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setAuth(state: AuthState) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(state));
}

export function clearAuth() {
  localStorage.removeItem(AUTH_KEY);
  localStorage.removeItem(PENDING_KEY);
}

export function setPendingEmail(email: string) {
  localStorage.setItem(PENDING_KEY, email);
}

export function getPendingEmail(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(PENDING_KEY);
}

// Simulate magic link login — in prototype, "any" email auto-matches to first member
// In reality, this would validate a one-time token from an email link
export function loginWithMagicLink(email: string): AuthState {
  const member = MEMBERS.find((m) =>
    m.contactEmail.toLowerCase() === email.toLowerCase()
  ) ?? MEMBERS[0]; // default to first member for demo purposes

  const state: AuthState = {
    memberId: member.id,
    email: member.contactEmail,
    name: member.name,
    loginMethod: "magic-link",
  };
  setAuth(state);
  localStorage.removeItem(PENDING_KEY);
  return state;
}

// Fallback password auth (prototype: any password works)
export function loginWithPassword(email: string, _password: string): AuthState {
  const member = MEMBERS.find((m) =>
    m.contactEmail.toLowerCase() === email.toLowerCase()
  ) ?? MEMBERS[0];

  const state: AuthState = {
    memberId: member.id,
    email: member.contactEmail,
    name: member.name,
    loginMethod: "password",
  };
  setAuth(state);
  return state;
}

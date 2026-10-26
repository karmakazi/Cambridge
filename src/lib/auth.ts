"use client";

import { getAllResolvedMembers } from "./store";

const AUTH_KEY = "cf_auth";
const PENDING_KEY = "cf_pending_email";

export type AuthState = {
  memberId: string;
  email: string;
  name: string;
  loginMethod: "magic-link" | "password";
  role?: "participant" | "assistant";
  assistedMemberId?: string;
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
  const members = getAllResolvedMembers();
  const assistantFor = members.find((m) =>
    m.assistantAccess?.enabled && m.assistantAccess.email.toLowerCase() === email.toLowerCase()
  );
  if (assistantFor?.assistantAccess) {
    const state: AuthState = {
      memberId: assistantFor.id,
      assistedMemberId: assistantFor.id,
      email: assistantFor.assistantAccess.email,
      name: assistantFor.assistantAccess.name,
      loginMethod: "magic-link",
      role: "assistant",
    };
    setAuth(state);
    localStorage.removeItem(PENDING_KEY);
    return state;
  }

  const member = members.find((m) =>
    m.contactEmail.toLowerCase() === email.toLowerCase()
  ) ?? members[0]; // default to first member for demo purposes

  const state: AuthState = {
    memberId: member.id,
    email: member.contactEmail,
    name: member.name,
    loginMethod: "magic-link",
    role: "participant",
  };
  setAuth(state);
  localStorage.removeItem(PENDING_KEY);
  return state;
}

// Fallback password auth (prototype: any password works)
export function loginWithPassword(email: string, password: string): AuthState {
  void password; // Prototype only: any non-empty password is accepted by the form.
  const members = getAllResolvedMembers();
  const assistantFor = members.find((m) =>
    m.assistantAccess?.enabled && m.assistantAccess.email.toLowerCase() === email.toLowerCase()
  );
  if (assistantFor?.assistantAccess) {
    const state: AuthState = {
      memberId: assistantFor.id,
      assistedMemberId: assistantFor.id,
      email: assistantFor.assistantAccess.email,
      name: assistantFor.assistantAccess.name,
      loginMethod: "password",
      role: "assistant",
    };
    setAuth(state);
    return state;
  }

  const member = members.find((m) =>
    m.contactEmail.toLowerCase() === email.toLowerCase()
  ) ?? members[0];

  const state: AuthState = {
    memberId: member.id,
    email: member.contactEmail,
    name: member.name,
    loginMethod: "password",
    role: "participant",
  };
  setAuth(state);
  return state;
}

export function loginAsAssistant(memberId = "m001"): AuthState | null {
  const member = getAllResolvedMembers().find(candidate => candidate.id === memberId);
  if (!member?.assistantAccess?.enabled) return null;
  const state: AuthState = {
    memberId: member.id,
    assistedMemberId: member.id,
    email: member.assistantAccess.email,
    name: member.assistantAccess.name,
    loginMethod: "magic-link",
    role: "assistant",
  };
  setAuth(state);
  return state;
}

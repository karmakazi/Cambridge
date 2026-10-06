"use client";

import { Member, MEMBERS } from "./data";

const PROFILE_KEY = "cf_profiles";

// Load any locally-edited profiles from LocalStorage (overrides seed data)
export function loadProfiles(): Record<string, Partial<Member>> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveProfile(memberId: string, updates: Partial<Member>) {
  const existing = loadProfiles();
  existing[memberId] = { ...existing[memberId], ...updates };
  localStorage.setItem(PROFILE_KEY, JSON.stringify(existing));
}

// Merge seed data with any locally-saved edits
export function getResolvedMember(memberId: string): Member | undefined {
  const base = MEMBERS.find((m) => m.id === memberId);
  if (!base) return undefined;
  const overrides = loadProfiles()[memberId] ?? {};
  return { ...base, ...overrides };
}

export function getAllResolvedMembers(): Member[] {
  const overrides = loadProfiles();
  return MEMBERS.map((m) => ({ ...m, ...(overrides[m.id] ?? {}) }));
}

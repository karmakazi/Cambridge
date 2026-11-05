"use client";

const MEMBER_KEY = "cf_favorite_members";
const MATERIAL_KEY = "cf_saved_materials";
const EXCHANGE_KEY = "cf_saved_exchange_posts";

function read(key: string, defaults: string[] = []): string[] {
  if (typeof window === "undefined") return defaults;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaults;
  } catch {
    return defaults;
  }
}

function write(key: string, values: string[]) {
  window.localStorage.setItem(key, JSON.stringify(values));
  window.dispatchEvent(new CustomEvent("cambridge:saved-items"));
}

function toggle(key: string, id: string, defaults: string[] = []): string[] {
  const current = read(key, defaults);
  const next = current.includes(id) ? current.filter(value => value !== id) : [...current, id];
  write(key, next);
  return next;
}

export const getFavoriteMemberIds = () => read(MEMBER_KEY);
export const toggleFavoriteMember = (id: string) => toggle(MEMBER_KEY, id);
export const getSavedMaterialIds = () => read(MATERIAL_KEY, ["mat001-iwd", "mat003-iwd"]);
export const toggleSavedMaterial = (id: string) => toggle(MATERIAL_KEY, id, ["mat001-iwd", "mat003-iwd"]);
export const getSavedExchangePostIds = () => read(EXCHANGE_KEY, ["exchange-expert-evidence-roundup"]);
export const toggleSavedExchangePost = (id: string) => toggle(EXCHANGE_KEY, id, ["exchange-expert-evidence-roundup"]);

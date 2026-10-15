"use client";

import { FORUMS, getForumsForMember, type Forum, type Member } from "./data";
import { getAllResolvedMembers, saveProfile } from "./store";

export type RsvpStatus = "pending" | "attending" | "maybe" | "declined";
export type DirectoryScope = "network" | "all";

export type ForumParticipation = {
  status: RsvpStatus;
  comment: string;
  fee: string | null;
  canAccessResources: boolean;
};

type SavedRsvp = Pick<ForumParticipation, "status" | "comment">;

const RSVP_KEY = "cf_rsvps";

function loadRsvps(): Record<string, SavedRsvp> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(RSVP_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function initialStatus(forum: Forum, memberId: string): RsvpStatus {
  if (forum.status === "past") return "attending";
  const participantIndex = forum.participants.indexOf(memberId);
  return (["attending", "pending", "attending", "maybe"] as RsvpStatus[])[participantIndex] ?? "pending";
}

export function getForumParticipation(forum: Forum, memberId: string): ForumParticipation {
  const saved = loadRsvps()[`${forum.id}:${memberId}`];
  const status = saved?.status ?? initialStatus(forum, memberId);

  return {
    status,
    comment: saved?.comment ?? "",
    fee: forum.memberFees[memberId] ?? null,
    canAccessResources: forum.status === "past" || status === "attending",
  };
}

export async function submitRsvp(
  forumId: string,
  memberId: string,
  status: RsvpStatus,
  comment: string,
): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 450));
  const saved = loadRsvps();
  saved[`${forumId}:${memberId}`] = { status, comment: comment.trim() };
  localStorage.setItem(RSVP_KEY, JSON.stringify(saved));
}

export async function submitProfileUpdate(memberId: string, updates: Partial<Member>): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 550));
  saveProfile(memberId, updates);
}

export function getDirectoryMembers(
  currentMemberId: string,
  scope: DirectoryScope,
  forumId = "",
): Member[] {
  const allMembers = getAllResolvedMembers();
  const sharedForumIds = new Set(getForumsForMember(currentMemberId).map(forum => forum.id));
  const networkIds = new Set(
    FORUMS.filter(forum => sharedForumIds.has(forum.id)).flatMap(forum => forum.participants),
  );

  let visible = scope === "network"
    ? allMembers.filter(member => networkIds.has(member.id))
    : allMembers.filter(member => member.discoverable || member.id === currentMemberId);

  if (forumId) {
    const participantIds = new Set(FORUMS.find(forum => forum.id === forumId)?.participants ?? []);
    visible = visible.filter(member => participantIds.has(member.id));
  }

  return visible.sort((a, b) => a.name.localeCompare(b.name));
}

export function getDirectoryForums(memberId: string): Forum[] {
  return getForumsForMember(memberId).sort((a, b) => b.date.localeCompare(a.date));
}

export function formatForumDate(date: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${date}T12:00:00`));
}

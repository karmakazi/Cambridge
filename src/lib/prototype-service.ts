"use client";

import {
  FORUMS,
  FORUM_EDITION_HISTORY,
  getForumEditionSummary,
  getForumsForMember,
  type Forum,
  type Material,
  type Member,
} from "./data";
import { getAllResolvedMembers, saveProfile } from "./store";

export type RsvpStatus = "pending" | "attending" | "maybe" | "declined";
export type DirectoryScope = "network" | "all";

export type ForumParticipation = {
  status: RsvpStatus;
  comment: string;
  fee: string | null;
  canAccessResources: boolean;
};

export type TravelDetails = {
  arrivalDetails: string;
  arrivalDateTime: string;
  departureDetails: string;
  departureDateTime: string;
};

type SavedRsvp = Pick<ForumParticipation, "status" | "comment">;

const RSVP_KEY = "cf_rsvps";
const MATERIAL_VIEWS_KEY = "cf_material_views";
const SC_NOTES_KEY = "cf_sc_notes";
const TRAVEL_DETAILS_KEY = "cf_travel_details";

type MaterialViewState = Record<string, number>;

export type SteeringCommitteeNote = {
  id: string;
  forumId: string;
  authorId: string;
  text: string;
  createdAt: string;
};

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

export function getTravelDetails(forumId: string, memberId: string): TravelDetails {
  const empty: TravelDetails = {
    arrivalDetails: "",
    arrivalDateTime: "",
    departureDetails: "",
    departureDateTime: "",
  };
  if (typeof window === "undefined") return empty;
  try {
    const saved = JSON.parse(localStorage.getItem(TRAVEL_DETAILS_KEY) ?? "{}") as Record<string, TravelDetails>;
    return saved[`${forumId}:${memberId}`] ?? empty;
  } catch {
    return empty;
  }
}

export async function submitTravelDetails(forumId: string, memberId: string, details: TravelDetails): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 450));
  let saved: Record<string, TravelDetails> = {};
  if (typeof window !== "undefined") {
    try {
      saved = JSON.parse(localStorage.getItem(TRAVEL_DETAILS_KEY) ?? "{}") as Record<string, TravelDetails>;
    } catch {
      saved = {};
    }
  }
  saved[`${forumId}:${memberId}`] = details;
  localStorage.setItem(TRAVEL_DETAILS_KEY, JSON.stringify(saved));
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
  const allMembers = getAllResolvedMembers().filter(member => !member.isCambridgeStaff);
  const currentMember = allMembers.find(member => member.id === currentMemberId);
  const currentProgramIds = new Set(
    (currentMember?.forumsAttended ?? [])
      .map(id => getForumEditionSummary(id)?.programId)
      .filter((id): id is string => Boolean(id)),
  );
  const selectedProgramId = forumId
    ? getForumEditionSummary(forumId)?.programId ?? FORUMS.find(forum => forum.id === forumId)?.programId
    : "";

  const networkIds = new Set(
    allMembers
      .filter(member => member.forumsAttended.some(id => {
        const programId = getForumEditionSummary(id)?.programId;
        return programId ? currentProgramIds.has(programId) : false;
      }))
      .map(member => member.id),
  );

  let visible = scope === "network"
    ? allMembers.filter(member => networkIds.has(member.id))
    : allMembers.filter(member => member.discoverable || member.id === currentMemberId);

  if (selectedProgramId) {
    visible = visible.filter(member => member.forumsAttended.some(id => (
      getForumEditionSummary(id)?.programId === selectedProgramId
    )));
  }

  return visible.sort((a, b) => a.name.localeCompare(b.name));
}

export function getDirectoryForums(memberId: string): Forum[] {
  const seenPrograms = new Set<string>();
  return getForumsForMember(memberId)
    .sort((a, b) => b.startDate.localeCompare(a.startDate))
    .filter(forum => {
      if (seenPrograms.has(forum.programId)) return false;
      seenPrograms.add(forum.programId);
      return true;
    });
}

function formatDate(date: string, includeYear = true): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    ...(includeYear ? { year: "numeric" } : {}),
  }).format(new Date(`${date}T12:00:00`));
}

export function formatForumDateRange(forum: Forum): string {
  if (forum.startDate === forum.endDate) return formatDate(forum.startDate);
  const startYear = forum.startDate.slice(0, 4);
  const endYear = forum.endDate.slice(0, 4);
  return `${formatDate(forum.startDate, startYear !== endYear)} – ${formatDate(forum.endDate)}`;
}

function loadMaterialViews(): MaterialViewState {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(MATERIAL_VIEWS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function materialViewKey(memberId: string, material: Material): string {
  return `${memberId}:${material.id}`;
}

export function isMaterialUnseen(memberId: string, material: Material): boolean {
  return (loadMaterialViews()[materialViewKey(memberId, material)] ?? 0) < material.revision;
}

export function getUnseenMaterialCount(memberId: string, forum: Forum): number {
  return forum.materials.filter(material => isMaterialUnseen(memberId, material)).length;
}

export function markMaterialSeen(memberId: string, material: Material): void {
  if (typeof window === "undefined") return;
  const views = loadMaterialViews();
  views[materialViewKey(memberId, material)] = material.revision;
  localStorage.setItem(MATERIAL_VIEWS_KEY, JSON.stringify(views));
}

export function getMemberTenure(member: Member): { count: number; firstYear: number | null } {
  const years = member.forumsAttended
    .map(id => getForumEditionSummary(id)?.year)
    .filter((year): year is number => typeof year === "number");
  return {
    count: years.length,
    firstYear: years.length ? Math.min(...years) : null,
  };
}

function compactUtc(date: string, time: string): string {
  return `${date.replaceAll("-", "")}T${time.replace(":", "")}00`;
}

export function getGoogleCalendarUrl(forum: Forum): string {
  const query = new URLSearchParams({
    action: "TEMPLATE",
    text: forum.title,
    dates: `${compactUtc(forum.startDate, forum.startTime)}/${compactUtc(forum.endDate, forum.endTime)}`,
    details: `Cambridge Forums ${forum.editionYear} edition`,
    location: `${forum.logistics.hotel}, ${forum.logistics.hotelAddress}`,
    ctz: forum.timeZone,
  });
  return `https://calendar.google.com/calendar/render?${query.toString()}`;
}

export function getCalendarFileUrl(forum: Forum): string {
  const body = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Cambridge Forums//Member Platform Prototype//EN",
    "BEGIN:VEVENT",
    `UID:${forum.id}@cambridgeforums.com`,
    `DTSTART;TZID=${forum.timeZone}:${compactUtc(forum.startDate, forum.startTime)}`,
    `DTEND;TZID=${forum.timeZone}:${compactUtc(forum.endDate, forum.endTime)}`,
    `SUMMARY:${forum.title}`,
    `LOCATION:${forum.logistics.hotel}\\, ${forum.logistics.hotelAddress}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(body)}`;
}

export function getSteeringCommitteeNotes(forumId: string): SteeringCommitteeNote[] {
  if (typeof window === "undefined") return [];
  try {
    const notes = JSON.parse(localStorage.getItem(SC_NOTES_KEY) ?? "[]") as SteeringCommitteeNote[];
    return notes.filter(note => note.forumId === forumId);
  } catch {
    return [];
  }
}

export function addSteeringCommitteeNote(forumId: string, authorId: string, text: string): SteeringCommitteeNote {
  const note = { id: crypto.randomUUID(), forumId, authorId, text: text.trim(), createdAt: new Date().toISOString() };
  const existing = typeof window === "undefined" ? [] : JSON.parse(localStorage.getItem(SC_NOTES_KEY) ?? "[]");
  localStorage.setItem(SC_NOTES_KEY, JSON.stringify([note, ...existing]));
  return note;
}

export function getForumHistory(member: Member) {
  return member.forumsAttended
    .map(id => FORUM_EDITION_HISTORY.find(edition => edition.id === id))
    .filter((edition): edition is NonNullable<typeof edition> => Boolean(edition))
    .sort((a, b) => b.year - a.year);
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import { getAuth } from "@/lib/auth";
import { getForumDirectorByEmail, getForumsForMember, type AgendaItem, type Forum, type Material, type Member } from "@/lib/data";
import { getResolvedMember } from "@/lib/store";
import {
  addSteeringCommitteeNote,
  formatForumDateRange,
  getCalendarFileUrl,
  getForumParticipation,
  getSteeringCommitteeNotes,
  getUnseenMaterialCount,
  isMaterialUnseen,
  markMaterialSeen,
  submitRsvp,
  type ForumParticipation,
  type RsvpStatus,
  type SteeringCommitteeNote,
} from "@/lib/prototype-service";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Calendar, CalendarPlus, CheckCircle2, ChevronDown, ChevronRight, CircleHelp, Download,
  ExternalLink, Eye, FileText, Loader2, Mail, MapPin, MessageSquare, Send, UserRound, Users, XCircle,
} from "lucide-react";

const RSVP_OPTIONS: Array<{ value: RsvpStatus; label: string }> = [
  { value: "attending", label: "Attending" },
  { value: "maybe", label: "Maybe" },
  { value: "declined", label: "Unable to attend" },
];

const RSVP_LABELS: Record<RsvpStatus, string> = {
  pending: "Response requested",
  attending: "Attending",
  maybe: "Maybe",
  declined: "Not attending",
};

function ForumCard({ forum, member }: { forum: Forum; member: Member }) {
  const memberId = member.id;
  const [open, setOpen] = useState(false);
  const [participation, setParticipation] = useState<ForumParticipation>(() => getForumParticipation(forum, memberId));
  const [selectedStatus, setSelectedStatus] = useState<RsvpStatus>(participation.status);
  const [comment, setComment] = useState(participation.comment);
  const [saving, setSaving] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [unseenCount, setUnseenCount] = useState(() => getUnseenMaterialCount(memberId, forum));
  const isUpcoming = forum.status === "upcoming";
  const director = getForumDirectorByEmail(forum.logistics.contactEmail);

  async function handleRsvp() {
    setSaving(true);
    setConfirmation("");
    await submitRsvp(forum.id, memberId, selectedStatus, comment);
    setParticipation(getForumParticipation(forum, memberId));
    setSaving(false);
    setConfirmation("Response saved. Your Cambridge coordinator has been notified.");
  }

  return (
    <div className="bg-white rounded-lg border border-border overflow-hidden">
      <div className="px-4 sm:px-6 py-4 flex items-start justify-between gap-3 hover:bg-muted/30 transition-colors">
        <div className="min-w-0 flex-1">
          <button type="button" className="block w-full text-left" onClick={() => setOpen(value => !value)} aria-expanded={open}>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="label-caps text-gold">{forum.area}</span>
              <Badge className={isUpcoming
                ? "bg-[#1e2b45] text-cream text-[10px] h-4 px-1.5 rounded"
                : "bg-muted text-muted-foreground text-[10px] h-4 px-1.5 rounded"
              }>
                {isUpcoming ? "Upcoming" : "Past"}
              </Badge>
              {isUpcoming && (
                <Badge className="bg-[#c8975e]/10 text-[#9a6a33] text-[10px] h-4 px-1.5 rounded border-0">
                  {RSVP_LABELS[participation.status]}
                </Badge>
              )}
              {unseenCount > 0 && participation.canAccessResources && (
                <Badge className="bg-[#9a6a33] text-white text-[10px] h-4 px-1.5 rounded border-0">
                  {unseenCount} new {unseenCount === 1 ? "document" : "documents"}
                </Badge>
              )}
            </div>
            <h3 className="font-garamond text-lg font-medium text-foreground leading-tight">{forum.title}</h3>
          </button>
          <div className="flex items-center gap-x-4 gap-y-1 mt-1.5 text-muted-foreground text-xs flex-wrap">
            <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{formatForumDateRange(forum)} · {forum.startTime}–{forum.endTime}</span>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(forum.logistics.hotelAddress)}`}
              target="_blank"
              rel="noreferrer"
              title={`Open ${forum.logistics.hotel} in Google Maps`}
              aria-label={`Open ${forum.logistics.hotel} in Google Maps`}
              className="flex items-center gap-1 hover:text-[#9a6a33] hover:underline transition-colors"
            >
              <MapPin className="w-3.5 h-3.5" />{forum.logistics.hotel} · {forum.location}
            </a>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Forum Director:{" "}
            {director ? (
              <Link href={`/directors/${director.id}`} className="font-medium text-[#76502a] hover:underline">{director.name}</Link>
            ) : (
              <a href={`mailto:${forum.logistics.contactEmail}`} className="font-medium text-[#76502a] hover:underline">{forum.logistics.contactName}</a>
            )}
          </p>
          {isUpcoming && (
            <a
              href={getCalendarFileUrl(forum)}
              download={`${forum.title}-${forum.editionYear}.ics`}
              className="mt-2 h-8 w-fit px-3 rounded-md border border-[#1e2b45]/20 bg-white text-xs font-medium text-[#1e2b45] inline-flex items-center gap-1.5 hover:bg-[#1e2b45]/5"
            >
              <Download className="w-3.5 h-3.5" />Download Calendar
            </a>
          )}
        </div>
        <button
          type="button"
          onClick={() => setOpen(value => !value)}
          aria-expanded={open}
          aria-label={`${open ? "Collapse" : "Expand"} ${forum.title}`}
          className="p-1 -mr-1 rounded hover:bg-muted"
        >
          <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${open ? "rotate-90" : ""}`} />
        </button>
      </div>

      {open && (
        <div className="border-t border-border">
          {isUpcoming && (
            <div className="px-4 sm:px-6 py-5 bg-[#1e2b45]/[0.025] border-b border-border">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <p className="label-caps text-muted-foreground mb-1">Your response</p>
                  <div className="flex gap-2 flex-wrap">
                    {RSVP_OPTIONS.map(option => (
                      <button
                        type="button"
                        key={option.value}
                        onClick={() => { setSelectedStatus(option.value); setConfirmation(""); }}
                        className={`h-8 px-3 rounded-md border text-xs font-medium transition-colors ${
                          selectedStatus === option.value
                            ? "border-[#c8975e] bg-[#c8975e]/10 text-[#76502a]"
                            : "border-border bg-white text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
                {participation.fee && (
                  <div className="sm:text-right flex-shrink-0">
                    <p className="label-caps text-muted-foreground">Your forum fee</p>
                    <p className="font-garamond text-lg font-medium">{participation.fee}</p>
                    <a href={forum.factSheetUrl} download className="text-xs text-[#9a6a33] hover:underline">View what&apos;s included</a>
                  </div>
                )}
              </div>
              <div className="mt-3 flex flex-col sm:flex-row gap-2">
                <textarea
                  value={comment}
                  onChange={event => setComment(event.target.value)}
                  rows={2}
                  placeholder="Add dietary, accessibility, or travel notes (optional)"
                  className="min-w-0 w-full flex-1 text-sm rounded-md border border-input bg-white px-3 py-2 placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
                />
                <button
                  type="button"
                  onClick={handleRsvp}
                  disabled={saving}
                  className="h-9 sm:self-end px-4 rounded-md border border-[#1e2b45]/20 bg-white text-[#1e2b45] text-sm font-medium hover:bg-[#1e2b45]/5 disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}Save response
                </button>
              </div>
              {confirmation && (
                <p className="mt-2 text-xs text-green-700 flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" />{confirmation}</p>
              )}
            </div>
          )}

          {participation.canAccessResources ? (
            <ForumDetail
              forum={forum}
              member={member}
              unseenCount={unseenCount}
              onMaterialSeen={() => setUnseenCount(count => Math.max(0, count - 1))}
            />
          ) : (
            <div className="px-6 py-7 text-center">
              {participation.status === "declined"
                ? <XCircle className="w-6 h-6 mx-auto mb-2 text-muted-foreground/60" />
                : <CircleHelp className="w-6 h-6 mx-auto mb-2 text-muted-foreground/60" />}
              <p className="text-sm font-medium">Forum details become available when attendance is confirmed.</p>
              <p className="text-xs text-muted-foreground mt-1">Choose “Attending” above to preview the member experience.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

type ForumTab = "agenda" | "materials" | "participants" | "logistics" | "steering";

function ForumDetail({
  forum,
  member,
  unseenCount,
  onMaterialSeen,
}: {
  forum: Forum;
  member: Member;
  unseenCount: number;
  onMaterialSeen: () => void;
}) {
  const [tab, setTab] = useState<ForumTab>("agenda");
  const director = getForumDirectorByEmail(forum.logistics.contactEmail);
  const tabs = [
    { id: "agenda" as const, label: "Agenda", show: forum.agenda.length > 0 },
    { id: "materials" as const, label: unseenCount ? `Materials (${unseenCount})` : "Materials", show: forum.materials.length > 0 },
    { id: "participants" as const, label: "Participants", show: true },
    { id: "logistics" as const, label: "Logistics", show: true },
    { id: "steering" as const, label: "SC Workspace", show: member.steeringCommitteeForums.includes(forum.id) && forum.status === "upcoming" },
  ].filter(item => item.show);

  return (
    <div>
      <div className="mx-4 sm:mx-6 mt-5 rounded-lg border border-[#c8975e]/30 bg-[#c8975e]/[0.06] p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 min-w-0">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-[#1e2b45] text-cream flex items-center justify-center flex-shrink-0"><UserRound className="w-4 h-4" /></div>
          <div className="min-w-0">
            <p className="label-caps text-[#9a6a33]">Your Forum Director</p>
            {director ? (
              <Link href={`/directors/${director.id}`} className="text-sm font-medium hover:text-[#9a6a33] hover:underline">{director.name}</Link>
            ) : (
              <p className="text-sm font-medium">{forum.logistics.contactName}</p>
            )}
            <p className="text-xs text-muted-foreground">Questions about attendance, travel, or materials</p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap min-w-0">
          {director && <Link href={`/directors/${director.id}`} className="h-8 px-3 rounded-md border border-[#1e2b45]/20 bg-white text-xs font-medium text-[#1e2b45] inline-flex items-center gap-1.5 hover:bg-[#1e2b45]/5"><UserRound className="w-3.5 h-3.5" />View profile</Link>}
          <a href={`mailto:${forum.logistics.contactEmail}`} className="h-8 px-3 rounded-md border border-[#1e2b45]/20 bg-white text-xs font-medium text-[#1e2b45] inline-flex items-center gap-1.5 hover:bg-[#1e2b45]/5"><Mail className="w-3.5 h-3.5" />Email</a>
          <a
            href={`mailto:${forum.logistics.contactEmail}?subject=${encodeURIComponent(`Meeting request: ${forum.title}`)}&body=${encodeURIComponent(`Hello ${forum.logistics.contactName},\n\nI would like to arrange a meeting regarding ${forum.title}.\n\nThank you.`)}`}
            title="Email the Forum Director to request a meeting"
            className="h-8 px-3 rounded-md border border-[#1e2b45]/20 bg-white text-xs font-medium text-[#1e2b45] inline-flex items-center gap-1.5 hover:bg-[#1e2b45]/5"
          ><CalendarPlus className="w-3.5 h-3.5" />Request a meeting</a>
        </div>
      </div>
      <div className="flex max-w-full border-b border-border px-4 sm:px-6 overflow-x-auto overscroll-x-contain">
        {tabs.map(item => (
          <button
            type="button"
            key={item.id}
            onClick={() => setTab(item.id)}
            className={`py-3 mr-5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
              tab === item.id ? "border-[#c8975e] text-[#1e2b45]" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >{item.label}</button>
        ))}
      </div>

      <div className="px-4 sm:px-6 py-5 min-w-0">
        {tab === "agenda" && (
          <div className="space-y-3">
            {forum.agenda.map((item, index) => (
              <div key={`${item.time}-${index}`} className="border-b border-border last:border-0 pb-3 last:pb-0">
                <div className="hidden sm:flex gap-4">
                  <span className="text-xs text-muted-foreground font-mono w-12 flex-shrink-0 pt-0.5">{item.time}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">{item.title}</p>
                    {item.description && <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>}
                    <AgendaLinks item={item} />
                  </div>
                </div>
                <details className="sm:hidden group">
                  <summary className="list-none flex items-start gap-3 cursor-pointer">
                    <span className="text-[11px] text-muted-foreground font-mono w-11 flex-shrink-0 pt-0.5">{item.time}</span>
                    <span className="text-sm font-medium flex-1">{item.title}</span>
                    <ChevronDown className="w-4 h-4 text-muted-foreground transition-transform group-open:rotate-180" />
                  </summary>
                  <div className="pl-14 pr-5 pt-2">
                    {item.description && <p className="text-xs text-muted-foreground">{item.description}</p>}
                    <AgendaLinks item={item} />
                  </div>
                </details>
              </div>
            ))}
          </div>
        )}

        {tab === "materials" && (
          <div>
            <div className="flex justify-end mb-2">
              <a href={forum.materialsBundleUrl} download className="inline-flex items-center gap-1.5 text-xs text-[#1e2b45] font-medium hover:text-[#9a6a33]">
                <Download className="w-3.5 h-3.5" />Download all
              </a>
            </div>
            <MaterialGroup title="Required pre-reading" description="Please review these items before the Forum." materials={forum.materials.filter(material => material.category === "required")} memberId={member.id} onMaterialSeen={onMaterialSeen} required />
            <MaterialGroup title="Supplementary materials" description="Optional background and reference material." materials={forum.materials.filter(material => material.category === "supplementary")} memberId={member.id} onMaterialSeen={onMaterialSeen} />
          </div>
        )}

        {tab === "participants" && <ParticipantList participantIds={forum.participants} />}

        {tab === "steering" && <SteeringCommitteeWorkspace forum={forum} member={member} />}

        {tab === "logistics" && (
          <div className="space-y-3 text-sm">
            <div>
              <p className="label-caps text-muted-foreground mb-1">Venue</p>
              <p className="font-medium">{forum.logistics.hotel}</p>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(forum.logistics.hotelAddress)}`}
                target="_blank"
                rel="noreferrer"
                className="block text-xs text-muted-foreground hover:text-foreground"
              >{forum.logistics.hotelAddress}</a>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(forum.logistics.hotelAddress)}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 mt-1 text-xs font-medium text-[#9a6a33] hover:underline"
              >Open in Google Maps<ExternalLink className="w-3 h-3" /></a>
            </div>
            <Separator />
            <div><p className="label-caps text-muted-foreground mb-1">Dress Code</p><p>{forum.logistics.dressCode}</p></div>
            <Separator />
            <div>
              <p className="label-caps text-muted-foreground mb-1">Your Cambridge Contact</p>
              <p className="font-medium">{forum.logistics.contactName}</p>
              <a href={`mailto:${forum.logistics.contactEmail}`} className="block text-xs text-[#9a6a33] hover:underline">{forum.logistics.contactEmail}</a>
              <a href={`tel:${forum.logistics.contactPhone}`} className="text-xs text-muted-foreground hover:text-foreground">{forum.logistics.contactPhone}</a>
            </div>
            {forum.logistics.notes && (<><Separator /><div><p className="label-caps text-muted-foreground mb-1">Notes</p><p className="text-muted-foreground text-xs leading-relaxed">{forum.logistics.notes}</p></div></>)}
            <a href={forum.websiteUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-[#9a6a33] hover:underline">
              Visit forum website<ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

function AgendaLinks({ item }: { item: AgendaItem }) {
  return (
    <>
      {item.speaker && (item.speakerMemberId ? (
        <Link href={`/directory/${item.speakerMemberId}`} className="inline-flex items-center gap-1 text-xs text-[#9a6a33] mt-1 hover:underline">
          {item.speaker}<ChevronRight className="w-3 h-3" />
        </Link>
      ) : <p className="text-xs text-[#9a6a33] mt-1">{item.speaker}</p>)}
      {item.venueAddress && (
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.venueAddress)}`}
          target="_blank"
          rel="noreferrer"
          className="flex items-start gap-1.5 mt-1 text-xs text-[#9a6a33] hover:underline"
        >
          <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
          <span>{item.venueName} · {item.venueAddress}</span>
        </a>
      )}
    </>
  );
}

function MaterialGroup({
  title,
  description,
  materials,
  memberId,
  onMaterialSeen,
  required = false,
}: {
  title: string;
  description: string;
  materials: Material[];
  memberId: string;
  onMaterialSeen: () => void;
  required?: boolean;
}) {
  const [seenInSession, setSeenInSession] = useState<Set<string>>(() => new Set());
  if (!materials.length) return null;
  return (
    <section className={`mb-5 last:mb-0 rounded-lg ${required ? "border border-[#c8975e]/35 bg-[#c8975e]/[0.055]" : "border border-border"}`}>
      <div className="px-4 py-3 border-b border-inherit">
        <div className="flex items-center gap-2">
          <FileText className={`w-4 h-4 ${required ? "text-[#9a6a33]" : "text-muted-foreground"}`} />
          <h3 className="font-garamond text-base font-medium">{title}</h3>
          {required && <Badge className="bg-[#9a6a33] text-white border-0 text-[9px] h-4">Required</Badge>}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 ml-6">{description}</p>
      </div>
      <div className="px-4">
        {materials.map(material => {
          const unseen = !seenInSession.has(material.id) && isMaterialUnseen(memberId, material);
          return (
            <div key={material.id} className="flex items-center justify-between gap-4 py-3 border-b border-border last:border-0">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm text-foreground">{material.title}</p>
                  {unseen && <Badge className="bg-[#1e2b45] text-cream border-0 text-[9px] h-4">{material.revision > 1 ? "Updated" : "New"}</Badge>}
                </div>
                <p className="text-xs text-muted-foreground capitalize">{material.type} · {material.size} · Added {new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" }).format(new Date(`${material.publishedAt}T12:00:00`))}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (unseen) {
                    markMaterialSeen(memberId, material);
                    setSeenInSession(current => new Set(current).add(material.id));
                    onMaterialSeen();
                  }
                  window.open(material.url, "_blank", "noopener,noreferrer");
                }}
                className="flex items-center gap-1.5 text-xs text-[#1e2b45] hover:text-[#9a6a33] font-medium transition-colors flex-shrink-0"
              >
                {unseen ? <Eye className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}{unseen ? "Open" : "Download"}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function SteeringCommitteeWorkspace({ forum, member }: { forum: Forum; member: Member }) {
  const [notes, setNotes] = useState<SteeringCommitteeNote[]>(() => getSteeringCommitteeNotes(forum.id));
  const [draft, setDraft] = useState("");

  function postNote() {
    if (!draft.trim()) return;
    const note = addSteeringCommitteeNote(forum.id, member.id, draft);
    setNotes(current => [note, ...current]);
    setDraft("");
  }

  return (
    <div>
      <div className="rounded-lg bg-[#1e2b45] text-cream p-4 mb-4">
        <div className="flex items-center gap-2"><MessageSquare className="w-4 h-4 text-[#d4aa7a]" /><p className="text-sm font-medium">Private Steering Committee workspace</p></div>
        <p className="text-xs text-cream/65 mt-1">A lightweight concept for sharing session ideas, candidate notes, and working documents between meetings.</p>
      </div>
      <div className="flex gap-2 mb-4">
        <textarea value={draft} onChange={event => setDraft(event.target.value)} rows={2} placeholder="Suggest a session idea or leave a note for the committee…" className="min-w-0 w-full flex-1 text-sm rounded-md border border-input bg-white px-3 py-2 placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none" />
        <button type="button" onClick={postNote} disabled={!draft.trim()} className="self-end h-9 px-3 rounded-md bg-[#1e2b45] text-cream text-xs font-medium disabled:opacity-50 inline-flex items-center gap-1.5"><Send className="w-3.5 h-3.5" />Post</button>
      </div>
      <div className="rounded-lg border border-border p-3 mb-3 flex items-center justify-between gap-3">
        <div><p className="text-sm font-medium">Draft 2026 discussion themes</p><p className="text-xs text-muted-foreground">Working document · Updated 14 October</p></div>
        <a href="/materials/prototype-resource.txt" download className="text-xs font-medium text-[#9a6a33] inline-flex items-center gap-1"><Download className="w-3.5 h-3.5" />Download</a>
      </div>
      {notes.length ? notes.map(note => (
        <div key={note.id} className="border-b border-border py-3 last:border-0">
          <p className="text-sm">{note.text}</p>
          <p className="text-[10px] text-muted-foreground mt-1">{member.name} · just now</p>
        </div>
      )) : <p className="text-xs text-muted-foreground text-center py-5">No committee notes yet. Add the first idea above.</p>}
    </div>
  );
}

function ParticipantList({ participantIds }: { participantIds: string[] }) {
  const participants = participantIds.map(id => getResolvedMember(id)).filter(Boolean) as Member[];
  return (
    <div className="space-y-2">
      {participants.map(participant => (
        <Link key={participant.id} href={`/directory/${participant.id}`} className="flex items-center gap-3 py-2 hover:bg-muted/40 rounded px-2 -mx-2 transition-colors group">
          <div className="w-7 h-7 rounded-full bg-[#1e2b45]/10 flex items-center justify-center flex-shrink-0">
            <span className="text-[10px] font-semibold text-[#1e2b45]">{participant.avatar}</span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground group-hover:text-[#9a6a33] transition-colors">{participant.name}</p>
            <p className="text-xs text-muted-foreground truncate">{participant.title} · {participant.organization}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [member, setMember] = useState<Member | null>(null);
  const [forums, setForums] = useState<Forum[]>([]);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      const auth = getAuth();
      if (!auth) { router.replace("/"); return; }
      const resolvedMember = getResolvedMember(auth.memberId);
      if (!resolvedMember) { router.replace("/"); return; }
      setMember(resolvedMember);
      setForums(getForumsForMember(auth.memberId));
    });
    return () => { cancelled = true; };
  }, [router]);

  if (!member) return null;
  const upcoming = forums.filter(forum => forum.status === "upcoming");
  const past = forums.filter(forum => forum.status === "past");

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <div className="mb-8">
          <p className="label-caps text-[#c8975e] mb-1">My Forums</p>
          <h1 className="font-garamond text-3xl font-medium text-foreground">Good to see you, {member.name.split(" ")[0]}.</h1>
          <p className="text-muted-foreground text-sm mt-1">Respond to invitations and find everything Cambridge has shared with you.</p>
        </div>

        {upcoming.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <h2 className="font-garamond text-xl font-medium">Upcoming Forums</h2>
              <span className="bg-[#1e2b45] text-cream text-[10px] px-1.5 py-0.5 rounded font-medium">{upcoming.length}</span>
            </div>
            <div className="space-y-3">{upcoming.map(forum => <ForumCard key={forum.id} forum={forum} member={member} />)}</div>
          </section>
        )}

        {past.length > 0 && (
          <section>
            <h2 className="font-garamond text-xl font-medium mb-3">Past Forums</h2>
            <div className="space-y-3">{past.map(forum => <ForumCard key={forum.id} forum={forum} member={member} />)}</div>
          </section>
        )}

        {forums.length === 0 && (
          <div className="text-center py-16 text-muted-foreground"><Users className="w-8 h-8 mx-auto mb-3 opacity-30" /><p className="text-sm">No forums on record for your account.</p></div>
        )}
      </div>
    </AppShell>
  );
}

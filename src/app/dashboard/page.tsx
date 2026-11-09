"use client";

import { useEffect, useState, type ReactNode } from "react";
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
  getMemberAnniversaryMilestone,
  getMemberTenure,
  getSteeringCommitteeNotes,
  getTravelDetails,
  getUnseenMaterialCount,
  isMaterialUnseen,
  markMaterialSeen,
  submitRsvp,
  submitTravelDetails,
  type ForumParticipation,
  type RsvpStatus,
  type SteeringCommitteeNote,
  type TravelDetails,
} from "@/lib/prototype-service";
import { Badge } from "@/components/ui/badge";
import { getSavedMaterialIds, toggleSavedMaterial } from "@/lib/saved-items";
import {
  Award, BedDouble, Bookmark, Calendar, CalendarPlus, CheckCircle2, ChevronDown, ChevronRight, CircleHelp, Download,
  ExternalLink, Eye, FileText, Globe, Loader2, Mail, MapPin, Megaphone, MessageSquare, Phone, Plane, Printer, Search, Send, ShieldCheck, UserRound, Users, X, XCircle,
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
  declined: "Unable to attend",
};

// Keep the prototype implementation available for a later review round without
// exposing the Steering Committee workspace in the current client build.
const SHOW_STEERING_COMMITTEE_WORKSPACE = false;

const DOWNLOAD_BUTTON_CLASS = "inline-flex h-9 items-center gap-1.5 rounded-md border border-[#253855]/20 bg-white px-3 text-xs font-medium text-[#253855] hover:border-[#253855]/35 hover:bg-[#253855]/5";

function forumDisplayTitle(title: string): string {
  return title.replace(/^Cambridge Forum on /, "");
}

function ForumCard({ forum, member, defaultOpen = false }: { forum: Forum; member: Member; defaultOpen?: boolean }) {
  const memberId = member.id;
  const [open, setOpen] = useState(defaultOpen);
  const [participation, setParticipation] = useState<ForumParticipation>(() => getForumParticipation(forum, memberId));
  const [selectedStatus, setSelectedStatus] = useState<RsvpStatus>(participation.status);
  const [comment, setComment] = useState(participation.comment);
  const [saving, setSaving] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [unseenCount, setUnseenCount] = useState(() => getUnseenMaterialCount(memberId, forum));
  const [dismissedNotices, setDismissedNotices] = useState<string[]>([]);
  const isUpcoming = forum.status === "upcoming";
  const activeNotices = (forum.notices ?? []).filter(notice => !dismissedNotices.includes(notice.id));

  useEffect(() => {
    if (window.location.hash === `#forum-${forum.id}`) {
      queueMicrotask(() => setOpen(true));
      requestAnimationFrame(() => document.getElementById(`forum-${forum.id}`)?.scrollIntoView({ behavior: "smooth", block: "start" }));
    }
  }, [forum.id]);

  async function handleRsvp() {
    setSaving(true);
    setConfirmation("");
    await submitRsvp(forum.id, memberId, selectedStatus, comment);
    setParticipation(getForumParticipation(forum, memberId));
    setSaving(false);
    setConfirmation("Your interest has been noted and you will hear back from your Cambridge coordinator within 48 hours.");
  }

  return (
    <div id={`forum-${forum.id}`} className="scroll-mt-5 bg-white rounded-lg border border-border overflow-hidden">
      <button type="button" className="group block w-full px-4 py-7 text-left transition-colors hover:bg-muted/30 sm:px-7 sm:py-8" onClick={() => setOpen(value => !value)} aria-expanded={open}>
        <span className="flex items-start justify-between gap-4">
          <span className="min-w-0 flex-1">
            <span className="font-garamond text-xl sm:text-2xl font-medium text-[#253855] leading-tight underline decoration-transparent underline-offset-4 group-hover:decoration-[#B17E6B]">{forumDisplayTitle(forum.title)}</span>
            <span className="mt-3 flex items-center gap-x-6 gap-y-2 text-muted-foreground text-sm flex-wrap">
              <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" />{formatForumDateRange(forum)}</span>
              <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" />{forum.logistics.hotel} · {forum.location}</span>
            </span>
            <span className="mt-5 flex flex-wrap items-center gap-4 text-xs">
              {isUpcoming && <span className="font-medium text-[#253855]">Your response: {RSVP_LABELS[participation.status]}</span>}
              {activeNotices.length > 0 && <span className="inline-flex items-center gap-1 font-medium text-[#8A5E50]"><Megaphone className="w-3.5 h-3.5" />Event update</span>}
            </span>
          </span>
          <span className="flex-shrink-0 rounded-full border border-border p-2 group-hover:border-[#B17E6B]/50">
            <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${open ? "rotate-90" : ""}`} />
          </span>
        </span>
      </button>

      {open && (
        <div className="border-t border-border">
          {activeNotices.map(notice => (
            <div key={notice.id} className="mx-4 sm:mx-6 mt-5 rounded-lg border border-[#B17E6B]/35 bg-[#B17E6B]/[0.08] px-4 py-3 flex items-start gap-3" role="status">
              <div className="w-8 h-8 rounded-full bg-[#B17E6B]/15 text-[#8A5E50] flex items-center justify-center flex-shrink-0"><Megaphone className="w-4 h-4" /></div>
              <div className="min-w-0 flex-1">
                <p className="label-caps text-[#8A5E50]">On-site notice</p>
                <p className="text-sm font-medium mt-0.5">{notice.title}</p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{notice.message}</p>
                <p className="text-[11px] text-muted-foreground mt-1.5">{notice.publishedAt}</p>
              </div>
              <button type="button" onClick={() => setDismissedNotices(current => [...current, notice.id])} aria-label={`Dismiss ${notice.title}`} className="p-1 text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
            </div>
          ))}
          {isUpcoming && (
            <div className="px-4 sm:px-6 py-5 bg-[#253855]/[0.025] border-b border-border">
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
                            ? "border-[#B17E6B] bg-[#B17E6B]/10 text-[#7A5144]"
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
                    <a href={forum.factSheetUrl} download className="text-xs text-[#8A5E50] hover:underline">View what&apos;s included</a>
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
                  className="h-9 sm:self-end px-4 rounded-md border border-[#253855]/20 bg-white text-[#253855] text-sm font-medium hover:bg-[#253855]/5 disabled:opacity-60 flex items-center justify-center gap-2"
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

type ForumTab = "overview" | "agenda" | "materials" | "participants" | "logistics" | "steering";

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
  const [tab, setTab] = useState<ForumTab>(forum.status === "past" ? "materials" : forum.overview ? "overview" : "agenda");
  const agendaDates = Array.from(new Set(forum.agenda.map(item => item.date).filter((date): date is string => Boolean(date))));
  const [agendaDate, setAgendaDate] = useState(agendaDates[0] ?? "");
  const director = getForumDirectorByEmail(forum.logistics.contactEmail);
  useEffect(() => {
    const requestedTab = window.location.hash.replace(`#forum-${forum.id}-`, "") as ForumTab;
    if (["overview", "agenda", "materials", "participants", "logistics"].includes(requestedTab)) queueMicrotask(() => setTab(requestedTab));
  }, [forum.id]);
  const tabs = [
    { id: "overview" as const, label: "Forum overview", show: Boolean(forum.overview) },
    { id: "agenda" as const, label: forum.updateCounts?.agenda ? `Agenda (${forum.updateCounts.agenda} update)` : "Agenda", show: forum.agenda.length > 0 },
    { id: "materials" as const, label: unseenCount ? `Materials (${unseenCount} new)` : "Materials", show: forum.materials.length > 0 },
    { id: "participants" as const, label: forum.updateCounts?.participants ? `Participants (${forum.updateCounts.participants} new)` : "Participants", show: true },
    { id: "logistics" as const, label: "Logistics", show: forum.status === "upcoming" },
    {
      id: "steering" as const,
      label: "SC Workspace",
      show: SHOW_STEERING_COMMITTEE_WORKSPACE
        && member.steeringCommitteeForums.includes(forum.id)
        && forum.status === "upcoming",
    },
  ].filter(item => item.show);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 pt-5 sm:px-6">
        {forum.status === "upcoming" ? (
          <a href={getCalendarFileUrl(forum)} download={`${forumDisplayTitle(forum.title)}-${forum.editionYear}.ics`} className={DOWNLOAD_BUTTON_CLASS}><CalendarPlus className="h-3.5 w-3.5" />Download Calendar</a>
        ) : <span />}
        <a href="/materials/prototype-complete-forum-pack.txt" download={`${forumDisplayTitle(forum.title)}-${forum.editionYear}-forum-pack.txt`} className={`${DOWNLOAD_BUTTON_CLASS} ml-auto`}><Download className="h-3.5 w-3.5" />Download Forum Pack</a>
      </div>
      <div className="flex max-w-full gap-2 border-b border-border px-4 sm:px-6 pt-5 overflow-x-auto overscroll-x-contain">
        {tabs.map(item => (
          <button
            type="button"
            key={item.id}
            onClick={() => { setTab(item.id); history.replaceState(null, "", `#forum-${forum.id}-${item.id}`); }}
            className={`rounded-t-md border border-b-0 px-3 py-2.5 text-sm font-medium transition-colors whitespace-nowrap ${
              tab === item.id ? "border-border bg-[#253855] text-white" : "border-transparent bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >{item.label}</button>
        ))}
      </div>

      <div className="px-4 sm:px-6 py-5 min-w-0">
        {tab === "overview" && forum.overview && (
          <div className="space-y-5">
            <section className="rounded-lg border border-[#B17E6B]/30 bg-[#B17E6B]/[0.06] p-4 sm:p-5">
              <p className="label-caps text-[#8A5E50] mb-2">About this Forum</p>
              <h3 className="font-garamond text-xl font-medium text-foreground">{forum.overview.headline}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mt-2 max-w-3xl">{forum.overview.summary}</p>
              <div className="flex flex-wrap gap-2 mt-4">
                {forum.overview.principles.map(principle => <Badge key={principle} className="bg-white text-[#253855] border border-[#253855]/10 text-[10px] font-medium">{principle}</Badge>)}
              </div>
            </section>

            <div className="grid gap-3 md:grid-cols-3">
              <OverviewCard icon={<Users className="w-4 h-4" />} label="Who participates" text={forum.overview.participantProfile} />
              <OverviewCard icon={<MessageSquare className="w-4 h-4" />} label="How it works" text={forum.overview.format} />
              <OverviewCard icon={<ShieldCheck className="w-4 h-4" />} label="The atmosphere" text={forum.overview.atmosphere} />
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">First time attending? Your Forum Director can answer questions about the format, preparation, or what to expect.</p>
          </div>
        )}

        {tab === "agenda" && (
          <div>
            <div className="mb-4 flex flex-wrap items-center justify-end gap-2">
              <a href="/materials/prototype-agenda.txt" download className={DOWNLOAD_BUTTON_CLASS}><Download className="h-3.5 w-3.5" />Download agenda</a>
              <button type="button" onClick={() => window.print()} className={DOWNLOAD_BUTTON_CLASS}><Printer className="h-3.5 w-3.5" />Print</button>
            </div>
            {agendaDates.length > 1 && (
              <div className="grid grid-cols-3 gap-1 rounded-lg bg-muted/70 p-1 mb-5" aria-label="Agenda days">
                {agendaDates.map((date, index) => (
                  <button
                    type="button"
                    key={date}
                    onClick={() => setAgendaDate(date)}
                    className={`rounded-md px-2 py-2 text-center transition-colors ${agendaDate === date ? "bg-white text-[#253855] shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    <span className="block text-[10px] font-semibold uppercase tracking-[0.14em]">Day {index + 1}</span>
                    <span className="block text-[11px] mt-0.5">{formatAgendaDay(date)}</span>
                  </button>
                ))}
              </div>
            )}
            <div className="space-y-0">
              {forum.agenda.filter(item => !agendaDate || item.date === agendaDate).map((item, index) => (
                <details key={`${item.date}-${item.time}-${index}`} className="group border-b border-border last:border-0">
                  <summary className="list-none flex items-start gap-3 sm:gap-4 cursor-pointer py-3.5">
                    <span className="text-[11px] text-muted-foreground font-mono w-16 sm:w-24 flex-shrink-0 pt-0.5">
                      {item.time}{item.endTime ? `–${item.endTime}` : ""}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2 flex-wrap">
                        {item.sessionNumber && <span className="label-caps text-[#8A5E50]">Session {item.sessionNumber}</span>}
                        {item.optional && <Badge className="bg-[#B17E6B]/12 text-[#8A5E50] border-0 text-[9px] h-4">Optional</Badge>}
                        {item.kind === "social" && !item.optional && <Badge className="bg-[#253855]/8 text-[#253855] border-0 text-[9px] h-4">Social</Badge>}
                      </span>
                      <span className="block text-sm font-medium text-foreground mt-0.5">{item.title}</span>
                      {item.venueName && <span className="block text-[11px] text-muted-foreground mt-0.5">{item.venueName}</span>}
                    </span>
                    <ChevronDown className="w-4 h-4 mt-0.5 text-muted-foreground transition-transform group-open:rotate-180 flex-shrink-0" />
                  </summary>
                  <div className="pl-[5.5rem] sm:pl-28 pr-2 pb-4">
                    {item.description && <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>}
                    {item.topics?.length ? (
                      <ul className="mt-3 space-y-1.5 text-xs text-muted-foreground list-disc pl-4">
                        {item.topics.map(topic => <li key={topic}>{topic}</li>)}
                      </ul>
                    ) : null}
                    <AgendaLinks item={item} />
                  </div>
                </details>
              ))}
            </div>
          </div>
        )}

        {tab === "materials" && (
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <p className="text-[11px] text-muted-foreground">Subscription articles are linked separately and are not included in the bundle.</p>
              <a href={forum.materialsBundleUrl} download className={DOWNLOAD_BUTTON_CLASS}>
                <Download className="w-3.5 h-3.5" />Download all
              </a>
            </div>
            <SessionMaterials forum={forum} memberId={member.id} onMaterialSeen={onMaterialSeen} />
          </div>
        )}

        {tab === "participants" && <ParticipantList forum={forum} />}

        {tab === "steering" && <SteeringCommitteeWorkspace forum={forum} member={member} />}

        {tab === "logistics" && <LogisticsPanel forum={forum} memberId={member.id} />}
      </div>
      <div className="mx-4 sm:mx-6 mb-6 rounded-lg border border-[#B17E6B]/30 bg-[#B17E6B]/[0.06] p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 min-w-0">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-[#253855] text-cream flex items-center justify-center flex-shrink-0"><UserRound className="w-4 h-4" /></div>
          <div className="min-w-0"><p className="label-caps text-[#8A5E50]">Your Forum Director</p>{director ? <Link href={`/directors/${director.id}`} className="text-sm font-medium hover:text-[#8A5E50] hover:underline">{director.name}</Link> : <p className="text-sm font-medium">{forum.logistics.contactName}</p>}<p className="text-xs text-muted-foreground">Questions about attendance, travel, or materials</p></div>
        </div>
        <div className="flex gap-2 flex-wrap min-w-0">
          {director && <Link href={`/directors/${director.id}`} className="h-8 px-3 rounded-md border border-[#253855]/20 bg-white text-xs font-medium text-[#253855] inline-flex items-center gap-1.5 hover:bg-[#253855]/5"><UserRound className="w-3.5 h-3.5" />View profile</Link>}
          <a
            href={`mailto:${forum.logistics.contactEmail}?subject=${encodeURIComponent(`${forum.status === "upcoming" ? "Forum question" : "Next Forum enquiry"}: ${forumDisplayTitle(forum.title)}`)}&body=${encodeURIComponent(`Hello ${forum.logistics.contactName},\n\nI would like to get in touch about ${forum.status === "upcoming" ? forumDisplayTitle(forum.title) : `the next ${forumDisplayTitle(forum.title)}`}.\n\nThank you.`)}`}
            className="h-8 px-3 rounded-md border border-[#253855]/20 bg-white text-xs font-medium text-[#253855] inline-flex items-center gap-1.5 hover:bg-[#253855]/5"
          ><Mail className="w-3.5 h-3.5" />Contact Forum Director</a>
        </div>
      </div>
    </div>
  );
}

function OverviewCard({ icon, label, text }: { icon: ReactNode; label: string; text: string }) {
  return (
    <section className="rounded-lg border border-border bg-white p-4">
      <div className="w-8 h-8 rounded-full bg-[#253855]/8 text-[#253855] flex items-center justify-center mb-3">{icon}</div>
      <p className="label-caps text-[#8A5E50] mb-1.5">{label}</p>
      <p className="text-xs text-muted-foreground leading-relaxed">{text}</p>
    </section>
  );
}

function LogisticsPanel({ forum, memberId }: { forum: Forum; memberId: string }) {
  const [travel, setTravel] = useState<TravelDetails>(() => getTravelDetails(forum.id, memberId));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const logistics = forum.logistics;

  function updateTravel(field: keyof TravelDetails, value: string) {
    setTravel(current => ({ ...current, [field]: value }));
    setSaved(false);
  }

  async function saveTravel() {
    setSaving(true);
    await submitTravelDetails(forum.id, memberId, travel);
    setSaving(false);
    setSaved(true);
  }

  return (
    <div className="space-y-5 text-sm">
      <div className="flex justify-end">
        <a
          href="/materials/prototype-logistics.txt"
          download={`${forumDisplayTitle(forum.title)}-${forum.editionYear}-logistics.txt`}
          className={DOWNLOAD_BUTTON_CLASS}
        >
          <Download className="h-3.5 w-3.5" />Download logistics
        </a>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <section className="rounded-lg border border-border bg-white p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-[#253855]/8 text-[#253855] flex items-center justify-center flex-shrink-0"><BedDouble className="w-4 h-4" /></div>
            <div className="min-w-0">
              <p className="label-caps text-[#8A5E50] mb-1">Hotel &amp; accommodation</p>
              <p className="font-medium">{logistics.hotel}</p>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(logistics.hotelAddress)}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-muted-foreground hover:text-[#8A5E50] hover:underline"
              >{logistics.hotelAddress}</a>
              {logistics.accommodation && <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{logistics.accommodation}</p>}
              {(logistics.hotelCheckIn || logistics.hotelCheckOut) && (
                <dl className="mt-3 grid grid-cols-[5rem_1fr] gap-x-3 gap-y-1 text-xs">
                  {logistics.hotelCheckIn && <><dt className="text-muted-foreground">Check-in</dt><dd>{logistics.hotelCheckIn}</dd></>}
                  {logistics.hotelCheckOut && <><dt className="text-muted-foreground">Check-out</dt><dd>{logistics.hotelCheckOut}</dd></>}
                </dl>
              )}
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(logistics.hotelAddress)}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 mt-3 text-xs font-medium text-[#8A5E50] hover:underline"
              >Open in Google Maps<ExternalLink className="w-3 h-3" /></a>
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-border bg-white p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-[#253855]/8 text-[#253855] flex items-center justify-center flex-shrink-0"><Plane className="w-4 h-4" /></div>
            <div>
              <p className="label-caps text-[#8A5E50] mb-1">Airport &amp; arrival</p>
              {logistics.airportName ? (
                <>
                  <p className="font-medium">{logistics.airportName}{logistics.airportCode ? ` (${logistics.airportCode})` : ""}</p>
                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{logistics.airportTransfer}</p>
                </>
              ) : <p className="text-xs text-muted-foreground">Contact your Forum Director for recommended travel arrangements.</p>}
              <p className="text-xs text-muted-foreground mt-3 leading-relaxed">{logistics.notes}</p>
            </div>
          </div>
        </section>
      </div>

      {logistics.inclusions?.length ? (
        <section className="rounded-lg border border-[#B17E6B]/30 bg-[#B17E6B]/[0.06] p-4">
          <p className="label-caps text-[#8A5E50] mb-2">What your Forum fee includes</p>
          <ul className="grid gap-2 sm:grid-cols-2 text-xs text-foreground">
            {logistics.inclusions.map(item => <li key={item} className="flex items-start gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-[#8A5E50] flex-shrink-0 mt-0.5" />{item}</li>)}
          </ul>
        </section>
      ) : null}

      <div className="grid gap-3 md:grid-cols-2">
        <section className="rounded-lg border border-border bg-white p-4">
          <div className="flex items-start gap-3">
            <Award className="w-4 h-4 text-[#8A5E50] flex-shrink-0 mt-0.5" />
            <div>
              <p className="label-caps text-[#8A5E50] mb-1">CLE/CPD information</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{logistics.cleCpd ?? "Contact Cambridge for accreditation information for your jurisdiction."}</p>
            </div>
          </div>
        </section>
        <section className="rounded-lg border border-border bg-white p-4">
          <p className="label-caps text-[#8A5E50] mb-1">Dress code</p>
          <p className="text-xs text-muted-foreground leading-relaxed">{logistics.dressCode}</p>
        </section>
      </div>

      {logistics.cancellationPolicy?.length ? (
        <details className="group rounded-lg border border-border bg-white">
          <summary className="list-none cursor-pointer px-4 py-3 flex items-center justify-between gap-3">
            <div><p className="label-caps text-[#8A5E50]">Cancellation policy</p><p className="text-xs text-muted-foreground mt-1">Registration is non-transferable. View refund and credit deadlines.</p></div>
            <ChevronDown className="w-4 h-4 text-muted-foreground transition-transform group-open:rotate-180" />
          </summary>
          <div className="border-t border-border px-4 py-3 space-y-3">
            {logistics.cancellationPolicy.map(item => (
              <div key={item.deadline} className="grid gap-1 sm:grid-cols-[12rem_1fr] text-xs">
                <p className="font-medium">{item.deadline}</p>
                <p className="text-muted-foreground">{item.outcome}</p>
              </div>
            ))}
          </div>
        </details>
      ) : null}

      {forum.status === "upcoming" && (
        <section className="rounded-lg border border-border bg-white p-4">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <p className="label-caps text-[#8A5E50] mb-1">Your travel plans</p>
              <h4 className="font-medium">Share your arrival and departure details</h4>
              <p className="text-xs text-muted-foreground mt-1">This helps Cambridge coordinate your hotel stay and on-site arrival. Prototype entries are saved only in this browser.</p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <TravelField label="Arrival details" hint="Flight or train number">
              <input value={travel.arrivalDetails} onChange={event => updateTravel("arrivalDetails", event.target.value)} placeholder="e.g. AC 810" className="w-full h-9 rounded-md border border-input bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
            </TravelField>
            <TravelField label="Arrival date and time">
              <input type="datetime-local" value={travel.arrivalDateTime} onChange={event => updateTravel("arrivalDateTime", event.target.value)} className="w-full h-9 rounded-md border border-input bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
            </TravelField>
            <TravelField label="Departure details" hint="Flight or train number">
              <input value={travel.departureDetails} onChange={event => updateTravel("departureDetails", event.target.value)} placeholder="e.g. AC 811" className="w-full h-9 rounded-md border border-input bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
            </TravelField>
            <TravelField label="Departure date and time">
              <input type="datetime-local" value={travel.departureDateTime} onChange={event => updateTravel("departureDateTime", event.target.value)} className="w-full h-9 rounded-md border border-input bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
            </TravelField>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <button type="button" onClick={saveTravel} disabled={saving} className="h-9 px-4 rounded-md border border-[#253855]/20 bg-white text-[#253855] text-sm font-medium hover:bg-[#253855]/5 disabled:opacity-60 inline-flex items-center gap-2">
              {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}Save travel details
            </button>
            {saved && <span className="text-xs text-green-700 inline-flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" />Saved</span>}
          </div>
        </section>
      )}

      <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs">
        <a href={`mailto:${logistics.contactEmail}`} className="text-[#8A5E50] hover:underline">Questions? Email {logistics.contactName}</a>
        <a href={forum.websiteUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[#8A5E50] hover:underline">Visit forum website<ExternalLink className="w-3 h-3" /></a>
      </div>
    </div>
  );
}

function TravelField({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium mb-1">{label}</span>
      {children}
      {hint && <span className="block text-[11px] text-muted-foreground mt-1">{hint}</span>}
    </label>
  );
}

function AgendaLinks({ item }: { item: AgendaItem }) {
  return (
    <>
      {item.speaker && (item.speakerMemberId ? (
        <Link href={`/directory/${item.speakerMemberId}`} className="inline-flex items-center gap-1 text-xs text-[#8A5E50] mt-1 hover:underline">
          {item.speaker}<ChevronRight className="w-3 h-3" />
        </Link>
      ) : <p className="text-xs text-[#8A5E50] mt-1">{item.speaker}</p>)}
      {item.venueAddress && (
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.venueAddress)}`}
          target="_blank"
          rel="noreferrer"
          className="flex items-start gap-1.5 mt-1 text-xs text-[#8A5E50] hover:underline"
        >
          <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
          <span>{item.venueName} · {item.venueAddress}</span>
        </a>
      )}
      {item.discussionLeaders?.length ? (
        <div className="mt-4">
          <p className="label-caps text-muted-foreground mb-2">Discussion leaders</p>
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {item.discussionLeaders.map(leader => (
              <div key={`${leader.name}-${leader.organization}`} className="rounded-md border border-border bg-white px-3 py-2">
                <Link href={leader.memberId ? `/directory/${leader.memberId}` : `/search?q=${encodeURIComponent(leader.name)}`} className="text-xs font-medium text-[#253855] hover:underline">{leader.name}</Link>
                <p className="text-[11px] text-muted-foreground">{leader.organization}</p>
                <p className="text-[11px] text-muted-foreground">{leader.location}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </>
  );
}

function formatAgendaDay(date: string): string {
  return new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short" })
    .format(new Date(`${date}T12:00:00`));
}

function SessionMaterials({ forum, memberId, onMaterialSeen }: { forum: Forum; memberId: string; onMaterialSeen: () => void }) {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();
  const matchingMaterials = forum.materials.filter(material => {
    const session = forum.agenda.find(item => item.sessionId === material.sessionId);
    return !normalizedQuery || `${material.title} ${material.type} ${material.category} ${session?.title ?? ""} ${session?.discussionLeaders?.map(leader => `${leader.name} ${leader.organization}`).join(" ") ?? ""}`.toLowerCase().includes(normalizedQuery);
  });
  const sessions = forum.agenda.filter(item => item.sessionId && matchingMaterials.some(material => material.sessionId === item.sessionId));
  const unassigned = matchingMaterials.filter(material => !material.sessionId);

  return (
    <div className="space-y-5">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input aria-label="Search Forum materials" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search Forum materials by title, session, or discussion leader…" className="h-10 w-full rounded-md border border-border bg-white pl-9 pr-3 text-sm focus:border-[#B17E6B] focus:outline-none" />
      </div>
      {sessions.map(session => {
        const materials = forum.materials.filter(material => material.sessionId === session.sessionId);
        return (
          <section key={session.sessionId} className="rounded-lg border border-border overflow-hidden">
            <div className="bg-[#253855]/[0.045] px-4 py-3 border-b border-border sm:flex sm:items-start sm:justify-between gap-5">
              <div>
                <p className="label-caps text-[#8A5E50]">Session {session.sessionNumber}</p>
                <h3 className="font-garamond text-lg font-medium mt-0.5">{session.title}</h3>
              </div>
              {session.discussionLeaders?.length ? (
                <div className="mt-2 sm:mt-0 sm:text-right flex-shrink-0">
                  <p className="label-caps text-muted-foreground">Discussion leaders</p>
                  {session.discussionLeaders.map(leader => (
                    <p key={leader.name} className="text-[11px] text-muted-foreground">{leader.name} · {leader.organization}</p>
                  ))}
                </div>
              ) : null}
            </div>
            <div className="p-3 sm:p-4">
              <MaterialGroup title="Required pre-reading" description="Please review these items before this session." materials={materials.filter(material => material.category === "required")} memberId={memberId} onMaterialSeen={onMaterialSeen} required />
              <MaterialGroup title="Supplementary materials" description="Optional background and reference material." materials={materials.filter(material => material.category === "supplementary")} memberId={memberId} onMaterialSeen={onMaterialSeen} />
            </div>
          </section>
        );
      })}
      {unassigned.length > 0 && (
        <section>
          <MaterialGroup title="General Forum materials" description="Documents that apply across the full Forum." materials={unassigned} memberId={memberId} onMaterialSeen={onMaterialSeen} />
        </section>
      )}
      {matchingMaterials.length === 0 && <p className="rounded-lg border border-dashed border-border py-10 text-center text-sm text-muted-foreground">No materials match your search.</p>}
    </div>
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
  const [savedIds, setSavedIds] = useState<string[]>(() => getSavedMaterialIds());
  if (!materials.length) return null;
  return (
    <section className={`mb-5 last:mb-0 rounded-lg ${required ? "border border-[#B17E6B]/35 bg-[#B17E6B]/[0.055]" : "border border-border"}`}>
      <div className="px-4 py-3 border-b border-inherit">
        <div className="flex items-center gap-2">
          <FileText className={`w-4 h-4 ${required ? "text-[#8A5E50]" : "text-muted-foreground"}`} />
          <h3 className="font-garamond text-base font-medium">{title}</h3>
          {required && <Badge className="bg-[#8A5E50] text-white border-0 text-[9px] h-4">Required</Badge>}
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
                  {unseen && <Badge className="bg-[#253855] text-cream border-0 text-[9px] h-4">{material.revision > 1 ? "Updated" : "New"}</Badge>}
                </div>
                <p className="text-xs text-muted-foreground capitalize">{material.type} · {material.size} · Added {new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" }).format(new Date(`${material.publishedAt}T12:00:00`))}</p>
                {material.access?.kind === "subscription" && <p className="mt-1 text-[11px] font-medium text-[#8A5E50]">Requires subscription to {material.access.publication} · Not included in Download All</p>}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0"><button type="button" onClick={() => setSavedIds(toggleSavedMaterial(material.id))} className={`p-1.5 rounded ${savedIds.includes(material.id) ? "text-[#8A5E50] bg-[#B17E6B]/10" : "text-muted-foreground hover:text-[#8A5E50]"}`} aria-label={`${savedIds.includes(material.id) ? "Remove from" : "Save to"} My Library`}><Bookmark className={`w-3.5 h-3.5 ${savedIds.includes(material.id) ? "fill-current" : ""}`} /></button><button
                type="button"
                onClick={() => {
                  if (unseen) {
                    markMaterialSeen(memberId, material);
                    setSeenInSession(current => new Set(current).add(material.id));
                    onMaterialSeen();
                  }
                  window.open(material.url, "_blank", "noopener,noreferrer");
                }}
                className="flex items-center gap-1.5 text-xs text-[#253855] hover:text-[#8A5E50] font-medium transition-colors flex-shrink-0"
              >
                <Eye className="w-3.5 h-3.5" />{material.access ? "Open article" : "Open"}
              </button></div>
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
      <div className="rounded-lg bg-[#253855] text-cream p-4 mb-4">
        <div className="flex items-center gap-2"><MessageSquare className="w-4 h-4 text-[#C79786]" /><p className="text-sm font-medium">Private Steering Committee workspace</p></div>
        <p className="text-xs text-cream/65 mt-1">A lightweight concept for sharing session ideas, candidate notes, and working documents between meetings.</p>
      </div>
      <div className="flex gap-2 mb-4">
        <textarea value={draft} onChange={event => setDraft(event.target.value)} rows={2} placeholder="Suggest a session idea or leave a note for the committee…" className="min-w-0 w-full flex-1 text-sm rounded-md border border-input bg-white px-3 py-2 placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none" />
        <button type="button" onClick={postNote} disabled={!draft.trim()} className="self-end h-9 px-3 rounded-md bg-[#253855] text-cream text-xs font-medium disabled:opacity-50 inline-flex items-center gap-1.5"><Send className="w-3.5 h-3.5" />Post</button>
      </div>
      <div className="rounded-lg border border-border p-3 mb-3 flex items-center justify-between gap-3">
        <div><p className="text-sm font-medium">Draft 2026 discussion themes</p><p className="text-xs text-muted-foreground">Working document · Updated 14 October</p></div>
        <a href="/materials/prototype-resource.txt" download className={DOWNLOAD_BUTTON_CLASS}><Download className="w-3.5 h-3.5" />Download</a>
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

function ParticipantList({ forum }: { forum: Forum }) {
  const participants = forum.participants.map(id => getResolvedMember(id)).filter(Boolean) as Member[];
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();
  const filteredParticipants = participants.filter(participant => !normalizedQuery || `${participant.name} ${participant.organization} ${participant.title} ${participant.location}`.toLowerCase().includes(normalizedQuery));
  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div><h3 className="font-garamond text-lg font-medium">Forum participants</h3><p className="text-xs text-muted-foreground mt-0.5">Select a participant to view their full directory profile and contact preferences.</p></div>
        <a href="/materials/prototype-participant-roster.txt" download className={`${DOWNLOAD_BUTTON_CLASS} w-fit`}><Download className="h-3.5 w-3.5" />Download participant roster</a>
      </div>
      <div className="relative mb-4"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input aria-label="Search Forum participants" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search participants by name or organization…" className="h-10 w-full rounded-md border border-border bg-white pl-9 pr-3 text-sm focus:border-[#B17E6B] focus:outline-none" /></div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {filteredParticipants.map(participant => {
          const tenure = getMemberTenure(participant);
          const milestoneYears = getMemberAnniversaryMilestone(participant);
          const isCoChair = participant.coChairForums?.includes(forum.id);
          const isSteeringCommittee = participant.steeringCommitteeForums.includes(forum.id);
          const displayName = participant.publishedName || participant.name;
          return (
            <article key={participant.id} className={`rounded-lg border bg-white p-4 transition-colors ${milestoneYears ? "border-[#B17E6B]/60 bg-[#B17E6B]/[0.045] shadow-sm" : "border-border hover:border-[#B17E6B]/50"}`}>
              <div className="flex items-start gap-3">
                <Link href={`/directory/${participant.id}?from=forum`} aria-label={`View ${displayName}'s profile`} className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0 bg-[#253855]/10">
                  {participant.photo ? (
                    <img src={participant.photo} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="w-full h-full flex items-center justify-center text-xs font-semibold text-[#253855]">{participant.avatar}</span>
                  )}
                </Link>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <Link href={`/directory/${participant.id}?from=forum`} className="text-sm font-medium hover:text-[#8A5E50] hover:underline">{displayName}</Link>
                    <div className="flex flex-wrap justify-end gap-1">
                      {isCoChair && <Badge className="bg-[#253855] text-cream border-0 text-[9px] h-4">Committee Co-Chair</Badge>}
                      {isSteeringCommittee && <Badge className="bg-[#B17E6B]/12 text-[#8A5E50] border-0 text-[9px] h-4">Steering Committee</Badge>}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{participant.title}</p>
                  <p className="text-xs font-medium mt-0.5">{participant.organization}</p>
                  {milestoneYears && (
                    <p className="mt-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#8A5E50]">
                      <Award className="h-3 w-3" aria-hidden="true" />
                      {milestoneYears}-year anniversary attendee
                    </p>
                  )}
                  <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1"><Globe className="w-3 h-3" />{participant.location}</p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <p className="text-[11px] text-muted-foreground">
                  {tenure.count} Forum {tenure.count === 1 ? "edition" : "editions"}{tenure.firstYear ? ` · first attended ${tenure.firstYear}` : ""}
                </p>
                <div className="flex items-center gap-3">
                  {participant.contactPreference === "email" && participant.contactEmail && (
                    <a href={`mailto:${participant.contactEmail}`} className="text-[11px] text-[#8A5E50] hover:underline inline-flex items-center gap-1"><Mail className="w-3 h-3" />Email</a>
                  )}
                  {participant.contactPreference === "email" && participant.phone && (
                    <a href={`tel:${participant.phone}`} className="text-[11px] text-muted-foreground hover:text-foreground inline-flex items-center gap-1"><Phone className="w-3 h-3" />Phone</a>
                  )}
                  <Link href={`/directory/${participant.id}?from=forum`} className="text-[11px] font-medium text-[#253855] hover:underline">View profile</Link>
                </div>
              </div>
            </article>
          );
        })}
      </div>
      {filteredParticipants.length === 0 && <p className="py-10 text-center text-sm text-muted-foreground">No participants match your search.</p>}

      {forum.representatives?.length ? (
        <section className="mt-7 pt-6 border-t border-border">
          <div className="mb-4">
            <p className="label-caps text-[#8A5E50]">Cambridge Forums</p>
            <h3 className="font-garamond text-lg font-medium mt-0.5">Cambridge Team</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Your on-site contacts for Forum, attendance, and event support.</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {forum.representatives.map(representative => (
              <article key={representative.id} className="rounded-lg border border-[#B17E6B]/30 bg-[#B17E6B]/[0.045] p-4 flex items-start gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-[#253855] text-cream flex items-center justify-center">
                  {representative.photo ? <img src={representative.photo} alt="" className="w-full h-full object-cover" /> : <span className="text-xs font-semibold">{representative.avatar}</span>}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium">{representative.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{representative.title}</p>
                  <p className="text-[11px] text-muted-foreground mt-1">{representative.location}</p>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
                    <a href={`mailto:${representative.contactEmail}`} className="text-[11px] text-[#8A5E50] hover:underline inline-flex items-center gap-1"><Mail className="w-3 h-3" />Email</a>
                    <a href={`tel:${representative.contactPhone}`} className="text-[11px] text-muted-foreground hover:text-foreground inline-flex items-center gap-1"><Phone className="w-3 h-3" />{representative.contactPhone}</a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}
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
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div><p className="label-caps text-[#B17E6B] mb-1">My Forums</p><h1 className="font-garamond text-3xl font-medium text-foreground">Good to see you, {member.name.split(" ")[0]}.</h1><p className="text-muted-foreground text-sm mt-1">Respond to invitations and find everything Cambridge has shared with you.</p></div>
            <Link href="/search" className="inline-flex h-10 w-full items-center gap-2 rounded-md border border-[#253855]/20 bg-white px-3 text-sm font-medium text-[#253855] shadow-sm hover:bg-[#253855]/5 sm:w-auto"><Search className="h-4 w-4" />Search Cambridge</Link>
          </div>
        </div>

        {upcoming.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <h2 className="font-garamond text-xl font-medium">Upcoming Forums</h2>
              <span className="bg-[#253855] text-cream text-[10px] px-1.5 py-0.5 rounded font-medium">{upcoming.length}</span>
            </div>
            <div className="space-y-3">{upcoming.map((forum, index) => <ForumCard key={forum.id} forum={forum} member={member} defaultOpen={index === 0} />)}</div>
          </section>
        )}

        {past.length > 0 && (
          <section>
            <h2 className="font-garamond text-xl font-medium mb-3">Past Forums</h2>
            <div className="space-y-3">{past.map(forum => <ForumCard key={forum.id} forum={forum} member={member} defaultOpen={false} />)}</div>
          </section>
        )}

        {forums.length === 0 && (
          <div className="text-center py-16 text-muted-foreground"><Users className="w-8 h-8 mx-auto mb-3 opacity-30" /><p className="text-sm">No forums on record for your account.</p></div>
        )}
      </div>
    </AppShell>
  );
}

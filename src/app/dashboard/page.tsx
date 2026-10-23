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
import {
  Award, BedDouble, Calendar, CalendarPlus, CheckCircle2, ChevronDown, ChevronRight, CircleHelp, Download,
  ExternalLink, Eye, FileText, Globe, Loader2, Mail, MapPin, MessageSquare, Phone, Plane, Send, ShieldCheck, UserRound, Users, XCircle,
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

// Keep the prototype implementation available for a later review round without
// exposing the Steering Committee workspace in the current client build.
const SHOW_STEERING_COMMITTEE_WORKSPACE = false;

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
  const [tab, setTab] = useState<ForumTab>(forum.overview ? "overview" : "agenda");
  const agendaDates = Array.from(new Set(forum.agenda.map(item => item.date).filter((date): date is string => Boolean(date))));
  const [agendaDate, setAgendaDate] = useState(agendaDates[0] ?? "");
  const director = getForumDirectorByEmail(forum.logistics.contactEmail);
  const tabs = [
    { id: "overview" as const, label: "Forum overview", show: Boolean(forum.overview) },
    { id: "agenda" as const, label: "Agenda", show: forum.agenda.length > 0 },
    { id: "materials" as const, label: unseenCount ? `Materials (${unseenCount})` : "Materials", show: forum.materials.length > 0 },
    { id: "participants" as const, label: "Participants", show: true },
    { id: "logistics" as const, label: "Logistics", show: true },
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
        {tab === "overview" && forum.overview && (
          <div className="space-y-5">
            <section className="rounded-lg border border-[#c8975e]/30 bg-[#c8975e]/[0.06] p-4 sm:p-5">
              <p className="label-caps text-[#9a6a33] mb-2">About this Forum</p>
              <h3 className="font-garamond text-xl font-medium text-foreground">Built around participation, not presentations.</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mt-2 max-w-3xl">{forum.overview.summary}</p>
              <div className="flex flex-wrap gap-2 mt-4">
                {forum.overview.principles.map(principle => <Badge key={principle} className="bg-white text-[#1e2b45] border border-[#1e2b45]/10 text-[10px] font-medium">{principle}</Badge>)}
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
            {agendaDates.length > 1 && (
              <div className="grid grid-cols-3 gap-1 rounded-lg bg-muted/70 p-1 mb-5" aria-label="Agenda days">
                {agendaDates.map((date, index) => (
                  <button
                    type="button"
                    key={date}
                    onClick={() => setAgendaDate(date)}
                    className={`rounded-md px-2 py-2 text-center transition-colors ${agendaDate === date ? "bg-white text-[#1e2b45] shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
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
                        {item.sessionNumber && <span className="label-caps text-[#9a6a33]">Session {item.sessionNumber}</span>}
                        {item.optional && <Badge className="bg-[#c8975e]/12 text-[#9a6a33] border-0 text-[9px] h-4">Optional</Badge>}
                        {item.kind === "social" && !item.optional && <Badge className="bg-[#1e2b45]/8 text-[#1e2b45] border-0 text-[9px] h-4">Social</Badge>}
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
            <div className="flex justify-end mb-2">
              <a href={forum.materialsBundleUrl} download className="inline-flex items-center gap-1.5 text-xs text-[#1e2b45] font-medium hover:text-[#9a6a33]">
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
    </div>
  );
}

function OverviewCard({ icon, label, text }: { icon: ReactNode; label: string; text: string }) {
  return (
    <section className="rounded-lg border border-border bg-white p-4">
      <div className="w-8 h-8 rounded-full bg-[#1e2b45]/8 text-[#1e2b45] flex items-center justify-center mb-3">{icon}</div>
      <p className="label-caps text-[#9a6a33] mb-1.5">{label}</p>
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
      <div className="grid gap-3 md:grid-cols-2">
        <section className="rounded-lg border border-border bg-white p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-[#1e2b45]/8 text-[#1e2b45] flex items-center justify-center flex-shrink-0"><BedDouble className="w-4 h-4" /></div>
            <div className="min-w-0">
              <p className="label-caps text-[#9a6a33] mb-1">Hotel &amp; accommodation</p>
              <p className="font-medium">{logistics.hotel}</p>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(logistics.hotelAddress)}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-muted-foreground hover:text-[#9a6a33] hover:underline"
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
                className="inline-flex items-center gap-1 mt-3 text-xs font-medium text-[#9a6a33] hover:underline"
              >Open in Google Maps<ExternalLink className="w-3 h-3" /></a>
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-border bg-white p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-[#1e2b45]/8 text-[#1e2b45] flex items-center justify-center flex-shrink-0"><Plane className="w-4 h-4" /></div>
            <div>
              <p className="label-caps text-[#9a6a33] mb-1">Airport &amp; arrival</p>
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
        <section className="rounded-lg border border-[#c8975e]/30 bg-[#c8975e]/[0.06] p-4">
          <p className="label-caps text-[#9a6a33] mb-2">What your Forum fee includes</p>
          <ul className="grid gap-2 sm:grid-cols-2 text-xs text-foreground">
            {logistics.inclusions.map(item => <li key={item} className="flex items-start gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-[#9a6a33] flex-shrink-0 mt-0.5" />{item}</li>)}
          </ul>
        </section>
      ) : null}

      <div className="grid gap-3 md:grid-cols-2">
        <section className="rounded-lg border border-border bg-white p-4">
          <div className="flex items-start gap-3">
            <Award className="w-4 h-4 text-[#9a6a33] flex-shrink-0 mt-0.5" />
            <div>
              <p className="label-caps text-[#9a6a33] mb-1">CLE/CPD information</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{logistics.cleCpd ?? "Contact Cambridge for accreditation information for your jurisdiction."}</p>
            </div>
          </div>
        </section>
        <section className="rounded-lg border border-border bg-white p-4">
          <p className="label-caps text-[#9a6a33] mb-1">Dress code</p>
          <p className="text-xs text-muted-foreground leading-relaxed">{logistics.dressCode}</p>
        </section>
      </div>

      {logistics.cancellationPolicy?.length ? (
        <details className="group rounded-lg border border-border bg-white">
          <summary className="list-none cursor-pointer px-4 py-3 flex items-center justify-between gap-3">
            <div><p className="label-caps text-[#9a6a33]">Cancellation policy</p><p className="text-xs text-muted-foreground mt-1">Registration is non-transferable. View refund and credit deadlines.</p></div>
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
              <p className="label-caps text-[#9a6a33] mb-1">Your travel plans</p>
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
            <button type="button" onClick={saveTravel} disabled={saving} className="h-9 px-4 rounded-md border border-[#1e2b45]/20 bg-white text-[#1e2b45] text-sm font-medium hover:bg-[#1e2b45]/5 disabled:opacity-60 inline-flex items-center gap-2">
              {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}Save travel details
            </button>
            {saved && <span className="text-xs text-green-700 inline-flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" />Saved</span>}
          </div>
        </section>
      )}

      <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs">
        <a href={`mailto:${logistics.contactEmail}`} className="text-[#9a6a33] hover:underline">Questions? Email {logistics.contactName}</a>
        <a href={forum.websiteUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[#9a6a33] hover:underline">Visit forum website<ExternalLink className="w-3 h-3" /></a>
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
      {item.discussionLeaders?.length ? (
        <div className="mt-4">
          <p className="label-caps text-muted-foreground mb-2">Discussion leaders</p>
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {item.discussionLeaders.map(leader => (
              <div key={`${leader.name}-${leader.organization}`} className="rounded-md border border-border bg-white px-3 py-2">
                <p className="text-xs font-medium text-foreground">{leader.name}</p>
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
  const sessions = forum.agenda.filter(item => item.sessionId && forum.materials.some(material => material.sessionId === item.sessionId));
  const unassigned = forum.materials.filter(material => !material.sessionId);

  return (
    <div className="space-y-5">
      {sessions.map(session => {
        const materials = forum.materials.filter(material => material.sessionId === session.sessionId);
        return (
          <section key={session.sessionId} className="rounded-lg border border-border overflow-hidden">
            <div className="bg-[#1e2b45]/[0.045] px-4 py-3 border-b border-border sm:flex sm:items-start sm:justify-between gap-5">
              <div>
                <p className="label-caps text-[#9a6a33]">Session {session.sessionNumber}</p>
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
          <MaterialGroup title="General Forum materials" description="Documents that apply across the Forum programme." materials={unassigned} memberId={memberId} onMaterialSeen={onMaterialSeen} />
        </section>
      )}
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
                <Eye className="w-3.5 h-3.5" />Open
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

function ParticipantList({ forum }: { forum: Forum }) {
  const participants = forum.participants.map(id => getResolvedMember(id)).filter(Boolean) as Member[];
  return (
    <div>
      <div className="mb-4">
        <h3 className="font-garamond text-lg font-medium">Forum participants</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Select a participant to view their full directory profile and contact preferences.</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {participants.map(participant => {
          const tenure = getMemberTenure(participant);
          const isCoChair = participant.coChairForums?.includes(forum.id);
          const isSteeringCommittee = participant.steeringCommitteeForums.includes(forum.id);
          const displayName = participant.publishedName || participant.name;
          return (
            <article key={participant.id} className="rounded-lg border border-border bg-white p-4 hover:border-[#c8975e]/50 transition-colors">
              <div className="flex items-start gap-3">
                <Link href={`/directory/${participant.id}`} aria-label={`View ${displayName}'s profile`} className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0 bg-[#1e2b45]/10">
                  {participant.photo ? (
                    <img src={participant.photo} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="w-full h-full flex items-center justify-center text-xs font-semibold text-[#1e2b45]">{participant.avatar}</span>
                  )}
                </Link>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <Link href={`/directory/${participant.id}`} className="text-sm font-medium hover:text-[#9a6a33] hover:underline">{displayName}</Link>
                    <div className="flex flex-wrap justify-end gap-1">
                      {isCoChair && <Badge className="bg-[#1e2b45] text-cream border-0 text-[9px] h-4">Committee Co-Chair</Badge>}
                      {isSteeringCommittee && <Badge className="bg-[#c8975e]/12 text-[#9a6a33] border-0 text-[9px] h-4">Steering Committee</Badge>}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{participant.title}</p>
                  <p className="text-xs font-medium mt-0.5">{participant.organization}</p>
                  <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1"><Globe className="w-3 h-3" />{participant.location}</p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <p className="text-[11px] text-muted-foreground">
                  {tenure.count} Forum {tenure.count === 1 ? "edition" : "editions"}{tenure.firstYear ? ` · first attended ${tenure.firstYear}` : ""}
                </p>
                <div className="flex items-center gap-3">
                  {participant.contactPreference === "email" && participant.contactEmail && (
                    <a href={`mailto:${participant.contactEmail}`} className="text-[11px] text-[#9a6a33] hover:underline inline-flex items-center gap-1"><Mail className="w-3 h-3" />Email</a>
                  )}
                  {participant.contactPreference === "email" && participant.phone && (
                    <a href={`tel:${participant.phone}`} className="text-[11px] text-muted-foreground hover:text-foreground inline-flex items-center gap-1"><Phone className="w-3 h-3" />Phone</a>
                  )}
                  <Link href={`/directory/${participant.id}`} className="text-[11px] font-medium text-[#1e2b45] hover:underline">View profile</Link>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {forum.representatives?.length ? (
        <section className="mt-7 pt-6 border-t border-border">
          <div className="mb-4">
            <p className="label-caps text-[#9a6a33]">Cambridge Forums</p>
            <h3 className="font-garamond text-lg font-medium mt-0.5">Cambridge representatives</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Your on-site contacts for programme, attendance, and event support.</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {forum.representatives.map(representative => (
              <article key={representative.id} className="rounded-lg border border-[#c8975e]/30 bg-[#c8975e]/[0.045] p-4 flex items-start gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-[#1e2b45] text-cream flex items-center justify-center">
                  {representative.photo ? <img src={representative.photo} alt="" className="w-full h-full object-cover" /> : <span className="text-xs font-semibold">{representative.avatar}</span>}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium">{representative.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{representative.title}</p>
                  <p className="text-[11px] text-muted-foreground mt-1">{representative.location}</p>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
                    <a href={`mailto:${representative.contactEmail}`} className="text-[11px] text-[#9a6a33] hover:underline inline-flex items-center gap-1"><Mail className="w-3 h-3" />Email</a>
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

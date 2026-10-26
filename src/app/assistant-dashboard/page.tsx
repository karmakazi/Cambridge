"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { clearAuth, exitAssistantPreview, getAuth } from "@/lib/auth";
import { getResolvedMember } from "@/lib/store";
import { getForumDirectorByEmail, getForumsForMember, type Forum, type Member } from "@/lib/data";
import {
  formatForumDateRange,
  getForumParticipation,
  getTravelDetails,
  submitRsvp,
  submitTravelDetails,
  type RsvpStatus,
  type TravelDetails,
} from "@/lib/prototype-service";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, BriefcaseBusiness, Calendar, CheckCircle2, Eye, FileText, LogOut, MapPin, ShieldCheck } from "lucide-react";

const RSVP_OPTIONS: Array<{ value: RsvpStatus; label: string }> = [
  { value: "attending", label: "Attending" },
  { value: "maybe", label: "Maybe" },
  { value: "declined", label: "Unable to attend" },
];

export default function AssistantDashboardPage() {
  const router = useRouter();
  const [assistantName, setAssistantName] = useState("");
  const [participant, setParticipant] = useState<Member | null>(null);
  const [isPreview, setIsPreview] = useState(false);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      const auth = getAuth();
      if (!auth || auth.role !== "assistant") { router.replace("/"); return; }
      const member = getResolvedMember(auth.assistedMemberId ?? auth.memberId);
      if (!member) { clearAuth(); router.replace("/"); return; }
      setAssistantName(auth.name);
      setParticipant(member);
      setIsPreview(Boolean(auth.assistantPreview));
    });
    return () => { cancelled = true; };
  }, [router]);

  function signOut() {
    clearAuth();
    router.push("/");
  }

  function exitPreview() {
    if (exitAssistantPreview()) router.push("/profile");
  }

  if (!participant) return null;
  const forums = getForumsForMember(participant.id).filter(forum => forum.status === "upcoming");

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-[#253855] text-cream">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div>
            <p className="font-garamond text-lg font-medium tracking-wide">Cambridge</p>
            <p className="label-caps text-[#B17E6B] -mt-0.5">Forums · Assistant Access</p>
          </div>
          <div className="flex items-center gap-3">
            {isPreview && <button type="button" onClick={exitPreview} className="text-xs text-cream hover:text-white flex items-center gap-1.5"><ArrowLeft className="w-3.5 h-3.5" />Exit assistant preview</button>}
            <button type="button" onClick={signOut} className="text-xs text-white/60 hover:text-white flex items-center gap-1.5"><LogOut className="w-3.5 h-3.5" />Sign out</button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <div className="rounded-lg border border-[#253855]/15 bg-white p-5 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-[#253855] text-cream flex items-center justify-center flex-shrink-0"><BriefcaseBusiness className="w-4 h-4" /></div>
              <div>
                <p className="label-caps text-[#B17E6B]">Restricted assistant workspace</p>
                <h1 className="font-garamond text-2xl font-medium mt-1">Welcome, {assistantName}.</h1>
                <p className="text-sm text-muted-foreground mt-1">You’re managing Forum details for <span className="font-medium text-foreground">{participant.name}</span>.</p>
              </div>
            </div>
            <Badge className="self-start bg-[#253855]/[0.07] text-[#253855] border-0 gap-1"><ShieldCheck className="w-3 h-3" />Delegated access</Badge>
          </div>
          <p className="mt-4 rounded-md bg-[#253855]/[0.035] border border-[#253855]/10 px-3 py-2.5 text-xs text-muted-foreground leading-relaxed">You can update {participant.preferredName ?? participant.name.split(" ")[0]}’s attendance, dietary, accessibility and travel details, and view their Forum materials and logistics. Directory, Member Exchange, participant rosters and other member profiles are not available.</p>
        </div>

        <div className="mb-4">
          <p className="label-caps text-[#B17E6B]">Upcoming Forums</p>
          <h2 className="font-garamond text-2xl font-medium mt-1">Registration and travel</h2>
        </div>
        <div className="space-y-5">
          {forums.map(forum => <AssistantForumCard key={forum.id} forum={forum} participant={participant} />)}
        </div>
      </main>
    </div>
  );
}

function AssistantForumCard({ forum, participant }: { forum: Forum; participant: Member }) {
  const initialParticipation = getForumParticipation(forum, participant.id);
  const [status, setStatus] = useState<RsvpStatus>(initialParticipation.status);
  const [notes, setNotes] = useState(initialParticipation.comment);
  const [travel, setTravel] = useState<TravelDetails>(() => getTravelDetails(forum.id, participant.id));
  const [saved, setSaved] = useState("");
  const director = getForumDirectorByEmail(forum.logistics.contactEmail);

  async function saveRegistration() {
    await submitRsvp(forum.id, participant.id, status, notes);
    setSaved("Registration details saved.");
  }

  async function saveTravel() {
    await submitTravelDetails(forum.id, participant.id, travel);
    setSaved("Travel details saved.");
  }

  function setTravelField(key: keyof TravelDetails, value: string) {
    setTravel(current => ({ ...current, [key]: value }));
    setSaved("");
  }

  return (
    <section className="bg-white rounded-lg border border-border overflow-hidden">
      <div className="p-5 sm:p-6 border-b border-border">
        <div className="flex items-center gap-2 flex-wrap"><span className="label-caps text-[#B17E6B]">{forum.area}</span><Badge className="bg-[#253855] text-cream border-0 text-[10px]">Upcoming</Badge></div>
        <h3 className="font-garamond text-xl font-medium mt-1">{forum.title}</h3>
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{formatForumDateRange(forum)} · {forum.startTime}–{forum.endTime}</span>
          <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{forum.logistics.hotel} · {forum.location}</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">Forum Director: {director?.name ?? forum.logistics.contactName}</p>
      </div>

      <div className="grid lg:grid-cols-2">
        <div className="p-5 sm:p-6 lg:border-r border-border">
          <p className="label-caps text-muted-foreground mb-3">Attendance and participant notes</p>
          <div className="flex flex-wrap gap-2">
            {RSVP_OPTIONS.map(option => <button type="button" key={option.value} onClick={() => { setStatus(option.value); setSaved(""); }} className={`h-8 px-3 rounded-md border text-xs font-medium ${status === option.value ? "border-[#B17E6B] bg-[#B17E6B]/10 text-[#7A5144]" : "border-border"}`}>{option.label}</button>)}
          </div>
          <textarea value={notes} onChange={event => { setNotes(event.target.value); setSaved(""); }} rows={3} placeholder="Dietary, accessibility, or registration notes" className="mt-3 w-full text-sm rounded-md border border-input bg-white px-3 py-2 placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none" />
          <button type="button" onClick={saveRegistration} className="mt-2 h-9 px-4 rounded-md border border-[#253855]/20 text-[#253855] text-sm font-medium hover:bg-[#253855]/5">Save registration</button>
        </div>

        <div className="p-5 sm:p-6">
          <p className="label-caps text-muted-foreground mb-3">Travel itinerary</p>
          <div className="grid sm:grid-cols-2 gap-3">
            <AssistantInput label="Arrival details" value={travel.arrivalDetails} onChange={value => setTravelField("arrivalDetails", value)} placeholder="Flight or train number" />
            <AssistantInput label="Arrival date and time" type="datetime-local" value={travel.arrivalDateTime} onChange={value => setTravelField("arrivalDateTime", value)} />
            <AssistantInput label="Departure details" value={travel.departureDetails} onChange={value => setTravelField("departureDetails", value)} placeholder="Flight or train number" />
            <AssistantInput label="Departure date and time" type="datetime-local" value={travel.departureDateTime} onChange={value => setTravelField("departureDateTime", value)} />
          </div>
          <button type="button" onClick={saveTravel} className="mt-3 h-9 px-4 rounded-md border border-[#253855]/20 text-[#253855] text-sm font-medium hover:bg-[#253855]/5">Save travel details</button>
        </div>
      </div>

      <div className="border-t border-border bg-[#253855]/[0.025] p-5 sm:p-6 grid sm:grid-cols-2 gap-5">
        <div>
          <p className="label-caps text-muted-foreground mb-2">Materials</p>
          <div className="space-y-2">
            {forum.materials.slice(0, 4).map(material => <a key={material.id} href={material.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs text-[#253855] hover:underline"><FileText className="w-3.5 h-3.5 text-[#B17E6B]" /><span className="min-w-0 flex-1 truncate">{material.title}</span><Eye className="w-3.5 h-3.5" /></a>)}
          </div>
        </div>
        <div>
          <p className="label-caps text-muted-foreground mb-2">Hotel and logistics</p>
          <p className="text-sm font-medium">{forum.logistics.hotel}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{forum.logistics.hotelAddress}</p>
          {forum.logistics.hotelCheckIn && <p className="text-xs text-muted-foreground mt-2">Check-in: {forum.logistics.hotelCheckIn}</p>}
          {forum.logistics.hotelCheckOut && <p className="text-xs text-muted-foreground">Check-out: {forum.logistics.hotelCheckOut}</p>}
        </div>
      </div>
      {saved && <p className="px-5 sm:px-6 py-3 border-t border-border text-xs text-green-700 flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" />{saved}</p>}
    </section>
  );
}

function AssistantInput({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; type?: string }) {
  return <label><span className="block text-[11px] font-medium text-muted-foreground mb-1">{label}</span><input type={type} value={value} onChange={event => onChange(event.target.value)} placeholder={placeholder} className="h-9 w-full rounded-md border border-input bg-white px-3 text-xs outline-none focus:ring-1 focus:ring-ring" /></label>;
}

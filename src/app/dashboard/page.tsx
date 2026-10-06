"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import { getAuth } from "@/lib/auth";
import { getForumsForMember, getMemberById, type Forum, type Member } from "@/lib/data";
import { getResolvedMember } from "@/lib/store";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, MapPin, Download, ChevronRight, Users } from "lucide-react";

function ForumCard({ forum }: { forum: Forum }) {
  const [open, setOpen] = useState(false);
  const isUpcoming = forum.status === "upcoming";

  const dateStr = new Intl.DateTimeFormat("en-GB", {
    day: "numeric", month: "long", year: "numeric",
  }).format(new Date(forum.date));

  return (
    <div className="bg-white rounded-lg border border-border overflow-hidden">
      {/* Header */}
      <div
        className="px-6 py-4 flex items-start justify-between cursor-pointer hover:bg-muted/30 transition-colors"
        onClick={() => setOpen(!open)}
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="label-caps text-gold">{forum.area}</span>
            {isUpcoming ? (
              <Badge className="bg-[#1e2b45] text-cream text-[10px] h-4 px-1.5 rounded">Upcoming</Badge>
            ) : (
              <Badge variant="secondary" className="text-[10px] h-4 px-1.5 rounded">Past</Badge>
            )}
          </div>
          <h3 className="font-garamond text-lg font-medium text-foreground leading-tight">{forum.title}</h3>
          <div className="flex items-center gap-4 mt-1.5 text-muted-foreground text-xs">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />{dateStr}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />{forum.location}
            </span>
          </div>
        </div>
        <ChevronRight className={`w-4 h-4 text-muted-foreground flex-shrink-0 mt-1 transition-transform ${open ? "rotate-90" : ""}`} />
      </div>

      {/* Expanded */}
      {open && (
        <div className="border-t border-border">
          {/* Tabs */}
          <ForumDetail forum={forum} />
        </div>
      )}
    </div>
  );
}

function ForumDetail({ forum }: { forum: Forum }) {
  const [tab, setTab] = useState<"agenda" | "materials" | "participants" | "logistics">("agenda");
  const tabs = [
    { id: "agenda" as const, label: "Agenda", show: forum.agenda.length > 0 },
    { id: "materials" as const, label: "Materials", show: forum.materials.length > 0 },
    { id: "participants" as const, label: "Participants", show: true },
    { id: "logistics" as const, label: "Logistics", show: true },
  ].filter(t => t.show);

  return (
    <div>
      {/* Tab bar */}
      <div className="flex border-b border-border px-6">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`py-3 mr-5 text-xs font-medium border-b-2 transition-colors ${
              tab === t.id
                ? "border-[#c8975e] text-[#1e2b45]"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="px-6 py-5">
        {tab === "agenda" && (
          <div className="space-y-4">
            {forum.agenda.map((item, i) => (
              <div key={i} className="flex gap-4">
                <span className="text-xs text-muted-foreground font-mono w-12 flex-shrink-0 pt-0.5">{item.time}</span>
                <div>
                  <p className="text-sm font-medium text-foreground">{item.title}</p>
                  {item.description && <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>}
                  {item.speaker && item.description && (
                    <p className="text-xs text-[#c8975e] mt-0.5">{item.speaker}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "materials" && (
          <div className="space-y-2">
            {forum.materials.map((mat) => (
              <div key={mat.id} className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
                <div>
                  <p className="text-sm text-foreground">{mat.title}</p>
                  <p className="text-xs text-muted-foreground capitalize">{mat.type} · {mat.size}</p>
                </div>
                <button className="flex items-center gap-1.5 text-xs text-[#1e2b45] hover:text-[#c8975e] font-medium transition-colors">
                  <Download className="w-3.5 h-3.5" />
                  Download
                </button>
              </div>
            ))}
          </div>
        )}

        {tab === "participants" && (
          <ParticipantList participantIds={forum.participants} />
        )}

        {tab === "logistics" && (
          <div className="space-y-3 text-sm">
            <div>
              <p className="label-caps text-muted-foreground mb-1">Venue</p>
              <p className="font-medium">{forum.logistics.hotel}</p>
              <p className="text-muted-foreground text-xs">{forum.logistics.hotelAddress}</p>
            </div>
            <Separator />
            <div>
              <p className="label-caps text-muted-foreground mb-1">Dress Code</p>
              <p>{forum.logistics.dressCode}</p>
            </div>
            <Separator />
            <div>
              <p className="label-caps text-muted-foreground mb-1">Your Cambridge Contact</p>
              <p className="font-medium">{forum.logistics.contactName}</p>
              <a href={`mailto:${forum.logistics.contactEmail}`} className="text-xs text-[#c8975e]">{forum.logistics.contactEmail}</a>
              <p className="text-xs text-muted-foreground">{forum.logistics.contactPhone}</p>
            </div>
            {forum.logistics.notes && (
              <>
                <Separator />
                <div>
                  <p className="label-caps text-muted-foreground mb-1">Notes</p>
                  <p className="text-muted-foreground text-xs leading-relaxed">{forum.logistics.notes}</p>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ParticipantList({ participantIds }: { participantIds: string[] }) {
  const participants = participantIds.map(id => getResolvedMember(id)).filter(Boolean) as Member[];

  return (
    <div className="space-y-2">
      {participants.map((p) => (
        <Link
          key={p.id}
          href={`/directory/${p.id}`}
          className="flex items-center gap-3 py-2 hover:bg-muted/40 rounded px-2 -mx-2 transition-colors group"
        >
          <div className="w-7 h-7 rounded-full bg-[#1e2b45]/10 flex items-center justify-center flex-shrink-0">
            <span className="text-[10px] font-semibold text-[#1e2b45]">{p.avatar}</span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground group-hover:text-[#c8975e] transition-colors">{p.name}</p>
            <p className="text-xs text-muted-foreground truncate">{p.title} · {p.organization}</p>
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
    const auth = getAuth();
    if (!auth) { router.replace("/"); return; }
    const m = getResolvedMember(auth.memberId);
    if (!m) { router.replace("/"); return; }
    setMember(m);
    setForums(getForumsForMember(auth.memberId));
  }, [router]);

  if (!member) return null;

  const upcoming = forums.filter(f => f.status === "upcoming");
  const past = forums.filter(f => f.status === "past");

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto px-6 py-10">
        {/* Greeting */}
        <div className="mb-8">
          <p className="label-caps text-[#c8975e] mb-1">My Forums</p>
          <h1 className="font-garamond text-3xl font-medium text-foreground">
            Good to see you, {member.name.split(" ")[0]}.
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Everything Cambridge has shared with you, in one place.
          </p>
        </div>

        {/* Upcoming */}
        {upcoming.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <h2 className="font-garamond text-xl font-medium">Upcoming Forums</h2>
              <span className="bg-[#1e2b45] text-cream text-[10px] px-1.5 py-0.5 rounded font-medium">{upcoming.length}</span>
            </div>
            <div className="space-y-3">
              {upcoming.map(f => <ForumCard key={f.id} forum={f} />)}
            </div>
          </section>
        )}

        {/* Past */}
        {past.length > 0 && (
          <section>
            <h2 className="font-garamond text-xl font-medium mb-3">Past Forums</h2>
            <div className="space-y-3">
              {past.map(f => <ForumCard key={f.id} forum={f} />)}
            </div>
          </section>
        )}

        {forums.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <Users className="w-8 h-8 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No forums on record for your account.</p>
          </div>
        )}
      </div>
    </AppShell>
  );
}

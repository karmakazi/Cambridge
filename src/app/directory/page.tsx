"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import { getAuth } from "@/lib/auth";
import { getAllResolvedMembers } from "@/lib/store";
import type { Member } from "@/lib/data";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, X, Globe, Building2 } from "lucide-react";

const PRACTICE_AREAS = [
  "Antitrust",
  "Compliance & Corporate Governance",
  "Corporate Law & Finance",
  "Dispute Resolution",
  "Enforcement",
  "ESG & Environmental Regulation",
  "Family Office",
  "Land Use Planning & Infrastructure",
  "Private Capital Markets",
  "Private Client",
  "Privacy, Data & Cyber Security",
];

const JURISDICTIONS = [
  "Asia-Pacific",
  "Canada",
  "Central & Eastern Europe",
  "European Union",
  "Germany",
  "Japan",
  "Latin America",
  "Middle East",
  "Nordic Countries",
  "United Kingdom",
  "United States",
  "West Africa",
];

export default function DirectoryPage() {
  const router = useRouter();
  const [members, setMembers] = useState<Member[]>([]);
  const [query, setQuery] = useState("");
  const [practice, setPractice] = useState("");
  const [jurisdiction, setJurisdiction] = useState("");

  useEffect(() => {
    const auth = getAuth();
    if (!auth) { router.replace("/"); return; }
    const all = getAllResolvedMembers().filter(m => m.discoverable);
    setMembers(all);
  }, [router]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return members.filter(m => {
      const matchQuery = !q || [
        m.name, m.organization, m.title, m.location,
        ...m.expertise,
      ].some(s => s.toLowerCase().includes(q));
      const matchPractice = !practice || m.practiceArea === practice;
      const matchJurisdiction = !jurisdiction || m.jurisdiction === jurisdiction;
      return matchQuery && matchPractice && matchJurisdiction;
    });
  }, [members, query, practice, jurisdiction]);

  const activeFilters = [practice, jurisdiction].filter(Boolean);

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-6">
          <p className="label-caps text-[#c8975e] mb-1">Member Directory</p>
          <h1 className="font-garamond text-3xl font-medium text-foreground">
            Find the right person.
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {members.length} members across {new Set(members.map(m => m.jurisdiction)).size} jurisdictions.
          </p>
        </div>

        {/* Search + filters */}
        <div className="space-y-3 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, firm, expertise…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="pl-9 bg-white"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            <select
              value={practice}
              onChange={e => setPractice(e.target.value)}
              className="h-9 px-3 text-sm rounded-md border border-border bg-white text-foreground focus:ring-0 focus:outline-none focus:border-[#c8975e]"
            >
              <option value="">All Practice Areas</option>
              {PRACTICE_AREAS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>

            <select
              value={jurisdiction}
              onChange={e => setJurisdiction(e.target.value)}
              className="h-9 px-3 text-sm rounded-md border border-border bg-white text-foreground focus:ring-0 focus:outline-none focus:border-[#c8975e]"
            >
              <option value="">All Jurisdictions</option>
              {JURISDICTIONS.map(j => <option key={j} value={j}>{j}</option>)}
            </select>

            {activeFilters.length > 0 && (
              <button
                onClick={() => { setPractice(""); setJurisdiction(""); }}
                className="h-9 px-3 text-xs flex items-center gap-1.5 text-muted-foreground hover:text-foreground border border-border rounded-md bg-white"
              >
                <X className="w-3 h-3" /> Clear filters
              </button>
            )}
          </div>
        </div>

        {/* Results count */}
        <p className="text-xs text-muted-foreground mb-4">
          {filtered.length} {filtered.length === 1 ? "member" : "members"} found
        </p>

        {/* Member grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered.map(m => (
            <MemberCard key={m.id} member={m} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <Search className="w-8 h-8 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No members match your search.</p>
            <button
              onClick={() => { setQuery(""); setPractice(""); setJurisdiction(""); }}
              className="mt-2 text-xs text-[#c8975e] hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </AppShell>
  );
}

function MemberCard({ member: m }: { member: Member }) {
  return (
    <Link
      href={`/directory/${m.id}`}
      className="bg-white rounded-lg border border-border p-4 hover:border-[#c8975e]/50 hover:bg-[#c8975e]/[0.02] transition-all group"
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-[#1e2b45]/10 flex items-center justify-center flex-shrink-0">
          <span className="text-xs font-semibold text-[#1e2b45]">{m.avatar}</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-1">
            <p className="font-medium text-sm text-foreground group-hover:text-[#c8975e] transition-colors leading-tight">{m.name}</p>
            {m.steeringCommittee && (
              <Badge className="bg-[#c8975e]/10 text-[#c8975e] text-[9px] px-1 h-4 flex-shrink-0 border-0 font-medium">SC</Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">{m.title}</p>
          <p className="text-xs text-muted-foreground truncate">{m.organization}</p>
          <div className="flex items-center gap-3 mt-2">
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <Globe className="w-3 h-3" />{m.jurisdiction}
            </span>
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            {m.expertise.slice(0, 2).map(e => (
              <span key={e} className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded">{e}</span>
            ))}
            {m.expertise.length > 2 && (
              <span className="text-[10px] text-muted-foreground px-1.5 py-0.5">+{m.expertise.length - 2}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

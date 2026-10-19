"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import { getAuth } from "@/lib/auth";
import type { Forum, Member } from "@/lib/data";
import {
  getDirectoryForums,
  getDirectoryMembers,
  getMemberTenure,
  type DirectoryScope,
} from "@/lib/prototype-service";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Globe, Mail, Phone, Search, X } from "lucide-react";

const PRACTICE_AREAS = [
  "Antitrust", "Compliance & Corporate Governance", "Corporate Law & Finance",
  "Dispute Resolution", "Enforcement", "ESG & Environmental Regulation",
  "Family Office", "Land Use Planning & Infrastructure", "Private Capital Markets",
  "Private Client", "Privacy, Data & Cyber Security",
];

const JURISDICTIONS = [
  "Asia-Pacific", "Canada", "Central & Eastern Europe", "European Union", "Germany",
  "Japan", "Latin America", "Middle East", "Nordic Countries", "United Kingdom",
  "United States", "West Africa",
];

export default function DirectoryPage() {
  const router = useRouter();
  const [currentMemberId, setCurrentMemberId] = useState("");
  const [forums, setForums] = useState<Forum[]>([]);
  const [scope, setScope] = useState<DirectoryScope>("network");
  const [forumId, setForumId] = useState("");
  const [query, setQuery] = useState("");
  const [practice, setPractice] = useState("");
  const [jurisdiction, setJurisdiction] = useState("");

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      const auth = getAuth();
      if (!auth) { router.replace("/"); return; }
      setCurrentMemberId(auth.memberId);
      setForums(getDirectoryForums(auth.memberId));
    });
    return () => { cancelled = true; };
  }, [router]);

  const members = useMemo(
    () => currentMemberId ? getDirectoryMembers(currentMemberId, scope, forumId) : [],
    [currentMemberId, scope, forumId],
  );

  const filtered = useMemo(() => {
    const normalizedQuery = query.toLowerCase();
    return members.filter(member => {
      const matchesQuery = !normalizedQuery || [
        member.name, member.organization, member.title, member.location, ...member.expertise,
      ].some(value => value.toLowerCase().includes(normalizedQuery));
      const matchesPractice = !practice || member.practiceArea === practice;
      const matchesJurisdiction = !jurisdiction || member.jurisdiction === jurisdiction;
      return matchesQuery && matchesPractice && matchesJurisdiction;
    });
  }, [members, query, practice, jurisdiction]);

  const activeFilters = [forumId, practice, jurisdiction].filter(Boolean);

  function clearFilters() {
    setForumId("");
    setPractice("");
    setJurisdiction("");
  }

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="mb-6">
          <p className="label-caps text-[#c8975e] mb-1">Member Directory</p>
          <h1 className="font-garamond text-3xl font-medium text-foreground">Find the right person.</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Start with people in your forums, or explore the wider Cambridge network.
          </p>
        </div>

        <div className="inline-flex p-1 mb-5 bg-muted rounded-lg" aria-label="Directory scope">
          {([
            ["network", "My Forum Network"],
            ["all", "All Cambridge Members"],
          ] as Array<[DirectoryScope, string]>).map(([value, label]) => (
            <button
              type="button"
              key={value}
              onClick={() => { setScope(value); setForumId(""); }}
              className={`h-8 px-3 rounded-md text-xs font-medium transition-colors ${
                scope === value ? "bg-white text-[#1e2b45] shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >{label}</button>
          ))}
        </div>

        <div className="space-y-3 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              aria-label="Search members"
              placeholder="Search by name, firm, expertise…"
              value={query}
              onChange={event => setQuery(event.target.value)}
              className="pl-9 bg-white"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            <select
              aria-label="Filter by forum"
              value={forumId}
              onChange={event => setForumId(event.target.value)}
              className="h-9 px-3 text-sm rounded-md border border-border bg-white text-foreground focus:outline-none focus:border-[#c8975e]"
            >
              <option value="">All my forums</option>
              {forums.map(forum => <option key={forum.id} value={forum.id}>{forum.title}</option>)}
            </select>

            <select
              aria-label="Filter by practice area"
              value={practice}
              onChange={event => setPractice(event.target.value)}
              className="h-9 px-3 text-sm rounded-md border border-border bg-white text-foreground focus:outline-none focus:border-[#c8975e]"
            >
              <option value="">All Practice Areas</option>
              {PRACTICE_AREAS.map(value => <option key={value} value={value}>{value}</option>)}
            </select>

            <select
              aria-label="Filter by jurisdiction"
              value={jurisdiction}
              onChange={event => setJurisdiction(event.target.value)}
              className="h-9 px-3 text-sm rounded-md border border-border bg-white text-foreground focus:outline-none focus:border-[#c8975e]"
            >
              <option value="">All Jurisdictions</option>
              {JURISDICTIONS.map(value => <option key={value} value={value}>{value}</option>)}
            </select>

            {activeFilters.length > 0 && (
              <button type="button" onClick={clearFilters} className="h-9 px-3 text-xs flex items-center gap-1.5 text-muted-foreground hover:text-foreground border border-border rounded-md bg-white">
                <X className="w-3 h-3" />Clear filters
              </button>
            )}
          </div>
        </div>

        <p className="text-xs text-muted-foreground mb-4">
          {filtered.length} {filtered.length === 1 ? "member" : "members"} found
          {scope === "network" ? " in your forum network" : " across Cambridge"}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered.map(member => <MemberCard key={member.id} member={member} />)}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <Search className="w-8 h-8 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No members match your search.</p>
            <button type="button" onClick={() => { setQuery(""); clearFilters(); }} className="mt-2 text-xs text-[#9a6a33] hover:underline">Clear all filters</button>
          </div>
        )}
      </div>
    </AppShell>
  );
}

function MemberCard({ member }: { member: Member }) {
  const tenure = getMemberTenure(member);
  return (
    <article className="bg-white rounded-lg border border-border p-4 hover:border-[#c8975e]/50 hover:bg-[#c8975e]/[0.02] transition-all group">
      <div className="flex items-start gap-3">
        <Link href={`/directory/${member.id}`} aria-label={`View ${member.name}'s profile`} className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-[#1e2b45]/10">
          {member.photo ? (
            <img src={member.photo} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="w-full h-full flex items-center justify-center text-xs font-semibold text-[#1e2b45]">{member.avatar}</span>
          )}
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <Link href={`/directory/${member.id}`} className="font-medium text-sm text-foreground group-hover:text-[#9a6a33] transition-colors leading-tight hover:underline">{member.name}</Link>
            <div className="flex items-center gap-1 flex-shrink-0">
              {tenure.count > 0 && <Badge className="bg-[#1e2b45]/[0.07] text-[#1e2b45] text-[9px] px-1.5 h-4 border-0 font-medium">{tenure.count}-time participant</Badge>}
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">{member.title}</p>
          <p className="text-xs text-muted-foreground truncate">{member.organization}</p>
          <span className="flex items-center gap-1 text-[10px] text-muted-foreground mt-2"><Globe className="w-3 h-3" />{member.jurisdiction}</span>

          <div className="mt-2 space-y-1">
            {member.contactPreference === "email" && (
              <>
                {member.contactEmail && (
                  <a href={`mailto:${member.contactEmail}`} className="flex items-center gap-1.5 text-[11px] text-[#9a6a33] hover:underline truncate max-w-full">
                    <Mail className="w-3 h-3 flex-shrink-0" /><span className="truncate">{member.contactEmail}</span>
                  </a>
                )}
                {member.phone && (
                  <a href={`tel:${member.phone}`} className="flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground transition-colors">
                    <Phone className="w-3 h-3 flex-shrink-0" />{member.phone}
                  </a>
                )}
              </>
            )}
            {member.contactPreference === "request-intro" && (
              <a
                href={`mailto:webhelp@cambridgeforums.com?subject=${encodeURIComponent(`Introduction request: ${member.name}`)}`}
                className="inline-flex items-center gap-1.5 text-[11px] text-[#1e2b45] font-medium border border-[#1e2b45]/20 px-2 py-1 rounded hover:bg-[#1e2b45]/5 transition-colors mt-1"
              ><Mail className="w-3 h-3 flex-shrink-0" />Request introduction</a>
            )}
          </div>

          <div className="flex flex-wrap gap-1 mt-2">
            {member.expertise.slice(0, 2).map(value => <span key={value} className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded">{value}</span>)}
            {member.expertise.length > 2 && <span className="text-[10px] text-muted-foreground px-1.5 py-0.5">+{member.expertise.length - 2}</span>}
          </div>
        </div>
      </div>
    </article>
  );
}

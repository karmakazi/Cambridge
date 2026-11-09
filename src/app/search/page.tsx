"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import { getAuth } from "@/lib/auth";
import { FORUMS } from "@/lib/data";
import { getExchangePosts } from "@/lib/member-qa";
import { getAllResolvedMembers } from "@/lib/store";
import { BriefcaseBusiness, FileText, MessageCircle, Search, UserRound, Users } from "lucide-react";

type Tab = "all" | "people" | "team" | "forums" | "exchange" | "resources";

export default function SearchPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<Tab>("all");

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      if (!getAuth()) { router.replace("/"); return; }
      setQuery(new URLSearchParams(window.location.search).get("q") ?? "");
      setReady(true);
    });
    return () => { cancelled = true; };
  }, [router]);

  const q = query.trim().toLowerCase();
  const allMembers = useMemo(() => getAllResolvedMembers(), []);
  const people = useMemo(() => !q ? [] : allMembers.filter(member => !member.isCambridgeStaff && `${member.name} ${member.organization} ${member.title} ${member.location} ${member.expertise.join(" ")} ${(member.interests ?? []).join(" ")}`.toLowerCase().includes(q)), [allMembers, q]);
  const team = useMemo(() => !q ? [] : allMembers.filter(member => member.isCambridgeStaff && `${member.name} ${member.organization} ${member.title} ${member.location} ${member.expertise.join(" ")} ${(member.interests ?? []).join(" ")}`.toLowerCase().includes(q)), [allMembers, q]);
  const forums = useMemo(() => !q ? [] : FORUMS.filter(forum => `${forum.title} ${forum.area} ${forum.editionYear} ${forum.location} ${forum.venue} ${forum.agenda.map(item => `${item.title} ${item.description} ${(item.topics ?? []).join(" ")}`).join(" ")}`.toLowerCase().includes(q)), [q]);
  const posts = useMemo(() => !q ? [] : getExchangePosts().filter(post => `${post.title} ${post.body} ${post.authorName} ${post.forumSeries} ${post.year} ${post.topics.join(" ")}`.toLowerCase().includes(q)), [q]);
  const resources = useMemo(() => !q ? [] : FORUMS.flatMap(forum => forum.materials.map(material => ({ material, forum }))).filter(({ material, forum }) => `${material.title} ${material.type} ${forum.title} ${forum.editionYear}`.toLowerCase().includes(q)), [q]);

  if (!ready) return null;
  const total = people.length + team.length + forums.length + posts.length + resources.length;
  const tabs: Array<[Tab, string, number]> = [["all", "All", total], ["people", "People", people.length], ["team", "Cambridge Team", team.length], ["forums", "Forums", forums.length], ["exchange", "Member Exchange", posts.length], ["resources", "Resources", resources.length]];

  return <AppShell><div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
    <p className="label-caps text-[#B17E6B] mb-1">Universal Search</p><h1 className="font-garamond text-3xl font-medium">Search across Cambridge.</h1><p className="text-sm text-muted-foreground mt-1">Find people, Cambridge Team contacts, Forums, conversations, and resources without needing to know where they live.</p>
    <div className="relative mt-6"><Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground"/><input autoFocus value={query} onChange={event => setQuery(event.target.value)} placeholder="Try a person, year, topic, firm, Forum, or document…" className="h-12 w-full rounded-lg border border-border bg-white pl-12 pr-4 text-base shadow-sm"/></div>
    <div className="flex gap-1 mt-5 border-b border-border overflow-x-auto">{tabs.map(([value,label,count]) => <button key={value} onClick={() => setTab(value)} className={`whitespace-nowrap px-3 py-2 text-sm font-medium border-b-2 ${tab===value?"border-[#B17E6B] text-[#253855]":"border-transparent text-muted-foreground"}`}>{label}{q&&<span className="ml-1 text-xs">{count}</span>}</button>)}</div>
    {!q ? <div className="py-16 text-center text-muted-foreground"><Search className="w-8 h-8 mx-auto mb-3 opacity-30"/><p className="text-sm">Search across the member network, Cambridge Team, Forums, Member Exchange, and Forum materials.</p></div> : <div className="mt-6 space-y-6">
      {(tab==="all"||tab==="people")&&people.length>0&&<ResultGroup title="People" icon={<UserRound className="w-4 h-4"/>}>{people.map(member=><Link key={member.id} href={`/directory/${member.id}`} className="block bg-white border border-border rounded-lg p-4 hover:border-[#B17E6B]"><p className="text-sm font-medium">{member.publishedName||member.name}</p><p className="text-xs text-muted-foreground">{member.title} · {member.organization} · {member.location}</p></Link>)}</ResultGroup>}
      {(tab==="all"||tab==="team")&&team.length>0&&<ResultGroup title="Cambridge Team" icon={<Users className="w-4 h-4"/>}>{team.map(member=><Link key={member.id} href={`/directory/${member.id}`} className="block bg-[#B17E6B]/[0.045] border border-[#B17E6B]/30 rounded-lg p-4 hover:border-[#B17E6B]"><p className="text-sm font-medium">{member.name}</p><p className="text-xs text-muted-foreground">{member.title} · Cambridge Forums</p></Link>)}</ResultGroup>}
      {(tab==="all"||tab==="forums")&&forums.length>0&&<ResultGroup title="Forums" icon={<BriefcaseBusiness className="w-4 h-4"/>}>{forums.map(forum=><Link key={forum.id} href={`/dashboard#forum-${forum.id}`} className="block bg-white border border-border rounded-lg p-4 hover:border-[#B17E6B]"><p className="text-sm font-medium">{forum.title.replace(/^Cambridge Forum on /, "")}</p><p className="text-xs text-muted-foreground">{forum.editionYear} · {forum.location} · {forum.agenda.length} agenda items</p></Link>)}</ResultGroup>}
      {(tab==="all"||tab==="exchange")&&posts.length>0&&<ResultGroup title="Member Exchange" icon={<MessageCircle className="w-4 h-4"/>}>{posts.map(post=><Link key={post.id} href={`/member-exchange#discussion-${post.id}`} className="block bg-white border border-border rounded-lg p-4 hover:border-[#B17E6B]"><p className="text-sm font-medium">{post.title}</p><p className="text-xs text-muted-foreground">{post.authorName} · {post.year} · {post.topics.join(" · ")}</p></Link>)}</ResultGroup>}
      {(tab==="all"||tab==="resources")&&resources.length>0&&<ResultGroup title="Resources" icon={<FileText className="w-4 h-4"/>}>{resources.map(({material,forum})=><a key={material.id} href={material.url} target="_blank" rel="noreferrer" className="block bg-white border border-border rounded-lg p-4 hover:border-[#B17E6B]"><p className="text-sm font-medium">{material.title}</p><p className="text-xs text-muted-foreground">{forum.title.replace(/^Cambridge Forum on /, "")} · {forum.editionYear}{material.access?` · Requires ${material.access.publication} subscription`:""}</p></a>)}</ResultGroup>}
      {total===0&&<p className="py-14 text-center text-sm text-muted-foreground">No results found. Try a broader term.</p>}
    </div>}
  </div></AppShell>;
}

function ResultGroup({title,icon,children}:{title:string;icon:React.ReactNode;children:React.ReactNode}) { return <section><h2 className="mb-3 flex items-center gap-2 font-medium text-sm text-[#253855]">{icon}{title}</h2><div className="space-y-2">{children}</div></section>; }

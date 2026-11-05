"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import { getAuth } from "@/lib/auth";
import { FORUMS } from "@/lib/data";
import { getExchangePosts } from "@/lib/member-qa";
import { getResolvedMember } from "@/lib/store";
import { getSavedExchangePostIds, getSavedMaterialIds, toggleSavedExchangePost, toggleSavedMaterial } from "@/lib/saved-items";
import { Bookmark, ExternalLink, FileText, MessageCircle, Search } from "lucide-react";

export default function LibraryPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [memberId, setMemberId] = useState("");
  const [tab, setTab] = useState<"materials" | "exchange">("materials");
  const [query, setQuery] = useState("");
  const [materialIds, setMaterialIds] = useState<string[]>([]);
  const [postIds, setPostIds] = useState<string[]>([]);
  useEffect(() => { let cancelled = false; queueMicrotask(() => { if (cancelled) return; const auth = getAuth(); if (!auth) { router.replace("/"); return; } setReady(Boolean(getResolvedMember(auth.memberId))); setMemberId(auth.memberId); setMaterialIds(getSavedMaterialIds()); setPostIds(getSavedExchangePostIds()); }); return () => { cancelled = true; }; }, [router]);
  const materials = useMemo(() => FORUMS.filter(forum => forum.participants.includes(memberId)).flatMap(forum => forum.materials.map(material => ({ material, forum }))).filter(({ material }) => materialIds.includes(material.id) && material.title.toLowerCase().includes(query.toLowerCase())), [materialIds, query, memberId]);
  const posts = useMemo(() => getExchangePosts().filter(post => postIds.includes(post.id) && `${post.title} ${post.body} ${post.authorName} ${post.topics.join(" ")}`.toLowerCase().includes(query.toLowerCase())), [postIds, query]);
  if (!ready) return null;
  return <AppShell><div className="max-w-4xl mx-auto px-6 py-10">
    <p className="label-caps text-[#B17E6B] mb-1">Personal Resource Library</p><h1 className="font-garamond text-3xl font-medium">Everything you saved, in one place.</h1><p className="text-sm text-muted-foreground mt-1">Keep useful Forum reading and Member Exchange discussions close at hand over time.</p>
    <div className="relative mt-6"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"/><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search your library…" className="h-10 w-full rounded-md border border-border bg-white pl-9 pr-3 text-sm"/></div>
    <div className="flex gap-1 mt-5 border-b border-border">{([['materials','Reading materials',materials.length],['exchange','Member Exchange',posts.length]] as const).map(([value,label,count]) => <button key={value} onClick={() => setTab(value)} className={`px-3 py-2 text-sm font-medium border-b-2 ${tab===value?'border-[#B17E6B] text-[#253855]':'border-transparent text-muted-foreground'}`}>{label} <span className="text-xs">({count})</span></button>)}</div>
    <div className="mt-5 space-y-3">{tab === "materials" ? materials.map(({material,forum}) => <article key={material.id} className="bg-white border border-border rounded-lg p-4 flex items-start justify-between gap-4"><div><div className="flex items-center gap-2"><FileText className="w-4 h-4 text-[#8A5E50]"/><h2 className="text-sm font-medium">{material.title}</h2></div><p className="text-xs text-muted-foreground mt-1">{forum.title} · {forum.editionYear}</p>{material.access && <p className="text-[11px] text-[#8A5E50] mt-1">Requires subscription to {material.access.publication}</p>}<a href={material.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-[#8A5E50] mt-2 hover:underline">Open <ExternalLink className="w-3 h-3"/></a></div><button onClick={() => setMaterialIds(toggleSavedMaterial(material.id))} className="text-[#8A5E50] p-1" aria-label="Remove from library"><Bookmark className="w-4 h-4 fill-current"/></button></article>) : posts.map(post => <article key={post.id} className="bg-white border border-border rounded-lg p-4 flex items-start justify-between gap-4"><div><div className="flex items-center gap-2"><MessageCircle className="w-4 h-4 text-[#8A5E50]"/><h2 className="text-sm font-medium">{post.title}</h2></div><p className="text-xs text-muted-foreground mt-1">{post.authorName} · {post.year} · {post.replies.length} responses</p><p className="text-sm text-muted-foreground mt-2 line-clamp-2">{post.body}</p><Link href="/member-exchange" className="inline-block text-xs text-[#8A5E50] mt-2 hover:underline">View discussion</Link></div><button onClick={() => setPostIds(toggleSavedExchangePost(post.id))} className="text-[#8A5E50] p-1" aria-label="Remove from library"><Bookmark className="w-4 h-4 fill-current"/></button></article>)}</div>
    {((tab === "materials" && !materials.length) || (tab === "exchange" && !posts.length)) && <div className="py-16 text-center text-muted-foreground"><Bookmark className="w-7 h-7 mx-auto mb-2 opacity-40"/><p className="text-sm">No saved items match this view yet.</p></div>}
  </div></AppShell>;
}

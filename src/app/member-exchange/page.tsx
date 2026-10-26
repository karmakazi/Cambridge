"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { getAuth } from "@/lib/auth";
import { getMemberById, type Member } from "@/lib/data";
import { getResolvedMember } from "@/lib/store";
import {
  addReply, canAccessMemberExchange, canModerateMemberExchange, createExchangePost,
  deletePost, deleteReply, editPost, editReply, getExchangePosts, togglePinnedPost,
  type QAPost,
} from "@/lib/member-qa";
import {
  Bell, ChevronDown, ChevronUp, Edit3, LockKeyhole, MessageSquarePlus, Pin, PinOff, Reply, Search,
  Send, Settings, Trash2, UsersRound, X,
} from "lucide-react";

type Sort = "activity" | "newest" | "discussed";

const stamp = (value: string) => new Intl.DateTimeFormat("en-CA", {
  month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit",
}).format(new Date(value));

const activity = (post: QAPost) => post.replies.reduce(
  (latest, reply) => reply.createdAt > latest ? reply.createdAt : latest,
  post.createdAt,
);

function Avatar({ id, name }: { id: string; name: string }) {
  const photo = getMemberById(id)?.photo;
  const initials = name.split(" ").map(part => part[0]).join("").slice(0, 2).toUpperCase();
  return <div className="w-9 h-9 rounded-full overflow-hidden bg-[#253855] text-cream flex items-center justify-center text-xs font-semibold flex-shrink-0">
    {photo ? <img src={photo} alt="" className="w-full h-full object-cover" /> : initials}
  </div>;
}

export default function MemberExchangePage() {
  const router = useRouter();
  const [member, setMember] = useState<Member | null>(null);
  const [moderator, setModerator] = useState(false);
  const [posts, setPosts] = useState<QAPost[]>([]);
  const [query, setQuery] = useState("");
  const [person, setPerson] = useState("all");
  const [topic, setTopic] = useState("all");
  const [year, setYear] = useState("all");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState<Sort>("activity");
  const [composerOpen, setComposerOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [topics, setTopics] = useState("");
  const [postYear, setPostYear] = useState("2026");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyBody, setReplyBody] = useState("");
  const [editingPost, setEditingPost] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");
  const [editingReply, setEditingReply] = useState<string | null>(null);
  const [editReplyBody, setEditReplyBody] = useState("");
  const [notice, setNotice] = useState("");

  const refresh = () => setPosts(getExchangePosts());

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      const auth = getAuth();
      if (!auth) { router.replace("/"); return; }
      const resolved = getResolvedMember(auth.memberId);
      if (!resolved || !canAccessMemberExchange(resolved, auth.email)) { router.replace("/dashboard"); return; }
      setMember(resolved);
      setModerator(canModerateMemberExchange(auth.email));
      setPosts(getExchangePosts());
    });
    return () => { cancelled = true; };
  }, [router]);

  const people = useMemo(() => Array.from(new Set(posts.flatMap(post => [post.authorName, ...post.replies.map(reply => reply.authorName)]))).sort(), [posts]);
  const availableTopics = useMemo(() => Array.from(new Set(posts.flatMap(post => post.topics))).sort(), [posts]);
  const years = useMemo(() => Array.from(new Set(posts.map(post => post.year))).sort((a, b) => b - a), [posts]);
  const popularTopics = useMemo(() => {
    const counts = new Map<string, number>();
    posts.flatMap(post => post.topics).forEach(item => counts.set(item, (counts.get(item) ?? 0) + 1));
    return [...counts].sort((a, b) => b[1] - a[1]).slice(0, 6).map(([item]) => item);
  }, [posts]);

  const visiblePosts = useMemo(() => {
    const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
    return posts.filter(post => {
      const haystack = [post.title, post.body, post.authorName, post.authorOrganization, post.year,
        post.forumSeries, ...post.topics, ...post.replies.flatMap(reply => [reply.authorName, reply.authorOrganization, reply.body])]
        .filter(Boolean).join(" ").toLowerCase();
      return terms.every(term => haystack.includes(term))
        && (person === "all" || post.authorName === person || post.replies.some(reply => reply.authorName === person))
        && (topic === "all" || post.topics.includes(topic))
        && (year === "all" || post.year === Number(year))
        && (status === "all" || status === "unanswered" && post.replies.length === 0 || status === "pinned" && post.pinned);
    }).sort((a, b) => {
      const pinned = Number(Boolean(b.pinned)) - Number(Boolean(a.pinned));
      if (pinned) return pinned;
      if (sort === "newest") return b.createdAt.localeCompare(a.createdAt);
      if (sort === "discussed") return b.replies.length - a.replies.length;
      return activity(b).localeCompare(activity(a));
    });
  }, [person, posts, query, sort, status, topic, year]);

  if (!member) return null;
  const digestOn = member.notifyQaDigest ?? true;
  const immediateNotificationsOn = (member.notifyQaNewPosts ?? false) || (member.notifyQaReplies ?? false) || (member.notifyQaMentions ?? false);
  const filtered = Boolean(query) || [person, topic, year, status].some(value => value !== "all");
  const clearFilters = () => { setQuery(""); setPerson("all"); setTopic("all"); setYear("all"); setStatus("all"); };

  function submitPost() {
    if (!title.trim() || !body.trim()) return;
    createExchangePost(member!, title, body, topics.split(","), Number(postYear));
    setTitle(""); setBody(""); setTopics(""); setComposerOpen(false); setNotice("Your discussion has been posted."); refresh();
  }

  function submitReply(postId: string) {
    if (!replyBody.trim()) return;
    addReply(postId, member!, replyBody); setReplyBody(""); setReplyingTo(null); setNotice("Your reply has been posted."); refresh();
  }

  return <AppShell>
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <header className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
        <div><div className="flex items-center gap-2 flex-wrap mb-2"><span className="label-caps text-[#B17E6B]">Member Exchange</span><Badge className="bg-[#253855]/[0.07] text-[#253855] border-0 text-[10px]">Members only</Badge>{moderator && <Badge className="bg-[#B17E6B]/15 text-[#7A5144] border-0 text-[10px]">Moderator</Badge>}</div><h1 className="font-garamond text-3xl sm:text-4xl font-medium leading-tight">Conversations that continue between Forums.</h1><p className="text-sm text-muted-foreground mt-2 max-w-3xl">Ask questions, exchange practical insight, and reconnect with Cambridge members throughout the year.</p></div>
        <Link href="/profile#notifications" className="h-9 px-3 rounded-md border border-[#253855]/20 bg-white text-xs font-medium text-[#253855] inline-flex items-center gap-1.5 hover:bg-[#253855]/5 self-start"><Bell className="w-3.5 h-3.5" />{immediateNotificationsOn ? "Immediate alerts on" : digestOn ? "Weekly digest" : "Notifications off"}</Link>
      </header>
      {notice && <div className="mb-4 px-4 py-3 rounded-md bg-[#eef5ef] border border-[#c9ddcc] text-sm text-[#355d3c] flex justify-between gap-3"><span>{notice}</span><button onClick={() => setNotice("")} aria-label="Dismiss"><X className="w-4 h-4" /></button></div>}

      <section className="bg-white border border-border rounded-lg p-4 sm:p-5 mb-5" aria-label="Search discussions">
        <label htmlFor="exchange-search" className="label-caps text-muted-foreground block mb-2">Search the exchange</label>
        <div className="relative mb-3"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><input id="exchange-search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search discussions, people, firms, years, or topics…" className="w-full h-11 rounded-md border border-input bg-background pl-10 pr-3 text-sm" /></div>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-2">
          <select aria-label="Filter by person" value={person} onChange={event => setPerson(event.target.value)} className="filter-select"><option value="all">All people</option>{people.map(item => <option key={item}>{item}</option>)}</select>
          <select aria-label="Filter by topic" value={topic} onChange={event => setTopic(event.target.value)} className="filter-select"><option value="all">All topics</option>{availableTopics.map(item => <option key={item}>{item}</option>)}</select>
          <select aria-label="Filter by year" value={year} onChange={event => setYear(event.target.value)} className="filter-select"><option value="all">All years</option>{years.map(item => <option key={item}>{item}</option>)}</select>
          <select aria-label="Filter by status" value={status} onChange={event => setStatus(event.target.value)} className="filter-select"><option value="all">All discussions</option><option value="unanswered">Unanswered</option><option value="pinned">Pinned</option></select>
          <select aria-label="Sort discussions" value={sort} onChange={event => setSort(event.target.value as Sort)} className="filter-select col-span-2 lg:col-span-1"><option value="activity">Recent activity</option><option value="newest">Newest posts</option><option value="discussed">Most discussed</option></select>
        </div>
        <div className="flex items-center justify-between gap-3 mt-3 text-xs text-muted-foreground"><span>{visiblePosts.length} {visiblePosts.length === 1 ? "discussion" : "discussions"}</span>{filtered && <button onClick={clearFilters} className="text-[#8A5E50] font-medium hover:underline">Clear filters</button>}</div>
      </section>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_260px] gap-6">
        <main className="min-w-0">
          <section className="bg-white border border-border rounded-lg p-4 mb-4">
            {!composerOpen ? <button onClick={() => setComposerOpen(true)} className="w-full flex items-center justify-between gap-3 text-left"><div><p className="text-sm font-medium">Start a discussion</p><p className="text-xs text-muted-foreground mt-0.5">Ask the community a question or share something useful.</p></div><span className="h-9 px-3 rounded-md bg-[#253855] text-cream text-xs font-medium inline-flex items-center gap-1.5 flex-shrink-0"><MessageSquarePlus className="w-3.5 h-3.5" />New discussion</span></button> :
              <div className="space-y-3"><Field label="Title"><input value={title} onChange={event => setTitle(event.target.value)} placeholder="Give your discussion a clear title" className="field" /></Field><Field label="Message"><textarea value={body} onChange={event => setBody(event.target.value)} rows={4} placeholder="Add useful context without including confidential client information." className="field py-2 h-auto" /></Field><div className="grid sm:grid-cols-[minmax(0,1fr)_120px] gap-3"><Field label="Topics"><input value={topics} onChange={event => setTopics(event.target.value)} placeholder="e.g. Mediation, Referrals" className="field" /></Field><Field label="Year"><select value={postYear} onChange={event => setPostYear(event.target.value)} className="field">{[2026, 2025, 2024, 2023].map(item => <option key={item}>{item}</option>)}</select></Field></div><p className="text-[11px] text-muted-foreground -mt-2">Separate multiple topics with commas.</p><div className="flex gap-2 justify-end"><button onClick={() => setComposerOpen(false)} className="secondary-btn">Cancel</button><button onClick={submitPost} disabled={!title.trim() || !body.trim()} className="primary-btn"><Send className="w-3.5 h-3.5" />Post discussion</button></div></div>}
          </section>
          <div className="space-y-4">{visiblePosts.map(post => <Discussion key={post.id} post={post} member={member} moderator={moderator} replyingTo={replyingTo} replyBody={replyBody} editingPost={editingPost} editTitle={editTitle} editBody={editBody} editingReply={editingReply} editReplyBody={editReplyBody} setReplyingTo={setReplyingTo} setReplyBody={setReplyBody} setEditingPost={setEditingPost} setEditTitle={setEditTitle} setEditBody={setEditBody} setEditingReply={setEditingReply} setEditReplyBody={setEditReplyBody} submitReply={submitReply} refresh={refresh} />)}{visiblePosts.length === 0 && <div className="bg-white border border-border rounded-lg p-8 text-center"><Search className="w-7 h-7 mx-auto text-muted-foreground mb-2" /><p className="font-medium text-sm">No discussions match those filters.</p><button onClick={clearFilters} className="text-xs text-[#8A5E50] mt-2 hover:underline">Clear filters</button></div>}</div>
        </main>
        <aside className="space-y-4"><div className="bg-white border border-border rounded-lg p-4"><UsersRound className="w-5 h-5 text-[#B17E6B] mb-2" /><h2 className="font-garamond text-lg font-semibold">How it works</h2><p className="text-xs text-muted-foreground leading-relaxed mt-1">This is a private, year-round exchange for Cambridge members and staff. Search by person, firm, year, or topic to find earlier conversations.</p><div className="flex items-center gap-1.5 mt-3 text-[11px] text-muted-foreground"><LockKeyhole className="w-3 h-3" />Do not share confidential client information.</div></div><div className="bg-white border border-border rounded-lg p-4"><h2 className="label-caps text-muted-foreground mb-3">Browse popular topics</h2><div className="flex flex-wrap gap-2">{popularTopics.map(item => <button key={item} onClick={() => setTopic(item)} className="text-xs px-2.5 py-1.5 rounded-full bg-[#253855]/[0.06] text-[#253855]">{item}</button>)}</div></div><Link href="/profile#notifications" className="block bg-[#253855] text-cream rounded-lg p-4"><Settings className="w-5 h-5 text-[#B17E6B] mb-2" /><p className="font-garamond text-lg font-semibold">Notification settings</p><p className="text-xs text-white/60 mt-1">Choose which Member Exchange updates you receive.</p></Link></aside>
      </div>
      <style jsx>{`.filter-select{height:2.25rem;min-width:0;border:1px solid hsl(var(--input));border-radius:.375rem;background:hsl(var(--background));padding:0 .5rem;font-size:.75rem}.field{width:100%;height:2.5rem;border:1px solid hsl(var(--input));border-radius:.375rem;background:hsl(var(--background));padding:0 .75rem;font-size:.875rem}.primary-btn,.secondary-btn{height:2.25rem;padding:0 .75rem;border-radius:.375rem;font-size:.75rem;font-weight:500;display:inline-flex;align-items:center;gap:.375rem}.primary-btn{background:#253855;color:#f7f2e8}.primary-btn:disabled{opacity:.4}.secondary-btn{border:1px solid hsl(var(--border))}`}</style>
    </div>
  </AppShell>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="label-caps text-muted-foreground block mb-1.5">{label}</label>{children}</div>;
}

type DiscussionProps = {
  post: QAPost; member: Member; moderator: boolean; replyingTo: string | null; replyBody: string;
  editingPost: string | null; editTitle: string; editBody: string; editingReply: string | null; editReplyBody: string;
  setReplyingTo: (value: string | null) => void; setReplyBody: (value: string) => void;
  setEditingPost: (value: string | null) => void; setEditTitle: (value: string) => void; setEditBody: (value: string) => void;
  setEditingReply: (value: string | null) => void; setEditReplyBody: (value: string) => void;
  submitReply: (postId: string) => void; refresh: () => void;
};

function Discussion(props: DiscussionProps) {
  const { post, member, moderator, refresh } = props;
  const ownsPost = post.authorId === member.id;
  const hasLongThread = post.replies.length >= 3;
  const [responsesOpen, setResponsesOpen] = useState(!hasLongThread);
  return <article className="bg-white border border-border rounded-lg overflow-hidden">
    {post.pinned && <div className="px-4 py-2 bg-[#B17E6B]/10 border-b border-[#B17E6B]/20 text-[11px] font-medium text-[#7A5144] flex items-center gap-1.5"><Pin className="w-3 h-3" />Pinned by Cambridge</div>}
    <div className="p-4 sm:p-5"><div className="flex items-start gap-3"><Avatar id={post.authorId} name={post.authorName} /><div className="min-w-0 flex-1"><div className="flex flex-wrap justify-between gap-2"><div><p className="text-sm font-medium">{post.authorName}{post.moderator && <span className="ml-2 text-[10px] uppercase tracking-wide text-[#8A5E50]">Cambridge</span>}</p><p className="text-[11px] text-muted-foreground">{post.authorOrganization} · {stamp(post.createdAt)}{post.editedAt ? " · edited" : ""}</p></div>{!post.deleted && <div className="flex">{moderator && <button onClick={() => { togglePinnedPost(post.id); refresh(); }} className="p-1.5 text-muted-foreground">{post.pinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}</button>}{(ownsPost || moderator) && <><button onClick={() => { props.setEditingPost(post.id); props.setEditTitle(post.title); props.setEditBody(post.body); }} className="p-1.5 text-muted-foreground"><Edit3 className="w-3.5 h-3.5" /></button><button onClick={() => { if (window.confirm("Remove this discussion?")) { deletePost(post.id); refresh(); } }} className="p-1.5 text-muted-foreground hover:text-red-700"><Trash2 className="w-3.5 h-3.5" /></button></>}</div>}</div>
      {props.editingPost === post.id ? <div className="mt-3 space-y-2"><input value={props.editTitle} onChange={event => props.setEditTitle(event.target.value)} className="w-full h-9 border rounded-md px-3 text-sm" /><textarea value={props.editBody} onChange={event => props.setEditBody(event.target.value)} rows={4} className="w-full border rounded-md px-3 py-2 text-sm" /><div className="flex justify-end gap-2"><button onClick={() => props.setEditingPost(null)} className="text-xs">Cancel</button><button onClick={() => { editPost(post.id, props.editTitle, props.editBody); props.setEditingPost(null); refresh(); }} className="text-xs font-medium text-[#8A5E50]">Save</button></div></div> : <><h2 className="font-garamond text-xl font-semibold mt-3">{post.title}</h2>{!post.deleted && <p className="text-sm text-foreground/80 leading-relaxed mt-2 whitespace-pre-wrap">{post.body}</p>}</>}
      {!post.deleted && <div className="flex flex-wrap gap-1.5 mt-3"><Badge variant="outline" className="text-[10px]">{post.year}</Badge>{post.forumSeries && <Badge variant="outline" className="text-[10px]">{post.forumSeries}</Badge>}{post.topics.map(item => <Badge key={item} className="bg-[#253855]/[0.06] text-[#253855] border-0 text-[10px]">{item}</Badge>)}</div>}</div></div></div>
    {hasLongThread && <button type="button" onClick={() => setResponsesOpen(open => !open)} aria-expanded={responsesOpen} className="w-full border-t border-border bg-[#faf9f7] px-4 sm:px-5 py-3 flex items-center justify-between text-xs font-medium text-[#253855] hover:bg-[#f6f3ee]"><span>{responsesOpen ? "Hide" : "Show"} {post.replies.length} responses</span>{responsesOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}</button>}
    {post.replies.length > 0 && responsesOpen && <div className="border-t border-border bg-[#faf9f7] px-4 sm:px-5 py-3 space-y-3">{post.replies.map(reply => <div key={reply.id} className="flex gap-3"><Avatar id={reply.authorId} name={reply.authorName} /><div className="min-w-0 flex-1"><div className="flex justify-between gap-2"><div><p className="text-xs font-medium">{reply.authorName}</p><p className="text-[10px] text-muted-foreground">{reply.authorOrganization} · {stamp(reply.createdAt)}{reply.editedAt ? " · edited" : ""}</p></div>{!reply.deleted && (reply.authorId === member.id || moderator) && <div className="flex"><button onClick={() => { props.setEditingReply(reply.id); props.setEditReplyBody(reply.body); }} className="p-1 text-muted-foreground"><Edit3 className="w-3 h-3" /></button><button onClick={() => { if (window.confirm("Remove this reply?")) { deleteReply(post.id, reply.id); refresh(); } }} className="p-1 text-muted-foreground"><Trash2 className="w-3 h-3" /></button></div>}</div>{props.editingReply === reply.id ? <div className="mt-2"><textarea value={props.editReplyBody} onChange={event => props.setEditReplyBody(event.target.value)} rows={3} className="w-full border rounded-md px-2 py-1.5 text-xs" /><div className="flex justify-end gap-2"><button onClick={() => props.setEditingReply(null)} className="text-[11px]">Cancel</button><button onClick={() => { editReply(post.id, reply.id, props.editReplyBody); props.setEditingReply(null); refresh(); }} className="text-[11px] text-[#8A5E50]">Save</button></div></div> : <p className="text-xs text-foreground/75 leading-relaxed mt-1">{reply.body}</p>}</div></div>)}</div>}
    {!post.deleted && <div className="border-t border-border px-4 sm:px-5 py-3">{props.replyingTo === post.id ? <div><textarea value={props.replyBody} onChange={event => props.setReplyBody(event.target.value)} rows={3} placeholder="Write a reply…" className="w-full border rounded-md px-3 py-2 text-sm" /><div className="flex justify-end gap-2 mt-2"><button onClick={() => props.setReplyingTo(null)} className="h-8 px-3 border rounded-md text-xs">Cancel</button><button onClick={() => props.submitReply(post.id)} disabled={!props.replyBody.trim()} className="h-8 px-3 bg-[#253855] text-cream rounded-md text-xs disabled:opacity-40 inline-flex items-center gap-1"><Send className="w-3 h-3" />Reply</button></div></div> : <button onClick={() => { props.setReplyingTo(post.id); props.setReplyBody(""); }} className="text-xs font-medium text-[#253855] inline-flex items-center gap-1.5"><Reply className="w-3.5 h-3.5" />Reply · {post.replies.length} {post.replies.length === 1 ? "response" : "responses"}</button>}</div>}
  </article>;
}

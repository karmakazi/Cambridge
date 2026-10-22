"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { getAuth } from "@/lib/auth";
import { getForumById, type AgendaItem, type Forum, type Member } from "@/lib/data";
import {
  addReply,
  canAccessMemberQA,
  canModerateMemberQA,
  createPost,
  deletePost,
  deleteReply,
  editPost,
  editReply,
  getArchivedQA,
  getSessionPosts,
  togglePinnedPost,
  type QAPost,
} from "@/lib/member-qa";
import { getResolvedMember } from "@/lib/store";
import {
  ArrowLeft, Bell, CheckCircle2, ChevronRight, Clock3, Edit3, LockKeyhole,
  MessageCircle, MessageSquarePlus, Pin, PinOff, Reply, Send, Settings, Trash2, UserRound,
} from "lucide-react";

type Filter = "all" | "unanswered";

function formatTimestamp(value: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function initials(name: string): string {
  return name.split(" ").map(part => part[0]).join("").slice(0, 2).toUpperCase();
}

export default function MemberQAPage() {
  const router = useRouter();
  const { forumId, sessionId } = useParams<{ forumId: string; sessionId: string }>();
  const [forum, setForum] = useState<Forum | null>(null);
  const [session, setSession] = useState<AgendaItem | null>(null);
  const [member, setMember] = useState<Member | null>(null);
  const [moderator, setModerator] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);
  const [posts, setPosts] = useState<QAPost[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [composerOpen, setComposerOpen] = useState(false);
  const [questionTitle, setQuestionTitle] = useState("");
  const [questionBody, setQuestionBody] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyBody, setReplyBody] = useState("");
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");
  const [editingReplyId, setEditingReplyId] = useState<string | null>(null);
  const [editReplyBody, setEditReplyBody] = useState("");
  const [confirmation, setConfirmation] = useState("");

  function refreshPosts() {
    setPosts(getSessionPosts(forumId, sessionId));
  }

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      const auth = getAuth();
      if (!auth) { router.replace("/"); return; }
      const resolvedForum = getForumById(forumId);
      const resolvedMember = getResolvedMember(auth.memberId);
      const resolvedSession = resolvedForum?.agenda.find(item => item.sessionId === sessionId);
      if (!resolvedForum || !resolvedSession || !resolvedMember) {
        router.replace("/dashboard");
        return;
      }
      if (!canAccessMemberQA(resolvedForum, resolvedMember, auth.email)) {
        setAccessDenied(true);
        setForum(resolvedForum);
        setSession(resolvedSession);
        setMember(resolvedMember);
        return;
      }
      setForum(resolvedForum);
      setSession(resolvedSession);
      setMember(resolvedMember);
      setModerator(canModerateMemberQA(resolvedForum, auth.email));
      setPosts(getSessionPosts(forumId, sessionId));
    });
    return () => { cancelled = true; };
  }, [forumId, router, sessionId]);

  const visiblePosts = useMemo(
    () => filter === "unanswered" ? posts.filter(post => post.replies.length === 0 && !post.deleted) : posts,
    [filter, posts],
  );
  const archives = useMemo(() => getArchivedQA(forumId, sessionId), [forumId, sessionId]);

  if (!forum || !session || !member) return null;

  if (accessDenied) {
    return (
      <AppShell>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
          <div className="bg-white border border-border rounded-lg p-8 text-center">
            <LockKeyhole className="w-8 h-8 mx-auto text-[#1e2b45] mb-3" />
            <h1 className="font-garamond text-2xl font-medium">This Q&amp;A is private.</h1>
            <p className="text-sm text-muted-foreground mt-2">Access is limited to registered Forum participants and Cambridge staff.</p>
            <Link href="/dashboard" className="inline-flex mt-5 text-sm font-medium text-[#9a6a33] hover:underline">Return to My Forums</Link>
          </div>
        </div>
      </AppShell>
    );
  }

  function submitQuestion() {
    if (!questionTitle.trim() || !questionBody.trim() || !member) return;
    createPost(forumId, sessionId, member, questionTitle, questionBody);
    setQuestionTitle("");
    setQuestionBody("");
    setComposerOpen(false);
    setConfirmation("Your question has been posted.");
    refreshPosts();
  }

  function submitReply(postId: string) {
    if (!replyBody.trim() || !member) return;
    addReply(postId, member, replyBody);
    setReplyBody("");
    setReplyingTo(null);
    setConfirmation("Your reply has been posted.");
    refreshPosts();
  }

  function beginPostEdit(post: QAPost) {
    setEditingPostId(post.id);
    setEditTitle(post.title);
    setEditBody(post.body);
  }

  function savePostEdit(postId: string) {
    if (!editTitle.trim() || !editBody.trim()) return;
    editPost(postId, editTitle, editBody);
    setEditingPostId(null);
    setConfirmation("Post updated.");
    refreshPosts();
  }

  function removePost(postId: string) {
    if (!window.confirm("Remove this post?")) return;
    deletePost(postId);
    setConfirmation("Post removed.");
    refreshPosts();
  }

  function saveReplyEdit(postId: string, replyId: string) {
    if (!editReplyBody.trim()) return;
    editReply(postId, replyId, editReplyBody);
    setEditingReplyId(null);
    setConfirmation("Reply updated.");
    refreshPosts();
  }

  const notificationsOn = (member.notifyQaNewPosts ?? true)
    || (member.notifyQaReplies ?? true)
    || (member.notifyQaMentions ?? true);

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-5">
          <ArrowLeft className="w-3.5 h-3.5" />Back to {forum.title}
        </Link>

        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span className="label-caps text-[#c8975e]">Member Q&amp;A</span>
              <Badge className="bg-[#1e2b45]/[0.07] text-[#1e2b45] border-0 text-[10px]">Participants only</Badge>
              {moderator && <Badge className="bg-[#c8975e]/15 text-[#76502a] border-0 text-[10px]">Moderator</Badge>}
            </div>
            <h1 className="font-garamond text-3xl sm:text-4xl font-medium leading-tight">{session.title}</h1>
            <p className="text-sm text-muted-foreground mt-2 max-w-3xl">{session.description}</p>
            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1.5"><Clock3 className="w-3.5 h-3.5" />{session.time} · {forum.title} · {forum.editionYear}</p>
          </div>
          <div className="flex flex-col items-start lg:items-end gap-2 flex-shrink-0">
            <Link href="/profile#notifications" className="h-8 px-3 rounded-md border border-[#1e2b45]/20 bg-white text-xs font-medium text-[#1e2b45] inline-flex items-center gap-1.5 hover:bg-[#1e2b45]/5">
              <Bell className="w-3.5 h-3.5" />Q&amp;A notifications {notificationsOn ? "on" : "off"}
            </Link>
            <p className="text-[11px] text-muted-foreground inline-flex items-center gap-1"><LockKeyhole className="w-3 h-3" />Registered participants and Cambridge staff</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-[minmax(0,1fr)_260px] gap-6">
          <div className="min-w-0">
            <div className="bg-white border border-border rounded-lg p-4 mb-4">
              {!composerOpen ? (
                <button type="button" onClick={() => setComposerOpen(true)} className="w-full flex items-center justify-between gap-3 text-left">
                  <div>
                    <p className="text-sm font-medium">Ask the group a question</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Share an issue you would like participants or discussion leaders to address.</p>
                  </div>
                  <span className="h-9 px-3 rounded-md bg-[#1e2b45] text-cream text-xs font-medium inline-flex items-center gap-1.5 flex-shrink-0"><MessageSquarePlus className="w-3.5 h-3.5" />Ask a question</span>
                </button>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label htmlFor="question-title" className="label-caps text-muted-foreground block mb-1.5">Question</label>
                    <input id="question-title" value={questionTitle} onChange={event => setQuestionTitle(event.target.value)} placeholder="Give your question a clear title" className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
                  </div>
                  <div>
                    <label htmlFor="question-detail" className="label-caps text-muted-foreground block mb-1.5">Context or detail</label>
                    <textarea id="question-detail" value={questionBody} onChange={event => setQuestionBody(event.target.value)} rows={4} placeholder="Add useful context without including confidential or identifying client information." className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-y focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button type="button" onClick={() => setComposerOpen(false)} className="h-8 px-3 rounded-md border border-border text-xs font-medium">Cancel</button>
                    <button type="button" onClick={submitQuestion} disabled={!questionTitle.trim() || !questionBody.trim()} className="h-8 px-3 rounded-md bg-[#1e2b45] text-cream text-xs font-medium inline-flex items-center gap-1.5 disabled:opacity-40"><Send className="w-3.5 h-3.5" />Post question</button>
                  </div>
                </div>
              )}
            </div>

            {confirmation && <p className="mb-4 text-xs text-green-700 flex items-center gap-1.5" aria-live="polite"><CheckCircle2 className="w-3.5 h-3.5" />{confirmation}</p>}

            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="inline-flex p-1 bg-muted rounded-md" aria-label="Filter questions">
                {(["all", "unanswered"] as Filter[]).map(value => (
                  <button type="button" key={value} onClick={() => setFilter(value)} className={`h-7 px-3 rounded text-xs font-medium capitalize ${filter === value ? "bg-white text-[#1e2b45] shadow-sm" : "text-muted-foreground"}`}>{value}</button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">{visiblePosts.length} {visiblePosts.length === 1 ? "question" : "questions"}</p>
            </div>

            <div className="space-y-3">
              {visiblePosts.map(post => {
                const canManage = moderator || post.authorId === member.id;
                return (
                  <article key={post.id} className={`bg-white rounded-lg border ${post.pinned ? "border-[#c8975e]/45" : "border-border"} overflow-hidden`}>
                    {post.pinned && <div className="px-4 py-1.5 bg-[#c8975e]/10 text-[#76502a] text-[10px] font-medium flex items-center gap-1.5"><Pin className="w-3 h-3" />Pinned by Cambridge</div>}
                    <div className="p-4 sm:p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-full bg-[#1e2b45] text-cream flex items-center justify-center text-[11px] font-semibold flex-shrink-0">{initials(post.authorName)}</div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{post.authorName}{post.moderator && <span className="ml-1.5 text-[10px] text-[#9a6a33]">Cambridge</span>}</p>
                            <p className="text-[11px] text-muted-foreground truncate">{post.authorOrganization} · {formatTimestamp(post.createdAt)}{post.editedAt ? " · Edited" : ""}</p>
                          </div>
                        </div>
                        {canManage && !post.deleted && (
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {moderator && <button type="button" title={post.pinned ? "Unpin post" : "Pin post"} onClick={() => { togglePinnedPost(post.id); refreshPosts(); }} className="p-1.5 text-muted-foreground hover:text-[#9a6a33]">{post.pinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}</button>}
                            <button type="button" title="Edit post" onClick={() => beginPostEdit(post)} className="p-1.5 text-muted-foreground hover:text-foreground"><Edit3 className="w-3.5 h-3.5" /></button>
                            <button type="button" title="Delete post" onClick={() => removePost(post.id)} className="p-1.5 text-muted-foreground hover:text-red-700"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        )}
                      </div>

                      {editingPostId === post.id ? (
                        <div className="mt-4 space-y-2">
                          <input value={editTitle} onChange={event => setEditTitle(event.target.value)} className="w-full h-9 rounded-md border border-input px-3 text-sm" />
                          <textarea value={editBody} onChange={event => setEditBody(event.target.value)} rows={3} className="w-full rounded-md border border-input px-3 py-2 text-sm" />
                          <div className="flex justify-end gap-2"><button type="button" onClick={() => setEditingPostId(null)} className="text-xs px-2 py-1">Cancel</button><button type="button" onClick={() => savePostEdit(post.id)} className="text-xs px-3 py-1.5 rounded bg-[#1e2b45] text-cream">Save changes</button></div>
                        </div>
                      ) : post.deleted ? (
                        <p className="mt-4 text-sm italic text-muted-foreground">This post has been removed.</p>
                      ) : (
                        <div className="mt-4"><h2 className="font-garamond text-xl font-medium">{post.title}</h2><p className="text-sm text-foreground/80 leading-relaxed mt-2 whitespace-pre-wrap">{post.body}</p></div>
                      )}

                      {post.replies.length > 0 && (
                        <div className="mt-5 ml-3 sm:ml-6 border-l-2 border-[#1e2b45]/10 pl-4 space-y-4">
                          {post.replies.map(reply => {
                            const canManageReply = moderator || reply.authorId === member.id;
                            return (
                              <div key={reply.id}>
                                <div className="flex items-start justify-between gap-2">
                                  <div className="min-w-0"><p className="text-xs font-medium">{reply.authorName}{reply.moderator && <span className="ml-1.5 text-[9px] text-[#9a6a33]">Cambridge</span>}</p><p className="text-[10px] text-muted-foreground">{reply.authorOrganization} · {formatTimestamp(reply.createdAt)}{reply.editedAt ? " · Edited" : ""}</p></div>
                                  {canManageReply && !reply.deleted && <div className="flex"><button type="button" title="Edit reply" onClick={() => { setEditingReplyId(reply.id); setEditReplyBody(reply.body); }} className="p-1 text-muted-foreground hover:text-foreground"><Edit3 className="w-3 h-3" /></button><button type="button" title="Delete reply" onClick={() => { if (window.confirm("Remove this reply?")) { deleteReply(post.id, reply.id); refreshPosts(); } }} className="p-1 text-muted-foreground hover:text-red-700"><Trash2 className="w-3 h-3" /></button></div>}
                                </div>
                                {editingReplyId === reply.id ? <div className="mt-2"><textarea value={editReplyBody} onChange={event => setEditReplyBody(event.target.value)} rows={2} className="w-full rounded-md border border-input px-3 py-2 text-sm" /><div className="flex justify-end gap-2 mt-1"><button type="button" onClick={() => setEditingReplyId(null)} className="text-xs">Cancel</button><button type="button" onClick={() => saveReplyEdit(post.id, reply.id)} className="text-xs px-2 py-1 rounded bg-[#1e2b45] text-cream">Save</button></div></div> : <p className={`text-sm mt-1.5 ${reply.deleted ? "italic text-muted-foreground" : "text-foreground/80"}`}>{reply.body}</p>}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {!post.deleted && (
                        <div className="mt-4">
                          {replyingTo === post.id ? (
                            <div className="flex flex-col sm:flex-row gap-2">
                              <textarea value={replyBody} onChange={event => setReplyBody(event.target.value)} rows={2} autoFocus placeholder="Write a reply…" className="min-w-0 flex-1 rounded-md border border-input px-3 py-2 text-sm" />
                              <div className="flex sm:flex-col gap-1 justify-end"><button type="button" onClick={() => setReplyingTo(null)} className="h-8 px-2 text-xs">Cancel</button><button type="button" onClick={() => submitReply(post.id)} disabled={!replyBody.trim()} className="h-8 px-3 rounded bg-[#1e2b45] text-cream text-xs disabled:opacity-40">Reply</button></div>
                            </div>
                          ) : <button type="button" onClick={() => { setReplyingTo(post.id); setReplyBody(""); }} className="inline-flex items-center gap-1.5 text-xs font-medium text-[#9a6a33] hover:underline"><Reply className="w-3.5 h-3.5" />Reply</button>}
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
              {!visiblePosts.length && <div className="bg-white border border-border rounded-lg py-10 text-center"><MessageCircle className="w-6 h-6 mx-auto text-muted-foreground/50" /><p className="text-sm font-medium mt-2">No unanswered questions.</p><p className="text-xs text-muted-foreground mt-1">Everything currently has a response.</p></div>}
            </div>
          </div>

          <aside className="space-y-4">
            <div className="bg-[#1e2b45] text-cream rounded-lg p-4">
              <p className="label-caps text-[#c8975e] mb-2">How this space works</p>
              <ul className="space-y-2 text-xs text-cream/75 leading-relaxed">
                <li className="flex gap-2"><UserRound className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />Participants can post, reply, and manage their own contributions.</li>
                <li className="flex gap-2"><Pin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />Cambridge staff can moderate and pin important guidance.</li>
                <li className="flex gap-2"><LockKeyhole className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />Please do not share confidential or identifying client information.</li>
              </ul>
            </div>

            <div id="past-q-and-a" className="bg-white border border-border rounded-lg p-4 scroll-mt-6">
              <p className="label-caps text-muted-foreground mb-1">Past Member Q&amp;A</p>
              <p className="text-xs text-muted-foreground mb-3">Read-only discussions from earlier editions of this continuing Forum.</p>
              {archives.length ? <div className="space-y-3">{archives.map(archive => (
                <a key={archive.year} href={`#archive-${archive.year}`} className="block group">
                  <div className="flex items-center justify-between gap-2"><p className="text-sm font-medium group-hover:text-[#9a6a33]">{archive.year}</p><ChevronRight className="w-3.5 h-3.5 text-muted-foreground" /></div>
                  <p className="text-xs text-foreground mt-0.5">{archive.title}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{archive.questionCount} questions · Read only</p>
                </a>
              ))}</div> : <p className="text-xs text-muted-foreground">No earlier discussions are available for this session.</p>}
            </div>

            <Link href="/profile#notifications" className="bg-white border border-border rounded-lg p-4 flex items-start gap-3 hover:border-[#c8975e]/50 transition-colors">
              <Settings className="w-4 h-4 text-[#9a6a33] mt-0.5" />
              <div><p className="text-sm font-medium">Notification settings</p><p className="text-xs text-muted-foreground mt-0.5">Choose which Q&amp;A updates you receive.</p></div>
            </Link>
          </aside>
        </div>

        {archives.map(archive => (
          <section key={archive.year} id={`archive-${archive.year}`} className="mt-8 bg-muted/40 border border-border rounded-lg p-5 scroll-mt-6">
            <div className="flex items-center gap-2"><LockKeyhole className="w-4 h-4 text-muted-foreground" /><p className="label-caps text-muted-foreground">Read-only archive · {archive.year}</p></div>
            <h2 className="font-garamond text-xl font-medium mt-2">{archive.title}</h2>
            <p className="text-sm text-muted-foreground mt-2">{archive.summary}</p>
            <p className="text-xs text-muted-foreground mt-3">Prototype archive summary · {archive.questionCount} historical questions</p>
          </section>
        ))}
      </div>
    </AppShell>
  );
}

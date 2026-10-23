"use client";

import type { Forum, Member } from "./data";

export type QAReply = {
  id: string;
  authorId: string;
  authorName: string;
  authorOrganization: string;
  body: string;
  createdAt: string;
  editedAt?: string;
  deleted?: boolean;
  moderator?: boolean;
};

export type QAPost = {
  id: string;
  forumId?: string;
  sessionId?: string;
  forumSeries?: string;
  year: number;
  topics: string[];
  authorId: string;
  authorName: string;
  authorOrganization: string;
  title: string;
  body: string;
  createdAt: string;
  editedAt?: string;
  deleted?: boolean;
  pinned?: boolean;
  moderator?: boolean;
  replies: QAReply[];
};

export type ArchivedQA = {
  year: number;
  title: string;
  questionCount: number;
  summary: string;
};

const QA_KEY = "cf_member_qa";

const SEEDED_POSTS: QAPost[] = [
  {
    id: "qa-welcome-psychology",
    forumId: "f001",
    sessionId: "psychology-hnw-family-disputes",
    authorId: "staff-shona-fox",
    authorName: "Shóna Fox",
    authorOrganization: "Cambridge Forums",
    title: "Welcome to the Member Exchange",
    body: "Use this space to share questions, practical experience, and useful developments with the Cambridge community throughout the year. Please avoid identifying clients or sharing confidential information.",
    forumSeries: "International Wealth Disputes",
    year: 2026,
    topics: ["Community", "Cambridge updates"],
    createdAt: "2026-10-20T14:00:00.000Z",
    pinned: true,
    moderator: true,
    replies: [],
  },
  {
    id: "exchange-expert-evidence-roundup",
    authorId: "m003",
    authorName: "Priya Anand",
    authorOrganization: "Kapur Anand Legal",
    title: "How are firms handling expert evidence across jurisdictions?",
    body: "We are reviewing our approach to coordinating expert evidence where related proceedings are moving at different speeds. I would welcome practical examples of what has helped keep the strategy consistent without duplicating work.",
    forumSeries: "International Wealth Disputes",
    year: 2026,
    topics: ["Evidence", "Cross-border disputes", "Professional practice"],
    createdAt: "2026-10-22T13:20:00.000Z",
    replies: [
      {
        id: "exchange-expert-reply-elena",
        authorId: "m001",
        authorName: "Elena Marchetti",
        authorOrganization: "Marchetti & Silveira LLP",
        body: "We have found it useful to agree on a shared chronology first, then give each local expert a short jurisdiction-specific annex. That has reduced both repetition and small factual inconsistencies.",
        createdAt: "2026-10-22T15:05:00.000Z",
      },
      {
        id: "exchange-expert-reply-thomas",
        authorId: "m009",
        authorName: "Thomas Abernathy",
        authorOrganization: "Abernathy & Caldwell LLP",
        body: "That is close to our approach. We also appoint one lawyer to maintain the assumptions register so that every expert is working from the same version of the facts.",
        createdAt: "2026-10-22T17:40:00.000Z",
      },
      {
        id: "exchange-expert-reply-priya",
        authorId: "m003",
        authorName: "Priya Anand",
        authorOrganization: "Kapur Anand Legal",
        body: "The assumptions register is a helpful idea. Do you circulate it to the experts directly, or keep it as a document managed by counsel?",
        createdAt: "2026-10-23T08:25:00.000Z",
      },
      {
        id: "exchange-expert-reply-thomas-followup",
        authorId: "m009",
        authorName: "Thomas Abernathy",
        authorOrganization: "Abernathy & Caldwell LLP",
        body: "Counsel manages the master version, but each expert receives the relevant extracts and confirms any departure in writing. That has kept the process manageable while preserving a clear record.",
        createdAt: "2026-10-23T10:10:00.000Z",
      },
    ],
  },
  {
    id: "qa-family-dynamics",
    forumId: "f001",
    sessionId: "psychology-hnw-family-disputes",
    authorId: "m004",
    authorName: "Marcus Holst",
    authorOrganization: "Holst & Richter",
    title: "How early should advisers introduce non-legal support?",
    body: "I would be interested in comparing when participants involve psychologists, mediators, or family-governance specialists, and how that affects the legal strategy.",
    forumSeries: "International Wealth Disputes",
    year: 2026,
    topics: ["Family governance", "Mediation"],
    createdAt: "2026-10-21T09:35:00.000Z",
    replies: [
      {
        id: "qa-reply-elena",
        authorId: "m001",
        authorName: "Elena Marchetti",
        authorOrganization: "Marchetti & Silveira LLP",
        body: "In our experience, bringing in a neutral professional before positions harden can be valuable. I would particularly like to compare how that role is explained to clients across jurisdictions.",
        createdAt: "2026-10-21T11:10:00.000Z",
      },
    ],
  },
  {
    id: "qa-family-evidence",
    forumId: "f001",
    sessionId: "psychology-hnw-family-disputes",
    authorId: "m009",
    authorName: "Thomas Abernathy",
    authorOrganization: "Abernathy & Caldwell LLP",
    title: "Evidence of coercion in family wealth disputes",
    body: "What evidence has proved most useful when control or coercive behaviour is central to the dispute but is expressed indirectly through financial arrangements?",
    forumSeries: "International Wealth Disputes",
    year: 2026,
    topics: ["Evidence", "Family disputes"],
    createdAt: "2026-10-21T15:20:00.000Z",
    replies: [],
  },
  {
    id: "exchange-ai-evidence",
    authorId: "m001",
    authorName: "Elena Marchetti",
    authorOrganization: "Marchetti & Silveira LLP",
    title: "Approaches to AI-generated evidence across jurisdictions",
    body: "Has anyone developed a practical protocol for authenticating AI-generated or AI-modified evidence? I would be particularly interested in approaches taken by courts during the past year.",
    forumSeries: "Data Privacy & AI Governance",
    year: 2025,
    topics: ["Artificial intelligence", "Evidence", "Professional practice"],
    createdAt: "2025-11-12T16:15:00.000Z",
    replies: [
      {
        id: "exchange-ai-reply",
        authorId: "m003",
        authorName: "Priya Anand",
        authorOrganization: "Kapur Anand Legal",
        body: "We have been separating provenance, chain-of-custody, and reliability questions rather than treating AI involvement as a single issue. I can share a short checklist at our next discussion.",
        createdAt: "2025-11-13T10:05:00.000Z",
      },
    ],
  },
  {
    id: "exchange-cross-border-mediation",
    authorId: "m015",
    authorName: "Robert Kowalski",
    authorOrganization: "Kowalski Chambers",
    title: "Recommendations for mediators in cross-border family disputes",
    body: "I am compiling a shortlist of mediators with experience coordinating parallel proceedings and multilingual family groups. Recommendations from members would be very welcome.",
    forumSeries: "International Wealth Disputes",
    year: 2024,
    topics: ["Mediation", "Cross-border disputes", "Referrals"],
    createdAt: "2024-09-18T13:40:00.000Z",
    replies: [],
  },
];

const ARCHIVES: Record<string, ArchivedQA[]> = {
  "f001:psychology-hnw-family-disputes": [
    {
      year: 2025,
      title: "Family Dynamics in Cross-Border Wealth Disputes",
      questionCount: 8,
      summary: "Read-only discussion covering family governance, mediation strategy, and the evidentiary challenges surrounding coercive relationships.",
    },
    {
      year: 2024,
      title: "Resolving Conflict Across Generations",
      questionCount: 5,
      summary: "Read-only discussion about inheritance expectations, family identity, and alternatives to formal proceedings.",
    },
  ],
};

function loadPosts(): QAPost[] {
  if (typeof window === "undefined") return SEEDED_POSTS;
  try {
    const raw = localStorage.getItem(QA_KEY);
    const saved = raw ? JSON.parse(raw) as QAPost[] : [];
    const savedIds = new Set(saved.map(post => post.id));
    return [...saved, ...SEEDED_POSTS.filter(post => !savedIds.has(post.id))].map(post => ({
      ...post,
      year: post.year ?? new Date(post.createdAt).getFullYear(),
      topics: post.topics ?? [],
    }));
  } catch {
    return SEEDED_POSTS;
  }
}

function savePosts(posts: QAPost[]) {
  localStorage.setItem(QA_KEY, JSON.stringify(posts));
}

export function canAccessMemberQA(forum: Forum, member: Member, email: string): boolean {
  return forum.participants.includes(member.id) || email.toLowerCase().endsWith("@cambridgeforums.com");
}

export function canModerateMemberQA(forum: Forum, email: string): boolean {
  const normalized = email.toLowerCase();
  return normalized === forum.logistics.contactEmail.toLowerCase() || normalized.endsWith("@cambridgeforums.com");
}

export function canAccessMemberExchange(member: Member, email: string): boolean {
  return Boolean(member.id) || email.toLowerCase().endsWith("@cambridgeforums.com");
}

export function canModerateMemberExchange(email: string): boolean {
  return email.toLowerCase().endsWith("@cambridgeforums.com");
}

export function getExchangePosts(): QAPost[] {
  return loadPosts().sort((a, b) => (
    Number(Boolean(b.pinned)) - Number(Boolean(a.pinned))
    || latestActivity(b).localeCompare(latestActivity(a))
  ));
}

function latestActivity(post: QAPost): string {
  return post.replies.reduce((latest, reply) => reply.createdAt > latest ? reply.createdAt : latest, post.createdAt);
}

export function createExchangePost(member: Member, title: string, body: string, topics: string[], year: number): QAPost {
  const post: QAPost = {
    id: crypto.randomUUID(),
    authorId: member.id,
    authorName: member.publishedName || member.name,
    authorOrganization: member.organization,
    title: title.trim(),
    body: body.trim(),
    topics: topics.map(topic => topic.trim()).filter(Boolean),
    year,
    createdAt: new Date().toISOString(),
    replies: [],
  };
  savePosts([post, ...loadPosts()]);
  return post;
}

export function getSessionPosts(forumId: string, sessionId: string): QAPost[] {
  return loadPosts()
    .filter(post => post.forumId === forumId && post.sessionId === sessionId)
    .sort((a, b) => Number(Boolean(b.pinned)) - Number(Boolean(a.pinned)) || b.createdAt.localeCompare(a.createdAt));
}

export function createPost(forumId: string, sessionId: string, member: Member, title: string, body: string): QAPost {
  const post: QAPost = {
    id: crypto.randomUUID(),
    forumId,
    sessionId,
    authorId: member.id,
    authorName: member.name,
    authorOrganization: member.organization,
    year: new Date().getFullYear(),
    topics: [],
    title: title.trim(),
    body: body.trim(),
    createdAt: new Date().toISOString(),
    replies: [],
  };
  savePosts([post, ...loadPosts()]);
  return post;
}

export function editPost(postId: string, title: string, body: string): void {
  savePosts(loadPosts().map(post => post.id === postId
    ? { ...post, title: title.trim(), body: body.trim(), editedAt: new Date().toISOString() }
    : post));
}

export function deletePost(postId: string): void {
  savePosts(loadPosts().map(post => post.id === postId
    ? { ...post, deleted: true, title: "Post removed", body: "" }
    : post));
}

export function togglePinnedPost(postId: string): void {
  savePosts(loadPosts().map(post => post.id === postId ? { ...post, pinned: !post.pinned } : post));
}

export function addReply(postId: string, member: Member, body: string): QAReply {
  const reply: QAReply = {
    id: crypto.randomUUID(),
    authorId: member.id,
    authorName: member.name,
    authorOrganization: member.organization,
    body: body.trim(),
    createdAt: new Date().toISOString(),
  };
  savePosts(loadPosts().map(post => post.id === postId ? { ...post, replies: [...post.replies, reply] } : post));
  return reply;
}

export function editReply(postId: string, replyId: string, body: string): void {
  savePosts(loadPosts().map(post => post.id === postId ? {
    ...post,
    replies: post.replies.map(reply => reply.id === replyId
      ? { ...reply, body: body.trim(), editedAt: new Date().toISOString() }
      : reply),
  } : post));
}

export function deleteReply(postId: string, replyId: string): void {
  savePosts(loadPosts().map(post => post.id === postId ? {
    ...post,
    replies: post.replies.map(reply => reply.id === replyId
      ? { ...reply, deleted: true, body: "Reply removed" }
      : reply),
  } : post));
}

export function getArchivedQA(forumId: string, sessionId: string): ArchivedQA[] {
  return ARCHIVES[`${forumId}:${sessionId}`] ?? [];
}

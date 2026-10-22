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
  forumId: string;
  sessionId: string;
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
    authorId: "staff-sarah-chen",
    authorName: "Sarah Chen",
    authorOrganization: "Cambridge Forums",
    title: "Welcome to the Member Q&A",
    body: "Use this space to share questions, examples, and issues you would like the discussion leaders to address. Please avoid identifying clients or sharing confidential information.",
    createdAt: "2026-10-20T14:00:00.000Z",
    pinned: true,
    moderator: true,
    replies: [],
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
    createdAt: "2026-10-21T15:20:00.000Z",
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
    return raw ? JSON.parse(raw) : SEEDED_POSTS;
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

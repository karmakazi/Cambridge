# Cambridge Forums — Member Platform: Build Notes

> **Purpose:** Handoff notes for a new AI instance or developer picking up this project.  
> **Last updated:** October 2026  
> **Repo:** https://github.com/karmakazi/Cambridge.git  
> **Project folder:** `Cambridge Forums/cambridge-platform` (client documents live beside it in `client-docs/`)

---

## What This Is

A **prototype** of the Cambridge Forums member platform — a digital add-on to the existing marketing site at [cambridgeforums.com](https://www.cambridgeforums.com). The goal is to give Cambridge Forum participants a single destination to:

1. Access their upcoming and past forums (agenda, materials, logistics, participants)
2. Search a curated member directory by expertise, jurisdiction, and practice area
3. Manage their own profile and contact/visibility preferences

This is a **prototype only** — there is no backend, no real database, and no real authentication. Everything runs locally in the browser using `localStorage`. The intent is to test the concept with real users before committing to production infrastructure.

The brief and MVP priorities came from a discovery document (`Cambridge_Forums_Discovery_Findings_MVP_Simplified_Outline-2.docx`) in the parent project folder. The four MVP priorities from that research were:

| Priority | Feature | Status |
|---|---|---|
| P1 | Member Directory | Built |
| P2 | My Forums & Resources | Built |
| P3 | Frictionless Access (magic link auth) | Built |
| P4 | Structured Q&A | Not built — validate demand first |

---

## Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js 16 (App Router) | `"use client"` on all interactive pages |
| Language | TypeScript | Strict mode |
| Styling | Tailwind CSS v4 | Custom Cambridge design tokens in `globals.css` |
| Components | shadcn/ui | Components live in `src/components/ui/` |
| Icons | lucide-react | |
| Data | `localStorage` | No backend — see Data Layer section below |
| Auth | Mock magic link + password | `localStorage`-based — see Auth section below |
| Dev port | 3030 | Hardcoded in `package.json` scripts |

### Running the dev server

```bash
cd "cambridge-platform"
npm run dev
# → http://localhost:3030
```

**Important:** The dev server dies when the terminal session ends. Always run it in an integrated terminal (Cursor: `` Ctrl+` ``), not via an agent shell command.

---

## Cambridge Design Language

The prototype matches the visual identity of the existing Cambridge Forums marketing site:

| Token | Value | Usage |
|---|---|---|
| Navy (primary bg) | `#1e2b45` | Sidebar, login page background |
| Navy light | `#243253` | Login card background, sidebar hover |
| Gold (accent) | `#c8975e` | CTAs, active nav, labels, badges |
| Gold light | `#d4aa7a` | Button hover |
| Cream (text on dark) | `#f5f0e8` | Text on navy surfaces |
| Background | `#f7f5f2` | Main content area |
| Serif font | EB Garamond | All `h1/h2/h3`, loaded via Google Fonts |
| Sans font | Inter | Body text |

**Key CSS utility classes** (defined in `globals.css`):
- `.font-garamond` — applies EB Garamond
- `.text-gold` — `#c8975e`
- `.bg-navy` — `#1e2b45`
- `.text-cream` — `#f5f0e8`
- `.label-caps` — 11px, 500 weight, 0.12em tracking, uppercase — used for section labels throughout

**Tailwind CSS variables** for Cambridge colours are registered under `--color-cambridge-*` in the `@theme inline` block of `globals.css`.

---

## Project Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout — loads Google Fonts in <head>
│   ├── globals.css             # Cambridge design tokens + Tailwind config
│   ├── page.tsx                # Login page (magic link / password toggle)
│   ├── magic-link/
│   │   └── page.tsx            # Magic link landing — verifies token, redirects to /dashboard
│   ├── dashboard/
│   │   └── page.tsx            # "My Forums" — upcoming + past forums
│   ├── directory/
│   │   ├── page.tsx            # Member directory — search + filter grid
│   │   └── [id]/
│   │       └── page.tsx        # Individual member profile page
│   └── profile/
│       └── page.tsx            # Edit profile with debounced auto-save
├── components/
│   ├── AppShell.tsx            # Sidebar nav + mobile header — wraps all protected pages
│   └── ui/                     # shadcn/ui components (button, input, badge, card, etc.)
└── lib/
    ├── data.ts                 # All seed data: Member type, Forum type, MEMBERS[], FORUMS[]
    ├── auth.ts                 # localStorage auth helpers
    ├── store.ts                # localStorage profile store (merges seed data + edits)
    ├── prototype-service.ts    # Async CRM-shaped boundary for RSVP, directory, profile
    └── utils.ts                # shadcn cn() utility
```

---

## Data Layer

### How it works

All data lives in `src/lib/data.ts` as TypeScript constants. There is no API or database. Interactive pages call `prototype-service.ts`, which simulates asynchronous CRM operations while delegating to seed data and `localStorage`. A production implementation can replace these functions with API calls without redesigning the pages.

User-made edits (profile changes) are stored in `localStorage` under the key `cf_profiles` as a `Record<memberId, Partial<Member>>`. The `store.ts` functions merge seed data with any saved edits at read time:

```
getResolvedMember(id)     → base MEMBERS[id] merged with localStorage overrides
getAllResolvedMembers()   → all members with overrides applied
saveProfile(id, updates)  → writes partial updates into localStorage
```

This means:
- The seed data in `data.ts` is the source of truth for all members initially
- Any profile edit made through the UI persists across page refreshes but is lost if the browser's localStorage is cleared
- **To reset all profile edits:** open browser DevTools → Application → Local Storage → delete `cf_profiles`
- RSVP changes are stored separately under `cf_rsvps`

### Member type

```typescript
type Member = {
  id: string;                  // "m001" through "m015"
  name: string;
  title: string;
  organization: string;
  location: string;            // City, Country (short form)
  address: string;             // Full business address
  phone: string;               // International format e.g. "+44 20 7946 0312"
  jurisdiction: string;        // Used for directory filter
  practiceArea: string;        // Used for directory filter
  expertise: string[];         // Tags shown in directory cards
  bio: string;
  forumsAttended: string[];    // Array of Forum IDs
  steeringCommittee: boolean;  // Shows "SC" badge in directory
  contactEmail: string;
  contactPreference: "email" | "request-intro" | "private";
  discoverable: boolean;       // Cross-forum discovery opt-in
  avatar: string;              // 2-letter initials fallback
  photo: string;               // URL — currently pravatar.cc portraits
};
```

### Forum type

```typescript
type Forum = {
  id: string;                  // "f001" through "f005"
  title: string;
  area: string;                // Practice area
  date: string;                // ISO date string "YYYY-MM-DD"
  location: string;
  venue: string;
  status: "upcoming" | "past";
  participants: string[];      // Array of Member IDs
  websiteUrl: string;
  factSheetUrl: string;
  materialsBundleUrl: string;
  memberFees: Record<string, string>;
  agenda: AgendaItem[];
  materials: Material[];
  logistics: Logistics;
};
```

### Seed data summary

- **15 members** across 12 jurisdictions and 10 practice areas
- **5 forums**: 3 upcoming (f001, f002, f003), 2 past (f004, f005)
- Photos: `https://i.pravatar.cc/150?img={n}` — consistent portrait photos per member
- Default logged-in user: **Elena Marchetti (m001)** — her email is `e.marchetti@marchetti-silveira.com`

---

## Auth Flow

Authentication is fully mocked — no real tokens, emails, or backend.

### localStorage keys
| Key | Value |
|---|---|
| `cf_auth` | JSON `AuthState` object — set on login, cleared on sign out |
| `cf_pending_email` | Email entered before magic link is "sent" |

### Magic link flow (default)

1. User enters email on `/` → `setPendingEmail(email)` → shows "Check your inbox" state
2. An **"Open Magic Link"** button simulates clicking the link in the email
3. Clicking it navigates to `/magic-link?email=...`
4. `magic-link/page.tsx` waits 1.2s (fake verification), calls `loginWithMagicLink(email)`, redirects to `/dashboard`
5. `loginWithMagicLink()` matches email to a `MEMBERS` record (or defaults to m001 if no match), writes `AuthState` to `localStorage`

### Password flow (opt-out)

A toggle on the login page switches to a traditional email + password form. Any password is accepted in the prototype. Same `loginWithPassword()` → `AuthState` → localStorage flow.

### Auth guard

Every protected page checks `getAuth()` in a `useEffect` on mount. If null, it calls `router.replace("/")`. There is no middleware-level protection — this is client-side only, appropriate for a prototype.

### Switching the logged-in user

To test as a different member, sign out (sidebar) and log in with that member's `contactEmail` from `data.ts`. Or use DevTools to manually set `cf_auth` in localStorage.

---

## Pages Reference

### `/` — Login

- Default mode: **Magic Link** tab
- Alt mode: **Password** tab (opt-out)
- Magic link "sent" state shows `email` and an "Open Magic Link" button (prototype affordance)
- Redirects to `/dashboard` if already authenticated on mount

### `/magic-link?email=...` — Magic Link Handler

- Wrapped in `<Suspense>` (required for `useSearchParams()` in Next.js App Router)
- 1.2s fake verification delay → calls `loginWithMagicLink(email)` → redirects to `/dashboard`

### `/dashboard` — My Forums

- Shows upcoming forums first, then past
- Upcoming forums include RSVP status, comments, a personalized fee, and a fact sheet
- Agenda speakers link to member profiles where a matching member exists
- Each forum is a collapsible card with four tabs: **Agenda / Materials / Participants / Logistics**
- Materials and "Download all" links return clearly labelled placeholder files
- Venue addresses open in Google Maps; Cambridge contact details are actionable
- Participants tab lists members as links to their directory profiles
- Reads from `getForumsForMember(auth.memberId)` which filters `FORUMS[]` by `participants` array

### `/directory` — Member Directory

- Opens on **My Forum Network**, with a switch to **All Cambridge Members**
- Supports filtering the network to a specific forum
- Client-side search across name, org, title, location, expertise
- Two dropdowns: Practice Area + Jurisdiction
- Member cards show: photo, name, title, org, jurisdiction, expertise tags, and contact info based on preference:
  - `"email"` → shows email (gold link) + phone number
  - `"request-intro"` → shows "Request introduction" button (mailto: to Cambridge)
  - `"private"` → shows nothing
- Cards use a non-link container so email and phone are valid, directly clickable links

### `/directory/[id]` — Member Profile

- Shows full profile: photo, bio, expertise tags, forum history, shared forums, contact
- **Contact section always visible** — on your own profile it shows a "What others see" badge and preview text instead of the actionable button
- "Shared forums" section only appears when viewing someone else's profile and you share at least one forum

### `/profile` — Edit Profile

- Automatically saves approximately 900ms after the member stops editing
- Shows visible **Saving…** and **Saved** status feedback
- Auto-save calls the async prototype service so production can replace local storage with the CRM API
- Profile photo is read-only ("Contact Cambridge to update")
- Editable fields: Title, Organisation, Location, Business Address, Telephone, Expertise (comma-separated), Bio
- Contact preference radio: email / request-intro / private
- Cross-forum discovery toggle (opt-out)

### `AppShell.tsx`

- Fixed sidebar on desktop (width: 224px / `w-56`)
- Mobile: top bar with hamburger → full-screen overlay nav
- Shows logged-in member's photo + name + org + sign out link
- Active route highlighted with gold left-border indicator
- All protected pages must wrap their content in `<AppShell>`

---

## Contact Preference Logic

This controls what appears across the entire app:

| Preference | Directory card | Profile page | Own profile |
|---|---|---|---|
| `"email"` | Email + phone links | Email, phone, address | Same (preview) |
| `"request-intro"` | "Request introduction" button | Explanatory text + button | Explanatory text, no button |
| `"private"` | Nothing | Privacy message | Privacy message (preview) |

---

## Known Patterns & Decisions

### Valid interactive markup
Directory cards use an `<article>` container. Profile names/photos, email addresses, and phone numbers can therefore be separate links without nesting anchors.

### `"use client"` on all pages
All pages use client-side React hooks (`useEffect`, `useState`, `useRouter`) so they all carry the `"use client"` directive. Next.js App Router defaults to Server Components — the `"use client"` boundary must be at the top of every file that touches localStorage or the router.

### Suspense for `useSearchParams()`
`/magic-link/page.tsx` wraps its inner component in `<Suspense>` — required by Next.js when using `useSearchParams()` in the App Router.

### LocalStorage is client-only
All `localStorage` reads are guarded with `if (typeof window === "undefined") return null` to prevent SSR errors. Next.js may attempt to render pages on the server even in client components during the build.

### Prototype service boundary
`prototype-service.ts` is the UI's integration seam. RSVP and profile submissions are async even though they currently write to local storage. Directory scope logic also lives there rather than in the page component.

---

## What's Not Built Yet (from discovery doc)

| Feature | Notes |
|---|---|
| Structured Q&A | Discovery doc says validate demand first — not built |
| Email digests / notifications | Not built |
| Final forum documents | Current downloads are labelled placeholder files |
| Real auth | Magic link is fully mocked — needs Clerk, Auth.js, or similar for production |
| Real database | Replace localStorage with Supabase (PostgreSQL) — data layer is abstracted in `store.ts` so UI changes are minimal |
| Server-enforced visibility | Prototype filters network/discoverability in the browser; production must enforce this in the API |
| Steering committee tools | Not in MVP scope |
| Mobile polish | Basic responsive layout exists but not deeply tested |

---

## Migrating to Production

The prototype was designed so the jump to production is a data-layer swap, not a rebuild:

1. **Auth:** Replace `src/lib/auth.ts` mock functions with Clerk or Auth.js magic link. The `AuthState` shape stays the same.
2. **CRM/data API:** Replace the implementations in `src/lib/prototype-service.ts` with authenticated CRM/API calls while retaining its page-facing types. Replace direct read helpers in `store.ts` as remaining screens migrate.
3. **Seed data:** `src/lib/data.ts` becomes the data import/migration script rather than the live data source.
4. **Deploy:** Vercel — `npm run build` passes cleanly, zero config needed.

---

## Useful Commands

```bash
# Start dev server
npm run dev                    # → http://localhost:3030

# Type check without building
npx tsc --noEmit

# Production build (also validates types)
npm run build
# If Turbopack cannot bind its internal helper port in a restricted shell:
npx next build --webpack

# Reset all prototype data in browser
# DevTools → Application → Local Storage → Clear all cf_* keys
```

---

## Git

- Remote: `https://github.com/karmakazi/Cambridge.git`
- Working branch: `james/platform-next-steps`
- Commits follow the pattern: short imperative summary + bullet list of changes

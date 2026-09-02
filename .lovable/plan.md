# Personalized Investor Access & Engagement Intelligence

Architecture only — no website changes made yet. Current state: a single-page presentation (`src/routes/index.tsx` + `src/components/site/*`), a live financial model (`src/model/investment.ts`), one server function (`src/lib/investor.functions.ts`) that emails allocation requests, and an empty Cloud database.

## 1. Proposed database tables

**investors** — one row per invited investor
full_name, email, phone, company, access_token (long random, unique), investor_position (optional, Investor A–F), status, internal_notes, first_viewed_at, last_viewed_at, total_visits, total_active_seconds, request_status, created_at/updated_at.
Status values: invited, opened, reviewing, interested, requested_allocation, committed, declined.

**investor_sessions** — one row per visit
investor_id, started_at, ended_at, active_seconds, device_type (mobile/tablet/desktop only), referrer_kind. No IP, no fingerprint, no user agent string stored.

**investor_section_views** — engagement per section per session
session_id, investor_id, section_id (hero, why-nizek, pipeline, model, sourcing, equity, fund, advantages, investment, simulator, team, reserve), first_viewed_at, view_count, active_seconds, max_visible_percent.

**investor_events** — the activity timeline and simulator history (append-only)
session_id, investor_id, event_type, payload jsonb, occurred_at.
Event types: session_start, section_view, positions_selected, simulator_opened, assumption_changed, outcome_viewed, allocation_requested, session_end. Nothing is overwritten, so full history is kept.

**allocation_requests** — submitted requests
investor_id (nullable for anonymous visitors), session_id, full_name, phone, company, positions text[] (Investor A–F), ownership_percent, quarterly_capital_call, submitted_at.

Future tables plug in without touching the above: investor_documents, investor_reports, investor_updates, agreements, capital_calls, ownership_certificates — each keyed by investor_id.

## 2. Relationships

```text
investors 1───n investor_sessions 1───n investor_section_views
    │                   │
    │                   └──n investor_events
    └──n allocation_requests
```

## 3. Investor URL / auth architecture

- Route `src/routes/i.$token.tsx` renders the exact existing presentation, plus a subtle "Welcome, {first name}." line in the hero. Nothing else is personalized.
- Token: 32 bytes, base64url, generated server-side. Never sequential, never derived from name/email/id. No IDs, emails or phones in the URL or in any client payload.
- Token resolution happens in a server function; the browser only ever receives `{ firstName, fullName, phone, company, positionsOfInterest }` for that one investor plus an opaque session id. No admin data, no other investor's data, no token echoed into the DOM.
- Public routes stay untouched: `/` works exactly as today with no personalization and anonymous tracking off.
- Admin routes live under `_authenticated/admin/*` with a server-side role check (`user_roles` + `has_role`) — Cloud auth, not a shared password. All investor tables are RLS-locked so no anon role can read them; writes go only through validated server functions.

## 4. Tracking architecture

- One `useEngagement` hook mounted once in the personalized route. It uses IntersectionObserver per section plus a 1s ticker.
- Active time is credited only when: tab visible (`document.visibilityState`), section ≥50% in viewport, and no input/scroll idle beyond 60s.
- Buffered locally and flushed every ~15s and on `visibilitychange`/`pagehide` to a server function, which upserts section totals and appends events. Session end is inferred from the last flush.
- Simulator: position selection, each assumption change (debounced), and the resulting investor value / MOIC snapshot are recorded as events, so every session keeps its own history.
- Position selections record interest only; they never reserve anything.
- Privacy: no fingerprinting, no cross-site tracking, no third-party analytics. A one-line disclosure in the footer states that Nizek records presentation engagement for this private invitation.

## 5. Admin dashboard

- `/admin/investors` — table: Investor, Company, Status, First opened, Last opened, Visits, Time spent, Progress (sections viewed / 12), Simulator used, Allocation requested. Plus "Create investor" (name + email → Generate investor link → copy).
- `/admin/investors/$id` — header stats (status, first opened, last viewed, visits, total engagement, simulator, allocation interest), Section Engagement list with times, a most-viewed/skipped engagement bar, and the chronological activity timeline. Internal notes editable here.
- Built from existing primitives (Section, Reveal, label-xs/num typography) so the admin matches the site's monochrome design.

## 6. Security concerns and mitigations

- Token in a shared link = bearer credential. Mitigations: long random tokens, revocable (`status = declined`/token rotation), no sensitive data returned beyond the investor's own contact details, and rate limiting on token resolution.
- RLS: `anon` gets no select on any investor table; all reads happen in server functions (admin-verified) — one investor can never query another.
- Admin analytics require authentication and an admin role check server-side; a route guard alone is not the boundary.
- Allocation submissions validated with Zod server-side; token is verified server-side rather than trusting client-sent identity.
- Investor-facing UI shows zero analytics.

## 7. Reusable components

`Section`, `SectionHeading`, `Reveal`, `AnimatedNumber`, `ValueField`, `StudioControl`, `Chrome` nav (its section ids become the tracking taxonomy), `ModelProvider`/`investment.ts` (simulator state to observe), `investorPosition()` for Investor A–F naming, and `investor.functions.ts` as the base for the submission server function.

## 8. Request Allocation form v2 (your follow-up)

- Fields reduce to Full Name, Phone Number, Company / Family Office (optional). Email is removed from the form; for personalized visitors it comes from the investor record.
- Personalized visitor with complete details: no form — a "Your details" card showing name, phone, company, with an "Edit details" action that reveals editable fields.
- Partial record: only the missing fields render.
- Anonymous visitor on `/`: the current three-field form (email still required there, since it is the only way to reach them).
- Requested ownership is carried from the Investment section — positions, ownership %, quarterly capital call are displayed, not re-selected.
- Submission persists to `allocation_requests`, links to the investor record, sets status to `requested_allocation`, logs a timeline event, and emails investors@nizek.com with name, phone, company, positions, ownership %, quarterly capital call, and a link to the investor's admin profile.

## Build order once approved

1. Migration for the five tables + roles/RLS/grants.
2. Token generation + `/i/$token` route with hero welcome.
3. Engagement hook and flush server functions.
4. Simulator/position event tracking.
5. Request Allocation v2 with prefill.
6. Admin dashboard + investor detail page.

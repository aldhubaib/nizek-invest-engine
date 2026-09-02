# Investor Access, Engagement & Fund Data Architecture (Revised)

Architecture only — no application changes yet. All 15 corrections are folded in.

## 1. Final tables and columns

**funds**
`id uuid PK` · name · code · jurisdiction · status (enum `fund_status`) · created_at · updated_at
Seed row: Nizek Venture Studio Fund A / "Fund A" / Abu Dhabi, UAE / open.

**fund_positions** — single source of truth for Investor A–F availability
`id uuid PK` · `fund_id FK → funds.id` · position_code (enum `position_code`: A–F) · display_name ("Investor A"…) · ownership_percent numeric (5) · status (enum `position_status`: available / reserved / committed) · `committed_investor_id FK → investors.id NULL` · reserved_at · committed_at · created_at · updated_at
Unique (fund_id, position_code). The site, simulator, Request Allocation and admin all read this; the hard-coded `RESERVED_SEATS` constant is retired once live.

**investors** — identity only, no position
`id uuid PK` · full_name · email (unique) · phone NULL · company NULL · **access_token_hash (unique, sha-256 of raw token)** · token_issued_at · token_revoked_at NULL · engagement_status (enum) · allocation_status (enum) · internal_notes · first_viewed_at · last_viewed_at · total_visits int · total_active_seconds int · created_at · updated_at
No `access_token`, no `investor_position`, no `status`/`request_status` pair.

**investor_sessions**
`id uuid PK` · `investor_id FK → investors.id` · started_at · last_seen_at · ended_at NULL · active_seconds int · device_type (enum: mobile/tablet/desktop) · created_at
No IP, no user-agent string, no fingerprint.

**investor_section_views** — aggregated, not per-tick
`id uuid PK` · `session_id FK → investor_sessions.id` · `investor_id FK → investors.id` · section_id (enum `section_key`) · first_viewed_at · view_count int · active_seconds int · max_visible_percent int · updated_at
Unique (session_id, section_id) — one row per section per session, upserted on flush.

**investor_events** — timeline + simulator history (append-only, debounced)
`id uuid PK` · `session_id FK` · `investor_id FK` · event_type (enum `investor_event_type`) · payload jsonb · occurred_at
Event types: session_start, session_end, section_milestone, positions_selected, simulator_opened, assumption_changed, simulator_snapshot, allocation_requested.

**allocation_requests**
`id uuid PK` · `investor_id FK → investors.id NULL` · `fund_id FK → funds.id` · `session_id FK → investor_sessions.id NULL` · full_name · phone · company NULL · positions position_code[] · ownership_percent numeric · quarterly_capital_call numeric · message NULL · status (enum `allocation_status`) · submitted_at · created_at · updated_at

**portfolio_companies**
`id uuid PK` · `fund_id FK → funds.id` · name · status (enum `company_status`) · country · industry · created_at · updated_at

**quarterly_reports**
`id uuid PK` · `portfolio_company_id FK → portfolio_companies.id` · report_year int · report_quarter int (1–4) · period_start · period_end · submitted_at NULL · status (enum `report_status`: draft/submitted/published) · revenue NULL · expenses NULL · net_profit_loss NULL · cash_balance NULL · runway_months NULL · summary text · document_url NULL · created_at · updated_at
Unique (portfolio_company_id, report_year, report_quarter).

**user_roles** (admin auth) — `id uuid PK` · `user_id → auth.users` · role (enum `app_role`: admin/staff) · unique(user_id, role), plus `has_role()` security-definer function. Roles never live on a profile table.

## 2. Primary keys
Every table uses a `uuid` primary key with `gen_random_uuid()` default.

## 3. Foreign keys
fund_positions.fund_id → funds · fund_positions.committed_investor_id → investors (SET NULL)
investor_sessions.investor_id → investors (CASCADE)
investor_section_views.session_id → investor_sessions (CASCADE) · .investor_id → investors (CASCADE)
investor_events.session_id → investor_sessions (CASCADE) · .investor_id → investors (CASCADE)
allocation_requests.investor_id → investors (SET NULL) · .fund_id → funds · .session_id → investor_sessions (SET NULL)
portfolio_companies.fund_id → funds (CASCADE)
quarterly_reports.portfolio_company_id → portfolio_companies (CASCADE)

## 4. Relationships

```text
funds 1──n fund_positions ──0..1 investors (committed_investor_id)
  │
  ├──n portfolio_companies 1──n quarterly_reports
  └──n allocation_requests

investors 1──n investor_sessions 1──n investor_section_views
    │                 └──n investor_events
    └──n allocation_requests
```

## 5. Enum fields
`fund_status` (structuring, open, closed) · `position_code` (A–F) · `position_status` (available, reserved, committed) · `engagement_status` (invited, opened, reviewing, interested, inactive) · `allocation_status` (none, requested, under_review, approved, committed, declined) · `device_type` · `section_key` (hero, why_nizek, founder_pipeline, venture_model, regional_sourcing, equity_model, fund_structure, advantages, investment, simulator, team, request_allocation) · `investor_event_type` · `company_status` · `report_status` · `app_role`.

## 6. Token / session security flow

1. Admin creates an investor → server generates 32 random bytes → base64url raw token, shown **once** in the admin UI as the copyable link.
2. Only `sha256(token)` is stored in `access_token_hash`. The raw token is never persisted, logged, or emailed by the system.
3. Investor opens `/i/{token}` → server function hashes the input, looks up the hash, rejects revoked tokens.
4. On success the server issues a signed session cookie (`Secure`, `HttpOnly`, `SameSite=Lax`, ~30 day expiry) holding `investor_id` + `session_id`, then **redirects to `/presentation`** so the raw token disappears from the address bar, history, screenshots and referrers.
5. `Referrer-Policy: strict-origin-when-cross-origin` (or `no-referrer` on `/i/*`) is set at the response layer; `/i/*` also returns `noindex`.
6. Token rotation/revocation: setting `token_revoked_at` invalidates the link immediately; a new link can be re-issued without touching engagement history.

## 7. RLS strategy
RLS on every table. `anon` and `authenticated` get **no** read access to investors, sessions, section views, events, or allocation requests — all investor-side reads/writes go through server functions using the cookie-derived investor id, and every write is Zod-validated and scoped to that investor. Admin reads go through `requireSupabaseAuth` + `has_role(auth.uid(),'admin')`. `funds` and `fund_positions` expose a narrow public SELECT (safe columns only: position_code, display_name, ownership_percent, status) so availability can render without leaking `committed_investor_id`. `quarterly_reports` are readable only via server functions that first confirm the caller holds a committed position in the report's fund. Every table gets explicit GRANTs alongside its policies.

## 8. Personalized URL flow

```text
Admin creates investor → Generate investor link → /i/{raw token}
   ↓ (server: hash, match, verify not revoked)
Create investor_session + set HttpOnly cookie
   ↓ redirect
/presentation  ← clean URL, no token
   ↓
Hero shows "Welcome, {first name}." — nothing else personalized
   ↓
Engagement tracked → simulator modeled → allocation requested
   ↓
Admin manages the investor from /admin/investors
```

`/` stays public and unchanged, with no personalization and no tracking. It is a fallback, not the primary journey — all Fund workflows are designed around the personalized route.

## 9. How Investor A–F availability works
`fund_positions` is authoritative. The public presentation reads status per position (available / reserved / committed) and renders the same Investor A–F labels everywhere. Selecting positions in the simulator or the Investment section records **interest only** (a `positions_selected` event) and never mutates `fund_positions`. Submitting an allocation request writes the requested `position_code[]` to `allocation_requests` and sets the investor's `allocation_status = requested`; an admin may then mark positions `reserved` and finally `committed` with `committed_investor_id`. Interest, request and allocation are three distinct states, so a change of mind never corrupts availability.

## 10. How quarterly reports become visible to stakeholders
Access is derived, never duplicated per investor:

```text
investor → committed fund_positions (fund_id) → portfolio_companies of that fund → quarterly_reports (status = published)
```

A single server function resolves the investor from the session cookie, finds the funds where they hold a committed position, and returns published reports for that fund's companies. Adding Fund B later requires no schema change, and no report row is ever copied.

## 11. Engagement tracking (light by design)
One `useEngagement` hook, IntersectionObserver + 1s local ticker. Time is credited only when the tab is visible, the section is ≥50% in view, and the user has been active within 60s. Everything is aggregated **in the browser** and flushed every ~20s and on `pagehide`, upserting one row per section per session. Simulator assumption changes are debounced (~1.2s of settle time) into a single `assumption_changed` event, and a `simulator_snapshot` event records successful companies, valuation assumptions, fund ownership, investor ownership, portfolio estimated value, investor estimated value, profit, MOIC and timestamp. No per-second rows; the database stays a summary, not a log.

## 12. Admin dashboard
`/admin/investors` (admin-gated, server-side role check): Investor · Company/Family Office · Engagement status · Allocation status · First viewed · Last viewed · Visits · Active time · Presentation progress · Simulator used · Positions of interest · Allocation request. Plus "Create investor" → Generate investor link → copy once.
**Engagement level** (Low / Medium / High) is a transparent internal indicator computed from presentation completion, repeat visits, simulator usage, active time and allocation interaction — explicitly not a prediction or probability of investing.

`/admin/investors/$id` — tabbed CRM record: Overview · Engagement · Simulator history · Allocation · Quarterly report access · Activity · Internal notes. Only Overview, Engagement, Simulator history, Allocation, Activity and Notes ship first; the schema already supports the reports tab.

## 13. Request Allocation prefill
Personalized investors are never asked for email. With a complete record the section shows a "Your details" card (Name / Phone / Company) plus **Edit details**; with a partial record only the missing fields render; positions, ownership % and quarterly capital call carry over from the Investment section and are displayed, not re-selected. Submission writes `allocation_requests` (with investor_id, fund_id, session_id), logs an `allocation_requested` event, updates `allocation_status`, and emails investors@nizek.com including a link to the investor's admin profile.

## 14. Reused components
`Section`, `SectionHeading`, `Reveal`, `AnimatedNumber`, `ValueField`, `StudioControl`, `Chrome` (its section ids become `section_key`), `ModelProvider` / `investment.ts`, `investorPosition()`, and `investor.functions.ts` as the base for the submission function.

## 15. Recommended implementation order

1. Migration 1 — enums, `funds`, `fund_positions`, `user_roles` + `has_role`, GRANTs/RLS, Fund A seed with six positions.
2. Migration 2 — `investors`, `investor_sessions`, `investor_section_views`, `investor_events`, `allocation_requests`.
3. Migration 3 — `portfolio_companies`, `quarterly_reports`.
4. Token issue/verify server functions, cookie session, `/i/$token` → `/presentation` redirect, Referrer-Policy.
5. `/presentation` route reusing the existing page + hero welcome line.
6. Engagement hook + aggregated flush function.
7. Simulator/position event tracking (debounced snapshots).
8. Request Allocation v2 with prefill and DB persistence.
9. Admin auth, `/admin/investors` list with engagement level.
10. Investor detail tabs.
11. Switch the site from `RESERVED_SEATS` to live `fund_positions`.

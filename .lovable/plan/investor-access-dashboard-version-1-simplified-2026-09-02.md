# Investor Access Dashboard — Version 1 (simplified)

Most of this system already exists in the project. This plan trims it down to exactly the six things you asked for, and fills the gaps. The presentation content and design are not touched.

## What already works
- Private links `/i/<token>` — secure random token, only the hash is stored, token is stripped from the URL and swapped for a signed HttpOnly session cookie.
- Section-time tracking with IntersectionObserver + a 1-second local timer, flushed to the database every 15 seconds (never one write per second).
- Admin pages at `/admin/investors` and `/admin/investors/{id}`, behind sign-in.
- Allocation requests are stored with the selected Investor A–F positions.

## What changes

### 1. Add Investor — name and mobile only
- The dashboard gets an `+ Add Investor` button that opens a small panel with exactly two fields: **Full Name**, **Mobile Number**.
- Email and Company fields are removed from the create form.
- On `Create Investor`, show a confirmation card: name, mobile, the private link, and a `Copy Link` button.

### 2. Tracking rules tightened
- Time counts only when: the tab is active **and** the section is ≥40% visible **and** there has been mouse/keyboard/scroll/touch activity within the last **60 seconds** (new idle rule).
- Flush interval stays at 15s, plus on tab hide and page unload.

### 3. Investor list table
Columns, in this order: INVESTOR · MOBILE · STATUS (`NOT OPENED` / `VIEWED`) · LAST VIEWED · VISITS · TIME SPENT · SIMULATOR USED (Yes/No) · ALLOCATION REQUEST (e.g. "Investor C + D" or "—"). Engagement-scoring chips (hot/warm/cold) are removed.

### 4. Investor detail page
- Header: name, mobile, status, first opened, last viewed, visits, total active time, allocation request.
- **Section engagement**: all 12 sections listed in website order (Hero → Request Allocation), each with `m:ss` or `Not Viewed`, plus a simple horizontal bar showing time relative to the investor's most-viewed section.
- **Simulator**: `Used: Yes / No` and the last saved state (positions selected, ownership %, estimated investor value, MOIC). No history timeline.
- Tabs are collapsed into a single scrollable page; the Reports tab is dropped from V1.

### 5. Allocation request
On submit, the investor record is flagged `allocation_requested = true`, and the request row keeps the positions, ownership %, quarterly capital call and timestamp — already stored, just surfaced in the admin UI.

## Database
No new tables. V1 uses only:

| Table | Purpose |
|---|---|
| `investors` | id, full_name, phone (mobile), access_token_hash, created_at, first_viewed_at, last_viewed_at, total_visits, total_active_seconds, allocation_status |
| `investor_sessions` | one row per visit, active seconds |
| `investor_section_views` | per session + section: active seconds, view count |
| `allocation_requests` | requested positions, ownership %, quarterly call, submitted_at |

One small migration:
- add `allocation_requested boolean not null default false` and `simulator_used boolean not null default false` to `investors`, set when the matching event/request arrives.

Existing extra tables (`funds`, `fund_positions`, `portfolio_companies`, `quarterly_reports`, `investor_events`) stay in place but are not part of the V1 admin UI. `investor_events` continues to back the "simulator used" flag.

## Files touched
- `src/lib/admin.functions.ts` — create-investor takes name + mobile only; list/detail return the simplified shape.
- `src/routes/_authenticated/admin.investors.index.tsx` — Add Investor panel + new table.
- `src/routes/_authenticated/admin.investors.$id.tsx` — flattened detail page with ordered section bars.
- `src/hooks/useEngagement.ts` — 60-second idle rule.
- `src/lib/investor.functions.ts` — set the two new boolean flags.

## Security
Admin routes stay behind authentication; investor links carry no personal data in the URL; only token hashes are stored; no IP addresses, no fingerprinting; each investor session can only read and write its own record.

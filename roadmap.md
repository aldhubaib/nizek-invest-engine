# Roadmap

## Next
- [x] Admin generates private investor links from name + phone (no email sending); email optional.
- [x] Investor Access Dashboard v1: add investor (name + mobile only), copyable private link, opened/visits/time table, ordered section-engagement bars, simulator used flag, allocation request surfaced.
- [x] Allocation form prefilled from the private link (name + phone, no email field); request lands on the investor's admin profile.
- [ ] Quarterly reporting surfaces (admin entry + stakeholder view) on top of the existing portfolio_companies / quarterly_reports tables.

## Done
- [x] Personalized investor-access system: hashed invite tokens (`/i/:token` → signed HttpOnly cookie → `/presentation`), investor database, aggregated section + simulator tracking, admin dashboard at `/admin/investors` with investor detail tabs.
- [x] Request Allocation v2: prefill from the investor record, "Your details" + Edit details, live position availability from `fund_positions`, request persisted and emailed with admin profile link.
- [x] Section 12 CTA rewrite (Request Your Ownership Position)
- [x] Merged selection metrics with the live assumptions bar in Section 09

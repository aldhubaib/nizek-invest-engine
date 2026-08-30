# NIZEK — Interactive Investor Platform

An institutional-grade, interactive investment platform. Black canvas, white type, no ornament. Every number on every screen is computed live from a single financial engine.

## 1. Information architecture (pages)

| Route | Purpose |
|---|---|
| `/` | Cinematic opening. Thesis in one sentence, three live headline metrics (ARR at exit, MOIC, IRR) pulled from the engine, scroll-driven entry into the story. |
| `/thesis` | Why NIZEK exists: market, wedge, why now, why this team. Minimal editorial layout. |
| `/model` | The business model, explained mechanically: revenue lines, unit economics, cost structure, operating leverage. Live figures. |
| `/financials` | Full P&L, cash flow, headcount and cohort build. Year-by-year tables + charts, all engine-derived. |
| `/simulator` | The core interactive surface. Assumption controls on the left, live outputs across the right. Scenario save/compare. |
| `/returns` | Investor-specific: cap table, dilution, ownership over rounds, MOIC/IRR/DPI, waterfall at exit, sensitivity grid. |
| `/scenarios` | Bear / Base / Bull side-by-side, plus any custom scenarios the investor built. |
| `/roadmap` | Capital plan, milestones, use of funds — each milestone tied to model assumptions. |
| `/data-room` | Structured appendix: methodology, assumption sources, definitions, risk register, contact. |

Global chrome: thin fixed top nav with route links and a persistent scenario badge (shows active scenario + key metric), so the investor never loses context.

## 2. User journey

1. **Land** — one sentence, three numbers, an invitation to scroll.
2. **Understand** — thesis then model: what is sold, to whom, at what margin.
3. **Verify** — financials: the build-up behind the claims, no black boxes.
4. **Interrogate** — simulator: drag assumptions, watch every number move.
5. **Position** — returns: "if I put in X at Y valuation, here is my outcome."
6. **Compare** — scenarios side-by-side, including their own.
7. **Act** — roadmap and data room, then contact.

Each page ends with a single forward action, so the journey reads as one continuous document rather than a menu of pages.

## 3. Financial engine architecture

Pure TypeScript, framework-free, fully deterministic, unit-testable. No React inside it.

```text
src/model/
  assumptions.ts   default assumption set + metadata (label, unit, min, max, step, group)
  types.ts         Assumptions, ProjectionYear, Projection, Round, ReturnsResult
  engine.ts        project(assumptions) -> Projection   (the single entry point)
  revenue.ts       cohorts, retention, ARPA, expansion, new-logo acquisition
  costs.ts         COGS, headcount plan, S&M, R&D, G&A
  capital.ts       rounds, dilution, cap table evolution
  returns.ts       MOIC, IRR (Newton solve), payback, exit waterfall
  scenarios.ts     bear/base/bull assumption overlays
  sensitivity.ts   2-D grid sweeps over any two assumptions
  format.ts        currency / multiple / percent formatting
```

`project(assumptions)` runs monthly internally and rolls up to years. It returns one immutable object holding: revenue by line, gross profit, opex by function, EBITDA, net income, cash balance, runway, headcount, cohort table, cap table by round, and derived KPIs (CAC, LTV, LTV/CAC, payback, magic number, Rule of 40, burn multiple).

Nothing is hardcoded in components. A component that shows a number reads it from the projection.

## 4. Data model

- `Assumptions` — a flat, typed record of every input (growth, churn, pricing, margins, hiring, round sizes, valuations, exit multiple, exit year, investor ticket).
- `AssumptionMeta` — display metadata driving the simulator UI automatically: any new assumption added to the model appears as a control with no UI work.
- `Projection` — the computed output tree, memoized on the assumption object.
- `Scenario` — `{ id, name, overrides: Partial<Assumptions> }`. Bear/base/bull ship as presets; custom scenarios are created from the current simulator state.

State lives in one React context (`ModelProvider`) holding the active assumptions, saved scenarios, and the memoized projection. Every page consumes it through `useModel()`. Changing one slider re-derives the whole site instantly. Scenarios and custom assumptions persist to localStorage and encode into the URL so an investor can share the exact state they built.

## 5. Reusable components

- `Metric` — label, value, unit, optional delta vs. base case.
- `MetricRow` / `MetricGrid` — hairline-divided clusters of metrics.
- `AssumptionControl` — slider + numeric entry, rendered from `AssumptionMeta`.
- `LineChart`, `BarChart`, `WaterfallChart`, `SensitivityGrid`, `Sparkline` — minimal, monochrome, no chrome, no legend clutter, hairline axes.
- `DataTable` — year-column financial tables with sticky first column.
- `ScenarioBar` — active scenario, quick switch, reset.
- `Section`, `SectionHeading`, `Reveal` — the layout and scroll-animation primitives every page composes from.

Charts are monochrome: white primary line, gray comparison lines, no fills, no gradients.

## 6. How calculations flow

`Assumptions` → `project()` → `Projection` → components. One direction, no local math in the UI, no duplicated formulas. Derived investor figures (`MOIC`, `IRR`, waterfall) are computed from the projection plus the investor's ticket, so the returns page reacts to both business assumptions and investment terms.

## 7. How the simulator works

Left rail: assumption groups (Growth, Retention, Pricing, Costs, Capital, Exit), each control live-bound. Right: a fixed KPI header (ARR, EBITDA, cash-out date, MOIC, IRR) plus charts that redraw on every change. The base case is always drawn as a faint gray reference line, so the investor sees the delta they just created. Reset, save-as-scenario, and share-link actions sit in the scenario bar.

## 8. Design system

Pure black background, white foreground, three gray steps for secondary text and hairlines. One font family, used at extreme scale contrast — display sizes for statements, small caps-tracked labels for data. Radius near zero. 1px borders at ~10% white. Motion: slow opacity/translate reveals on scroll, eased number transitions when values change, no bounce, no color. Everything defined as tokens in `src/styles.css`; no color utilities in components.

## 9. Future expansion

- New revenue line → add to `revenue.ts` + assumptions; it flows into every chart automatically.
- New assumption → add to `assumptions.ts` with metadata; the simulator control appears on its own.
- New page → composes existing primitives against `useModel()`.
- Real data later → Lovable Cloud can back scenario sharing, investor accounts, and a gated data room without touching the engine.

## 10. Build order (after approval)

1. Design system + shell + nav.
2. Financial engine + model context.
3. Home.
4. Model + Financials.
5. Simulator.
6. Returns + Scenarios.
7. Roadmap + Data room.
8. Polish: motion, SEO, responsive.

## Open inputs needed from you

Real NIZEK numbers: revenue lines and pricing, current traction, cost base, raise size and valuation, target exit year/multiple. Until you supply them, the engine ships with clearly-labelled placeholder defaults that are trivially swapped in one file.

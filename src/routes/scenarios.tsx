import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { Reveal, Section, SectionHeading } from "@/components/ui/primitives";
import { DataTable } from "@/components/ui/DataTable";
import { LineChart } from "@/components/charts/Charts";
import { NextStep } from "@/components/site/Chrome";
import { useModel } from "@/model/context";
import { defaultAssumptions } from "@/model/assumptions";
import { project } from "@/model/engine";
import { currency, multiple, percent } from "@/model/format";

export const Route = createFileRoute("/scenarios")({
  head: () => ({
    meta: [
      { title: "Scenarios — NIZEK" },
      {
        name: "description",
        content: "Bear, base and bull cases for NIZEK side by side, plus any scenario you build yourself.",
      },
      { property: "og:title", content: "Scenarios — NIZEK" },
      { property: "og:description", content: "Three cases, one model. Compare outcomes side by side." },
    ],
  }),
  component: Scenarios,
});

function Scenarios() {
  const { scenarios, assumptions, isCustom, loadScenario } = useModel();

  const rows = useMemo(() => {
    const list = scenarios.map((s) => ({
      name: s.name,
      projection: project({ ...defaultAssumptions, ...s.overrides }),
    }));
    if (isCustom) list.push({ name: "Yours", projection: project(assumptions) });
    return list;
  }, [scenarios, assumptions, isCustom]);

  const labels = rows[0]!.projection.years.map((y) => y.label);

  return (
    <div>
      <Section className="border-t-0 pt-32">
        <Reveal>
          <div className="label-xs">Scenarios</div>
          <h1 className="display-xl mt-10 max-w-4xl text-5xl md:text-8xl">
            One model. Several futures.
          </h1>
          <p className="mt-10 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
            Each case is the same engine with a different assumption overlay. Select one to make it
            the active state across the entire platform.
          </p>
        </Reveal>
      </Section>

      <Section>
        <SectionHeading index="01 — Comparison" title="Side by side." />
        <DataTable
          corner="Case"
          columns={rows.map((r) => r.name)}
          rows={[
            { label: "Terminal ARR", values: rows.map((r) => currency(r.projection.returns.exitArr)), emphasis: true },
            { label: "Exit valuation", values: rows.map((r) => currency(r.projection.returns.exitValuation)) },
            { label: "Your proceeds", values: rows.map((r) => currency(r.projection.returns.proceeds)) },
            { label: "MOIC", values: rows.map((r) => multiple(r.projection.returns.moic)), emphasis: true },
            {
              label: "IRR",
              values: rows.map((r) =>
                Number.isFinite(r.projection.returns.irr) ? percent(r.projection.returns.irr, 0) : "n/a",
              ),
              emphasis: true,
              divider: true,
            },
            { label: "LTV / CAC", values: rows.map((r) => multiple(r.projection.kpis.ltvToCac)) },
            { label: "Rule of 40", values: rows.map((r) => percent(r.projection.kpis.ruleOf40, 0)) },
            { label: "Lowest cash", values: rows.map((r) => currency(r.projection.kpis.cashLow)) },
            {
              label: "Breakeven",
              values: rows.map((r) =>
                r.projection.kpis.breakevenMonth ? `M${r.projection.kpis.breakevenMonth}` : "—",
              ),
            },
          ]}
        />
        <div className="mt-10 flex flex-wrap gap-6">
          {scenarios.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => loadScenario(s.id)}
              className="label-xs border border-border px-5 py-3 transition-colors hover:border-foreground hover:text-foreground"
            >
              Activate {s.name}
            </button>
          ))}
        </div>
      </Section>

      <Section>
        <SectionHeading index="02 — Divergence" title="ARR across cases." />
        <Reveal>
          <div className="text-foreground">
            <LineChart
              series={rows.map((r, i) => ({
                name: r.name,
                values: r.projection.years.map((y) => y.arr),
                muted: i !== rows.length - 1,
              }))}
              labels={labels}
              format={(v) => currency(v)}
            />
          </div>
          <div className="label-xs mt-4">{rows.map((r) => r.name).join(" · ")}</div>
        </Reveal>
      </Section>

      <Section>
        <Reveal>
          <NextStep to="/roadmap" label="Capital plan and milestones" />
        </Reveal>
      </Section>
    </div>
  );
}

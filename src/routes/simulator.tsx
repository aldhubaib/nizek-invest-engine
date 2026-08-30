import { createFileRoute } from "@tanstack/react-router";
import { assumptionGroups, assumptionMeta } from "@/model/assumptions";
import { AssumptionControl } from "@/components/model/AssumptionControl";
import { ScenarioBar } from "@/components/model/ScenarioBar";
import { LineChart } from "@/components/charts/Charts";
import { Metric, Reveal } from "@/components/ui/primitives";
import { NextStep } from "@/components/site/Chrome";
import { useModel } from "@/model/context";
import { currency, multiple, percent } from "@/model/format";

export const Route = createFileRoute("/simulator")({
  head: () => ({
    meta: [
      { title: "Simulator — NIZEK" },
      {
        name: "description",
        content: "Move any assumption and watch NIZEK's revenue, cash, and your return re-price instantly.",
      },
      { property: "og:title", content: "Simulator — NIZEK" },
      { property: "og:description", content: "An investor decision engine: drag assumptions, see outcomes live." },
    ],
  }),
  component: Simulator,
});

function Simulator() {
  const { projection, baseProjection } = useModel();
  const { years, returns, kpis } = projection;
  const labels = years.map((y) => y.label);

  return (
    <div>
      <ScenarioBar />
      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr]">
        <aside className="border-b border-border px-6 py-10 lg:sticky lg:top-[73px] lg:h-[calc(100vh-73px)] lg:overflow-y-auto lg:border-b-0 lg:border-r lg:px-8">
          <div className="label-xs">Assumptions</div>
          {assumptionGroups.map((g) => (
            <div key={g} className="mt-10">
              <div className="border-b border-border-strong pb-3 text-sm text-foreground">{g}</div>
              {assumptionMeta
                .filter((m) => m.group === g)
                .map((m) => (
                  <AssumptionControl key={m.key} meta={m} />
                ))}
            </div>
          ))}
        </aside>

        <main className="px-6 py-10 md:px-12">
          <div className="grid grid-cols-2 gap-px border border-border bg-border lg:grid-cols-5">
            {[
              { label: `ARR · Y${returns.holdYears}`, value: currency(returns.exitArr) },
              { label: "Exit valuation", value: currency(returns.exitValuation) },
              { label: "Your proceeds", value: currency(returns.proceeds) },
              { label: "MOIC", value: multiple(returns.moic) },
              { label: "IRR", value: Number.isFinite(returns.irr) ? percent(returns.irr, 0) : "n/a" },
            ].map((k) => (
              <div key={k.label} className="bg-background p-6">
                <Metric label={k.label} value={k.value} size="sm" />
              </div>
            ))}
          </div>

          <div className="mt-16 text-foreground">
            <div className="label-xs mb-6">ARR — your case against base case</div>
            <LineChart
              series={[
                { name: "Base", values: baseProjection.years.map((y) => y.arr), muted: true, dashed: true },
                { name: "Current", values: years.map((y) => y.arr) },
              ]}
              labels={labels}
              format={(v) => currency(v)}
            />
          </div>

          <div className="mt-16 text-foreground">
            <div className="label-xs mb-6">EBITDA — your case against base case</div>
            <LineChart
              series={[
                { name: "Base", values: baseProjection.years.map((y) => y.ebitda), muted: true, dashed: true },
                { name: "Current", values: years.map((y) => y.ebitda) },
              ]}
              labels={labels}
              format={(v) => currency(v)}
            />
          </div>

          <div className="mt-16 grid grid-cols-2 gap-px border border-border bg-border md:grid-cols-4">
            {[
              { label: "LTV / CAC", value: multiple(kpis.ltvToCac) },
              { label: "Payback", value: `${Math.round(kpis.paybackMonths)} mo` },
              { label: "Rule of 40", value: percent(kpis.ruleOf40, 0) },
              { label: "Lowest cash", value: currency(kpis.cashLow) },
            ].map((k) => (
              <div key={k.label} className="bg-background p-6">
                <Metric label={k.label} value={k.value} size="sm" />
              </div>
            ))}
          </div>

          <Reveal className="mt-20">
            <NextStep to="/returns" label="What this means for you" />
          </Reveal>
        </main>
      </div>
    </div>
  );
}

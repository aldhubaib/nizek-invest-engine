import { createFileRoute } from "@tanstack/react-router";
import { Metric, MetricCell, MetricGrid, Reveal, Section, SectionHeading } from "@/components/ui/primitives";
import { BarChart, LineChart } from "@/components/charts/Charts";
import { DataTable } from "@/components/ui/DataTable";
import { NextStep } from "@/components/site/Chrome";
import { useModel } from "@/model/context";
import { currency, multiple, percent } from "@/model/format";

export const Route = createFileRoute("/model")({
  head: () => ({
    meta: [
      { title: "Business Model — NIZEK" },
      {
        name: "description",
        content: "The NIZEK business model explained mechanically: revenue build, unit economics, cost structure and operating leverage.",
      },
      { property: "og:title", content: "Business Model — NIZEK" },
      { property: "og:description", content: "Revenue build, unit economics and operating leverage, computed live." },
    ],
  }),
  component: ModelPage,
});

function ModelPage() {
  const { projection, assumptions } = useModel();
  const { years, kpis } = projection;
  const labels = years.map((y) => y.label);

  return (
    <div>
      <Section className="border-t-0 pt-32">
        <Reveal>
          <div className="label-xs">Business model</div>
          <h1 className="display-xl mt-10 max-w-4xl text-5xl md:text-8xl">
            Clients in, margin out.
          </h1>
          <p className="mt-10 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
            Three mechanisms drive everything: how many clients arrive, how long they stay and how
            much they spend, and what it costs to serve them. Every other figure is derived.
          </p>
        </Reveal>
      </Section>

      <Section>
        <SectionHeading index="01 — Revenue engine" title="The build, step by step." />
        <div className="grid grid-cols-1 gap-px border border-border bg-border lg:grid-cols-3">
          {[
            {
              t: "Acquisition",
              v: `${Math.round(assumptions.newCustomersMonth1)} / month`,
              d: `New logos compound at ${percent(assumptions.acquisitionGrowth)} month over month.`,
            },
            {
              t: "Retention",
              v: percent(assumptions.netExpansion, 0),
              d: `Net revenue retention against ${percent(assumptions.monthlyChurn)} monthly logo churn.`,
            },
            {
              t: "Contract value",
              v: `${currency(assumptions.arpa)} / mo`,
              d: `Average revenue per client, rising ${percent(assumptions.annualPriceIncrease, 0)} a year.`,
            },
          ].map((c) => (
            <div key={c.t} className="bg-background p-10">
              <div className="label-xs">{c.t}</div>
              <div className="num mt-5 text-3xl">{c.v}</div>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{c.d}</p>
            </div>
          ))}
        </div>
        <Reveal className="mt-16">
          <div className="text-foreground">
            <BarChart
              values={years.map((y) => y.customers)}
              labels={labels}
              format={(v) => Math.round(v).toString()}
            />
            <div className="label-xs mt-4">Active clients, end of year</div>
          </div>
        </Reveal>
      </Section>

      <Section>
        <SectionHeading
          index="02 — Unit economics"
          title="What one client is worth."
          lede="Lifetime value is gross-margin revenue per client divided by monthly churn. Nothing is smoothed."
        />
        <MetricGrid>
          <MetricCell>
            <Metric label="Lifetime value" value={currency(kpis.ltv)} />
          </MetricCell>
          <MetricCell>
            <Metric label="Acquisition cost" value={currency(kpis.cac)} />
          </MetricCell>
          <MetricCell>
            <Metric label="LTV / CAC" value={multiple(kpis.ltvToCac)} />
          </MetricCell>
          <MetricCell>
            <Metric label="Payback" value={`${Math.round(kpis.paybackMonths)} mo`} />
          </MetricCell>
        </MetricGrid>
      </Section>

      <Section>
        <SectionHeading index="03 — Operating leverage" title="Cost falls as a share of revenue." />
        <Reveal>
          <div className="text-foreground">
            <LineChart
              series={[
                { name: "Gross profit", values: years.map((y) => y.grossProfit) },
                { name: "Operating cost", values: years.map((y) => y.opex), muted: true, dashed: true },
              ]}
              labels={labels}
              format={(v) => currency(v)}
            />
          </div>
          <div className="label-xs mt-4">Solid: gross profit · Dashed: operating cost</div>
        </Reveal>
        <div className="mt-16">
          <DataTable
            corner="Cost structure"
            columns={labels}
            rows={[
              { label: "Sales & marketing", values: years.map((y) => currency(y.sm)) },
              { label: "Research & development", values: years.map((y) => currency(y.rd)) },
              { label: "General & administrative", values: years.map((y) => currency(y.ga)) },
              { label: "Total operating cost", values: years.map((y) => currency(y.opex)), emphasis: true, divider: true },
              { label: "EBITDA margin", values: years.map((y) => percent(y.ebitdaMargin, 0)), emphasis: true },
            ]}
          />
        </div>
      </Section>

      <Section>
        <Reveal>
          <NextStep to="/financials" label="See the full financials" />
        </Reveal>
      </Section>
    </div>
  );
}

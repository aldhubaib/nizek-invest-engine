import { createFileRoute } from "@tanstack/react-router";
import { Metric, MetricCell, MetricGrid, Reveal, Section, SectionHeading } from "@/components/ui/primitives";
import { BarChart, LineChart } from "@/components/charts/Charts";
import { DataTable } from "@/components/ui/DataTable";
import { NextStep } from "@/components/site/Chrome";
import { useModel } from "@/model/context";
import { currency, number, percent } from "@/model/format";

export const Route = createFileRoute("/financials")({
  head: () => ({
    meta: [
      { title: "Financials — NIZEK" },
      {
        name: "description",
        content: "Full P&L, cash flow, headcount and client build for NIZEK, generated live from the financial engine.",
      },
      { property: "og:title", content: "Financials — NIZEK" },
      { property: "og:description", content: "Year-by-year P&L, cash and headcount from the live model." },
    ],
  }),
  component: Financials,
});

function Financials() {
  const { projection } = useModel();
  const { years, kpis, months } = projection;
  const labels = years.map((y) => y.label);

  return (
    <div>
      <Section className="border-t-0 pt-32">
        <Reveal>
          <div className="label-xs">Financials</div>
          <h1 className="display-xl mt-10 max-w-4xl text-5xl md:text-8xl">No black boxes.</h1>
          <p className="mt-10 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
            The complete build-up behind every claim on this platform. Each row is computed monthly
            and rolled up; nothing is typed in.
          </p>
        </Reveal>
      </Section>

      <Section>
        <SectionHeading index="01 — Income statement" title="Profit and loss." />
        <DataTable
          corner="US$"
          columns={labels}
          rows={[
            { label: "Revenue", values: years.map((y) => currency(y.revenue)), emphasis: true },
            { label: "Cost of revenue", values: years.map((y) => currency(-(y.revenue - y.grossProfit))) },
            { label: "Gross profit", values: years.map((y) => currency(y.grossProfit)), emphasis: true, divider: true },
            { label: "Sales & marketing", values: years.map((y) => currency(-y.sm)) },
            { label: "Research & development", values: years.map((y) => currency(-y.rd)) },
            { label: "General & administrative", values: years.map((y) => currency(-y.ga)) },
            { label: "EBITDA", values: years.map((y) => currency(y.ebitda)), emphasis: true, divider: true },
            { label: "EBITDA margin", values: years.map((y) => percent(y.ebitdaMargin, 0)) },
          ]}
        />
      </Section>

      <Section>
        <SectionHeading index="02 — Cash" title="Balance and burn." />
        <Reveal>
          <div className="text-foreground">
            <LineChart
              series={[{ name: "Cash", values: months.filter((_, i) => i % 3 === 0).map((m) => m.cash) }]}
              labels={months
                .filter((_, i) => i % 3 === 0)
                .map((m) => (m.month % 12 === 1 || m.month === 1 ? `Y${Math.ceil(m.month / 12)}` : ""))}
              format={(v) => currency(v)}
            />
          </div>
        </Reveal>
        <div className="mt-16">
          <MetricGrid>
            <MetricCell>
              <Metric label="Lowest cash point" value={currency(kpis.cashLow)} />
            </MetricCell>
            <MetricCell>
              <Metric label="Peak monthly burn" value={currency(kpis.peakBurn)} />
            </MetricCell>
            <MetricCell>
              <Metric
                label="EBITDA breakeven"
                value={kpis.breakevenMonth ? `Month ${kpis.breakevenMonth}` : "Beyond horizon"}
              />
            </MetricCell>
            <MetricCell>
              <Metric label="Runway" value={`${kpis.runwayMonths} mo`} note="Months before cash turns negative" />
            </MetricCell>
          </MetricGrid>
        </div>
      </Section>

      <Section>
        <SectionHeading index="03 — EBITDA by year" title="The crossover." />
        <Reveal>
          <div className="text-foreground">
            <BarChart values={years.map((y) => y.ebitda)} labels={labels} format={(v) => currency(v)} />
          </div>
        </Reveal>
      </Section>

      <Section>
        <SectionHeading index="04 — Operating build" title="Clients and headcount." />
        <DataTable
          corner="Operations"
          columns={labels}
          rows={[
            { label: "New clients", values: years.map((y) => number(y.newCustomers)) },
            { label: "Active clients", values: years.map((y) => number(y.customers)), emphasis: true },
            { label: "ARR", values: years.map((y) => currency(y.arr)), emphasis: true },
            { label: "Implied headcount", values: years.map((y) => number(y.headcount)) },
            { label: "Revenue / head", values: years.map((y) => currency(y.revenue / y.headcount)) },
          ]}
        />
      </Section>

      <Section>
        <Reveal>
          <NextStep to="/simulator" label="Change the assumptions" />
        </Reveal>
      </Section>
    </div>
  );
}

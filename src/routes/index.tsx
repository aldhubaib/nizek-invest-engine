import { createFileRoute } from "@tanstack/react-router";
import { useModel } from "@/model/context";
import { currency, multiple, percent } from "@/model/format";
import { Metric, MetricCell, MetricGrid, Reveal, Section, SectionHeading } from "@/components/ui/primitives";
import { LineChart } from "@/components/charts/Charts";
import { NextStep } from "@/components/site/Chrome";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NIZEK — Interactive Investor Platform" },
      {
        name: "description",
        content:
          "An interactive investment platform for NIZEK: live financial model, scenario simulator and investor return engine.",
      },
      { property: "og:title", content: "NIZEK — Interactive Investor Platform" },
      {
        property: "og:description",
        content: "Interrogate the model. Move the assumptions. See your return, live.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const { projection } = useModel();
  const { returns, years, kpis } = projection;

  return (
    <div>
      <section className="flex min-h-[88vh] flex-col justify-between px-6 pb-16 pt-24 md:px-12 md:pt-40">
        <Reveal>
          <div className="label-xs">Series A · Confidential investor materials</div>
          <h1 className="display-xl mt-10 max-w-5xl text-[13vw] leading-[0.88] md:text-[7.5vw]">
            The business, <br />
            not the pitch.
          </h1>
          <p className="mt-10 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
            NIZEK is a venture studio that builds and operates software companies. Everything on
            this platform is computed live from one financial model. Change an assumption, and the
            entire thesis re-prices in front of you.
          </p>
        </Reveal>

        <Reveal delay={200}>
          <div className="mt-24 grid grid-cols-1 gap-px border-t border-border bg-border md:grid-cols-3">
            <div className="bg-background pt-8 md:pr-8">
              <Metric
                label={`ARR at exit · Y${returns.holdYears}`}
                value={currency(returns.exitArr)}
                size="lg"
              />
            </div>
            <div className="bg-background pt-8 md:px-8">
              <Metric label="Gross MOIC" value={multiple(returns.moic)} size="lg" />
            </div>
            <div className="bg-background pt-8 md:pl-8">
              <Metric
                label="Net IRR"
                value={Number.isFinite(returns.irr) ? percent(returns.irr, 0) : "n/a"}
                size="lg"
              />
            </div>
          </div>
        </Reveal>
      </section>

      <Section>
        <SectionHeading
          index="01 — Trajectory"
          title="Revenue is a consequence of the model."
          lede="Annual recurring revenue across the projection horizon, generated from the current assumption set."
        />
        <Reveal>
          <div className="text-foreground">
            <LineChart
              series={[{ name: "ARR", values: years.map((y) => y.arr) }]}
              labels={years.map((y) => y.label)}
              format={(v) => currency(v)}
            />
          </div>
        </Reveal>
      </Section>

      <Section>
        <SectionHeading index="02 — Quality of the business" title="Unit economics." />
        <MetricGrid>
          <MetricCell>
            <Metric label="LTV / CAC" value={multiple(kpis.ltvToCac)} note="Lifetime value over acquisition cost" />
          </MetricCell>
          <MetricCell>
            <Metric
              label="CAC payback"
              value={`${Math.round(kpis.paybackMonths)} mo`}
              note="Gross-margin months to recover acquisition cost"
            />
          </MetricCell>
          <MetricCell>
            <Metric label="Rule of 40" value={percent(kpis.ruleOf40, 0)} note="Growth plus margin, Y2" />
          </MetricCell>
          <MetricCell>
            <Metric label="Burn multiple" value={multiple(kpis.burnMultiple)} note="Cash burned per dollar of net new ARR" />
          </MetricCell>
        </MetricGrid>
      </Section>

      <Section>
        <Reveal>
          <div className="flex flex-col gap-10">
            <p className="display-xl max-w-4xl text-3xl md:text-5xl">
              Read the thesis, then take the model apart yourself.
            </p>
            <div className="flex flex-wrap gap-12">
              <NextStep to="/thesis" label="The thesis" />
              <NextStep to="/simulator" label="Open the simulator" />
            </div>
          </div>
        </Reveal>
      </Section>
    </div>
  );
}

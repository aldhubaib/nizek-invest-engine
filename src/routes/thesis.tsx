import { createFileRoute } from "@tanstack/react-router";
import { Metric, MetricCell, MetricGrid, Reveal, Section, SectionHeading } from "@/components/ui/primitives";
import { NextStep } from "@/components/site/Chrome";
import { useModel } from "@/model/context";
import { currency, percent } from "@/model/format";

export const Route = createFileRoute("/thesis")({
  head: () => ({
    meta: [
      { title: "Thesis — NIZEK" },
      {
        name: "description",
        content: "Why NIZEK exists: the market, the wedge, why now, and the operating discipline behind it.",
      },
      { property: "og:title", content: "Thesis — NIZEK" },
      { property: "og:description", content: "Market, wedge, timing and team behind the NIZEK venture studio." },
    ],
  }),
  component: Thesis,
});

const pillars = [
  {
    index: "01",
    title: "A studio, not a fund",
    body: "NIZEK originates its own companies. Ownership at formation is structurally higher than any external round can buy, and the cost of the first customer is shared across the portfolio.",
  },
  {
    index: "02",
    title: "Operating leverage is designed in",
    body: "Shared engineering, design, and go-to-market infrastructure means each new venture inherits a platform rather than rebuilding one. Incremental margin rises with every launch.",
  },
  {
    index: "03",
    title: "Revenue before conviction",
    body: "Every venture is underwritten against contracted revenue, not narrative. The model on this platform is the same one used internally to decide what gets built.",
  },
  {
    index: "04",
    title: "Compounding distribution",
    body: "Enterprise relationships built for one venture become the acquisition channel for the next. Acquisition cost declines as the portfolio matures.",
  },
];

function Thesis() {
  const { projection } = useModel();
  const y = projection.years;
  const last = y[y.length - 1]!;

  return (
    <div>
      <Section className="border-t-0 pt-32">
        <Reveal>
          <div className="label-xs">Thesis</div>
          <h1 className="display-xl mt-10 max-w-4xl text-5xl md:text-8xl">
            Studios beat funds when execution is the scarce asset.
          </h1>
          <p className="mt-10 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
            Capital is abundant. Operators who can take a product from zero to contracted revenue
            are not. NIZEK is built to industrialise that step and to own the outcome.
          </p>
        </Reveal>
      </Section>

      <Section>
        <SectionHeading index="01 — Pillars" title="Four reasons this compounds." />
        <div className="grid grid-cols-1 gap-px border border-border bg-border md:grid-cols-2">
          {pillars.map((p, i) => (
            <div key={p.index} className="bg-background p-10 md:p-14">
              <Reveal delay={i * 80}>
                <div className="label-xs">{p.index}</div>
                <h3 className="display-xl mt-6 text-2xl md:text-3xl">{p.title}</h3>
                <p className="mt-5 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
              </Reveal>
            </div>
          ))}
        </div>
      </Section>

      <Section>
        <SectionHeading
          index="02 — What the thesis produces"
          title="The end state, in numbers."
          lede="These figures are not written into the page. They are the terminal year of the live model."
        />
        <MetricGrid cols={3}>
          <MetricCell>
            <Metric label={`Revenue · ${last.label}`} value={currency(last.revenue)} />
          </MetricCell>
          <MetricCell>
            <Metric label={`EBITDA margin · ${last.label}`} value={percent(last.ebitdaMargin, 0)} />
          </MetricCell>
          <MetricCell>
            <Metric label={`Clients · ${last.label}`} value={Math.round(last.customers).toString()} />
          </MetricCell>
        </MetricGrid>
      </Section>

      <Section>
        <Reveal>
          <NextStep to="/model" label="How the model works" />
        </Reveal>
      </Section>
    </div>
  );
}

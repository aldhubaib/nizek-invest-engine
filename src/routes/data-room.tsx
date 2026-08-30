import { createFileRoute } from "@tanstack/react-router";
import { Reveal, Section, SectionHeading } from "@/components/ui/primitives";
import { DataTable } from "@/components/ui/DataTable";
import { useModel } from "@/model/context";
import { assumptionMeta } from "@/model/assumptions";
import { formatByUnit } from "@/model/format";

export const Route = createFileRoute("/data-room")({
  head: () => ({
    meta: [
      { title: "Data Room — NIZEK" },
      {
        name: "description",
        content: "Methodology, definitions, the full assumption register and risk factors behind the NIZEK model.",
      },
      { property: "og:title", content: "Data Room — NIZEK" },
      { property: "og:description", content: "Methodology, definitions, assumptions and risks." },
    ],
  }),
  component: DataRoom,
});

const definitions = [
  ["ARR", "Ending monthly recurring revenue for the year, annualised."],
  ["LTV", "Gross-margin revenue per client divided by monthly logo churn."],
  ["CAC payback", "Acquisition cost divided by monthly gross profit per client."],
  ["Rule of 40", "Year-two revenue growth plus year-two EBITDA margin."],
  ["Burn multiple", "Cumulative two-year cash burn per dollar of net new ARR."],
  ["MOIC", "Gross proceeds at exit divided by capital invested."],
  ["IRR", "Annualised return solved from the investment and exit cash flows."],
];

const risks = [
  ["Acquisition", "Growth in new logos is the single largest driver of terminal value. A sustained shortfall compresses the exit multiple as well as revenue."],
  ["Retention", "Net revenue retention below 100% inverts the compounding effect of the installed base."],
  ["Pricing", "Contract value assumes annual uplift; competitive pressure would flatten it."],
  ["Capital", "The follow-on round is modelled as certain. A delayed or smaller round shortens runway."],
  ["Exit", "Terminal value uses a revenue multiple. Multiple compression affects returns more than operating performance in most cases."],
];

function DataRoom() {
  const { assumptions } = useModel();

  return (
    <div>
      <Section className="border-t-0 pt-32">
        <Reveal>
          <div className="label-xs">Data room</div>
          <h1 className="display-xl mt-10 max-w-4xl text-5xl md:text-8xl">The fine print.</h1>
          <p className="mt-10 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
            Methodology, definitions, the complete assumption register and the risks that would
            break the case.
          </p>
        </Reveal>
      </Section>

      <Section>
        <SectionHeading
          index="01 — Methodology"
          title="How the model computes."
          lede="The engine runs 84 monthly periods and rolls them into years. Client counts decay at monthly churn and grow with compounding acquisition. Contract value grows with net expansion and annual price increase. Cost of revenue is a margin assumption; sales and marketing is acquisition-driven; R&D and G&A scale with revenue over a fixed base. Cash starts with the round, absorbs monthly EBITDA and receives the follow-on. Returns solve MOIC and IRR from the investor cash flows against ownership after dilution."
        />
      </Section>

      <Section>
        <SectionHeading index="02 — Assumption register" title="Every input, current value." />
        <DataTable
          corner="Input"
          columns={["Group", "Value", "Range"]}
          rows={assumptionMeta.map((m) => ({
            label: m.label,
            values: [
              m.group,
              formatByUnit(assumptions[m.key], m.unit),
              `${formatByUnit(m.min, m.unit)} – ${formatByUnit(m.max, m.unit)}`,
            ],
          }))}
        />
      </Section>

      <Section>
        <SectionHeading index="03 — Definitions" title="Terms used on this platform." />
        <div className="border-t border-border">
          {definitions.map(([term, def]) => (
            <div key={term} className="grid grid-cols-1 gap-4 border-b border-border py-6 md:grid-cols-[240px_1fr]">
              <div className="text-sm text-foreground">{term}</div>
              <div className="text-sm leading-relaxed text-muted-foreground">{def}</div>
            </div>
          ))}
        </div>
      </Section>

      <Section>
        <SectionHeading index="04 — Risk register" title="What would break this." />
        <div className="grid grid-cols-1 gap-px border border-border bg-border md:grid-cols-2">
          {risks.map(([t, d]) => (
            <div key={t} className="bg-background p-10">
              <div className="label-xs">{t}</div>
              <p className="mt-5 text-sm leading-relaxed text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section>
        <Reveal>
          <div className="flex flex-col gap-8">
            <p className="display-xl max-w-3xl text-3xl md:text-5xl">
              Questions the model can't answer?
            </p>
            <a
              href="mailto:investors@nizek.com"
              className="num border-b border-border-strong pb-3 text-xl text-foreground transition-colors hover:border-foreground md:text-2xl"
            >
              investors@nizek.com
            </a>
          </div>
        </Reveal>
      </Section>
    </div>
  );
}

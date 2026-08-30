import { createFileRoute } from "@tanstack/react-router";
import { Reveal, Section, SectionHeading } from "@/components/ui/primitives";
import { DataTable } from "@/components/ui/DataTable";
import { NextStep } from "@/components/site/Chrome";
import { useModel } from "@/model/context";
import { currency, number, percent } from "@/model/format";

export const Route = createFileRoute("/roadmap")({
  head: () => ({
    meta: [
      { title: "Roadmap — NIZEK" },
      {
        name: "description",
        content: "NIZEK's capital plan, use of funds and milestones, each tied directly to a model assumption.",
      },
      { property: "og:title", content: "Roadmap — NIZEK" },
      { property: "og:description", content: "Use of funds and milestones, tied to the live model." },
    ],
  }),
  component: Roadmap,
});

function Roadmap() {
  const { projection, assumptions } = useModel();
  const { years, rounds } = projection;

  const useOfFunds = [
    { name: "Engineering & product", share: assumptions.rdPercent / (assumptions.rdPercent + assumptions.gaPercent + 30) },
    { name: "Go-to-market", share: 30 / (assumptions.rdPercent + assumptions.gaPercent + 30) },
    { name: "Operations & reserve", share: assumptions.gaPercent / (assumptions.rdPercent + assumptions.gaPercent + 30) },
  ];

  return (
    <div>
      <Section className="border-t-0 pt-32">
        <Reveal>
          <div className="label-xs">Roadmap</div>
          <h1 className="display-xl mt-10 max-w-4xl text-5xl md:text-8xl">
            {currency(assumptions.roundSize)} buys {years[2] ? Math.round(years[2].customers) : 0}{" "}
            clients and a profitable core.
          </h1>
          <p className="mt-10 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
            Every milestone below is stated in terms the model can check. If an assumption moves,
            the milestone moves with it.
          </p>
        </Reveal>
      </Section>

      <Section>
        <SectionHeading index="01 — Use of funds" title="Where the round goes." />
        <div className="grid grid-cols-1 gap-px border border-border bg-border md:grid-cols-3">
          {useOfFunds.map((u) => (
            <div key={u.name} className="bg-background p-10">
              <div className="label-xs">{u.name}</div>
              <div className="num mt-5 text-3xl">{percent(u.share * 100, 0)}</div>
              <div className="mt-3 text-sm text-muted-foreground">
                {currency(assumptions.roundSize * u.share)}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section>
        <SectionHeading index="02 — Milestones" title="Year by year." />
        <div className="border-t border-border">
          {years.map((y, i) => (
            <Reveal key={y.year} delay={i * 60}>
              <div className="grid grid-cols-1 gap-6 border-b border-border py-10 md:grid-cols-[120px_1fr_320px]">
                <div className="label-xs pt-2">{y.label}</div>
                <div>
                  <div className="display-xl text-2xl md:text-3xl">
                    {currency(y.arr)} ARR · {number(y.customers)} clients
                  </div>
                  <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
                    {y.ebitda > 0
                      ? `Self-funding: ${currency(y.ebitda)} EBITDA at ${percent(y.ebitdaMargin, 0)} margin.`
                      : `Investment phase: ${currency(Math.abs(y.ebitda))} deployed against growth.`}
                    {rounds.some((r) => r.year === y.year) ? " Follow-on financing completes this year." : ""}
                  </p>
                </div>
                <div className="num text-sm text-muted-foreground md:text-right">
                  Cash {currency(y.cash)} · Team {number(y.headcount)}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section>
        <SectionHeading index="03 — Financing plan" title="Rounds on the path to exit." />
        <DataTable
          corner="Round"
          columns={["Timing", "Size", "Post-money", "Dilution"]}
          rows={rounds.map((r) => ({
            label: r.name,
            values: [
              r.year === 0 ? "Now" : `Y${r.year}`,
              currency(r.size),
              currency(r.postMoney),
              percent(r.dilution * 100, 1),
            ],
          }))}
        />
      </Section>

      <Section>
        <Reveal>
          <NextStep to="/data-room" label="Methodology and data room" />
        </Reveal>
      </Section>
    </div>
  );
}

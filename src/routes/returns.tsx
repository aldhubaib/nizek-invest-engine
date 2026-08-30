import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { Metric, MetricCell, MetricGrid, Reveal, Section, SectionHeading } from "@/components/ui/primitives";
import { DonutBar } from "@/components/charts/Charts";
import { DataTable } from "@/components/ui/DataTable";
import { SensitivityGrid } from "@/components/charts/SensitivityGrid";
import { ScenarioBar } from "@/components/model/ScenarioBar";
import { AssumptionControl } from "@/components/model/AssumptionControl";
import { NextStep } from "@/components/site/Chrome";
import { useModel } from "@/model/context";
import { assumptionMeta } from "@/model/assumptions";
import { currency, currencyExact, multiple, percent } from "@/model/format";
import { sensitivity } from "@/model/sensitivity";

export const Route = createFileRoute("/returns")({
  head: () => ({
    meta: [
      { title: "Returns — NIZEK" },
      {
        name: "description",
        content: "Ownership, dilution, exit waterfall and sensitivity analysis for an investment in NIZEK.",
      },
      { property: "og:title", content: "Returns — NIZEK" },
      { property: "og:description", content: "Your ticket, your ownership, your MOIC and IRR — computed live." },
    ],
  }),
  component: ReturnsPage,
});

function ReturnsPage() {
  const { projection, assumptions } = useModel();
  const { returns, rounds, capTable } = projection;

  const grid = useMemo(
    () =>
      sensitivity(
        assumptions,
        "exitMultiple",
        "acquisitionGrowth",
        [assumptions.exitMultiple * 0.5, assumptions.exitMultiple * 1.5],
        [Math.max(assumptions.acquisitionGrowth - 3, 0), assumptions.acquisitionGrowth + 3],
        "moic",
      ),
    [assumptions],
  );

  const ticketMeta = assumptionMeta.find((m) => m.key === "investorTicket")!;
  const exitMeta = assumptionMeta.find((m) => m.key === "exitMultiple")!;
  const yearMeta = assumptionMeta.find((m) => m.key === "exitYear")!;

  return (
    <div>
      <ScenarioBar />
      <Section className="border-t-0 pt-24">
        <Reveal>
          <div className="label-xs">Returns</div>
          <h1 className="display-xl mt-10 max-w-4xl text-5xl md:text-8xl">
            {currency(returns.ticket)} in. {currency(returns.proceeds)} out.
          </h1>
          <p className="mt-10 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
            Held {returns.holdYears} years, through one follow-on round, at an exit valued on{" "}
            {multiple(assumptions.exitMultiple)} terminal ARR.
          </p>
        </Reveal>
        <div className="mt-16">
          <MetricGrid>
            <MetricCell>
              <Metric label="Entry ownership" value={percent(returns.entryOwnership * 100, 2)} />
            </MetricCell>
            <MetricCell>
              <Metric label="Ownership at exit" value={percent(returns.exitOwnership * 100, 2)} note="After follow-on dilution" />
            </MetricCell>
            <MetricCell>
              <Metric label="Gross MOIC" value={multiple(returns.moic)} />
            </MetricCell>
            <MetricCell>
              <Metric label="IRR" value={Number.isFinite(returns.irr) ? percent(returns.irr, 1) : "n/a"} />
            </MetricCell>
          </MetricGrid>
        </div>
      </Section>

      <Section>
        <SectionHeading index="01 — Terms" title="Set your position." />
        <div className="grid grid-cols-1 gap-x-16 md:grid-cols-3">
          <AssumptionControl meta={ticketMeta} />
          <AssumptionControl meta={exitMeta} />
          <AssumptionControl meta={yearMeta} />
        </div>
      </Section>

      <Section>
        <SectionHeading index="02 — Cap table" title="Ownership after every round." />
        <Reveal>
          <DonutBar entries={capTable} />
        </Reveal>
        <div className="mt-16">
          <DataTable
            corner="Financing"
            columns={["Year", "Size", "Pre-money", "Post-money", "Dilution"]}
            rows={rounds.map((r) => ({
              label: r.name,
              values: [
                r.year === 0 ? "Now" : `Y${r.year}`,
                currency(r.size),
                currency(r.preMoney),
                currency(r.postMoney),
                percent(r.dilution * 100, 1),
              ],
            }))}
          />
        </div>
      </Section>

      <Section>
        <SectionHeading index="03 — Waterfall" title="From ARR to your account." />
        <DataTable
          corner="Exit bridge"
          columns={["Value"]}
          rows={[
            { label: `Terminal ARR · Y${returns.holdYears}`, values: [currencyExact(returns.exitArr)] },
            { label: `Exit multiple`, values: [multiple(assumptions.exitMultiple)] },
            { label: "Enterprise value", values: [currencyExact(returns.exitValuation)], emphasis: true, divider: true },
            { label: "Your ownership at exit", values: [percent(returns.exitOwnership * 100, 2)] },
            { label: "Gross proceeds to you", values: [currencyExact(returns.proceeds)], emphasis: true },
            { label: "Capital invested", values: [currencyExact(-returns.ticket)] },
            { label: "Net gain", values: [currencyExact(returns.proceeds - returns.ticket)], emphasis: true, divider: true },
          ]}
        />
      </Section>

      <Section>
        <SectionHeading
          index="04 — Sensitivity"
          title="Where the return actually comes from."
          lede="Gross MOIC across exit multiple and acquisition growth, holding all other assumptions at your current settings."
        />
        <Reveal>
          <SensitivityGrid
            data={grid}
            rowLabel="Exit multiple"
            colLabel="Acquisition growth"
            formatAxis={{ row: (v) => multiple(v), col: (v) => percent(v) }}
            formatCell={(v) => multiple(v)}
          />
        </Reveal>
      </Section>

      <Section>
        <Reveal>
          <NextStep to="/scenarios" label="Compare scenarios" />
        </Reveal>
      </Section>
    </div>
  );
}

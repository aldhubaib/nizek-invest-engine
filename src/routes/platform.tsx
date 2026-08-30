import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useMemo, useState } from "react";

import { AnimatedNumber } from "@/components/model/AnimatedNumber";
import { ValueField } from "@/components/model/ValueField";
import { Reveal, Section, SectionHeading } from "@/components/ui/primitives";
import { multiple, number as fmtNumber, percent } from "@/model/format";
import {
  ANNUAL_COMMITMENT,
  COMMITMENT_YEARS,
  TOTAL_INVESTMENT,
  defaultInvestmentInputs,

  investmentControls,
  investmentGroups,
  projectInvestment,
  
  type InvestmentControlMeta,
  type InvestmentInputs,
} from "@/model/investment";
import { kd } from "@/model/studio";


export const Route = createFileRoute("/platform")({
  head: () => ({
    meta: [
      { title: "We Don't Invest in Startups. We Build Them. — NIZEK" },
      {
        name: "description",
        content:
          "NIZEK is a GCC venture creation platform building 10 startups a year. One commitment, fifty companies — model the returns live.",
      },
      { property: "og:title", content: "We Don't Invest in Startups. We Build Them. — NIZEK" },
      {
        property: "og:description",
        content:
          "Since 2009 NIZEK has built products and teams across the GCC. Now a structured venture creation platform.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PlatformPage,
});

function Arrow() {
  return <div className="my-3 h-8 w-px bg-border-strong" aria-hidden />;
}

function FlowStack({ steps }: { steps: string[] }) {
  return (
    <div className="flex flex-col items-start">
      {steps.map((s, i) => (
        <Reveal key={s} delay={i * 60} className="w-full">
          <div className="flex w-full items-center gap-6 border-b border-border py-5">
            <span className="num w-10 text-xs text-subtle">{String(i + 1).padStart(2, "0")}</span>
            <span className="display-xl text-2xl md:text-4xl">{s}</span>
          </div>
        </Reveal>
      ))}
    </div>
  );
}

function StudioControl({
  meta,
  value,
  onChange,
  onReset,
  base,
}: {
  meta: InvestmentControlMeta;
  value: number;
  base: number;
  onChange: (k: keyof InvestmentInputs, v: number) => void;
  onReset: (k: keyof InvestmentInputs) => void;

}) {
  const fmt = (v: number) =>
    meta.unit === "kd"
      ? kd(v)
      : meta.unit === "percent"
        ? `${Number.isInteger(v) ? v : v.toFixed(2).replace(/0$/, "")}%`
        : meta.unit === "years"
          ? `${Math.round(v)} yrs`
          : fmtNumber(v);
  return (
    <div className="border-b border-border py-5">
      <div className="flex items-baseline justify-between gap-4">
        <label htmlFor={`studio-${meta.key}`} className="text-sm text-muted-foreground">
          {meta.label}
        </label>
        <ValueField
          label={meta.label}
          display={fmt(value)}
          value={value}
          min={meta.min}
          max={meta.max}
          onCommit={(v) => onChange(meta.key, v)}
        />
      </div>
      <input
        id={`studio-${meta.key}`}
        type="range"
        min={meta.min}
        max={meta.max}
        step={meta.step}
        value={value}
        onChange={(e) => onChange(meta.key, Number(e.target.value))}
        className="mt-4"
        aria-label={meta.label}
      />
      <div className="mt-2 flex items-start justify-between gap-4">
        <span className="text-[11px] leading-relaxed text-subtle">{meta.help}</span>
        {Math.abs(value - base) > 1e-9 && (
          <button
            type="button"
            onClick={() => onReset(meta.key)}
            className="label-xs shrink-0 transition-colors hover:text-foreground"
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
}

function PlatformPage() {
  const [inputs, setInputs] = useState<InvestmentInputs>(defaultInvestmentInputs);
  const result = useMemo(() => projectInvestment(inputs), [inputs]);

  const set = useCallback(
    (k: keyof InvestmentInputs, v: number) => setInputs((p) => ({ ...p, [k]: v })),
    [],
  );
  const reset = useCallback(
    (k: keyof InvestmentInputs) =>
      setInputs((p) => ({ ...p, [k]: defaultInvestmentInputs[k] })),
    [],
  );


  return (
    <div>
      {/* 1 — Hero */}
      <section className="px-6 pb-24 pt-24 md:px-12 md:pb-32 md:pt-40">
        <div className="mx-auto w-full max-w-[1400px]">
          <Reveal>
            <div className="label-xs">NIZEK · Venture creation platform · GCC</div>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="display-xl mt-10 text-5xl md:text-8xl">
              We Don't Invest in Startups.
              <br />
              We Build Them.
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <p className="mt-12 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
              Since 2009, Nizek has been building technology companies, products, and engineering
              teams across the GCC. Today, we are transforming that experience into a structured
              venture creation platform capable of launching multiple startups every year.
            </p>
          </Reveal>
          <Reveal delay={240}>
            <a
              href="#model"
              className="group mt-14 inline-flex items-baseline gap-6 border-b border-border-strong pb-3 text-2xl transition-colors hover:border-foreground md:text-3xl"
            >
              <span className="display-xl">Explore the Investment</span>
              <span className="label-xs transition-transform group-hover:translate-x-1">→</span>
            </a>
          </Reveal>
        </div>
      </section>

      {/* 2 — Why we exist */}
      <Section>
        <SectionHeading index="01 — Why we exist" title="Great Ideas Don't Fail. Execution Does." />
        <div className="grid grid-cols-1 gap-16 md:grid-cols-2">
          <Reveal>
            <p className="text-lg leading-relaxed text-muted-foreground">
              Thousands of founders have ideas. Very few have access to experienced product
              managers, designers, engineers, CTOs, marketing support, legal guidance, fundraising
              expertise, and operational infrastructure.
            </p>
          </Reveal>
          <Reveal delay={100}>
            <p className="display-xl text-3xl md:text-5xl">
              Nizek already has all of that. Instead of waiting for great startups to appear, we
              build them ourselves.
            </p>
          </Reveal>
        </div>
      </Section>

      {/* 3 — Track record */}
      <Section>
        <SectionHeading index="02 — Track record" title="We've Been Building Since 2009" />
        <Reveal>
          <div className="flex items-baseline justify-between border-b border-border-strong pb-6">
            <span className="display-xl text-4xl md:text-7xl">2009</span>
            <span className="label-xs">→</span>
            <span className="display-xl text-4xl md:text-7xl">Today</span>
          </div>
        </Reveal>
        <div className="mt-px grid grid-cols-1 gap-px border border-border bg-border md:grid-cols-4">
          {[
            ["17+ Years", "Continuous operation across the GCC"],
            ["Hundreds", "Products delivered end to end"],
            ["GCC Focus", "Kuwait, Gulf-wide distribution"],
            ["Dabdoob", "Part of the success story"],
          ].map(([a, b]) => (
            <div key={a} className="bg-background p-8">
              <div className="display-xl text-2xl md:text-3xl">{a}</div>
              <div className="mt-4 text-xs leading-relaxed text-subtle">{b}</div>
            </div>
          ))}
        </div>
        <div className="mt-16">
          <div className="label-xs">Featured companies</div>
          <div className="mt-6 flex flex-wrap gap-x-16 gap-y-6">
            {["Ad Space", "Hazawy", "Dabdoob", "Others"].map((c, i) => (
              <Reveal key={c} delay={i * 80}>
                <span className="display-xl text-3xl text-muted-foreground md:text-5xl">{c}</span>
              </Reveal>
            ))}
          </div>
          <p className="mt-8 max-w-xl text-xs leading-relaxed text-subtle">
            Proven venture creation experience: teams, technology and go-to-market built in-house
            rather than outsourced.
          </p>
        </div>
      </Section>

      {/* 4 — The problem */}
      <Section>
        <SectionHeading
          index="03 — The problem"
          title="Traditional Venture Capital Has One Major Weakness"
          lede="VCs invest after founders have already built something. That means they inherit what was built before they arrived."
        />
        <div className="grid grid-cols-1 gap-px border border-border bg-border md:grid-cols-5">
          {[
            "Weak founders",
            "Poor technology",
            "Technical debt",
            "Bad hiring",
            "Weak product strategy",
          ].map((t, i) => (
            <div key={t} className="bg-background p-8">
              <div className="num text-xs text-subtle">{String(i + 1).padStart(2, "0")}</div>
              <div className="mt-6 text-lg text-foreground">{t}</div>
            </div>
          ))}
        </div>
        <Reveal>
          <p className="display-xl mt-16 text-3xl md:text-5xl">
            They hope execution improves. We don't.
          </p>
        </Reveal>
      </Section>

      {/* 5 — Our model */}
      <Section>
        <SectionHeading
          index="04 — Our model"
          title="We Build Companies From Day One"
          lede="Every startup goes through the same repeatable operating system."
        />
        <FlowStack
          steps={[
            "Idea",
            "Validation",
            "Product",
            "Technology",
            "Launch",
            "Growth",
            "Fundraising",
            "Exit",
          ]}
        />
      </Section>

      {/* 6 — The investment */}
      <Section>
        <SectionHeading
          index="05 — The investment"
          title="One Investment. Fifty Companies."
          lede="Instead of investing in one startup, invest in the platform that creates them."
        />
        <div className="grid grid-cols-1 gap-px border border-border bg-border md:grid-cols-3">
          {[
            ["Investment", "KD400K", "annually for 5 years"],
            ["Total commitment", "KD2M", "across the build window"],
            ["Nizek commits to", "10 startups", "every year — minimum 50"],
          ].map(([l, v, n]) => (
            <div key={l} className="bg-background p-10">
              <div className="label-xs">{l}</div>
              <div className="num mt-6 text-4xl text-foreground md:text-5xl">{v}</div>
              <div className="mt-4 text-xs text-subtle">{n}</div>
            </div>
          ))}
        </div>
        <Reveal>
          <div className="mt-16 max-w-3xl border-l border-border-strong pl-8">
            <p className="display-xl text-3xl md:text-5xl">
              Investor participates in 25% of Nizek's ownership in every startup created during
              those five years.
            </p>
            <p className="mt-6 text-sm text-muted-foreground">Not ownership in Nizek.</p>
          </div>
        </Reveal>
      </Section>

      {/* 7 — Where the money goes */}
      <Section>
        <SectionHeading index="06 — Capital deployment" title="Where The Money Goes" />
        <div className="grid grid-cols-2 gap-px border border-border bg-border md:grid-cols-4">
          {["Developers", "Marketing", "Operations", "Ecosystem"].map(
            (s, i) => (
              <div key={s} className="bg-background p-8">
                <div className="num text-xs text-subtle">{String(i + 1).padStart(2, "0")}</div>
                <div className="mt-6 text-base text-foreground">{s}</div>
              </div>
            ),
          )}
        </div>
        <Reveal>
          <p className="display-xl mt-16 text-3xl md:text-5xl">
            Every dinar creates assets. Not overhead.
          </p>
        </Reveal>
      </Section>

      {/* 8 — Why this is different */}
      <Section>
        <SectionHeading index="07 — Comparison" title="Why This Is Different" />
        <div className="grid grid-cols-1 gap-px border border-border bg-border md:grid-cols-2">
          <div className="bg-background p-10">
            <div className="label-xs">Traditional VC</div>
            <ul className="mt-8 space-y-5">
              {[
                "Waits for founders",
                "Invests later",
                "Limited influence",
                "Unknown technology",
                "Unknown execution",
              ].map((t) => (
                <li key={t} className="border-b border-border pb-4 text-lg text-subtle">
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-background p-10">
            <div className="label-xs text-foreground">Nizek</div>
            <ul className="mt-8 space-y-5">
              {[
                "Creates founders",
                "Builds technology",
                "Controls execution",
                "Owns infrastructure",
                "Launches repeatedly",
              ].map((t) => (
                <li key={t} className="border-b border-border pb-4 text-lg text-foreground">
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* 9 — Live business model */}
      <section id="model" className="border-t border-border">
        <div className="px-6 py-24 md:px-12 md:py-32">
          <div className="mx-auto w-full max-w-[1400px]">
            <Reveal>
              <div className="label-xs">08 — The investment simulator</div>
              <h2 className="display-xl mt-6 text-5xl md:text-8xl">
                If Nizek builds successful companies, what could your investment become?
              </h2>
              <p className="mt-8 max-w-2xl text-base leading-relaxed text-muted-foreground">
                Move three assumptions. Everything below re-prices instantly.
              </p>
            </Reveal>
          </div>
        </div>

        <div className="grid grid-cols-1 border-t border-border lg:grid-cols-[400px_1fr]">
          <aside className="border-b border-border px-6 py-10 lg:border-b-0 lg:border-r lg:px-8">
            <div className="label-xs">Your assumptions</div>
            {investmentGroups.map((g) => (
              <div key={g} className="mt-10">
                <div className="border-b border-border-strong pb-3 text-sm text-foreground">{g}</div>
                {investmentControls
                  .filter((c) => c.group === g)
                  .map((c) => (
                    <StudioControl
                      key={c.key}
                      meta={c}
                      value={inputs[c.key]}
                      base={defaultInvestmentInputs[c.key]}
                      onChange={set}
                      onReset={reset}
                    />
                  ))}
              </div>
            ))}
          </aside>

          <div className="px-6 py-12 md:px-12">
            {/* Capital commitment — deployed gradually, not on day one */}
            <div className="border border-border">
              <div className="border-b border-border px-8 py-8 md:px-12">
                <div className="label-xs">Capital commitment</div>
                <p className="mt-3 max-w-lg text-xs leading-relaxed text-subtle">
                  Capital is not paid on day one. It is drawn down gradually as startups are
                  created — KD400,000 each year for five years.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-px bg-border md:grid-cols-3">
                {[
                  ["Annual commitment", kd(ANNUAL_COMMITMENT), "Drawn each year as companies are built"],
                  ["Commitment period", `${COMMITMENT_YEARS} Years`, "Years 1 through 5"],
                  ["Maximum commitment", kd(TOTAL_INVESTMENT), "Cumulative across the full period"],
                ].map(([l, v, n]) => (
                  <div key={l} className="bg-background px-8 py-8 md:px-12">
                    <div className="label-xs">{l}</div>
                    <div className="num mt-5 text-3xl text-foreground md:text-4xl">{v}</div>
                    <div className="mt-4 text-[11px] leading-relaxed text-subtle">{n}</div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-5 gap-px border-t border-border bg-border">
                {Array.from({ length: COMMITMENT_YEARS }, (_, i) => (
                  <div key={i} className="bg-background px-4 py-5 text-center">
                    <div className="num text-[11px] text-subtle">Year {i + 1}</div>
                    <div className="num mt-2 text-sm text-foreground">{kd(ANNUAL_COMMITMENT)}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* The result — focal point */}
            <div className="mt-px border border-border">
              {[
                {
                  label: "Estimated value",
                  note: "Your share of Nizek's equity in the successful companies",
                  value: result.investorValue,
                  format: kd,
                },

                {
                  label: "Estimated profit",
                  note: "Value created above the capital you committed",
                  value: result.investorProfit,
                  format: kd,
                },
                {
                  label: "Return",
                  note: "What every dinar comes back as",
                  value: result.moic,
                  format: (v: number) => multiple(v, 2),
                },
              ].map((row) => (
                <div
                  key={row.label}
                  className="flex flex-col gap-4 border-b border-border px-8 py-10 last:border-b-0 md:flex-row md:items-end md:justify-between md:px-12"
                >
                  <div>
                    <div className="label-xs">{row.label}</div>
                    <div className="mt-3 max-w-sm text-xs leading-relaxed text-subtle">
                      {row.note}
                    </div>
                  </div>
                  <div className="num text-right text-4xl leading-none text-foreground md:text-7xl">

                    <AnimatedNumber value={row.value} format={row.format} />
                  </div>
                </div>
              ))}
            </div>

            {/* The story */}
            <div className="mt-20">
              <div className="label-xs">How the money travels</div>
              <div className="mt-8 grid grid-cols-1 gap-px border border-border bg-border md:grid-cols-5">
                {[
                  {
                    step: "01",
                    title: "50 startups are created",
                    value: fmtNumber(50),
                    note: "Ten every year for five years.",
                  },
                  {
                    step: "02",
                    title: "Some become successful",
                    value: fmtNumber(inputs.successfulCompanies),
                    note: "Your assumption for meaningful winners.",
                  },
                  {
                    step: "03",
                    title: "They create portfolio value",
                    value: kd(result.portfolioValue),
                    note: `${fmtNumber(inputs.successfulCompanies)} × ${kd(inputs.avgCompanyValue)} at exit.`,
                  },
                  {
                    step: "04",
                    title: "Nizek owns part of them",
                    value: kd(result.nizekEquityValue),
                    note: `${inputs.avgNizekOwnership}% average ownership.`,
                  },
                  {
                    step: "05",
                    title: "You hold 25% of that",
                    value: kd(result.investorValue),
                    note: "Your participation in Nizek's ownership.",
                  },
                ].map((s) => (
                  <div key={s.step} className="bg-background p-8">
                    <div className="num text-xs text-subtle">{s.step}</div>
                    <div className="mt-6 text-sm leading-relaxed text-foreground">{s.title}</div>
                    <div className="num mt-6 text-2xl text-foreground">{s.value}</div>
                    <div className="mt-4 text-[11px] leading-relaxed text-subtle">{s.note}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Comparison */}
            <div className="mt-20">
              <div className="label-xs">
                The same KD400,000 a year, invested three different ways
              </div>
              <div className="mt-8 grid grid-cols-1 gap-px border border-border bg-border md:grid-cols-3">
                {[
                  {
                    title: "What it is worth",
                    format: kd,
                    rows: [
                      { name: "Nizek", v: result.investorValue, color: "#FFFFFF" },
                      { name: "Public markets", v: result.publicMarket.finalValue, color: "#C9A227" },
                      { name: "Real estate", v: result.realEstate.finalValue, color: "#4E8C86" },
                    ],
                  },
                  {
                    title: "What you made",
                    format: kd,
                    rows: [
                      { name: "Nizek", v: result.investorProfit, color: "#FFFFFF" },
                      { name: "Public markets", v: result.publicMarket.profit, color: "#C9A227" },
                      { name: "Real estate", v: result.realEstate.profit, color: "#4E8C86" },
                    ],
                  },
                  {
                    title: "Return multiple",
                    format: (v: number) => multiple(v, 2),
                    rows: [
                      { name: "Nizek", v: result.moic, color: "#FFFFFF" },
                      {
                        name: "Public markets",
                        v: result.publicMarket.finalValue / result.totalInvestment,
                        color: "#C9A227",
                      },
                      {
                        name: "Real estate",
                        v: result.realEstate.finalValue / result.totalInvestment,
                        color: "#4E8C86",
                      },
                    ],
                  },
                ].map((panel) => {
                  const peak = Math.max(...panel.rows.map((r) => Math.abs(r.v)), 1);
                  return (
                    <div key={panel.title} className="bg-background p-8">
                      <div className="label-xs">{panel.title}</div>
                      <div className="mt-8 space-y-7">
                        {panel.rows.map((r) => (
                          <div key={r.name}>
                            <div className="flex items-baseline justify-between gap-4">
                              <span className="text-xs text-muted-foreground">{r.name}</span>
                              <span className="num text-base text-foreground">
                                <AnimatedNumber value={r.v} format={panel.format} />
                              </span>
                            </div>
                            <div className="mt-3 h-px w-full bg-border">
                              <div
                                className="h-px"
                                style={{
                                  width: `${Math.max((Math.abs(r.v) / peak) * 100, 0.5)}%`,
                                  backgroundColor: r.color,
                                  transition: "width 500ms cubic-bezier(0.16,1,0.3,1)",
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-px border border-border">
                <div className="grid grid-cols-[1.2fr_1fr_1fr_1fr] gap-4 border-b border-border px-6 py-4 text-[11px] uppercase tracking-[0.18em] text-subtle">
                  <div>Option</div>
                  <div className="text-right">Final value</div>
                  <div className="text-right">Profit</div>
                  <div className="text-right">Annual return</div>
                </div>
                {[
                  {
                    name: "Nizek participation",
                    value: result.investorValue,
                    profit: result.investorProfit,
                    rate: result.irr,
                  },
                  {
                    name: "Real estate",
                    value: result.realEstate.finalValue,
                    profit: result.realEstate.profit,
                    rate: result.realEstate.annualizedReturn,
                  },
                  {
                    name: "Public market",
                    value: result.publicMarket.finalValue,
                    profit: result.publicMarket.profit,
                    rate: result.publicMarket.annualizedReturn,
                  },
                ].map((row) => (
                  <div
                    key={row.name}
                    className="grid grid-cols-[1.2fr_1fr_1fr_1fr] gap-4 border-b border-border px-6 py-4 text-sm text-foreground last:border-b-0"
                  >
                    <div>{row.name}</div>
                    <div className="num text-right">
                      <AnimatedNumber value={row.value} format={kd} />
                    </div>
                    <div className="num text-right">
                      <AnimatedNumber value={row.profit} format={kd} />
                    </div>
                    <div className="num text-right">
                      <AnimatedNumber value={row.rate} format={(v) => percent(v, 1)} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* 10 — Current proof */}
      <Section>
        <SectionHeading index="09 — Current proof" title="Not Theory. Reality." />
        <div className="grid grid-cols-1 gap-px border border-border bg-border md:grid-cols-2">
          {[
            {
              name: "Ad Space",
              time: "6 months",
              val: "KD3M",
              basis: "Valuation basis: latest priced round discussions and comparable regional media-tech multiples.",
            },
            {
              name: "Hazawy",
              time: "2 months",
              val: "KD1.5M",
              basis: "Valuation basis: internal build cost, traction to date and comparable early-stage GCC rounds.",
            },
          ].map((c) => (
            <div key={c.name} className="bg-background p-10 md:p-14">
              <div className="display-xl text-4xl md:text-6xl">{c.name}</div>
              <div className="mt-10 flex gap-16">
                <div>
                  <div className="label-xs">Time to build</div>
                  <div className="num mt-3 text-2xl">{c.time}</div>
                </div>
                <div>
                  <div className="label-xs">Indicative valuation</div>
                  <div className="num mt-3 text-2xl">{c.val}</div>
                </div>
              </div>
              <p className="mt-10 max-w-md text-xs leading-relaxed text-subtle">{c.basis}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* 11 — Why investors win */}
      <Section>
        <SectionHeading index="10 — Investor case" title="Why Investors Win" />
        <div className="grid grid-cols-1 gap-px border border-border bg-border md:grid-cols-4">
          {[
            ["Diversification", "Exposure to dozens of startups instead of one."],
            ["Deal Flow", "See opportunities before the market."],
            ["Execution", "Built by an experienced venture studio."],
            [
              "Optional Follow-on",
              "Opportunity to participate in future funding rounds, subject to the investment terms.",
            ],
          ].map(([t, d]) => (
            <div key={t} className="bg-background p-10">
              <div className="display-xl text-2xl md:text-3xl">{t}</div>
              <p className="mt-6 text-sm leading-relaxed text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* 12 — Timeline */}
      <Section>
        <SectionHeading index="11 — Timeline" title="Fifty Companies In Five Years" />
        <div className="grid grid-cols-1 gap-px border border-border bg-border md:grid-cols-5">
          {[
            ["Year 1", "10 startups"],
            ["Year 2", "20 startups"],
            ["Year 3", "30 startups"],
            ["Year 4", "40 startups"],
            ["Year 5", "50+ startups"],
          ].map(([y, s], i) => (
            <Reveal key={y} delay={i * 80}>
              <div className="h-full bg-background p-8">
                <div className="label-xs">{y}</div>
                <div className="display-xl mt-6 text-3xl md:text-4xl">{s}</div>
              </div>
            </Reveal>
          ))}
        </div>
        <p className="mt-10 text-sm text-muted-foreground">
          Then the portfolio continues to mature well beyond the commitment window.
        </p>
        <Arrow />
      </Section>

      {/* 13 — Closing */}
      <Section>
        <Reveal>
          <h2 className="display-xl max-w-5xl text-4xl md:text-7xl">
            We Didn't Build One Startup.
            <br />
            We Built The Machine That Builds Them.
          </h2>
        </Reveal>
        <div className="mt-16 grid grid-cols-1 gap-16 md:grid-cols-2">
          <Reveal>
            <p className="text-lg leading-relaxed text-subtle">
              If you're looking to invest in one company… this isn't for you.
            </p>
          </Reveal>
          <Reveal delay={100}>
            <p className="text-lg leading-relaxed text-foreground">
              If you're looking to participate in the creation of the next generation of GCC
              technology companies… let's talk.
            </p>
          </Reveal>
        </div>
        <Reveal delay={160}>
          <a
            href="mailto:investors@nizek.com"
            className="group mt-14 inline-flex items-baseline gap-6 border-b border-border-strong pb-3 text-2xl transition-colors hover:border-foreground md:text-3xl"
          >
            <span className="display-xl">investors@nizek.com</span>
            <span className="label-xs transition-transform group-hover:translate-x-1">→</span>
          </a>
        </Reveal>
      </Section>
    </div>
  );
}

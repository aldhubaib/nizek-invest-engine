import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useMemo, useState } from "react";
import { LineChart } from "@/components/charts/Charts";
import { AnimatedNumber } from "@/components/model/AnimatedNumber";
import { Reveal, Section, SectionHeading } from "@/components/ui/primitives";
import { multiple, number as fmtNumber, percent } from "@/model/format";
import {
  defaultInvestmentInputs,
  investmentControls,
  investmentGroups,
  projectInvestment,
  TOTAL_INVESTMENT,
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
        <span className="num text-sm text-foreground">{fmt(value)}</span>
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
              <div className="label-xs">08 — Live business model</div>
              <h2 className="display-xl mt-6 text-5xl md:text-8xl">Model Your Investment</h2>
              <p className="mt-8 max-w-2xl text-base leading-relaxed text-muted-foreground">
                Every figure below is calculated live from the assumptions on the left. Change one
                and the entire section re-prices.
              </p>
            </Reveal>
          </div>
        </div>

        <div className="grid grid-cols-1 border-t border-border lg:grid-cols-[400px_1fr]">
          <aside className="border-b border-border px-6 py-10 lg:border-b-0 lg:border-r lg:px-8">
            <div className="label-xs">Assumptions</div>
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
            <div className="grid grid-cols-1 gap-px border border-border bg-border md:grid-cols-2 xl:grid-cols-4">
              {[
                { label: "Portfolio value", v: result.portfolioValue, f: kd },
                { label: "Nizek equity value", v: result.nizekEquityValue, f: kd },
                { label: "Investor value", v: result.investorValue, f: kd },
                { label: "Investor profit", v: result.investorProfit, f: kd },
              ].map((k) => (
                <div key={k.label} className="bg-background p-8">
                  <div className="label-xs">{k.label}</div>
                  <div className="num mt-4 text-3xl text-foreground md:text-4xl">
                    <AnimatedNumber value={k.v} format={k.f} />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-px grid grid-cols-2 gap-px border border-border bg-border lg:grid-cols-4">
              {[
                { label: "MOIC", v: result.moic, f: (v: number) => multiple(v, 2) },
                { label: "IRR", v: result.irr, f: (v: number) => percent(v, 1) },
                {
                  label: "Successful companies",
                  v: inputs.successfulCompanies,
                  f: (v: number) => fmtNumber(v),
                },
                { label: "Total investment", v: result.totalInvestment, f: kd },
              ].map((k) => (
                <div key={k.label} className="bg-background p-6">
                  <div className="label-xs">{k.label}</div>
                  <div className="num mt-3 text-xl text-foreground md:text-2xl">
                    <AnimatedNumber value={k.v} format={k.f} />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-16 text-foreground">
              <div className="label-xs mb-6">
                Your position vs real estate and public markets — same cash committed
              </div>
              <LineChart
                series={[
                  { name: "Nizek", values: result.investorCurve },
                  { name: "Public markets", values: result.publicMarket.curve, muted: true },
                  { name: "Real estate", values: result.realEstate.curve, muted: true, dashed: true },
                ]}
                labels={result.labels}
                format={(v) => kd(v)}
              />
              <div className="mt-6 border border-border">
                <div className="grid grid-cols-[1.2fr_1fr_1fr_1fr] gap-4 border-b border-border px-6 py-4 text-[11px] uppercase tracking-[0.18em] text-subtle">
                  <div>Option</div>
                  <div className="text-right">Final value</div>
                  <div className="text-right">Profit</div>
                  <div className="text-right">Annualized</div>
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

            <div className="mt-16">
              <div className="label-xs">How it is calculated</div>
              <div className="mt-6 grid grid-cols-1 gap-px border border-border bg-border md:grid-cols-3">
                {[
                  [
                    "Portfolio value",
                    `${fmtNumber(inputs.successfulCompanies)} companies × ${kd(inputs.avgCompanyValue)}`,
                    result.portfolioValue,
                  ],
                  [
                    "Nizek equity value",
                    `${kd(result.portfolioValue)} × ${inputs.avgNizekOwnership}%`,
                    result.nizekEquityValue,
                  ],
                  [
                    "Investor value",
                    `${kd(result.nizekEquityValue)} × 25%`,
                    result.investorValue,
                  ],
                ].map(([label, formula, value]) => (
                  <div key={label as string} className="bg-background p-6">
                    <div className="label-xs">{label as string}</div>
                    <div className="mt-3 text-sm text-muted-foreground">{formula as string}</div>
                    <div className="num mt-3 text-2xl text-foreground">
                      <AnimatedNumber value={value as number} format={kd} />
                    </div>
                  </div>
                ))}
              </div>
            </div>


            <Reveal className="mt-16">
              <Link
                to="/simulator"
                className="group inline-flex items-baseline gap-6 border-b border-border-strong pb-3 text-2xl transition-colors hover:border-foreground md:text-3xl"
              >
                <span className="display-xl">Open the full simulator</span>
                <span className="label-xs transition-transform group-hover:translate-x-1">→</span>
              </Link>
            </Reveal>
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

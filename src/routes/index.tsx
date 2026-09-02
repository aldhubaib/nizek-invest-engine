import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useMemo, useState } from "react";

import { AnimatedNumber } from "@/components/model/AnimatedNumber";
import { ValueField } from "@/components/model/ValueField";
import { EquitySection } from "@/components/site/EquitySection";
import { TeamSection } from "@/components/site/TeamSection";
import { Reveal, Section, SectionHeading } from "@/components/ui/primitives";
import { ReserveSection } from "@/components/site/ReserveSection";
import { multiple, number as fmtNumber } from "@/model/format";
import {
  AVAILABLE_SEATS,
  RESERVED_SEATS,
  SEAT_QUARTERLY_COMMITMENT,
  SEAT_OWNERSHIP,
  TOTAL_SEATS,
  cohortExitControls,
  defaultInvestmentInputs,
  investmentControls,
  investmentGroups,
  projectInvestment,
  type InvestmentControlMeta,
  type InvestmentInputs,
  type NumericInvestmentKey,
} from "@/model/investment";
import { kd } from "@/model/studio";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "We Don't Invest in Startups. We Build Them. — NIZEK" },
      {
        name: "description",
        content:
          "NIZEK is a GCC venture creation platform building ten startups a year. Six ownership seats — model the outcome live.",
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
  onChange: (k: NumericInvestmentKey, v: number) => void;
  onReset: (k: NumericInvestmentKey) => void;
}) {
  const fmt = (raw: number) => {
    const v = Number.isFinite(raw) ? raw : 0;
    return meta.unit === "kd"
      ? kd(v)
      : meta.unit === "percent"
        ? `${Number.isInteger(v) ? v : v.toFixed(2).replace(/0$/, "")}%`
        : meta.unit === "years"
          ? `${Math.round(v)} yrs`
          : fmtNumber(v);
  };
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
  const [panelOpen, setPanelOpen] = useState(false);
  const result = useMemo(() => projectInvestment(inputs), [inputs]);
  const maxCohort = useMemo(
    () => Math.max(...result.cohorts.map((c) => c.portfolioValue), 1),
    [result],
  );

  const set = useCallback(
    (k: NumericInvestmentKey, v: number) => setInputs((p) => ({ ...p, [k]: v })),
    [],
  );
  const reset = useCallback(
    (k: NumericInvestmentKey) => setInputs((p) => ({ ...p, [k]: defaultInvestmentInputs[k] })),
    [],
  );

  const setCohortExit = useCallback(
    (i: number, k: number, v: number) =>
      setInputs((p) => ({
        ...p,
        exitValuesByYear: (p.exitValuesByYear ?? []).map((row, idx) => {
          if (idx !== i) return row;
          const next = [...row];
          while (next.length <= k) next.push(next[next.length - 1] ?? 0);
          next[k] = v;
          return next;
        }),
      })),
    [],
  );

  const setCohortSuccess = useCallback(
    (i: number, v: number) =>
      setInputs((p) => ({
        ...p,
        successesByYear: (p.successesByYear ?? []).map((g, idx) => (idx === i ? v : g)),
        exitValuesByYear: (p.exitValuesByYear ?? []).map((row, idx) => {
          if (idx !== i) return row;
          const next = row.slice(0, Math.max(0, v));
          while (next.length < v) next.push(next[next.length - 1] ?? row[0] ?? 0);
          return next;
        }),
      })),
    [],
  );

  return (
    <div>
      {/* 01 — Hero */}
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
              Nizek creates technology companies from the ground up — the idea, the founder, the
              product and the team — and turns that capability into a repeatable venture engine for
              the GCC.
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

      {/* 02 — Why Nizek + proof */}
      <Section id="why" invert>
        <SectionHeading
          index="02 — Why Nizek"
          title="Built to Build. Since 2009."
          lede="Nizek has spent more than seventeen years building technology products, teams and companies across the GCC. The venture studio is not a new capability we are trying to create — it is an operating system built from infrastructure, people and experience that already exist."
        />

        <div className="grid grid-cols-2 gap-px border border-border bg-border md:grid-cols-4">
          {[
            { value: 2009, label: "Founded", suffix: "" },
            { value: 17, label: "Years operating", suffix: "+" },
            { value: 120, label: "Products shipped", suffix: "+" },
          ].map((m, i) => (
            <Reveal key={m.label} delay={i * 80}>
              <div className="flex h-full flex-col justify-between bg-background p-8 md:p-10">
                <div className="num text-xs text-subtle">{String(i + 1).padStart(2, "0")}</div>
                <div className="display-xl mt-10 text-5xl tabular-nums md:text-7xl">
                  <AnimatedNumber value={m.value} format={(v) => String(Math.round(v))} />
                  {m.suffix}
                </div>
                <div className="label-xs mt-6 text-muted-foreground">{m.label}</div>
              </div>
            </Reveal>
          ))}
          <Reveal delay={240}>
            <div className="flex h-full flex-col justify-between bg-background p-8 md:p-10">
              <div className="num text-xs text-subtle">04</div>
              <div className="display-xl mt-10 text-5xl md:text-7xl">GCC</div>
              <div className="label-xs mt-6 text-muted-foreground">Regional experience</div>
            </div>
          </Reveal>
        </div>

        {/* Track record */}
        <div className="mt-24">
          <div className="label-xs">Track record</div>
          <p className="mt-8 max-w-3xl text-base leading-relaxed text-muted-foreground">
            Real companies built through the Nizek Venture Studio.
          </p>
          <div className="mt-10 grid grid-cols-1 gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
            <Reveal>
              <div className="flex h-full flex-col justify-between bg-foreground p-8 text-background md:p-10">
                <div className="label-xs opacity-60">Success story</div>
                <div className="display-xl mt-10 text-4xl md:text-5xl">Dabdoob</div>
                <p className="mt-6 text-sm leading-relaxed opacity-70">
                  One of the GCC&apos;s best-known e-commerce platforms. Built with Nizek from its
                  early stages and successfully scaled into a leading regional consumer technology
                  company.
                </p>
              </div>
            </Reveal>
            <Reveal delay={120}>
              <div className="flex h-full flex-col justify-between bg-background p-8 md:p-10">
                <div className="label-xs text-subtle">Series A</div>
                <div className="display-xl mt-10 text-4xl md:text-5xl">Provien</div>
                <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
                  Built inside the Nizek Venture Studio. After validation, the company transitioned
                  to its own dedicated engineering team while continuing under Nizek&apos;s
                  long-term technical leadership.
                </p>
                <div className="label-xs mt-8 text-foreground">
                  Series A funding round completed
                </div>
              </div>
            </Reveal>
            {[
              {
                name: "Ad Space",
                desc: "A regional Digital Out-of-Home advertising platform currently being built inside the Nizek Venture Studio.",
                time: "6 months",
                val: "KD3M",
              },
              {
                name: "Hazawy",
                desc: "A modern commerce platform currently being built inside the Nizek Venture Studio.",
                time: "2 months",
                val: "KD1.5M",
              },
            ].map((c, i) => (
              <Reveal key={c.name} delay={(i + 2) * 120}>
                <div className="flex h-full flex-col justify-between bg-background p-8 md:p-10">
                  <div className="label-xs text-subtle">Currently building</div>
                  <div className="display-xl mt-10 text-4xl md:text-5xl">{c.name}</div>
                  <p className="mt-6 text-sm leading-relaxed text-muted-foreground">{c.desc}</p>
                  <div className="mt-8 flex gap-12">
                    <div>
                      <div className="label-xs">Time building</div>
                      <div className="num mt-3 text-xl">{c.time}</div>
                    </div>
                    <div>
                      <div className="label-xs">Indicative value</div>
                      <div className="num mt-3 text-xl">{c.val}</div>
                    </div>
                  </div>
                  <p className="mt-6 text-[11px] leading-relaxed text-subtle">
                    Indicative current company value based on the latest available valuation basis.
                    Not a guaranteed future value.
                  </p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal>
            <div className="mt-px border border-border bg-background p-8 md:p-10">
              <p className="max-w-4xl text-xl leading-snug md:text-2xl">
                Every company shown here is a real venture that has been built or is currently being
                built through the Nizek Venture Studio.
              </p>
              <p className="mt-6 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                Our portfolio spans multiple stages — from successful exits and funded companies to
                ventures currently under construction. We believe investors should evaluate our
                ability to repeatedly build companies, not just individual success stories.
              </p>
            </div>
          </Reveal>
        </div>


        {/* The infrastructure already exists */}
        <div className="mt-24">
          <div className="label-xs">The infrastructure already exists</div>
          <p className="mt-8 max-w-3xl text-base leading-relaxed text-muted-foreground">
            An investor is not funding Nizek to first assemble a venture studio. The teams,
            disciplines and operating routines required to create companies are already in place and
            already in use.
          </p>
          <div className="mt-10 grid grid-cols-1 gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Product Strategy", "What gets built, in what order, and why."],
              ["Engineering", "Internal teams that build and ship the product."],
              ["Product Design", "Interfaces customers can actually use."],
              ["Technical Leadership", "Architecture decisions that hold up as the company scales."],
              ["Market Validation", "Assumptions tested early to reduce wasted time and capital."],
              ["Business Model Design", "Pricing, revenue model and long-term sustainability."],
              ["Founder Selection", "Entrepreneurs evaluated and qualified before a company is built."],
              ["Fundraising Readiness", "Structure, metrics and documentation for future rounds."],
            ].map(([t, d], i) => (
              <Reveal key={t} delay={i * 60}>
                <div className="h-full bg-background px-6 py-8">
                  <div className="num text-xs text-subtle">{String(i + 1).padStart(2, "0")}</div>
                  <div className="mt-5 text-base text-foreground">{t}</div>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        {/* Key investor message */}
        <Reveal>
          <div className="mt-24 border-t border-border-strong pt-12">
            <p className="display-xl max-w-4xl text-2xl leading-snug md:text-4xl">
              The capital is not being used to discover whether Nizek can build companies. It is
              being used to apply an existing capability across a larger portfolio.
            </p>
          </div>
        </Reveal>


      </Section>

      {/* 03 — Founder pipeline */}
      <Section id="founders">
        <SectionHeading
          index="03 — Founder pipeline"
          title="We Don't Find Founders. We Qualify Them."
          lede="One of the hardest problems in venture investing is not capital. It is finding people who can execute."
        />

        <div className="grid grid-cols-1 gap-px border border-border bg-border md:grid-cols-2">
          <div className="bg-background p-10">
            <div className="label-xs">The problem</div>
            <p className="mt-8 text-lg leading-relaxed text-subtle">
              Most investors meet an entrepreneur a handful of times and must decide. Execution is
              discovered after the money is gone.
            </p>
          </div>
          <div className="bg-background p-10">
            <div className="label-xs text-foreground">Our solution</div>
            <p className="mt-8 text-lg leading-relaxed text-foreground">
              Every founder enters the Nizek Founder Residency first — roughly three months building
              inside a live startup. Only those who prove themselves are offered investment.
            </p>
          </div>
        </div>

        <div className="mt-24">
          <div className="label-xs">The process</div>
          <div className="mt-10 grid grid-cols-1 gap-px border border-border bg-border sm:grid-cols-2 md:grid-cols-3">
            {[
              { t: "Applications", d: "Open, continuous inbound from the region's operators." },
              { t: "3-Month Founder Residency", d: "Building inside a live Nizek startup." },
              { t: "Performance Evaluation", d: "Judged on real output, not a pitch deck." },
              { t: "Founder Approved", d: "Both sides decide to build a company together." },
              { t: "Investment", d: "Capital, equity and platform are committed." },
              { t: "Startup Launch", d: "The company enters the annual cohort." },
            ].map((s, i) => (
              <Reveal key={s.t} delay={i * 90}>
                <div className="flex h-full flex-col justify-between bg-background p-8">
                  <div>
                    <span className="num text-xs text-subtle">{String(i + 1).padStart(2, "0")}</span>
                    <div className="display-xl mt-6 text-2xl leading-tight md:text-3xl">{s.t}</div>
                  </div>
                  <p className="mt-8 text-sm leading-relaxed text-subtle">{s.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        <div className="mt-24">
          <div className="label-xs">What the residency measures</div>
          <div className="mt-8 grid grid-cols-1 gap-x-12 sm:grid-cols-2 lg:grid-cols-4">
            {[
              "Execution",
              "Leadership",
              "Commitment",
              "Problem solving",
              "Product thinking",
              "Communication",
              "Work under pressure",
              "Cultural fit",
            ].map((t, i) => (
              <Reveal key={t} delay={i * 50}>
                <div className="border-b border-border py-5 text-lg text-foreground">{t}</div>
              </Reveal>
            ))}
          </div>
        </div>

        <Reveal>
          <div className="mt-24 border-t border-border-strong pt-12">
            <p className="display-xl max-w-5xl text-3xl leading-tight md:text-6xl">
              Traditional venture capital invests first and evaluates execution later. Nizek
              evaluates execution first and invests later.
            </p>
          </div>
        </Reveal>
      </Section>

      {/* 04 — Venture building model */}
      <Section id="how-we-build" invert>
        <SectionHeading
          index="04 — Venture building model"
          title="From Idea To Scalable Company."
          lede="Nizek works beside the entrepreneur from problem discovery through product, validation and launch. As the company grows, shared venture-studio resources transition into a dedicated engineering team while Nizek remains the long-term technology and CTO partner."
        />

        <div className="grid grid-cols-1 gap-16 lg:grid-cols-[1fr_1fr] lg:gap-24">
          <FlowStack
            steps={[
              "Problem",
              "Validation",
              "Product Strategy",
              "Build",
              "Launch",
              "Market Validation",
              "Dedicated Engineering Team",
              "Ongoing Nizek CTO Leadership",
              "Scale",
            ]}
          />

          <div className="flex flex-col gap-10">
            <Reveal>
              <div className="border border-border p-8 md:p-10">
                <div className="label-xs">01 — Build together</div>
                <p className="mt-6 text-base leading-relaxed text-muted-foreground">
                  During the first year, the entrepreneur works directly with Nizek&apos;s
                  venture-studio team to understand the problem, validate the opportunity, shape the
                  product and launch the company.
                </p>
                <div className="mt-8 grid grid-cols-2 gap-px border border-border bg-border sm:grid-cols-4">
                  {[
                    "Problem validation",
                    "Product strategy",
                    "Product design",
                    "Technology",
                    "Market validation",
                    "Business model",
                    "Launch",
                    "Venture experience",
                  ].map((t) => (
                    <div key={t} className="bg-background px-4 py-5 text-sm text-foreground">
                      {t}
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
            <Reveal delay={100}>
              <div className="border border-border p-8 md:p-10">
                <div className="label-xs">02 — Dedicated capacity</div>
                <p className="mt-6 text-base leading-relaxed text-muted-foreground">
                  Once the company requires permanent engineering capacity, Nizek hires a dedicated
                  team that works exclusively on that startup.
                </p>
                <div className="mt-8 grid grid-cols-1 gap-px border border-border bg-border sm:grid-cols-3">
                  <div className="bg-background px-5 py-6">
                    <div className="label-xs text-subtle">Cost basis</div>
                    <div className="mt-3 text-base text-foreground">Engineering team cost</div>
                  </div>
                  <div className="flex items-center justify-center bg-background px-5 py-6">
                    <span className="display-xl text-3xl">+</span>
                  </div>
                  <div className="bg-background px-5 py-6">
                    <div className="label-xs text-subtle">Nizek</div>
                    <div className="mt-3 text-base text-foreground">15% management margin</div>
                  </div>
                </div>
              </div>
            </Reveal>
            <Reveal delay={200}>
              <div className="border border-border p-8 md:p-10">
                <div className="label-xs">03 — Continuous leadership</div>
                <p className="mt-6 text-base leading-relaxed text-muted-foreground">
                  Nizek continues as the long-term CTO and technology partner, supervising
                  architecture, technical decisions, engineering quality and product technology
                  strategy.
                </p>
                <div className="mt-8 grid grid-cols-1 gap-px border border-border bg-border sm:grid-cols-2">
                  {[
                    "CTO leadership",
                    "Technical strategy",
                    "Architecture",
                    "Engineering standards",
                    "Technical supervision",
                    "Product & technology direction",
                  ].map((t) => (
                    <div key={t} className="bg-background px-5 py-5 text-sm text-foreground">
                      {t}
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </div>

        <div className="mt-24">
          <div className="label-xs">Why this matters</div>
          <div className="mt-10 grid grid-cols-1 gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
            {[
              [
                "Venture experience",
                "The entrepreneur does not build the company alone. Nizek brings years of product, technology and company-building knowledge into the earliest decisions.",
              ],
              [
                "Dedicated execution",
                "Successful companies graduate from shared studio capacity into engineering resources dedicated exclusively to them.",
              ],
              [
                "Continuous CTO leadership",
                "Founders continue benefiting from experienced technical leadership instead of having to manage engineering alone.",
              ],
              [
                "Scalable studio model",
                "Shared studio resources return to building new companies while mature ventures fund their own dedicated capacity.",
              ],
            ].map(([title, body], i) => (
              <Reveal key={title} delay={i * 100}>
                <div className="flex h-full flex-col bg-background p-8 md:p-10">
                  <div className="num text-xs text-subtle">{String(i + 1).padStart(2, "0")}</div>
                  <div className="label-xs mt-8 text-foreground">{title}</div>
                  <p className="mt-5 text-sm leading-relaxed text-muted-foreground">{body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        <Reveal>
          <div className="mt-px border border-border-strong p-8 md:p-12">
            <p className="display-xl max-w-4xl text-2xl leading-snug md:text-4xl">
              We don&apos;t build software and hand it over. We build companies alongside
              entrepreneurs — and stay behind the technology as they scale.
            </p>
          </div>
        </Reveal>
      </Section>

      {/* 05 — Regional founder pipeline */}
      <Section id="regional">
        <SectionHeading
          index="05 — Regional sourcing"
          title="Source Broadly. Select Carefully."
          lede="Nizek sources entrepreneurs and opportunities from across the GCC, giving the venture studio access to a broader pool of founders and ideas. Every opportunity then goes through our structured qualification process before becoming part of the portfolio."
        />

        <Reveal>
          <div className="mb-16 grid grid-cols-1 gap-px border border-border bg-border md:grid-cols-5">
            {[
              ["Regional Sourcing", "01"],
              ["Founder Evaluation", "02"],
              ["Founder Residency", "03"],
              ["Investment Decision", "04"],
              ["Portfolio Company", "05"],
            ].map(([t, i]) => (
              <div key={i} className="h-full bg-background p-8">
                <div className="num text-xs text-subtle">{i}</div>
                <p className="display-xl mt-8 text-xl md:text-2xl">{t}</p>
              </div>
            ))}
          </div>
        </Reveal>



        <Reveal>
          <div className="border border-border p-6 md:p-10">
            <div className="label-xs">Regional sourcing network — Gulf Cooperation Council</div>
            <svg
              viewBox="0 0 760 470"
              className="mt-6 w-full text-foreground"
              fill="none"
              role="img"
              aria-label="Minimal map of the GCC showing Nizek's regional sourcing network across Kuwait, Saudi Arabia, Bahrain, Qatar, the UAE and Oman"

            >
              <path
                d="M196 74 L262 96 L300 78 L352 108 L398 96 L436 128 L470 132 L520 158 L566 160 L612 196 L648 258 L636 316 L594 356 L546 386 L488 404 L430 396 L372 366 L318 328 L262 300 L214 252 L182 190 Z"
                stroke="currentColor"
                strokeWidth="1"
                opacity="0.35"
              />
              <path
                d="M182 190 L214 252 L262 300 L318 328 L372 366"
                stroke="currentColor"
                strokeWidth="1"
                opacity="0.15"
              />

              {[
                "M232 132 C300 150 340 172 392 190",
                "M392 190 C420 186 430 190 448 200",
                "M448 200 C470 214 486 220 520 224",
                "M520 224 C566 232 596 262 616 296",
                "M232 132 C300 200 360 250 340 268",
                "M340 268 C420 268 500 246 520 224",
              ].map((d, i) => (
                <g key={d}>
                  <path d={d} stroke="currentColor" strokeWidth="0.75" opacity="0.18" />
                  <path
                    d={d}
                    stroke="currentColor"
                    strokeWidth="1"
                    className="map-flow"
                    opacity="0.75"
                    style={{ animationDelay: `${i * 0.7}s` }}
                  />
                </g>
              ))}

              {[
                { x: 232, y: 132, label: "Kuwait", anchor: "end" as const, dx: -14, dy: 4 },
                { x: 340, y: 268, label: "Saudi Arabia", anchor: "middle" as const, dx: 0, dy: 26 },
                { x: 392, y: 190, label: "Bahrain", anchor: "end" as const, dx: -14, dy: -8 },
                { x: 448, y: 200, label: "Qatar", anchor: "middle" as const, dx: 0, dy: 28 },
                {
                  x: 520,
                  y: 224,
                  label: "United Arab Emirates",
                  anchor: "start" as const,
                  dx: 14,
                  dy: -10,
                },
                { x: 616, y: 296, label: "Oman", anchor: "start" as const, dx: 14, dy: 6 },
              ].map((n, i) => (
                <g key={n.label}>
                  <circle
                    cx={n.x}
                    cy={n.y}
                    r="4"
                    fill="currentColor"
                    className="map-pulse"
                    style={{ animationDelay: `${i * 0.5}s` }}
                  />
                  <rect x={n.x - 3} y={n.y - 3} width="6" height="6" fill="currentColor" />
                  <text
                    x={n.x + n.dx}
                    y={n.y + n.dy}
                    textAnchor={n.anchor}
                    fill="currentColor"
                    opacity="0.7"
                    style={{
                      fontSize: "11px",
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                    }}
                  >
                    {n.label}
                  </text>
                </g>
              ))}
            </svg>
            <div className="mt-6 flex flex-wrap gap-x-8 gap-y-2 border-t border-border pt-5">
              {["Kuwait", "Saudi Arabia", "UAE", "Qatar", "Bahrain", "Oman"].map((c) => (
                <span key={c} className="label-xs">
                  {c}
                </span>
              ))}
            </div>
            <p className="mt-5 max-w-3xl text-sm leading-relaxed text-muted-foreground">
              The map represents where opportunities are sourced. It does not imply offices or
              operations in every country.
            </p>
          </div>
        </Reveal>

        <div className="mt-16 grid grid-cols-1 gap-px border border-border bg-border md:grid-cols-2 lg:grid-cols-4">
          {[
            {
              t: "Broader Opportunity Pool",
              b: "Regional sourcing provides access to a wider range of founders, industries and business opportunities than a single local ecosystem.",
            },
            {
              t: "Better Selection",
              b: "A larger sourcing network allows Nizek to remain highly selective rather than investing simply because opportunities are limited.",
            },
            {
              t: "Portfolio Diversification",
              b: "Ideas and founders originating from different GCC markets create a healthier and more diversified portfolio.",
            },
            {
              t: "Disciplined Qualification",
              b: "Every entrepreneur must complete Nizek's qualification process before becoming part of the venture studio.",
            },
          ].map((c, i) => (
            <Reveal key={c.t} delay={i * 100}>
              <div className="flex h-full flex-col bg-background p-8 md:p-10">
                <div className="num text-xs text-subtle">{String(i + 1).padStart(2, "0")}</div>
                <div className="display-xl mt-10 text-2xl md:text-3xl">{c.t}</div>
                <p className="mt-6 text-sm leading-relaxed text-muted-foreground">{c.b}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <div className="mt-16 border border-border p-8 md:p-14">
            <div className="label-xs">Investment philosophy</div>
            <p className="display-xl mt-8 max-w-4xl text-2xl md:text-4xl">
              “The hardest asset to find is not capital. It is exceptional entrepreneurs.”
            </p>
            <p className="mt-8 max-w-3xl text-base leading-relaxed text-muted-foreground">
              Our regional sourcing network helps us discover more opportunities. Our qualification
              process determines which founders earn our partnership.
            </p>
          </div>
        </Reveal>

        <Reveal>
          <div className="mt-16 max-w-3xl">
            <div className="label-xs">Why this matters</div>
            <p className="mt-6 text-base leading-relaxed text-muted-foreground">
              A regional sourcing network gives investors exposure to a far broader and more
              diversified set of founders than a venture studio limited to a single local market.
              Selectivity — not volume — determines which of those founders receive Nizek's capital,
              technology and time.
            </p>
            <p className="display-xl mt-10 text-2xl md:text-3xl">
              Our competitive advantage is not simply seeing more founders. It is combining regional
              sourcing with disciplined founder selection.
            </p>
          </div>
        </Reveal>


      </Section>

      {/* 06 — Equity model */}
      <EquitySection />

      {/* 07 — Fund structure */}
      <Section id="structure">
        <SectionHeading
          index="07 — Fund structure"
          title="One Fund. One Ownership Structure."
          lede="Investors own units in a single Abu Dhabi investment vehicle. The fund signs the startup agreements and becomes the legal shareholder in every portfolio company — so investors participate through one centralised structure rather than holding shares in dozens of startups."
        />

        <Reveal>
          <div className="border border-border p-8 md:p-12">
            <div className="label-xs">Ownership structure</div>

            <div className="mt-10 grid grid-cols-2 gap-px border border-border bg-border sm:grid-cols-3">
              {["Investor A", "Investor B", "Investor C", "Investor D", "Investor E", "Investor F"].map(
                (n, i) => (
                  <Reveal key={n} delay={i * 60}>
                    <div className="bg-background px-5 py-6 text-sm text-foreground">{n}</div>
                  </Reveal>
                ),
              )}
            </div>

            <Reveal delay={120}>
              <div className="flex flex-col items-center">
                <div className="my-6 h-10 w-px bg-border-strong" aria-hidden />
                <div className="w-full border-y border-border-strong py-8 text-center">
                  <div className="display-xl text-3xl md:text-5xl">NIZEK Venture Fund</div>
                  <div className="label-xs mt-4">Abu Dhabi, UAE</div>
                </div>
                <div className="my-6 h-10 w-px bg-border-strong" aria-hidden />
              </div>
            </Reveal>

            <div className="grid grid-cols-2 gap-px border border-border bg-border sm:grid-cols-4">
              {[
                "Startup 01",
                "Startup 02",
                "Startup 03",
                "Startup 04",
                "Startup 05",
                "Startup 06",
                "…",
                "Portfolio companies",
              ].map((s, i) => (
                <Reveal key={s} delay={i * 50}>
                  <div className="num bg-background px-4 py-5 text-xs text-muted-foreground">{s}</div>
                </Reveal>
              ))}
            </div>
          </div>
        </Reveal>

        <div className="mt-px grid grid-cols-1 gap-px border border-border bg-border md:grid-cols-3">
          {[
            [
              "Simple Ownership",
              "One fund unit instead of ownership in dozens of separate companies.",
            ],
            [
              "Centralized Portfolio",
              "Every company sits inside one professionally managed vehicle.",
            ],
            [
              "Scalable Structure",
              "New companies are added without changing the ownership structure.",
            ],
          ].map(([t, d], i) => (
            <Reveal key={t} delay={i * 70}>
              <div className="h-full bg-background p-10">
                <div className="num text-xs text-subtle">{String(i + 1).padStart(2, "0")}</div>
                <div className="display-xl mt-8 text-2xl md:text-3xl">{t}</div>
                <p className="mt-6 text-sm leading-relaxed text-muted-foreground">{d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* 08 — Investor advantages */}
      <Section id="advantages" invert>
        <SectionHeading index="08 — Investor advantages" title="Why This Works For The Investor." />
        <div className="grid grid-cols-1 gap-px border border-border bg-border lg:grid-cols-3">
          <Reveal>
            <div className="flex h-full flex-col bg-background p-10">
              <div className="num text-xs text-subtle">01</div>
              <div className="display-xl mt-8 text-3xl md:text-4xl">Diversification</div>
              <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
                Participation across 50+ companies means no single startup determines the entire
                portfolio outcome.
              </p>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <div className="flex h-full flex-col bg-background p-10">
              <div className="num text-xs text-subtle">02</div>
              <div className="display-xl mt-8 text-3xl md:text-4xl">Early Visibility</div>
              <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
                Investors see companies from the beginning, and watch how they actually behave over
                time.
              </p>
              <div className="mt-8 flex flex-col">
                {["Idea", "Validation", "MVP", "Traction", "Fundraising", "Growth"].map((s, i) => (
                  <div
                    key={s}
                    className="flex items-baseline gap-4 border-b border-border py-3 last:border-b-0"
                  >
                    <span className="num text-xs text-subtle">{String(i + 1).padStart(2, "0")}</span>
                    <span className="text-sm text-foreground">{s}</span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
          <Reveal delay={200}>
            <div className="flex h-full flex-col bg-background p-10">
              <div className="num text-xs text-subtle">03</div>
              <div className="display-xl mt-8 text-3xl md:text-4xl">Follow-On Opportunity</div>
              <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
                Investors can identify the strongest companies early and may have opportunities to
                participate directly in future funding rounds.
              </p>
              <p className="mt-auto pt-10 text-xs leading-relaxed text-subtle">
                This does not constitute guaranteed allocation, priority rights or first-refusal
                rights unless defined in the legal agreements.
              </p>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* 09 — Investment + limited ownership */}
      <Section id="investment">
        <SectionHeading
          index="09 — The investment"
          title="Only Six Ownership Seats."
          lede="The investment vehicle is limited to six ownership seats. Each seat represents 5% participation in Nizek's equity position across the portfolio startups."
        />

        <div className="grid grid-cols-2 gap-px border border-border bg-border lg:grid-cols-4">
          {[
            [kd(SEAT_QUARTERLY_COMMITMENT), "Quarterly capital call"],
            ["Every 3 months", "Capital call frequency"],
            ["In advance", "Called at the start of each quarter"],
            [`${SEAT_OWNERSHIP}%`, "Participation per seat"],
          ].map(([v, l], i) => (
            <Reveal key={l} delay={i * 70}>
              <div className="flex h-full flex-col justify-between bg-background p-8">
                <div className="num text-3xl text-foreground md:text-4xl">{v}</div>
                <div className="label-xs mt-8 text-muted-foreground">{l}</div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <p className="mt-10 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Investors commit for a five-year investment period. Capital is not paid upfront. Instead,
            capital is called every three months in advance as new venture cohorts are funded.
          </p>
        </Reveal>

        <Reveal>
          <div className="mt-10 grid grid-cols-2 gap-px border border-border bg-border md:grid-cols-4">
            {[1, 2, 3, 4].map((q) => (
              <div key={q} className="bg-background p-8">
                <div className="label-xs">Quarter {q}</div>
                <div className="num mt-6 text-2xl text-foreground md:text-3xl">
                  {kd(SEAT_QUARTERLY_COMMITMENT)}
                </div>
                <div className="mt-4 text-[11px] text-subtle">Capital call — in advance</div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-subtle">
            Quarterly capital calls continue throughout the five-year commitment.
          </p>
        </Reveal>


        <div className="mt-16 grid grid-cols-2 gap-px border border-border bg-border md:mt-24 md:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: TOTAL_SEATS }, (_, i) => {
            const n = i + 1;
            const reserved = RESERVED_SEATS.includes(n);
            return (
              <Reveal key={n} delay={i * 60}>
                <div
                  className={`h-full p-8 transition-colors duration-300 ${
                    reserved ? "bg-foreground text-background" : "bg-background"
                  }`}
                >
                  <div className="num text-xs opacity-60">Seat {String(n).padStart(2, "0")}</div>
                  <div className="display-xl mt-10 text-2xl md:text-3xl">
                    {reserved ? "Taken" : "Available"}
                  </div>
                  <div className="mt-6 text-[11px] leading-relaxed opacity-60">
                    {SEAT_OWNERSHIP}%
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>

        <Reveal>
          <div className="mt-px flex flex-wrap items-end justify-between gap-6 border border-border px-8 py-8">
            <div>
              <div className="label-xs">Total investor participation</div>
              <p className="mt-3 text-xs text-subtle">
                {TOTAL_SEATS} seats × {SEAT_OWNERSHIP}% of Nizek&apos;s equity position across the
                portfolio startups
              </p>
            </div>
            <div className="num text-4xl text-foreground md:text-6xl">
              {TOTAL_SEATS * SEAT_OWNERSHIP}%
            </div>
          </div>
        </Reveal>

        <Reveal>
          <div className="mt-px grid grid-cols-2 gap-px border border-border bg-border lg:grid-cols-4">
            {[
              [`${TOTAL_SEATS}`, "Ownership seats"],
              [`${SEAT_OWNERSHIP}%`, "Participation per seat"],
              [kd(SEAT_QUARTERLY_COMMITMENT), "Every 3 months"],
              ["In advance", "Quarterly capital call"],
            ].map(([v, l]) => (
              <div key={l} className="bg-background px-8 py-7">
                <div className="num text-xl text-foreground md:text-2xl">{v}</div>
                <div className="label-xs mt-5 text-muted-foreground">{l}</div>
              </div>
            ))}
          </div>
        </Reveal>


        <div className="mt-24 grid grid-cols-1 gap-16 lg:grid-cols-[1fr_1fr]">
          <div>
            <div className="label-xs">Capital deployment</div>
            <div className="mt-8 grid grid-cols-2 gap-px border border-border bg-border">
              {["Developers", "Marketing", "Operations", "Ecosystem"].map((s, i) => (
                <div key={s} className="bg-background p-8">
                  <div className="num text-xs text-subtle">{String(i + 1).padStart(2, "0")}</div>
                  <div className="display-xl mt-6 text-xl leading-tight md:text-2xl">{s}</div>
                </div>
              ))}
            </div>
          </div>
          <Reveal delay={100}>
            <div className="border-l border-border-strong pl-8">
              <p className="display-xl text-2xl md:text-4xl">
                Participation is in Nizek&apos;s portfolio equity allocation.
              </p>
              <p className="mt-6 text-sm text-muted-foreground">It is not ownership in Nizek itself.</p>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* 10 — Simulator */}
      <section id="model" className="section-invert border-t border-border">
        <div className="px-6 py-24 md:px-12 md:py-32">
          <div className="mx-auto w-full max-w-[1400px]">
            <Reveal>
              <div className="label-xs">10 — The investment simulator</div>
              <h2 className="display-xl mt-6 text-5xl md:text-8xl">
                If Nizek builds successful companies, what could your investment become?
              </h2>
              <p className="mt-8 max-w-2xl text-base leading-relaxed text-muted-foreground">
                Five annual cohorts. Portfolio value is the sum of the Estimated Enterprise Values of
                the successful companies. Move the assumptions and it re-prices instantly.
              </p>
            </Reveal>
          </div>
        </div>

        <div className="border-t border-border">
          {panelOpen && (
            <button
              type="button"
              aria-label="Close assumptions"
              onClick={() => setPanelOpen(false)}
              className="fixed inset-0 z-40 bg-black/70"
            />
          )}

          <aside
            className={`fixed right-0 top-0 z-50 h-screen w-full max-w-[420px] overflow-y-auto border-l border-border bg-background px-6 py-8 transition-transform duration-300 lg:px-8 ${
              panelOpen ? "translate-x-0" : "pointer-events-none translate-x-full"
            }`}
            aria-hidden={!panelOpen}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="label-xs">Your assumptions</div>
              <button
                type="button"
                onClick={() => setPanelOpen(false)}
                className="label-xs transition-colors hover:text-foreground"
              >
                Close
              </button>
            </div>
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
                {g === "Company value" && (
                  <div className="mt-8">
                    <div className="label-xs">
                      Successful companies &amp; Estimated Enterprise Value
                    </div>
                    {cohortExitControls.map((c) => (
                      <div key={c.index} className="border-b border-border py-5">
                        <div className="text-sm text-foreground">{c.label}</div>
                        <div className="mt-4 flex items-baseline justify-between gap-4">
                          <label
                            htmlFor={`cohort-success-${c.index}`}
                            className="text-sm text-muted-foreground"
                          >
                            Successful companies
                          </label>
                          <ValueField
                            label={`${c.label} successful companies`}
                            display={String(inputs.successesByYear?.[c.index] ?? 0)}
                            value={inputs.successesByYear?.[c.index] ?? 0}
                            min={c.successMin}
                            max={c.successMax}
                            onCommit={(v) => setCohortSuccess(c.index, Math.round(v))}
                          />
                        </div>
                        <input
                          id={`cohort-success-${c.index}`}
                          type="range"
                          min={c.successMin}
                          max={c.successMax}
                          step={c.successStep}
                          value={inputs.successesByYear?.[c.index] ?? 0}
                          onChange={(e) => setCohortSuccess(c.index, Number(e.target.value))}
                          className="mt-4"
                          aria-label={`${c.label} successful companies`}
                        />
                        {Array.from({ length: inputs.successesByYear?.[c.index] ?? 0 }, (_, k) => {
                          const val = inputs.exitValuesByYear?.[c.index]?.[k] ?? 0;
                          const id = `cohort-eev-${c.index}-${k}`;
                          return (
                            <div key={k} className="mt-5">
                              <div className="flex items-baseline justify-between gap-4">
                                <label htmlFor={id} className="text-sm text-muted-foreground">
                                  {(inputs.successesByYear?.[c.index] ?? 0) > 1
                                    ? `Estimated enterprise value · Company ${k + 1}`
                                    : "Estimated enterprise value"}
                                </label>
                                <ValueField
                                  label={`${c.label} estimated enterprise value ${k + 1}`}
                                  display={kd(val)}
                                  value={val}
                                  min={c.min}
                                  max={c.max}
                                  onCommit={(v) => setCohortExit(c.index, k, v)}
                                />
                              </div>
                              <input
                                id={id}
                                type="range"
                                min={c.min}
                                max={c.max}
                                step={c.step}
                                value={val}
                                onChange={(e) => setCohortExit(c.index, k, Number(e.target.value))}
                                className="mt-4"
                                aria-label={`${c.label} estimated enterprise value ${k + 1}`}
                              />
                            </div>
                          );
                        })}
                        <div className="mt-3 flex items-start justify-between gap-4">
                          <span className="text-[11px] leading-relaxed text-subtle">{c.help}</span>
                          <button
                            type="button"
                            onClick={() =>
                              setInputs((p) => ({
                                ...p,
                                successesByYear: (p.successesByYear ?? []).map((g2, idx) =>
                                  idx === c.index
                                    ? defaultInvestmentInputs.successesByYear[c.index] ?? 0
                                    : g2,
                                ),
                                exitValuesByYear: (p.exitValuesByYear ?? []).map((row, idx) =>
                                  idx === c.index
                                    ? [...(defaultInvestmentInputs.exitValuesByYear[c.index] ?? [])]
                                    : row,
                                ),
                              }))
                            }
                            className="label-xs shrink-0 transition-colors hover:text-foreground"
                          >
                            Reset
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </aside>

          <div className="px-6 py-12 md:px-12">
            {/* Seat selector — allocation interface */}
            <div className="relative border border-border p-8 md:p-12">
              <button
                type="button"
                onClick={() => setPanelOpen(true)}
                className="absolute right-8 top-8 border border-border-strong px-5 py-2.5 text-xs uppercase tracking-[0.18em] text-foreground transition-colors hover:bg-foreground hover:text-background md:right-12 md:top-12"
              >
                Show assumptions
              </button>
              <div className="flex flex-col gap-10 border-b border-border pb-10 md:flex-row md:items-end md:justify-between">
                <div className="max-w-2xl">
                  <div className="flex items-center gap-4">
                    <span className="h-px w-8 bg-border-strong" aria-hidden />
                    <div className="label-xs">Allocation interface</div>
                  </div>

                  <h3 className="display-xl mt-6 text-3xl leading-tight md:text-5xl">
                    Secure your position in the Nizek ecosystem.{" "}
                    <span className="text-subtle">
                      {AVAILABLE_SEATS - result.seats === 0
                        ? "All remaining seats are yours."
                        : `Only ${AVAILABLE_SEATS - result.seats} of ${TOTAL_SEATS} seats would remain.`}
                    </span>
                  </h3>
                  <p className="mt-6 max-w-md text-xs leading-relaxed text-subtle">
                    Select the number of seats. Everything below updates instantly.
                  </p>
                </div>
                <div className="text-right">
                  <div className="num text-6xl leading-none text-foreground md:text-8xl">
                    {String(AVAILABLE_SEATS - result.seats).padStart(2, "0")}
                    <span className="text-subtle">/{String(TOTAL_SEATS).padStart(2, "0")}</span>
                  </div>
                  <div className="label-xs mt-3">Seats still available</div>
                </div>
              </div>

              <div className="mt-10 grid grid-cols-2 gap-px border border-border bg-border md:grid-cols-3 lg:grid-cols-6">
                {Array.from({ length: TOTAL_SEATS }, (_, i) => {
                  const n = i + 1;
                  const reserved = RESERVED_SEATS.includes(n);
                  const rank = reserved ? 0 : n - RESERVED_SEATS.filter((r) => r < n).length;
                  const active = !reserved && rank <= result.seats;
                  return (
                    <button
                      key={n}
                      type="button"
                      disabled={reserved}
                      onClick={() => !reserved && set("seats", rank)}
                      aria-pressed={active}
                      aria-label={
                        reserved ? `Seat ${n} committed` : `Select ${rank} seat${rank > 1 ? "s" : ""}`
                      }
                      className={`group relative flex aspect-square flex-col justify-between overflow-hidden p-5 text-left transition-colors duration-300 md:p-6 ${
                        reserved
                          ? "cursor-not-allowed bg-background text-subtle"
                          : active
                            ? "bg-foreground text-background"
                            : "bg-background hover:bg-muted"
                      }`}
                    >
                      {reserved && (
                        <span
                          aria-hidden
                          className="pointer-events-none absolute inset-0 opacity-20"
                          style={{
                            backgroundImage:
                              "repeating-linear-gradient(45deg, currentColor 0, currentColor 1px, transparent 1px, transparent 8px)",
                          }}
                        />
                      )}
                      <span className="num relative text-[11px] opacity-50 transition-opacity group-hover:opacity-100">
                        {String(n).padStart(2, "0")}
                      </span>
                      <span className="relative block">
                        <span className={`label-xs block ${active ? "text-background" : ""}`}>
                          {reserved ? "Committed" : active ? "Selected" : "Available"}
                        </span>
                        <span
                          className={`num mt-2 block text-2xl tracking-tight md:text-3xl ${
                            reserved ? "opacity-30" : active ? "" : "opacity-50 group-hover:opacity-100"
                          }`}
                        >
                          {reserved ? "—" : `${SEAT_OWNERSHIP.toFixed(1)}%`}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* KPIs — live metrics matrix */}
            <div className="mt-px grid grid-cols-2 gap-px border border-border bg-border md:grid-cols-3 lg:grid-cols-6">
              {[
                { l: "Seats selected", v: result.seats, f: (v: number) => `${Math.round(v)}` },
                {
                  l: "Participation",
                  v: result.ownershipPercent,
                  f: (v: number) => `${v.toFixed(1)}%`,
                },
                { l: "Quarterly commitment", v: result.annualCommitment / 4, f: kd },
                { l: "Estimated portfolio value", v: result.portfolioValue, f: kd },
                { l: "Estimated investor value", v: result.investorValue, f: kd },
                { l: "Multiple", v: result.moic, f: (v: number) => multiple(v, 2) },
              ].map((k) => (
                <div key={k.l} className="bg-background p-8">
                  <div className="label-xs">{k.l}</div>
                  <div className="num mt-8 text-2xl tracking-tight text-foreground md:text-4xl">
                    <AnimatedNumber value={k.v} format={k.f} />
                  </div>
                </div>
              ))}
            </div>

            {/* Status bar */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-foreground" aria-hidden />
                <span className="label-xs">Live — pool allocation active</span>
              </div>
              <span className="label-xs text-subtle">
                {result.seats} of {AVAILABLE_SEATS} available seats selected
              </span>
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

            {/* The portfolio, year by year */}
            <div className="mt-20">
              <div className="label-xs">How the portfolio is built, one cohort at a time</div>
              <p className="mt-4 max-w-2xl text-xs leading-relaxed text-subtle">
                Every year new capital is drawn and a new cohort of startups is created. Most do not
                succeed. Each cohort is modeled using the Estimated Enterprise Value of its
                successful companies — earlier cohorts carry higher values because they have had more
                time to mature.
              </p>

              <div className="mt-8 border border-border">
                {result.cohorts.map((c) => {
                  const share = maxCohort > 0 ? c.portfolioValue / maxCohort : 0;
                  return (
                    <Reveal key={c.year} delay={(c.year - 1) * 60}>
                      <div className="border-b border-border px-6 py-7 last:border-b-0 md:px-10">
                        <div className="grid grid-cols-2 items-start gap-x-6 gap-y-6 sm:grid-cols-3 lg:grid-cols-6">
                          <div className="display-xl col-span-2 min-w-0 text-2xl sm:col-span-3 lg:col-span-1">
                            Year {c.year}
                          </div>
                          {[
                            ["Invested", `${kd(c.capitalInvested / 4)} / quarter`, null],
                            ["Successes", fmtNumber(c.successes), null],
                            [
                              "EEV",
                              kd(c.portfolioValue),
                              c.exitValues.length > 1
                                ? `${c.exitValues
                                    .map((v) => kd(v).replace("KD", ""))
                                    .join(" + ")} = ${kd(c.portfolioValue).replace("KD", "")}`
                                : null,
                            ],
                            ["Nizek equity", kd(c.nizekEquityValue), null],
                            ["Investor equity", kd(c.investorValue), null],
                          ].map(([l, v, breakdown]) => (
                            <div key={l as string} className="min-w-0">
                              <div
                                className="label-xs"
                                title={l === "EEV" ? "Estimated enterprise value" : undefined}
                              >
                                {l}
                              </div>
                              <div className="num mt-2 break-words text-xs text-foreground">{v}</div>
                              {breakdown ? (
                                <div className="num mt-1 break-words text-[10px] text-muted-foreground">
                                  {breakdown}
                                </div>
                              ) : null}
                            </div>
                          ))}
                        </div>
                        <div className="mt-5 h-px w-full bg-border">
                          <div
                            className="h-px bg-foreground"
                            style={{
                              width: `${Math.max(share * 100, 0.5)}%`,
                              transition: "width 500ms cubic-bezier(0.16,1,0.3,1)",
                            }}
                          />
                        </div>
                      </div>
                    </Reveal>
                  );
                })}
              </div>

              {/* Funnel */}
              <div className="mt-px grid grid-cols-1 gap-px border border-border bg-border md:grid-cols-4">
                {[
                  {
                    step: "01",
                    title: "Portfolio value",
                    value: result.portfolioValue,
                    note: `${fmtNumber(result.totalSuccesses)} successful companies out of ${fmtNumber(result.totalStartups)}, each at its Estimated Enterprise Value.`,
                  },
                  {
                    step: "02",
                    title: "Nizek ownership",
                    value: result.nizekEquityValue,
                    note: `${inputs.avgNizekOwnership}% average equity across the successful companies.`,
                  },
                  {
                    step: "03",
                    title: "Investor share",
                    value: result.investorValue,
                    note: `${result.ownershipPercent}% participation in Nizek's equity position — ${result.seats} seat${result.seats > 1 ? "s" : ""} × ${SEAT_OWNERSHIP}%.`,
                  },
                  {
                    step: "04",
                    title: "Estimated return",
                    value: result.moic,
                    format: (v: number) => multiple(v, 2),
                    note: `On ${kd(result.annualCommitment / 4)} called every three months, paid quarterly in advance.`,
                  },
                ].map((s) => (
                  <div key={s.step} className="bg-background p-8">
                    <div className="num text-xs text-subtle">{s.step}</div>
                    <div className="mt-6 text-sm leading-relaxed text-foreground">{s.title}</div>
                    <div className="num mt-6 text-2xl text-foreground">
                      <AnimatedNumber value={s.value} format={s.format ?? kd} />
                    </div>
                    <div className="mt-4 text-[11px] leading-relaxed text-subtle">{s.note}</div>
                  </div>
                ))}
              </div>

              <p className="mt-8 max-w-3xl text-[11px] leading-relaxed text-subtle">
                Illustrative model only. Estimated Enterprise Value is an assumption about what a
                company could be worth — it does not imply a sale, IPO or any liquidity event.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 11 — Team */}
      <TeamSection />

      {/* 12 — Request allocation */}
      <ReserveSection />
    </div>
  );
}

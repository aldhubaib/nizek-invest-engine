import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useMemo, useState } from "react";

import { AnimatedNumber } from "@/components/model/AnimatedNumber";
import { ValueField } from "@/components/model/ValueField";
import { TeamSection } from "@/components/site/TeamSection";
import { Reveal, Section, SectionHeading } from "@/components/ui/primitives";
import { multiple, number as fmtNumber, percent } from "@/model/format";
import {
  AVAILABLE_SEATS,
  RESERVED_SEATS,
  SEAT_ANNUAL_COMMITMENT,
  SEAT_QUARTERLY_COMMITMENT,
  SEAT_MAX_COMMITMENT,
  SEAT_OWNERSHIP,
  TOTAL_SEATS,
  cohortExitControls,
  COMMITMENT_YEARS,
  TOTAL_INVESTMENT,
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
    (k: NumericInvestmentKey) =>
      setInputs((p) => ({ ...p, [k]: defaultInvestmentInputs[k] })),
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

      <Section id="why">
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

      <Section id="problem" invert>
        <SectionHeading
          index="02 — The problem"
          title="Traditional Venture Capital Has One Major Weakness"
          lede="VCs invest after founders have already built something. And the hardest part is finding great entrepreneurs in the first place — capital is abundant, exceptional founders are not."
        />
        <div className="grid grid-cols-2 gap-px border border-border bg-border md:grid-cols-3">
          {[
            "Finding great entrepreneurs",
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

      <Section id="how-we-build">
        <SectionHeading
          index="03 — Our model"
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

      <Section id="founders" invert>
        <SectionHeading
          index="04 — Founder pipeline"
          title="We Don't Find Founders. We Qualify Them."
          lede="Venture capital's hardest problem is founder risk: a handful of meetings, then a decade of consequences. Nizek runs a repeatable system for discovering, testing and selecting founders before a single dinar is committed."
        />

        <div className="grid grid-cols-1 gap-px border border-border bg-border md:grid-cols-2">
          <div className="bg-background p-10">
            <div className="label-xs">The problem</div>
            <p className="mt-8 text-lg leading-relaxed text-subtle">
              Most investors meet entrepreneurs through pitch events, introductions or
              applications, and must decide after a few conversations. Execution is
              discovered after the money is gone.
            </p>
          </div>
          <div className="bg-background p-10">
            <div className="label-xs text-foreground">Our solution</div>
            <p className="mt-8 text-lg leading-relaxed text-foreground">
              Every founder enters the Nizek Founder Residency first — roughly six months
              building inside one of our existing startups. Only those who prove
              themselves are offered investment.
            </p>
          </div>
        </div>

        {/* Flow */}
        <div className="mt-24">
          <div className="label-xs">The process</div>
          <div className="mt-10 grid grid-cols-1 gap-px border border-border bg-border sm:grid-cols-2 md:grid-cols-3">
            {[
              { t: "Applications", d: "Open, continuous inbound from the region's operators." },
              { t: "Founder Residency", d: "~6 months building inside a live Nizek startup." },
              { t: "Performance Evaluation", d: "Judged on real output, not a pitch deck." },
              { t: "Founder Approved", d: "Both sides decide to build a company together." },
              { t: "Investment", d: "Capital, equity and platform are committed." },
              { t: "Startup Launch", d: "The company enters the annual cohort." },
            ].map((s, i) => (
              <Reveal key={s.t} delay={i * 90}>
                <div className="flex h-full flex-col justify-between bg-background p-8">
                  <div>
                    <span className="num text-xs text-subtle">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="display-xl mt-6 text-2xl leading-tight md:text-3xl">
                      {s.t}
                    </div>
                  </div>
                  <p className="mt-8 text-sm leading-relaxed text-subtle">{s.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        {/* What we evaluate */}
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
          <Reveal>
            <p className="mt-10 max-w-2xl text-base leading-relaxed text-muted-foreground">
              The founder is evaluating us at the same time. By the end of the residency,
              both sides know the answer.
            </p>
          </Reveal>
        </div>

        {/* Key message */}
        <Reveal>
          <div className="mt-24 border-t border-border-strong pt-12">
            <p className="display-xl max-w-5xl text-3xl leading-tight md:text-6xl">
              Traditional venture capital invests first and evaluates execution later.
              Nizek evaluates execution first and invests later.
            </p>
            <p className="mt-8 max-w-2xl text-base leading-relaxed text-muted-foreground">
              The result is a continuous pipeline of founders who have already proven they
              can execute before receiving capital — making the studio repeatable,
              scalable and far less dependent on luck.
            </p>
          </div>
        </Reveal>
      </Section>

      <Section id="independence">
        <SectionHeading
          index="05 — Operating model"
          title="From Building To Independence"
          lede="NIZEK does not permanently support every startup with its internal team. We provide the technology, product development and engineering needed to launch and validate the business in its first year — then hand it over."
        />

        <div className="grid grid-cols-1 gap-px border border-border bg-border lg:grid-cols-3">
          <div className="bg-background p-10">
            <div className="label-xs">The model</div>
            <p className="mt-6 text-base leading-relaxed text-muted-foreground">
              Every startup accepted into the NIZEK Venture Studio receives a full product and
              engineering organisation from day one, in exchange for an agreed equity stake.
            </p>
            <ul className="mt-8 flex flex-col">
              {[
                "Product Strategy",
                "UI/UX Design",
                "Software Development",
                "Technical Leadership",
                "Product Management",
                "Infrastructure & DevOps",
                "Technical Support",
              ].map((s, i) => (
                <li
                  key={s}
                  className="flex items-baseline gap-4 border-b border-border py-3 last:border-b-0"
                >
                  <span className="num text-xs text-subtle">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-base text-foreground">{s}</span>
                </li>
              ))}
            </ul>
            <p className="mt-8 text-sm leading-relaxed text-subtle">
              Founders focus on building the business, acquiring customers and validating the
              market — not on hiring and managing an engineering team from day one.
            </p>
          </div>

          <div className="bg-background p-10">
            <div className="label-xs">The transition</div>
            <div className="display-xl mt-6 text-3xl md:text-4xl">
              Built To Become Independent.
            </div>
            <p className="mt-6 text-base leading-relaxed text-muted-foreground">
              At the end of the first year, the startup begins building its own internal
              technology team. NIZEK supports the transition through documentation, knowledge
              transfer and technical handover.
            </p>
            <p className="mt-6 text-base leading-relaxed text-muted-foreground">
              The engineering team gradually moves from NIZEK to the startup, freeing NIZEK to
              redirect its resources toward building the next generation of companies.
            </p>
          </div>

          <div className="bg-background p-10">
            <div className="label-xs">Why this matters</div>
            <div className="display-xl mt-6 text-3xl md:text-4xl">
              Engineering Capacity Is Recycled, Not Consumed.
            </div>
            <p className="mt-6 text-base leading-relaxed text-muted-foreground">
              Instead of permanently allocating developers to mature companies, capacity returns
              to the studio and is reinvested into new ventures. That is what makes the program
              repeatable, scalable and capital efficient.
            </p>
            <div className="mt-10 grid grid-cols-1 gap-px border border-border bg-border sm:grid-cols-3">
              {["Repeatable", "Scalable", "Capital efficient"].map((t) => (
                <div key={t} className="bg-background px-5 py-6 text-sm text-foreground">
                  {t}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Animated horizontal timeline */}
        <div className="mt-16">
          <div className="label-xs mb-8">The cycle</div>
          <div className="grid grid-cols-1 gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
            {[
              { t: "Startup Accepted", n: "Into the venture studio" },
              { t: "NIZEK Builds Product", n: "Year 1" },
              { t: "Market Validation", n: "Customers, traction, proof" },
              { t: "Startup Hires Internal Team", n: "Its own engineers" },
              { t: "Knowledge Transfer", n: "Documentation and handover" },
              { t: "Independent Company", n: "Technically self-sufficient" },
              { t: "NIZEK Builds The Next Startup", n: "Capacity recycled" },
              { t: "Repeat", n: "The loop closes" },
            ].map((s, i) => (
              <Reveal key={s.t} delay={i * 80} className="bg-background">
                <div className="flex h-full flex-col justify-between p-8">
                  <span className="num text-xs text-subtle">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="mt-10">
                    <div className="display-xl text-xl md:text-2xl">{s.t}</div>
                    <div className="mt-3 text-xs text-muted-foreground">{s.n}</div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        <Reveal>
          <p className="mt-16 max-w-4xl text-2xl leading-snug text-foreground md:text-3xl">
            NIZEK's goal is not to become a startup's long-term software company. Our goal is to
            launch it, validate it and prepare it to stand on its own — so the studio can keep
            creating new companies without increasing operational complexity.
          </p>
        </Reveal>
      </Section>

      <Section id="track-record" invert>
        <SectionHeading index="06 — Track record" title="We've Been Building Since 2009" />
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

      <TeamSection />

      <Section id="proof">
        <SectionHeading index="08 — Current proof" title="Not Theory. Reality." />
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

      <Section id="diversification" invert>
        <SectionHeading
          index="09 — Diversification"
          title="One Investment. Fifty Opportunities."
          lede="Backing a single startup is a binary bet: it works, or the capital is gone. Participating across a studio portfolio spreads that same commitment over 50+ companies built on shared infrastructure — no single outcome decides the result."
        />

        <div className="grid grid-cols-1 gap-px border border-border bg-border md:grid-cols-2">
          <div className="bg-background p-10">
            <div className="label-xs">One startup</div>
            <div className="display-xl mt-8 text-5xl md:text-6xl">1</div>
            <p className="mt-4 text-sm text-subtle">company carries the entire outcome</p>
            <ul className="mt-10 space-y-5">
              {[
                "A single team, a single market, a single thesis",
                "One wrong hire or one bad quarter ends it",
                "No second attempt with the same capital",
                "Outcome concentrated in one exit event",
              ].map((t) => (
                <li key={t} className="border-b border-border pb-4 text-lg text-subtle">
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-background p-10">
            <div className="label-xs text-foreground">The Nizek portfolio</div>
            <div className="display-xl mt-8 text-5xl md:text-6xl">50+</div>
            <p className="mt-4 text-sm text-subtle">companies over five annual cohorts</p>
            <ul className="mt-10 space-y-5">
              {[
                "Ten new companies built every year, across sectors",
                "Failures are absorbed by the portfolio, not fatal to it",
                "Shared engineering, marketing and operations lower the cost of each attempt",
                "Multiple independent paths to a meaningful outcome",
              ].map((t) => (
                <li key={t} className="border-b border-border pb-4 text-lg text-foreground">
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Reveal>
          <p className="display-xl mt-16 text-3xl md:text-5xl">
            Diversification reduces dependence on any single company's success.
          </p>
        </Reveal>
      </Section>

      <Section id="visibility">
        <SectionHeading
          index="10 — Early visibility"
          title="See Tomorrow's Companies Before Everyone Else."
          lede="Most investors meet a company when it is already raising — the story is polished, the price is set, the seats are taken. Inside the studio, investors see companies from the day they are created, and watch how they actually behave over time."
        />

        <div className="grid grid-cols-1 gap-px border border-border bg-border sm:grid-cols-2 md:grid-cols-3">
          {[
            { t: "Idea", d: "The thesis is written, the market sized, the first sketch made." },
            { t: "Validation", d: "Demand is tested with real users before code is committed." },
            { t: "MVP", d: "The in-house team ships the first working product." },
            { t: "Traction", d: "Early usage, retention and revenue signals appear." },
            { t: "Fundraising", d: "The company approaches the outside market for the first time." },
            { t: "Growth", d: "Scale, expansion and the path toward an exit." },
          ].map((s, i) => (
            <Reveal key={s.t} delay={i * 90}>
              <div className="flex h-full flex-col justify-between bg-background p-8">
                <div>
                  <span className="num text-xs text-subtle">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="display-xl mt-6 text-2xl leading-tight md:text-3xl">
                    {s.t}
                  </div>
                </div>
                <p className="mt-8 text-sm leading-relaxed text-subtle">{s.d}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <p className="mt-12 max-w-3xl text-lg leading-relaxed text-subtle">
            Investors follow these companies throughout the journey rather than discovering
            them at the moment they raise. This is early visibility and the opportunity to
            evaluate future investments with far more information than the market has — it
            is not a guarantee of participation, and it does not create priority or
            first-refusal rights unless such rights are set out in the legal documents.
          </p>
        </Reveal>
      </Section>

      <Section id="regional" invert>
        <SectionHeading
          index="11 — Regional first"
          title="Built for the GCC. Designed to Scale Beyond Borders."
          lede="Nizek does not build companies for a single city or a single country. Every venture is designed from day one with regional expansion in mind."
        />

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
          <Reveal>
            <div className="space-y-6 text-lg leading-relaxed text-subtle">
              <p>
                Our experience across the GCC allows us to identify opportunities that can be
                replicated across multiple markets instead of relying on the limited size of
                any single economy.
              </p>
              <p>
                By focusing on regional opportunities, startups have access to significantly
                larger customer bases, stronger revenue potential and greater long-term
                valuations.
              </p>
              <p className="text-foreground">
                This creates a larger addressable market and increases the probability of
                building companies with regional relevance.
              </p>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="border border-border p-6 md:p-10">
              <div className="label-xs">Gulf Cooperation Council</div>
              <svg
                viewBox="0 0 760 470"
                className="mt-6 w-full text-foreground"
                fill="none"
                role="img"
                aria-label="Minimal map of the GCC with animated expansion routes between Kuwait, Saudi Arabia, Bahrain, Qatar, the UAE and Oman"
              >
                {/* Peninsula outline — stylised */}
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

                {/* Expansion routes */}
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

                {/* Country nodes */}
                {[
                  { x: 232, y: 132, label: "Kuwait", anchor: "end" as const, dx: -14, dy: 4 },
                  { x: 340, y: 268, label: "Saudi Arabia", anchor: "middle" as const, dx: 0, dy: 26 },
                  { x: 392, y: 190, label: "Bahrain", anchor: "end" as const, dx: -14, dy: -8 },
                  { x: 448, y: 200, label: "Qatar", anchor: "middle" as const, dx: 0, dy: 28 },
                  { x: 520, y: 224, label: "United Arab Emirates", anchor: "start" as const, dx: 14, dy: -10 },
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
                    <rect
                      x={n.x - 3}
                      y={n.y - 3}
                      width="6"
                      height="6"
                      fill="currentColor"
                    />
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
            </div>
          </Reveal>
        </div>

        {/* Why regional matters */}
        <div className="mt-20 grid grid-cols-1 gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              n: "01",
              t: "Larger Markets",
              d: "Every company is designed to reach millions of customers across the GCC rather than serving a single local market.",
            },
            {
              n: "02",
              t: "Higher Valuations",
              d: "Regional businesses generally attract higher valuations than businesses operating in only one country.",
            },
            {
              n: "03",
              t: "Faster Expansion",
              d: "Products are built with regional infrastructure, localization and scalability from the beginning.",
            },
            {
              n: "04",
              t: "Diversified Revenue",
              d: "Revenue generated across multiple countries reduces dependence on a single economy.",
            },
          ].map((c, i) => (
            <Reveal key={c.n} delay={i * 80}>
              <div className="h-full bg-background p-8">
                <div className="label-xs">{c.n}</div>
                <div className="display-xl mt-6 text-2xl">{c.t}</div>
                <p className="mt-4 text-sm leading-relaxed text-subtle">{c.d}</p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Our approach */}
        <div className="mt-20 grid grid-cols-1 gap-px border border-border bg-border md:grid-cols-2">
          <Reveal>
            <div className="h-full bg-background p-10">
              <div className="label-xs">Instead of asking</div>
              <p className="display-xl mt-6 text-2xl text-subtle md:text-3xl">
                “Can this succeed in Kuwait?”
              </p>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <div className="h-full bg-background p-10">
              <div className="label-xs">We ask</div>
              <p className="display-xl mt-6 text-2xl md:text-3xl">
                “Can this become a regional company?”
              </p>
            </div>
          </Reveal>
        </div>

        <Reveal>
          <p className="mt-10 max-w-3xl text-lg leading-relaxed text-subtle">
            Only ideas capable of expanding across multiple GCC markets are selected for
            venture creation.
          </p>
        </Reveal>

        <Reveal>
          <p className="display-xl mt-16 max-w-5xl text-3xl md:text-5xl">
            Our ambition is not to create Kuwait startups. Our ambition is to build regional
            technology companies that can scale across the GCC and beyond.
          </p>
        </Reveal>
      </Section>

      <Section id="comparison">
        <SectionHeading index="12 — Comparison" title="Why This Is Different" />
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

      <Section id="investors" invert>
        <SectionHeading index="13 — Investor case" title="Why Investors Win" />
        <div className="grid grid-cols-1 gap-px border border-border bg-border sm:grid-cols-2">
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

      <Section id="investment">
        <SectionHeading
          index="14 — The investment"
          title="One Investment. Fifty Companies."
          lede="Instead of investing in one startup, invest in the platform that creates them."
        />
        <div className="grid grid-cols-1 gap-px border border-border bg-border md:grid-cols-3">
          {[
            [

              "Per seat, per quarter",
              kd(SEAT_QUARTERLY_COMMITMENT),
              `every quarter for ${COMMITMENT_YEARS} years — ${kd(SEAT_ANNUAL_COMMITMENT)} a year, ${kd(SEAT_MAX_COMMITMENT)} per seat`,
            ],
            [
              "Your commitment",
              `${kd(result.seats * SEAT_QUARTERLY_COMMITMENT)} / quarter`,
              `${result.seats} seat${result.seats > 1 ? "s" : ""} — ${kd(result.annualCommitment)} a year, ${kd(result.maxCommitment)} over ${COMMITMENT_YEARS} years`,
            ],

            [
              "Nizek commits to",
              `${fmtNumber(inputs.startupsPerYear)} startups`,
              `every year — minimum ${fmtNumber(result.totalStartups)}`,
            ],
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
              Investor participates in a share of Nizek's ownership in every startup created
              during those five years.
            </p>
            <p className="mt-6 text-sm text-muted-foreground">Not ownership in Nizek.</p>
          </div>
        </Reveal>
      </Section>

      <Section id="ownership" invert>
        <SectionHeading
          index="15 — Limited ownership"
          title="Only Six Ownership Seats."
          lede="This investment vehicle is intentionally limited to only six ownership seats."
        />
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-[1.1fr_1fr]">
          <Reveal>
            <div className="space-y-6 text-base leading-relaxed text-muted-foreground md:text-lg">
              <p>
                Each seat represents {SEAT_OWNERSHIP}% ownership of Nizek's equity across every
                startup created during this five-year venture creation program.
              </p>
              <p>
                Each seat requires a quarterly commitment of {kd(SEAT_QUARTERLY_COMMITMENT)} —
                {" "}{kd(SEAT_ANNUAL_COMMITMENT)} a year over five years. Maximum commitment per seat is{" "}
                {kd(SEAT_MAX_COMMITMENT)}.
              </p>
              <p className="text-foreground">
                Once all six seats have been allocated, this investment vehicle will be closed.
              </p>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <div className="grid grid-cols-3 gap-px border border-border bg-border">
              {[
                [String(TOTAL_SEATS), "Total seats"],
                [String(RESERVED_SEATS.length), "Reserved"],
                [String(TOTAL_SEATS - RESERVED_SEATS.length), "Remaining"],
              ].map(([v, l]) => (
                <div key={l} className="bg-background p-6 text-center">
                  <div className="num text-4xl text-foreground md:text-5xl">{v}</div>
                  <div className="label-xs mt-4">{l}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>

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
                    {SEAT_OWNERSHIP}% · {kd(SEAT_QUARTERLY_COMMITMENT)} / quarter
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </Section>

      <Section id="capital">
        <SectionHeading index="16 — Capital deployment" title="Where The Money Goes" />
        <div className="grid grid-cols-2 gap-px border border-border bg-border md:grid-cols-4">
          {["Developers", "Marketing", "Operations", "Ecosystem"].map(
            (s, i) => (
              <div key={s} className="bg-background p-8">
                <div className="num text-xs text-subtle">{String(i + 1).padStart(2, "0")}</div>
                <div className="display-xl mt-6 text-2xl leading-tight md:text-3xl">{s}</div>
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

      <Section id="lifecycle" invert>
        <SectionHeading
          index="17 — Institutional Fund Structure"
          title="One Fund. Fifty Companies. One Ownership Structure."
          lede="To provide investors with a simple, transparent and scalable ownership model, all investments are made through a dedicated investment fund established in Abu Dhabi, UAE."
        />

        <div className="grid grid-cols-1 gap-16 lg:grid-cols-[1fr_1.2fr]">
          <div className="space-y-6 text-base leading-relaxed text-muted-foreground md:text-lg">
            <Reveal>
              <p>
                Instead of investors owning shares directly in dozens of different startups, each
                investor owns a percentage of the investment fund.
              </p>
            </Reveal>
            <Reveal delay={80}>
              <p>
                As new startups are created, every investment agreement is signed by the fund,
                making the fund the legal shareholder of every portfolio company.
              </p>
            </Reveal>
            <Reveal delay={160}>
              <p className="text-foreground">
                One ownership vehicle that grows over time, while the legal structure stays simple
                for investors.
              </p>
            </Reveal>
          </div>

          {/* Diagram */}
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
                "Startup 50+",
              ].map((s, i) => (
                <Reveal key={s} delay={i * 50}>
                  <div className="num bg-background px-4 py-5 text-xs text-muted-foreground">
                    {s}
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>

        {/* Process */}
        <div className="mt-24">
          <div className="label-xs">How it works</div>
          <div className="mt-8 border-t border-border">
            {[
              "Investors subscribe to ownership units in the NIZEK Venture Fund.",
              "The fund commits capital over five years.",
              "Every startup investment agreement is executed directly by the fund.",
              "The fund becomes the shareholder of each startup.",
              "As more startups are created, the value of the fund's portfolio grows.",
            ].map((step, i) => (
              <Reveal key={step} delay={i * 70}>
                <div className="flex items-baseline gap-8 border-b border-border py-7">
                  <span className="num w-12 shrink-0 text-xs text-subtle">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-xl leading-snug text-foreground md:text-3xl">{step}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        {/* Benefits */}
        <div className="mt-px grid grid-cols-1 gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {[
            [
              "Simple Ownership",
              "Investors own one fund instead of managing ownership in dozens of separate companies.",
            ],
            [
              "Centralized Portfolio",
              "Every startup becomes part of one professionally managed investment vehicle.",
            ],
            [
              "Scalable Structure",
              "New startups are automatically added to the fund without changing the ownership structure.",
            ],
            [
              "Aligned Interests",
              "All investors participate in the performance of the same diversified portfolio.",
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

      <section id="model" className="border-t border-border">
        <div className="px-6 py-24 md:px-12 md:py-32">
          <div className="mx-auto w-full max-w-[1400px]">
            <Reveal>
              <div className="label-xs">09 — The investment simulator</div>
              <h2 className="display-xl mt-6 text-5xl md:text-8xl">
                If Nizek builds successful companies, what could your investment become?
              </h2>
              <p className="mt-8 max-w-2xl text-base leading-relaxed text-muted-foreground">
                Ten new startups every year, five cohorts. Portfolio value is the sum of the expected exit valuations of the winners. Move the assumptions and it re-prices instantly.
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
                {g === "Exit value" && (
                  <div className="mt-8">
                    <div className="label-xs">Successes &amp; exit valuation per cohort</div>
                    {cohortExitControls.map((c) => (
                      <div key={c.index} className="border-b border-border py-5">
                        <div className="text-sm text-foreground">{c.label}</div>
                        <div className="mt-4 flex items-baseline justify-between gap-4">

                          <label
                            htmlFor={`cohort-success-${c.index}`}
                            className="text-sm text-muted-foreground"
                          >
                            Successes
                          </label>
                          <ValueField
                            label={`${c.label} successes`}
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
                          onChange={(e) =>
                            setCohortSuccess(c.index, Number(e.target.value))
                          }
                          className="mt-4"
                          aria-label={`${c.label} successes`}
                        />
                        {Array.from(
                          { length: inputs.successesByYear?.[c.index] ?? 0 },
                          (_, k) => {
                            const val =
                              inputs.exitValuesByYear?.[c.index]?.[k] ?? 0;
                            const id = `cohort-exit-${c.index}-${k}`;
                            return (
                              <div key={k} className="mt-5">
                                <div className="flex items-baseline justify-between gap-4">
                                  <label
                                    htmlFor={id}
                                    className="text-sm text-muted-foreground"
                                  >
                                    {(inputs.successesByYear?.[c.index] ?? 0) > 1
                                      ? `Estimated enterprise value · Company ${k + 1}`
                                      : "Estimated enterprise value"}
                                  </label>
                                  <ValueField
                                    label={`${c.label} exit ${k + 1}`}
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
                                  onChange={(e) =>
                                    setCohortExit(c.index, k, Number(e.target.value))
                                  }
                                  className="mt-4"
                                  aria-label={`${c.label} exit ${k + 1}`}
                                />
                              </div>
                            );
                          },
                        )}
                        <div className="mt-3 flex items-start justify-between gap-4">
                          <span className="text-[11px] leading-relaxed text-subtle">{c.help}</span>
                          <button
                            type="button"
                            onClick={() =>
                              setInputs((p) => ({
                                ...p,
                                successesByYear: (p.successesByYear ?? []).map((g, idx) =>
                                  idx === c.index
                                    ? defaultInvestmentInputs.successesByYear[c.index] ?? 0
                                    : g,
                                ),
                                exitValuesByYear: (p.exitValuesByYear ?? []).map((row, idx) =>
                                  idx === c.index
                                    ? [
                                        ...(defaultInvestmentInputs.exitValuesByYear[
                                          c.index
                                        ] ?? []),
                                      ]
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
                    Each seat is {SEAT_OWNERSHIP}% of Nizek's equity in every company created, for{" "}
                    {kd(SEAT_QUARTERLY_COMMITMENT)} a quarter over five years. Everything below
                    updates instantly.
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
                  const rank = reserved
                    ? 0
                    : n - RESERVED_SEATS.filter((r) => r < n).length;
                  const active = !reserved && rank <= result.seats;
                  return (
                    <button
                      key={n}
                      type="button"
                      disabled={reserved}
                      onClick={() => !reserved && set("seats", rank)}
                      aria-pressed={active}
                      aria-label={
                        reserved
                          ? `Seat ${n} committed`
                          : `Select ${rank} seat${rank > 1 ? "s" : ""}`
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
                        <span
                          className={`label-xs block ${active ? "text-background" : ""}`}
                        >
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
                  l: "Ownership",
                  v: result.ownershipPercent,
                  f: (v: number) => `${v.toFixed(1)}%`,
                },
                { l: "Quarterly", v: result.annualCommitment / 4, f: kd },
                { l: "Maximum cap", v: result.maxCommitment, f: kd },
                { l: "Portfolio value", v: result.portfolioValue, f: kd },
                {
                  l: "Multiple",
                  v: result.moic,
                  f: (v: number) => multiple(v, 2),
                },
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
                Every year new capital is drawn and a new cohort of startups is created. Most fail;
                a few reach an exit. Each cohort is valued at the expected exit valuation of its
                winners — earlier cohorts carry higher expected exits because they have had more
                time to mature.
              </p>

              <div className="mt-8 border border-border">
                {result.cohorts.map((c) => {
                  const share = maxCohort > 0 ? c.portfolioValue / maxCohort : 0;
                  return (
                    <Reveal key={c.year} delay={(c.year - 1) * 60}>
                      <div className="border-b border-border last:border-b-0 px-6 py-7 md:px-10">
                        <div className="grid grid-cols-2 items-start gap-x-6 gap-y-6 sm:grid-cols-3 lg:grid-cols-6">
                          <div className="display-xl col-span-2 min-w-0 text-2xl sm:col-span-3 lg:col-span-1">
                            Year {c.year}
                          </div>
                          <>

                            {[
                              [
                                "Invested",
                                `${kd(c.capitalInvested / 4)} / quarter`,
                                null,
                              ],
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
                                  title={
                                    l === "EEV"
                                      ? "Estimated enterprise value"
                                      : undefined
                                  }
                                >
                                  {l}
                                </div>
                                <div className="num mt-2 break-words text-xs text-foreground">
                                  {v}
                                </div>
                                {breakdown ? (
                                  <div className="num mt-1 break-words text-[10px] text-muted-foreground">
                                    {breakdown}
                                  </div>
                                ) : null}
                              </div>
                            ))}
                          </>


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
                    note: `${fmtNumber(result.totalSuccesses)} winners out of ${fmtNumber(result.totalStartups)} startups, each valued at its expected exit valuation.`,
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
                    note: `${result.ownershipPercent}% of Nizek's ownership — ${result.seats} seat${result.seats > 1 ? "s" : ""} × ${SEAT_OWNERSHIP}%.`,
                  },
                  {
                    step: "04",
                    title: "Estimated return",
                    value: result.moic,
                    format: (v: number) => multiple(v, 2),
                    note: `On the ${kd(result.maxCommitment)} committed across five years.`,
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
            </div>

          </div>
        </div>
      </section>

      <Section id="timeline">
        <SectionHeading index="19 — Timeline" title="Fifty Companies In Five Years" />
        <div className="grid grid-cols-1 gap-px border border-border bg-border md:grid-cols-6">
          {[
            ["Year 1", "10"],
            ["Year 2", "20"],
            ["Year 3", "30"],
            ["Year 4", "40"],
            ["Year 5", "50+"],
          ].map(([y, s], i) => (
            <Reveal key={y} delay={i * 80} className={i < 3 ? "md:col-span-2" : "md:col-span-3"}>

              <div className="h-full bg-background p-8">
                <div className="label-xs">{y}</div>
                <div className="display-xl mt-6 whitespace-nowrap text-3xl md:text-4xl">
                  {s} <span className="text-lg md:text-xl">startups</span>
                </div>
              </div>
            </Reveal>
          ))}

        </div>
        <p className="mt-10 text-sm text-muted-foreground">

          Then the portfolio continues to mature well beyond the commitment window.
        </p>

      </Section>

      <Section id="contact" invert>
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

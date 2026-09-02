import { useState } from "react";

import { Reveal, Section, SectionHeading } from "@/components/ui/primitives";
import { SEAT_OWNERSHIP, TOTAL_SEATS } from "@/model/investment";

/** Illustrative split used in the ownership example. */
const NIZEK_SHARE = 30;

const CONTRIBUTIONS = [
  "Founder Selection",
  "Problem Discovery",
  "Product Strategy",
  "Market Validation",
  "Product Design",
  "Technology Development",
  "Technical Leadership",
  "Go-To-Market Support",
  "Hiring Support",
  "Long-Term CTO Leadership",
];

const OWNERSHIP_FLOW = [
  { step: "01", title: "Entrepreneurs", note: "Founders join the studio to build their company." },
  {
    step: "02",
    title: "Nizek Venture Studio",
    note: "Builds the company and earns equity.",
  },
  {
    step: "03",
    title: "Nizek Venture Studio Fund A",
    note: "Holds the portfolio equity.",
  },
  {
    step: "04",
    title: "Investors",
    note: "Own units in the Fund.",
  },
];

const STEPS = [
  { step: "01", body: "Entrepreneurs join the Nizek Venture Studio." },
  {
    step: "02",
    body: "Nizek works alongside the founders to validate, build and launch the company.",
  },
  {
    step: "03",
    body: "In exchange for years of venture-building support, Nizek earns an agreed equity position.",
  },
  {
    step: "04",
    body: "That equity becomes part of Nizek Venture Studio Fund A, allowing investors to participate in the portfolio through Fund ownership.",
  },
];

const BENEFITS = [
  {
    t: "Diversified Portfolio",
    b: "One investment provides exposure to multiple venture-backed companies.",
  },
  {
    t: "Aligned Founders",
    b: "Founders remain highly motivated because they continue owning the majority of their businesses.",
  },
  {
    t: "Professional Structure",
    b: "Ownership is held through Nizek Venture Studio Fund A using a clear and transparent investment structure.",
  },
  {
    t: "Long-Term Value Creation",
    b: "The Fund participates in the value created as portfolio companies grow over time.",
  },
];

export function EquitySection() {
  const [seats, setSeats] = useState(1);
  const participation = seats * SEAT_OWNERSHIP;
  const fmt = (n: number) => n.toFixed(2).replace(/\.?0+$/, "");
  const effectiveMin = (20 * participation) / 100;
  const effectiveMax = (30 * participation) / 100;

  return (
    <Section id="equity" invert>
      <SectionHeading
        index="06 — Equity model"
        title="How Ownership Works"
        lede="Investors acquire ownership in Nizek Venture Studio Fund A, which holds equity positions in the portfolio companies created through the Nizek Venture Studio. The ownership structure is intentionally designed to provide diversified exposure through a single investment."
      />

      {/* Ownership flow — primary visual */}
      <Reveal>
        <div className="label-xs">The ownership chain</div>
        <div className="mt-6 grid grid-cols-1 gap-px border border-border bg-border md:grid-cols-4">
          {OWNERSHIP_FLOW.map((s) => (
            <div key={s.step} className="flex h-full flex-col bg-background p-8">
              <div className="num text-xs text-subtle">{s.step}</div>
              <div className="display-xl mt-8 text-lg md:text-xl">{s.title}</div>
              <p className="mt-5 text-sm leading-relaxed text-muted-foreground">{s.note}</p>
            </div>
          ))}
        </div>
      </Reveal>

      {/* How the model works */}
      <Reveal>
        <div className="mt-24 border-t border-border-strong pt-16">
          <div className="label-xs">How the model works</div>
          <div className="mt-8 grid grid-cols-1 gap-px border border-border bg-border md:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s) => (
              <div key={s.step} className="flex h-full flex-col bg-background p-8">
                <div className="display-xl text-3xl md:text-4xl">{s.step}</div>
                <p className="mt-8 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      {/* Equity earned through venture building */}
      <Reveal>
        <div className="mt-24 grid grid-cols-1 gap-16 border-t border-border-strong pt-16 lg:grid-cols-[1fr_1fr]">
          <div>
            <div className="label-xs">Why founders allocate equity</div>
            <h3 className="display-xl mt-6 text-3xl md:text-5xl">
              Equity Earned Through Venture Building
            </h3>
            <p className="mt-8 text-base leading-relaxed text-muted-foreground">
              Founders partner with Nizek to accelerate the creation of their company. The equity
              reflects the long-term value Nizek creates across the life of the business. This is
              long-term company building, not traditional software development.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-px self-start border border-border bg-border sm:grid-cols-2">
            {CONTRIBUTIONS.map((c) => (
              <div key={c} className="bg-background px-6 py-6 text-sm text-foreground">
                {c}
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      {/* Ownership example */}
      <Reveal>
        <div className="mt-24 border-t border-border-strong pt-16">
          <div className="label-xs">Example startup</div>
          <h3 className="display-xl mt-6 text-3xl md:text-5xl">What Fund Ownership Represents</h3>

          <div className="mt-12 border border-border">
            <div className="flex flex-wrap items-center justify-between gap-6 border-b border-border px-8 py-5">
              <span className="label-xs">Illustration only</span>
              <div className="flex items-center gap-3">
                <span className="label-xs text-subtle">Units</span>
                {Array.from({ length: TOTAL_SEATS }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setSeats(n)}
                    aria-pressed={seats === n}
                    className={`num border px-3 py-1 text-xs transition-colors ${
                      seats === n
                        ? "border-foreground bg-foreground text-background"
                        : "border-border text-muted-foreground hover:border-foreground"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 gap-px bg-border md:grid-cols-4">
              {[
                { l: "Entrepreneur", v: "70–80%", n: "Entrepreneurs keep the majority of their company." },
                { l: "Nizek Venture Studio ownership", v: "20–30%", n: "Equity earned by building the company." },

                {
                  l: "Investor share of the Fund",
                  v: `${participation}%`,
                  n: "Fixed ownership held as units in Fund A.",
                },
                {
                  l: "Look-through share of the startup",
                  v: `${fmt(effectiveMin)}–${fmt(effectiveMax)}%`,
                  n: "Fund ownership applied to the example company.",
                },
              ].map((c) => (
                <div key={c.l} className="bg-background p-8">
                  <div className="label-xs">{c.l}</div>
                  <div className="display-xl mt-4 text-3xl md:text-4xl">{c.v}</div>
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{c.n}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Reveal>

      {/* Anti-dilution */}
      <Reveal>
        <div className="mt-24 grid grid-cols-1 gap-16 border-t border-border-strong pt-16 lg:grid-cols-[1fr_1fr]">
          <div>
            <div className="label-xs">Anti-dilution</div>
            <h3 className="display-xl mt-6 text-3xl md:text-5xl">Protecting Long-Term Ownership</h3>
          </div>
          <div className="flex flex-col gap-6">
            <p className="text-base leading-relaxed text-muted-foreground">
              Every startup agreement is negotiated individually. Where appropriate, anti-dilution
              protection is included to help preserve the Fund&apos;s ownership as companies raise
              future investment rounds.
            </p>
            <div className="border border-border p-8">
              <div className="label-xs">Minimum protection target</div>
              <div className="display-xl mt-4 text-4xl md:text-6xl">KD3,000,000</div>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                company valuation — the baseline used when negotiating protection with each startup.
              </p>
            </div>
          </div>
        </div>
      </Reveal>

      {/* Key benefits */}
      <div className="mt-24 grid grid-cols-1 gap-px border border-border bg-border md:grid-cols-2 lg:grid-cols-4">
        {BENEFITS.map((c, i) => (
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
        <p className="display-xl mt-16 max-w-4xl text-2xl md:text-3xl">
          Nizek builds companies. The Fund holds the portfolio. Investors participate in the value
          created.
        </p>
      </Reveal>
    </Section>
  );
}

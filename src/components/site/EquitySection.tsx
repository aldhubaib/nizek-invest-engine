import { useState } from "react";

import { Reveal, Section, SectionHeading } from "@/components/ui/primitives";
import { SEAT_OWNERSHIP, TOTAL_SEATS } from "@/model/investment";

/** Illustrative split used in the ownership example. */
const FOUNDER_SHARE = 70;
const NIZEK_SHARE = 30;

const CONTRIBUTIONS = [
  "Product Strategy",
  "Technology Development",
  "Technical Leadership",
  "Venture Building",
  "Founder Support",
  "Go-To-Market Guidance",
  "Operational Experience",
];

const OWNERSHIP_FLOW = [
  { step: "01", title: "Founder", note: "Starts the company and remains the majority owner." },
  { step: "02", title: "Startup", note: "The company is created and launched." },
  {
    step: "03",
    title: "Nizek earns equity by building the company",
    note: "Equity is earned through work, not purchased with cash.",
  },
  {
    step: "04",
    title: "Investor participates in Nizek's equity allocation",
    note: "Participation is carved out of Nizek's position only.",
  },
  {
    step: "05",
    title: "Investor owns a share of the portfolio",
    note: "Exposure across every company Nizek builds.",
  },
];

const BENEFITS = [
  { t: "No Startup Dilution", b: "Investor ownership comes from Nizek's allocation." },
  { t: "Founder Alignment", b: "Founders remain highly incentivized." },
  {
    t: "Long-Term Protection",
    b: "Portfolio ownership is protected through negotiated anti-dilution provisions.",
  },
  { t: "Transparent Structure", b: "Every investor understands exactly where ownership originates." },
];

export function EquitySection() {
  const [seats, setSeats] = useState(1);
  const participation = seats * SEAT_OWNERSHIP;
  const effective = (NIZEK_SHARE * participation) / 100;

  return (
    <Section id="equity" invert>
      <SectionHeading
        index="06 — Equity model"
        title="Own Part of the Portfolio. Not Individual Startups."
        lede="Investors participate in Nizek's venture portfolio by acquiring a percentage of Nizek's equity allocation. Startup ownership is not diluted by incoming investors."
      />

      {/* Ownership flow — primary visual */}
      <Reveal>
        <div className="label-xs">The ownership flow</div>
        <div className="mt-6 grid grid-cols-1 gap-px border border-border bg-border md:grid-cols-5">
          {OWNERSHIP_FLOW.map((s) => (
            <div key={s.step} className="flex h-full flex-col bg-background p-8">
              <div className="num text-xs text-subtle">{s.step}</div>
              <div className="display-xl mt-8 text-lg md:text-xl">{s.title}</div>
              <p className="mt-5 text-sm leading-relaxed text-muted-foreground">{s.note}</p>
            </div>
          ))}
        </div>
      </Reveal>

      {/* How Nizek earns equity */}
      <Reveal>
        <div className="mt-24 grid grid-cols-1 gap-16 border-t border-border-strong pt-16 lg:grid-cols-[1fr_1fr]">
          <div>
            <div className="label-xs">How Nizek earns equity</div>
            <h3 className="display-xl mt-6 text-3xl md:text-5xl">
              Nizek Does Not Purchase Startup Equity.
            </h3>
            <p className="mt-8 text-base leading-relaxed text-muted-foreground">
              Nizek earns equity by contributing the capability required to create the company. That
              contribution replaces the traditional cash investment made by many venture investors.
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

      {/* Equity structure example */}
      <Reveal>
        <div className="mt-24 border-t border-border-strong pt-16">
          <div className="label-xs">Example startup</div>
          <h3 className="display-xl mt-6 text-3xl md:text-5xl">Where The Ownership Comes From</h3>

          <div className="mt-12 border border-border">
            <div className="flex flex-wrap items-center justify-between gap-6 border-b border-border px-8 py-5">
              <span className="label-xs">Illustration only</span>
              <div className="flex items-center gap-3">
                <span className="label-xs text-subtle">Seats</span>
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
                { l: "Founder", v: `${FOUNDER_SHARE}%`, n: "Unchanged by investor participation." },
                { l: "Nizek", v: `${NIZEK_SHARE}%`, n: "Earned by building the company." },
                {
                  l: "Investor participation in Nizek's allocation",
                  v: `${participation}%`,
                  n: "Never from the founder's ownership.",
                },
                {
                  l: "Effective share of the startup",
                  v: `${effective.toFixed(2).replace(/\.?0+$/, "")}%`,
                  n: "Carved out of Nizek's 30%.",
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

          <p className="mt-8 max-w-3xl text-base leading-relaxed text-muted-foreground">
            The investor&apos;s ownership is created from Nizek&apos;s equity allocation. The
            founder&apos;s ownership structure remains unchanged.
          </p>
        </div>
      </Reveal>

      {/* Founder alignment / anti-dilution */}
      <Reveal>
        <div className="mt-24 grid grid-cols-1 gap-16 border-t border-border-strong pt-16 lg:grid-cols-[1fr_1fr]">
          <div>
            <div className="label-xs">Non-dilution protection</div>
            <h3 className="display-xl mt-6 text-3xl md:text-5xl">Founder Alignment</h3>
          </div>
          <div className="flex flex-col gap-6">
            <p className="text-base leading-relaxed text-muted-foreground">
              Nizek negotiates anti-dilution protection individually with every startup. Each
              agreement is negotiated independently, so terms are not identical across the
              portfolio. The purpose is to protect long-term portfolio ownership while keeping
              founders aligned.
            </p>
            <div className="border border-border p-8">
              <div className="label-xs">Minimum protection threshold</div>
              <div className="display-xl mt-4 text-4xl md:text-6xl">KD3,000,000</div>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                company valuation — the baseline used when negotiating protection with each startup.
              </p>
            </div>
          </div>
        </div>
      </Reveal>

      {/* Why founders accept this model */}
      <Reveal>
        <div className="mt-24 border-t border-border-strong pt-16">
          <div className="label-xs">Why founders give equity to Nizek</div>
          <p className="mt-8 max-w-3xl text-base leading-relaxed text-muted-foreground">
            Founders receive far more than software development. They receive an experienced
            venture-building partner that helps validate the opportunity, build the product, launch
            the company, recruit the team and provide long-term CTO leadership. The equity reflects
            years of execution, infrastructure and operating support — not simply development work.
          </p>
        </div>
      </Reveal>

      {/* Investor benefits */}
      <div className="mt-16 grid grid-cols-1 gap-px border border-border bg-border md:grid-cols-2 lg:grid-cols-4">
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
          Our investors participate in the value Nizek creates. Not in additional dilution imposed on
          founders.
        </p>
      </Reveal>
    </Section>
  );
}

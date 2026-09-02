import { useState } from "react";

import { Reveal, Section, SectionHeading } from "@/components/ui/primitives";
import { AVAILABLE_SEATS, SEAT_OWNERSHIP } from "@/model/investment";

/** Illustrative split used in the ownership example. */
const FOUNDER_SHARE = 75;
const NIZEK_SHARE = 25;

function FlowNode({
  label,
  value,
  note,
  emphasis,
}: {
  label: string;
  value: string;
  note?: string;
  emphasis?: boolean;
}) {
  return (
    <div
      className={`flex w-full flex-col items-center border px-8 py-10 text-center transition-colors duration-500 ${
        emphasis ? "border-foreground" : "border-border hover:border-foreground/60"
      }`}
    >
      <div className="label-xs">{label}</div>
      <div className="display-xl mt-4 text-4xl md:text-6xl">{value}</div>
      {note ? (
        <p className="mt-4 max-w-xs text-xs leading-relaxed text-muted-foreground">{note}</p>
      ) : null}
    </div>
  );
}

function Arrow({ caption }: { caption?: string }) {
  return (
    <div className="flex flex-col items-center py-6">
      <span className="h-10 w-px bg-border" />
      <span className="mt-1 text-xs text-subtle">↓</span>
      {caption ? <span className="label-xs mt-3 text-subtle">{caption}</span> : null}
    </div>
  );
}

export function EquitySection() {
  const [seats, setSeats] = useState(1);
  const participation = seats * SEAT_OWNERSHIP;
  const effective = (NIZEK_SHARE * participation) / 100;

  return (
    <Section id="equity" invert>
      <SectionHeading
        index="06 — Equity model"
        title="We Earn Equity By Building Companies, Not By Funding Them."
        lede="Nizek contributes venture-building capability instead of charging the startup full cash development fees. In exchange, the studio takes an equity position — typically 20% to 30%, depending on the opportunity and level of involvement."
      />

      <Reveal>
        <div className="grid grid-cols-1 gap-px border border-border bg-border md:grid-cols-2">
          <div className="bg-background p-10">
            <div className="label-xs">Typical Nizek ownership</div>
            <div className="display-xl mt-6 text-4xl md:text-6xl">20–30%</div>
          </div>
          <div className="bg-background p-10">
            <div className="label-xs">Founder typically retains</div>
            <div className="display-xl mt-6 text-4xl md:text-6xl">70–80%</div>
          </div>
        </div>
      </Reveal>

      {/* Equity protection */}
      <Reveal>
        <div className="mt-24 grid grid-cols-1 gap-16 border-t border-border-strong pt-16 lg:grid-cols-[1fr_1fr]">
          <div>
            <div className="label-xs">Equity protection</div>
            <h3 className="display-xl mt-6 text-3xl md:text-5xl">Protecting Long-Term Ownership</h3>
          </div>
          <div className="flex flex-col gap-6">
            <p className="text-base leading-relaxed text-muted-foreground">
              Each startup has its own investment agreement, and Nizek negotiates anti-dilution
              protection depending on the company. Terms are not identical across the portfolio.
            </p>
            <div className="border border-border p-8">
              <div className="label-xs">Minimum target protection, subject to each agreement</div>
              <div className="display-xl mt-4 text-4xl md:text-6xl">KD3,000,000</div>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                company valuation — preserving meaningful ownership through the earliest funding
                rounds.
              </p>
            </div>
          </div>
        </div>
      </Reveal>

      {/* Investor participation */}
      <Reveal>
        <div className="mt-24 border-t border-border-strong pt-16">
          <div className="grid grid-cols-1 gap-16 lg:grid-cols-[1fr_1fr]">
            <div>
              <div className="label-xs">How the investor participates</div>
              <h3 className="display-xl mt-6 text-3xl md:text-5xl">
                Investor Ownership Comes From Nizek&apos;s Equity
              </h3>
            </div>
            <p className="text-base leading-relaxed text-muted-foreground">
              The investor receives participation from Nizek&apos;s ownership — never from the
              founder&apos;s. Founder ownership is unchanged by the investor&apos;s participation.
            </p>
          </div>

          <div className="mx-auto mt-16 flex w-full max-w-2xl flex-col items-center">
            <FlowNode label="Founder" value="70–80%" note="Remains the majority owner." />
            <Arrow />
            <FlowNode
              label="Nizek"
              value="20–30%"
              note="Earned by creating, building and launching the company."
              emphasis
            />
            <Arrow caption="A share of Nizek's ownership" />
            <FlowNode
              label="Investor"
              value={`${participation}% of Nizek`}
              note={`${seats} seat${seats > 1 ? "s" : ""} × ${SEAT_OWNERSHIP}% of Nizek's allocation.`}
            />
          </div>

          <div className="mt-16 border border-border">
            <div className="flex flex-wrap items-center justify-between gap-6 border-b border-border px-8 py-5">
              <span className="label-xs">Illustration only</span>
              <div className="flex items-center gap-3">
                <span className="label-xs text-subtle">Seats</span>
                {Array.from({ length: AVAILABLE_SEATS }, (_, i) => i + 1).map((n) => (
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
                { l: "Founder", v: `${FOUNDER_SHARE}%` },
                { l: "Nizek", v: `${NIZEK_SHARE}%` },
                { l: "Investor share of Nizek", v: `${participation}%` },
                {
                  l: "Effective ownership in startup",
                  v: `${effective.toFixed(2).replace(/\.?0+$/, "")}%`,
                },
              ].map((c) => (
                <div key={c.l} className="bg-background p-8">
                  <div className="label-xs">{c.l}</div>
                  <div className="display-xl mt-4 text-3xl md:text-4xl">{c.v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}

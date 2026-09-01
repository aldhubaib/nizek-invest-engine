import { Reveal, Section, SectionHeading } from "@/components/ui/primitives";

const contributions = [
  "Product Strategy",
  "Technology Development",
  "UI / UX Design",
  "Technical Leadership",
  "Product Management",
  "Infrastructure",
  "Founder Support",
  "Operational Execution",
];

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
  return (
    <Section id="equity">
      <SectionHeading
        index="06 — Our equity model"
        title="We Earn Equity By Building Companies, Not By Funding Them."
        lede="Nizek does not simply invest cash. We become an active venture-building partner. In exchange for creating and launching each company, Nizek receives an equity position — typically between 20% and 30% — depending on the opportunity, complexity and level of involvement."
      />

      <Reveal>
        <div className="grid grid-cols-1 gap-px border border-border bg-border lg:grid-cols-3">
          <div className="bg-background p-10 lg:col-span-1">
            <div className="label-xs">Nizek's contribution</div>
            <ul className="mt-8 flex flex-col">
              {contributions.map((c, i) => (
                <li
                  key={c}
                  className="flex items-baseline gap-4 border-b border-border py-3 last:border-b-0"
                >
                  <span className="label-xs text-subtle">{String(i + 1).padStart(2, "0")}</span>
                  <span className="text-sm">{c}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col justify-between bg-background p-10 lg:col-span-2">
            <p className="text-2xl leading-snug md:text-4xl">
              Instead of charging startups significant cash fees in their earliest stages, we align
              our success with the founder by taking equity.
            </p>
            <p className="mt-10 max-w-2xl text-base leading-relaxed text-muted-foreground">
              If the company succeeds, both the founder and Nizek succeed together. The studio is
              paid in ownership, not invoices — which keeps early capital inside the business and
              keeps our incentives identical to the founder's.
            </p>
            <div className="mt-12 grid grid-cols-2 gap-px border border-border bg-border">
              <div className="bg-background p-8">
                <div className="label-xs">Typical studio equity</div>
                <div className="display-xl mt-4 text-4xl md:text-6xl">20–30%</div>
              </div>
              <div className="bg-background p-8">
                <div className="label-xs">Founder retains</div>
                <div className="display-xl mt-4 text-4xl md:text-6xl">70–80%</div>
              </div>
            </div>
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
              Every startup has its own investment agreement. To protect the long-term value created
              by the venture studio, Nizek negotiates customised anti-dilution provisions for each
              company. The exact terms vary depending on the startup, the funding strategy and future
              investors.
            </p>
            <div className="border border-border p-8">
              <div className="label-xs">Ownership protected until approximately</div>
              <div className="display-xl mt-4 text-4xl md:text-6xl">KD3,000,000</div>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                company valuation — preserving meaningful ownership through the earliest funding
                rounds while still allowing startups to raise the capital they need to grow.
              </p>
            </div>
          </div>
        </div>
      </Reveal>

      {/* Investor alignment + diagram */}
      <Reveal>
        <div className="mt-24 border-t border-border-strong pt-16">
          <div className="grid grid-cols-1 gap-16 lg:grid-cols-[1fr_1fr]">
            <div>
              <div className="label-xs">Investor alignment</div>
              <h3 className="display-xl mt-6 text-3xl md:text-5xl">
                Investor Ownership Comes From Nizek's Equity
              </h3>
            </div>
            <div className="flex flex-col gap-6">
              <p className="text-base leading-relaxed text-muted-foreground">
                The investment fund does not receive ownership directly from founders. Instead,
                investors participate in Nizek's equity position.
              </p>
              <p className="text-base leading-relaxed text-muted-foreground">
                Founder ownership is not reduced by the investor's participation. The investor's
                interest comes entirely from Nizek's allocation.
              </p>
            </div>
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
              value="% of Nizek"
              note="Receives a percentage of Nizek's ownership only — never of the founder's."
            />
          </div>

          <div className="mt-16 border border-border">
            <div className="border-b border-border px-8 py-5">
              <span className="label-xs">Illustration only</span>
            </div>
            <div className="grid grid-cols-1 gap-px bg-border md:grid-cols-4">
              {[
                { l: "Founder", v: "75%" },
                { l: "Nizek", v: "25%" },
                { l: "Investor share of Nizek", v: "25%" },
                { l: "Effective ownership in startup", v: "6.25%" },
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

      {/* Key message */}
      <Reveal>
        <div className="mt-24 border-t border-border-strong pt-16">
          <p className="max-w-4xl text-2xl leading-snug md:text-4xl">
            Founders remain the majority owners. Nizek earns equity by creating companies. Investors
            participate through Nizek's ownership — not by reducing the founder's equity beyond the
            agreed venture studio allocation.
          </p>
        </div>
      </Reveal>
    </Section>
  );
}

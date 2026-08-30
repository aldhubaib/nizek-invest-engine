import { useMemo, useState } from "react";
import { AnimatedNumber } from "@/components/model/AnimatedNumber";
import { Reveal } from "@/components/ui/primitives";
import { kd } from "@/model/studio";

type Field = {
  key: "successes" | "avgValue" | "ownership" | "participation" | "investment";
  label: string;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
};

const fields: Field[] = [
  {
    key: "successes",
    label: "How many successful startups?",
    min: 0,
    max: 50,
    step: 1,
    format: (v) => String(Math.round(v)),
  },
  {
    key: "avgValue",
    label: "Average company value",
    min: 1_000_000,
    max: 200_000_000,
    step: 1_000_000,
    format: (v) => kd(v),
  },
  {
    key: "ownership",
    label: "Average NIZEK ownership",
    min: 5,
    max: 60,
    step: 1,
    format: (v) => `${Math.round(v)}%`,
  },
  {
    key: "participation",
    label: "Your participation",
    min: 5,
    max: 100,
    step: 1,
    format: (v) => `${Math.round(v)}%`,
  },
  {
    key: "investment",
    label: "Investment",
    min: 250_000,
    max: 10_000_000,
    step: 50_000,
    format: (v) => `KD${Math.round(v).toLocaleString("en-US")}`,
  },
];

const defaults = {
  successes: 4,
  avgValue: 30_000_000,
  ownership: 25,
  participation: 25,
  investment: 2_000_000,
};

const HOLD_YEARS = 8;
const REAL_ESTATE_RATE = 0.055;
const PUBLIC_MARKET_RATE = 0.07;

export function ScenarioBuilder() {
  const [inputs, setInputs] = useState(defaults);

  const r = useMemo(() => {
    const portfolioValue = inputs.successes * inputs.avgValue;
    const nizekEquity = portfolioValue * (inputs.ownership / 100);
    const investorValue = nizekEquity * (inputs.participation / 100);
    const profit = investorValue - inputs.investment;
    const multiple = inputs.investment > 0 ? investorValue / inputs.investment : 0;
    return {
      portfolioValue,
      nizekEquity,
      investorValue,
      profit,
      multiple,
      realEstate: inputs.investment * (1 + REAL_ESTATE_RATE) ** HOLD_YEARS,
      publicMarket: inputs.investment * (1 + PUBLIC_MARKET_RATE) ** HOLD_YEARS,
    };
  }, [inputs]);

  return (
    <section id="scenario" className="border-t border-border px-6 py-24 md:px-12 md:py-32">
      <div className="mx-auto w-full max-w-[1400px]">
        <Reveal>
          <div className="label-xs text-center">Build your scenario</div>
          <h2 className="display-xl mt-8 text-center text-4xl md:text-7xl">
            Set the assumptions.
            <br />
            See your outcome.
          </h2>
        </Reveal>

        <div className="mx-auto mt-20 max-w-3xl">
          {fields.map((f, i) => (
            <Reveal key={f.key} delay={i * 60}>
              <div className="border-t border-border py-12 text-center last:border-b">
                <label
                  htmlFor={`scenario-${f.key}`}
                  className="label-xs block text-muted-foreground"
                >
                  {f.label}
                </label>
                <div className="num mt-6 text-5xl text-foreground md:text-7xl">
                  {f.format(inputs[f.key])}
                </div>
                <input
                  id={`scenario-${f.key}`}
                  type="range"
                  min={f.min}
                  max={f.max}
                  step={f.step}
                  value={inputs[f.key]}
                  aria-label={f.label}
                  onChange={(e) =>
                    setInputs((p) => ({ ...p, [f.key]: Number(e.target.value) }))
                  }
                  className="mx-auto mt-8 block w-full max-w-md"
                />
              </div>
            </Reveal>
          ))}
        </div>

        <div className="mt-24">
          <div className="label-xs text-center">Result</div>
          <div className="mt-10 grid grid-cols-1 gap-px border border-border bg-border md:grid-cols-3">
            {[
              { label: "Portfolio value", v: r.portfolioValue },
              { label: "NIZEK equity", v: r.nizekEquity },
              { label: "Investor value", v: r.investorValue },
            ].map((k) => (
              <div key={k.label} className="bg-background p-10 text-center">
                <div className="label-xs">{k.label}</div>
                <div className="num mt-5 text-3xl text-foreground md:text-5xl">
                  <AnimatedNumber value={k.v} format={kd} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-px grid grid-cols-1 gap-px border border-border bg-border md:grid-cols-2">
            {[
              { label: "Profit", v: r.profit, f: kd },
              {
                label: "Return",
                v: r.multiple,
                f: (v: number) => `${v.toFixed(2)}×`,
              },
            ].map((k) => (
              <div key={k.label} className="bg-background p-10 text-center">
                <div className="label-xs">{k.label}</div>
                <div className="num mt-5 text-3xl text-foreground md:text-5xl">
                  <AnimatedNumber value={k.v} format={k.f} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-20">
          <div className="label-xs text-center">
            Compared to — same cash over {HOLD_YEARS} years
          </div>
          <div className="mt-10 grid grid-cols-1 gap-px border border-border bg-border md:grid-cols-2">
            {[
              { label: "Real estate", v: r.realEstate },
              { label: "Public market", v: r.publicMarket },
            ].map((k) => (
              <div key={k.label} className="bg-background p-10 text-center">
                <div className="label-xs">{k.label}</div>
                <div className="num mt-5 text-2xl text-muted-foreground md:text-4xl">
                  <AnimatedNumber value={k.v} format={kd} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

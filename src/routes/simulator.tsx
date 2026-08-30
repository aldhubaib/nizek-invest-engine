import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useMemo, useState } from "react";
import { LineChart } from "@/components/charts/Charts";
import { AnimatedNumber } from "@/components/model/AnimatedNumber";
import { PortfolioControl, formatControl } from "@/components/model/PortfolioControl";
import { Reveal } from "@/components/ui/primitives";
import { NextStep } from "@/components/site/Chrome";
import { currency, currencyExact, multiple, number as fmtNumber, percent } from "@/model/format";
import {
  defaultPortfolioInputs,
  portfolioControls,
  portfolioGroups,
  presetLabels,
  presetNotes,
  presetOrder,
  presets,
  projectPortfolio,
  type PortfolioInputs,
  type PresetKey,
} from "@/model/portfolio";

export const Route = createFileRoute("/simulator")({
  head: () => ({
    meta: [
      { title: "Investment Simulator — NIZEK" },
      {
        name: "description",
        content:
          "Model NIZEK's venture studio portfolio live: failure rate, winner distribution, ownership, dilution and hold period drive MOIC, IRR and your equity value.",
      },
      { property: "og:title", content: "Investment Simulator — NIZEK" },
      {
        property: "og:description",
        content: "An institutional-grade portfolio simulator. Every number is calculated live.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Simulator,
});

function Simulator() {
  const [preset, setPreset] = useState<PresetKey>("good");
  const [inputs, setInputs] = useState<PortfolioInputs>(defaultPortfolioInputs);

  const baseline = preset === "custom" ? defaultPortfolioInputs : presets[preset];

  const applyPreset = useCallback((key: PresetKey) => {
    setPreset(key);
    if (key !== "custom") setInputs(presets[key]);
  }, []);

  const setValue = useCallback((key: keyof PortfolioInputs, v: number) => {
    setPreset("custom");
    setInputs((prev) => ({ ...prev, [key]: v }));
  }, []);

  const resetValue = useCallback(
    (key: keyof PortfolioInputs) => setInputs((prev) => ({ ...prev, [key]: baseline[key] })),
    [baseline],
  );

  const result = useMemo(() => projectPortfolio(inputs), [inputs]);
  const comparison = useMemo(
    () =>
      (["conservative", "good", "great", "exceptional"] as const).map((k) => ({
        key: k,
        label: presetLabels[k],
        ...projectPortfolio({
          ...presets[k],
          investorTicket: inputs.investorTicket,
          nizekPostMoney: inputs.nizekPostMoney,
        }),
      })),
    [inputs.investorTicket, inputs.nizekPostMoney],
  );

  const maxCompare = Math.max(...comparison.map((c) => c.moic), result.moic, 1);
  const maxTier = Math.max(...result.tiers.map((t) => t.grossValue), 1);

  const headline = [
    { label: "Portfolio value", value: result.portfolioValue, fmt: (v: number) => currency(v) },
    { label: "NIZEK equity value", value: result.nizekEquityValue, fmt: (v: number) => currency(v) },
    {
      label: "Your equity value",
      value: result.investorEquityValue,
      fmt: (v: number) => currency(v),
    },
    { label: "Profit", value: result.profit, fmt: (v: number) => currency(v) },
  ];

  const secondary = [
    { label: "MOIC", value: result.moic, fmt: (v: number) => multiple(v, 2) },
    {
      label: "IRR",
      value: result.irr,
      fmt: (v: number) => (Number.isFinite(v) ? percent(v, 1) : "n/a"),
    },
    { label: "Return multiple", value: result.moic, fmt: (v: number) => `${v.toFixed(2)}×` },
    { label: "Hold period", value: inputs.holdYears, fmt: (v: number) => `${Math.round(v)} yrs` },
    {
      label: "Your ownership of NIZEK",
      value: result.investorOwnership * 100,
      fmt: (v: number) => percent(v, 2),
    },
  ];

  return (
    <div>
      {/* Preset rail */}
      <div className="sticky top-[73px] z-30 border-b border-border bg-background/85 backdrop-blur">
        <div className="flex flex-wrap items-center gap-px bg-border px-0">
          {presetOrder.map((k) => {
            const active = preset === k;
            return (
              <button
                key={k}
                type="button"
                onClick={() => applyPreset(k)}
                className={`flex-1 bg-background px-5 py-4 text-left transition-colors duration-300 ${
                  active ? "text-foreground" : "text-subtle hover:text-muted-foreground"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${
                      active ? "bg-foreground" : "bg-transparent ring-1 ring-border-strong"
                    }`}
                  />
                  <span className="text-sm tracking-tight">{presetLabels[k]}</span>
                </div>
                <div className="mt-1 hidden pl-[18px] text-[11px] leading-snug text-subtle lg:block">
                  {presetNotes[k]}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr]">
        {/* Controls */}
        <aside className="border-b border-border px-6 py-10 lg:sticky lg:top-[157px] lg:h-[calc(100vh-157px)] lg:overflow-y-auto lg:border-b-0 lg:border-r lg:px-8">
          <div className="label-xs">Assumptions</div>
          <p className="mt-4 text-[11px] leading-relaxed text-subtle">
            Outcome shares are normalised to 100% of the portfolio. Every figure on this page
            recalculates from these inputs.
          </p>
          {portfolioGroups.map((g) => (
            <div key={g} className="mt-10">
              <div className="border-b border-border-strong pb-3 text-sm text-foreground">{g}</div>
              {portfolioControls
                .filter((c) => c.group === g)
                .map((c) => (
                  <PortfolioControl
                    key={c.key}
                    meta={c}
                    value={inputs[c.key]}
                    base={baseline[c.key]}
                    onChange={setValue}
                    onReset={resetValue}
                  />
                ))}
            </div>
          ))}
        </aside>

        {/* Output */}
        <main className="px-6 py-12 md:px-12">
          <div className="max-w-3xl">
            <div className="label-xs">Investment simulator</div>
            <h1 className="display-xl mt-6 text-4xl md:text-6xl">
              {presetLabels[preset]} case
            </h1>
            <p className="mt-6 text-base leading-relaxed text-muted-foreground">
              {fmtNumber(Math.round(inputs.startups))} companies built.{" "}
              {fmtNumber(Math.round(result.failures))} return nothing.{" "}
              {fmtNumber(Math.round(result.winners))} carry the book over {Math.round(inputs.holdYears)}{" "}
              years.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-px border border-border bg-border md:grid-cols-2 xl:grid-cols-4">
            {headline.map((k) => (
              <div key={k.label} className="bg-background p-8">
                <div className="label-xs">{k.label}</div>
                <div className="num mt-4 text-3xl text-foreground md:text-4xl">
                  <AnimatedNumber value={k.value} format={k.fmt} />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-px grid grid-cols-2 gap-px border border-border bg-border lg:grid-cols-5">
            {secondary.map((k) => (
              <div key={k.label} className="bg-background p-6">
                <div className="label-xs">{k.label}</div>
                <div className="num mt-3 text-xl text-foreground md:text-2xl">
                  <AnimatedNumber value={k.value} format={k.fmt} />
                </div>
              </div>
            ))}
          </div>

          {/* Value accrual */}
          <div className="mt-20 text-foreground">
            <div className="flex items-baseline justify-between">
              <div className="label-xs">Value accrual — NIZEK equity vs your position</div>
              <div className="num text-xs text-subtle">
                exit {currency(result.nizekEquityValue)}
              </div>
            </div>
            <div className="mt-6">
              <LineChart
                series={[
                  { name: "NIZEK equity", values: result.valueCurve },
                  { name: "Your equity", values: result.investorCurve, muted: true, dashed: true },
                ]}
                labels={result.labels}
                format={(v) => currency(v)}
              />
            </div>
          </div>

          {/* Distribution */}
          <div className="mt-20">
            <div className="label-xs">Where the value comes from</div>
            <div className="mt-8 border border-border">
              <div className="grid grid-cols-[1.4fr_0.6fr_0.7fr_1fr_1fr] gap-4 border-b border-border px-6 py-4 text-[11px] uppercase tracking-[0.18em] text-subtle">
                <div>Outcome</div>
                <div className="text-right">Share</div>
                <div className="text-right">Companies</div>
                <div className="text-right">Exit / co.</div>
                <div className="text-right">NIZEK value</div>
              </div>
              <div className="grid grid-cols-[1.4fr_0.6fr_0.7fr_1fr_1fr] items-center gap-4 border-b border-border px-6 py-4 text-sm text-subtle">
                <div>Write-offs</div>
                <div className="num text-right">{result.normalised.failure.toFixed(1)}%</div>
                <div className="num text-right">{result.failures.toFixed(1)}</div>
                <div className="num text-right">$0</div>
                <div className="num text-right">$0</div>
              </div>
              {result.tiers.map((t) => (
                <div key={t.key} className="border-b border-border last:border-b-0">
                  <div className="grid grid-cols-[1.4fr_0.6fr_0.7fr_1fr_1fr] items-center gap-4 px-6 py-4 text-sm text-foreground">
                    <div>{t.label}</div>
                    <div className="num text-right">{t.share.toFixed(1)}%</div>
                    <div className="num text-right">{t.count.toFixed(1)}</div>
                    <div className="num text-right">{currency(t.exitValuation)}</div>
                    <div className="num text-right">
                      <AnimatedNumber value={t.nizekValue} format={(v) => currency(v)} />
                    </div>
                  </div>
                  <div className="h-px w-full bg-border/60">
                    <div
                      className="h-px bg-foreground transition-all duration-700 ease-out"
                      style={{ width: `${(t.grossValue / maxTier) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Scenario comparison */}
          <div className="mt-20">
            <div className="label-xs">Scenario comparison — MOIC on your ticket</div>
            <div className="mt-8 space-y-px border border-border bg-border">
              {comparison.map((c) => {
                const active = preset === c.key;
                return (
                  <div key={c.key} className="bg-background px-6 py-5">
                    <div className="flex items-baseline justify-between text-sm">
                      <span className={active ? "text-foreground" : "text-muted-foreground"}>
                        {c.label}
                      </span>
                      <span className="num text-foreground">
                        {multiple(c.moic, 2)} · {percent(c.irr, 1)} IRR ·{" "}
                        {currency(c.investorEquityValue)}
                      </span>
                    </div>
                    <div className="mt-3 h-[2px] w-full bg-border">
                      <div
                        className="h-[2px] bg-foreground transition-all duration-700 ease-out"
                        style={{
                          width: `${(c.moic / maxCompare) * 100}%`,
                          opacity: active ? 1 : 0.45,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
              <div className="bg-background px-6 py-5">
                <div className="flex items-baseline justify-between text-sm">
                  <span className="text-foreground">Your case</span>
                  <span className="num text-foreground">
                    {multiple(result.moic, 2)} · {percent(result.irr, 1)} IRR ·{" "}
                    {currency(result.investorEquityValue)}
                  </span>
                </div>
                <div className="mt-3 h-[2px] w-full bg-border">
                  <div
                    className="h-[2px] bg-foreground transition-all duration-700 ease-out"
                    style={{ width: `${(result.moic / maxCompare) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Position summary */}
          <div className="mt-20 grid grid-cols-1 gap-px border border-border bg-border md:grid-cols-3">
            {[
              ["Invested", currencyExact(inputs.investorTicket)],
              ["Returned at exit", currencyExact(result.investorEquityValue)],
              ["Profit", currencyExact(result.profit)],
              ["Effective NIZEK ownership per company", percent(result.effectiveOwnership * 100, 1)],
              ["NIZEK value per company", currency(result.impliedEntryValuePerStartup)],
              ["Annualised profit", currencyExact(result.annualisedProfit)],
            ].map(([label, value]) => (
              <div key={label} className="bg-background p-6">
                <div className="label-xs">{label}</div>
                <div className="num mt-3 text-lg text-foreground">{value}</div>
              </div>
            ))}
          </div>

          <p className="mt-10 max-w-2xl text-xs leading-relaxed text-subtle">
            Outcome tiers scale from the reference valuation you set:{" "}
            {formatControl(inputs.avgValuation, "currency")} reference — small 0.4×, medium 1×, large
            3.5×, outlier 15×. IRR is the annualised return on your ticket over the hold period.
          </p>

          <Reveal className="mt-20">
            <NextStep to="/returns" label="What this means for you" />
          </Reveal>
        </main>
      </div>
    </div>
  );
}

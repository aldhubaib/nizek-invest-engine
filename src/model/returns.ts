import type { Assumptions, CapTableEntry, Returns, Round, YearPoint } from "./types";

export const irr = (cashflows: number[]): number => {
  // cashflows[t] in years, t = 0..n
  let low = -0.9;
  let high = 10;
  const npv = (r: number) =>
    cashflows.reduce((sum, cf, t) => sum + cf / Math.pow(1 + r, t), 0);
  if (npv(low) * npv(high) > 0) return NaN;
  for (let i = 0; i < 200; i++) {
    const mid = (low + high) / 2;
    if (npv(low) * npv(mid) <= 0) high = mid;
    else low = mid;
  }
  return ((low + high) / 2) * 100;
};

export const buildReturns = (
  a: Assumptions,
  years: YearPoint[],
  rounds: Round[],
  capTable: CapTableEntry[],
): Returns => {
  const exitYear = Math.min(Math.max(Math.round(a.exitYear), 1), years.length);
  const exit = years[exitYear - 1] ?? years[years.length - 1]!;
  const exitValuation = Math.max(exit.arr * a.exitMultiple, 0);
  const entryOwnership = rounds[0]!.postMoney > 0 ? a.investorTicket / rounds[0]!.postMoney : 0;
  const exitOwnership = capTable.find((c) => c.name === "You")?.ownership ?? 0;
  const proceeds = Math.max(exitValuation * exitOwnership, a.investorTicket * 0);
  const moic = a.investorTicket > 0 ? proceeds / a.investorTicket : 0;
  const flows = Array.from({ length: exitYear + 1 }, (_, t) =>
    t === 0 ? -a.investorTicket : t === exitYear ? proceeds : 0,
  );
  return {
    ticket: a.investorTicket,
    entryOwnership,
    exitOwnership,
    exitArr: exit.arr,
    exitValuation,
    proceeds,
    moic,
    irr: irr(flows),
    holdYears: exitYear,
  };
};

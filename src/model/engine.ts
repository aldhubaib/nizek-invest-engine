import { HORIZON_YEARS } from "./assumptions";
import { buildCapTable, buildRounds } from "./capital";
import { buildCosts, headcountFor } from "./costs";
import { buildRevenue } from "./revenue";
import { buildReturns } from "./returns";
import type { Assumptions, Kpis, MonthPoint, Projection, YearPoint } from "./types";

const cache = new Map<string, Projection>();

export const project = (a: Assumptions): Projection => {
  const key = JSON.stringify(a);
  const hit = cache.get(key);
  if (hit) return hit;

  const totalMonths = HORIZON_YEARS * 12;
  const revenue = buildRevenue(a, totalMonths);
  const costs = buildCosts(a, revenue);
  const rounds = buildRounds(a);

  const months: MonthPoint[] = [];
  let cash = a.startingCash + a.roundSize;
  for (let i = 0; i < totalMonths; i++) {
    const r = revenue[i]!;
    const c = costs[i]!;
    const ebitda = r.grossProfit - c.opex;
    const yearIndex = Math.floor(i / 12) + 1;
    if (i % 12 === 0 && yearIndex === Math.round(a.followOnYear)) cash += a.followOnSize;
    cash += ebitda;
    months.push({
      month: i + 1,
      customers: r.customers,
      newCustomers: r.newCustomers,
      mrr: r.mrr,
      revenue: r.revenue,
      grossProfit: r.grossProfit,
      sm: c.sm,
      rd: c.rd,
      ga: c.ga,
      opex: c.opex,
      ebitda,
      cash,
    });
  }

  const years: YearPoint[] = [];
  for (let y = 1; y <= HORIZON_YEARS; y++) {
    const slice = months.slice((y - 1) * 12, y * 12);
    const last = slice[slice.length - 1]!;
    const sum = (f: (m: MonthPoint) => number) => slice.reduce((s, m) => s + f(m), 0);
    const rev = sum((m) => m.revenue);
    const ebitda = sum((m) => m.ebitda);
    const opex = sum((m) => m.opex);
    years.push({
      year: y,
      label: `Y${y}`,
      customers: last.customers,
      newCustomers: sum((m) => m.newCustomers),
      arr: last.mrr * 12,
      revenue: rev,
      grossProfit: sum((m) => m.grossProfit),
      sm: sum((m) => m.sm),
      rd: sum((m) => m.rd),
      ga: sum((m) => m.ga),
      opex,
      ebitda,
      ebitdaMargin: rev > 0 ? (ebitda / rev) * 100 : 0,
      cash: last.cash,
      headcount: headcountFor(opex),
    });
  }

  const capTable = buildCapTable(a, rounds);
  const returns = buildReturns(a, years, rounds, capTable);

  const grossPerCustomer = a.arpa * (a.grossMargin / 100);
  const churn = Math.max(a.monthlyChurn / 100, 0.0001);
  const ltv = grossPerCustomer / churn;
  const cashLow = Math.min(...months.map((m) => m.cash));
  const negative = months.find((m) => m.cash <= 0);
  const breakeven = months.find((m) => m.ebitda > 0);
  const y1 = years[0]!;
  const y2 = years[1] ?? y1;
  const growthPct = y1.revenue > 0 ? ((y2.revenue - y1.revenue) / y1.revenue) * 100 : 0;
  const burn = Math.abs(Math.min(0, months.slice(0, 24).reduce((s, m) => s + m.ebitda, 0)));
  const netNewArr = Math.max(y2.arr - y1.arr, 1);

  const kpis: Kpis = {
    ltv,
    cac: a.cac,
    ltvToCac: a.cac > 0 ? ltv / a.cac : 0,
    paybackMonths: grossPerCustomer > 0 ? a.cac / grossPerCustomer : 0,
    ruleOf40: growthPct + y2.ebitdaMargin,
    burnMultiple: burn / netNewArr,
    peakBurn: Math.abs(Math.min(0, ...months.map((m) => m.ebitda))),
    runwayMonths: negative ? negative.month : totalMonths,
    cashLow,
    breakevenMonth: breakeven ? breakeven.month : null,
  };

  const result: Projection = { assumptions: a, months, years, rounds, capTable, returns, kpis };
  if (cache.size > 200) cache.clear();
  cache.set(key, result);
  return result;
};

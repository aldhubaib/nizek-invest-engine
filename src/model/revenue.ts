import type { Assumptions } from "./types";

export interface RevenueMonth {
  month: number;
  newCustomers: number;
  customers: number;
  arpa: number;
  mrr: number;
  revenue: number;
  grossProfit: number;
}

/**
 * Logo-based build: new logos compound at the acquisition growth rate,
 * the retained base decays at monthly churn, and average contract value
 * grows with both net expansion and the annual price increase.
 */
export const buildRevenue = (a: Assumptions, months: number): RevenueMonth[] => {
  const churn = a.monthlyChurn / 100;
  const acqGrowth = a.acquisitionGrowth / 100;
  const expansionMonthly = Math.pow(Math.max(a.netExpansion, 1) / 100, 1 / 12) - 1;
  const priceMonthly = Math.pow(1 + a.annualPriceIncrease / 100, 1 / 12) - 1;
  const arpaGrowth = (1 + expansionMonthly) * (1 + priceMonthly) - 1;

  const out: RevenueMonth[] = [];
  let customers = a.startingCustomers;
  let arpa = a.arpa;

  for (let m = 1; m <= months; m++) {
    const newCustomers = a.newCustomersMonth1 * Math.pow(1 + acqGrowth, m - 1);
    customers = customers * (1 - churn) + newCustomers;
    arpa = m === 1 ? arpa : arpa * (1 + arpaGrowth);
    const mrr = customers * arpa;
    const revenue = mrr;
    out.push({
      month: m,
      newCustomers,
      customers,
      arpa,
      mrr,
      revenue,
      grossProfit: revenue * (a.grossMargin / 100),
    });
  }
  return out;
};

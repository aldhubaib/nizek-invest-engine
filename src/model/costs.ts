import type { Assumptions } from "./types";
import type { RevenueMonth } from "./revenue";

export interface CostMonth {
  sm: number;
  rd: number;
  ga: number;
  opex: number;
}

export const buildCosts = (a: Assumptions, revenue: RevenueMonth[]): CostMonth[] =>
  revenue.map((r) => {
    const sm = r.newCustomers * a.cac;
    const rd = r.revenue * (a.rdPercent / 100);
    const ga = r.revenue * (a.gaPercent / 100) + a.fixedOpexMonthly;
    return { sm, rd, ga, opex: sm + rd + ga };
  });

/** Illustrative headcount derived from the cost base, not an independent input. */
export const headcountFor = (annualOpex: number) =>
  Math.max(4, Math.round(annualOpex / 165000));

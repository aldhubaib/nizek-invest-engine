/**
 * NIZEK investor participation model — cohort based.
 *
 * Fixed offer: KD400,000 per year for 5 years (KD2,000,000 total).
 * The investor participates in 25% of NIZEK's ownership in successful companies.
 *
 * A venture studio does not create 50 startups on the same day. Each year NIZEK
 * builds a new cohort of startups. Some fail, some survive, some become
 * meaningful companies — and those winners keep compounding in value while the
 * next cohorts are still being created. So the portfolio is modelled cohort by
 * cohort: an earlier cohort has had more years to grow than a later one.
 */

export const ANNUAL_COMMITMENT = 400_000;
export const COMMITMENT_YEARS = 5;
export const TOTAL_INVESTMENT = ANNUAL_COMMITMENT * COMMITMENT_YEARS;
export const INVESTOR_PARTICIPATION = 0.25;

export interface InvestmentInputs {
  startupsPerYear: number; // startups created each year
  successesPerYear: number; // winners per cohort
  avgCompanyValue: number; // KD — value of a winner in the year it breaks out
  annualGrowth: number; // % — default growth applied to every cohort
  /** Optional per-cohort growth override, index 0 = Year 1 cohort. */
  growthByYear: number[];
  avgNizekOwnership: number; // %
  realEstateYield: number; // % annual
  publicMarketReturn: number; // % annual
}

export interface CohortResult {
  year: number; // 1..5
  capitalInvested: number;
  startups: number;
  failures: number;
  successes: number;
  yearsOfGrowth: number; // years compounding by the end of the window
  growthRate: number; // % annual growth applied to this cohort
  valueAtBreakout: number; // cohort value the year the winners emerge
  portfolioValue: number; // cohort value at the end of the window
  nizekEquityValue: number;
  investorValue: number;
  growthMultiple: number;
}

export interface BenchmarkResult {
  finalValue: number;
  profit: number;
  annualizedReturn: number; // %
  curve: number[];
}

export interface InvestmentResult {
  inputs: InvestmentInputs;
  totalInvestment: number;
  totalStartups: number;
  totalSuccesses: number;
  portfolioValue: number;
  nizekEquityValue: number;
  investorValue: number;
  investorProfit: number;
  moic: number;
  irr: number; // %
  cohorts: CohortResult[];
  labels: string[];
  /** Portfolio value at the end of each year Y0..Y5. */
  portfolioByYear: number[];
  investorCurve: number[];
  realEstate: BenchmarkResult;
  publicMarket: BenchmarkResult;
  cashflows: number[];
}

function irrFromFlows(flows: number[]): number {
  const npv = (r: number) => flows.reduce((s, f, i) => s + f / Math.pow(1 + r, i), 0);
  let lo = -0.95;
  let hi = 10;
  if (npv(lo) < 0) return -95;
  if (npv(hi) > 0) return hi * 100;
  for (let i = 0; i < 300; i++) {
    const mid = (lo + hi) / 2;
    if (npv(mid) > 0) lo = mid;
    else hi = mid;
  }
  return ((lo + hi) / 2) * 100;
}

function benchmark(rate: number, hold: number): BenchmarkResult {
  const r = rate / 100;
  const curve: number[] = [];
  let v = 0;
  for (let y = 0; y <= hold; y++) {
    // Same schedule as the investor: KD400,000 committed at the start of each
    // of the first five years, then compounded.
    const contribution = y < COMMITMENT_YEARS ? ANNUAL_COMMITMENT : 0;
    v = v * (1 + r) + contribution;
    curve.push(v);
  }
  const finalValue = curve[curve.length - 1] ?? 0;
  const flows = Array.from({ length: hold + 1 }, (_, y) =>
    (y < COMMITMENT_YEARS ? -ANNUAL_COMMITMENT : 0) + (y === hold ? finalValue : 0),
  );
  return {
    finalValue,
    profit: finalValue - TOTAL_INVESTMENT,
    annualizedReturn: irrFromFlows(flows),
    curve,
  };
}

export function projectInvestment(input: InvestmentInputs): InvestmentResult {
  const hold = COMMITMENT_YEARS;
  const growthFor = (year: number) =>
    (input.growthByYear?.[year - 1] ?? input.annualGrowth) / 100;
  const ownership = input.avgNizekOwnership / 100;
  const startups = Math.max(0, input.startupsPerYear);
  const successes = Math.min(Math.max(0, input.successesPerYear), startups);

  const cohorts: CohortResult[] = Array.from({ length: COMMITMENT_YEARS }, (_, i) => {
    const year = i + 1;
    const yearsOfGrowth = hold - year; // a Year 1 winner compounds four more years
    const growth = growthFor(year);
    const growthMultiple = Math.pow(1 + growth, yearsOfGrowth);
    const valueAtBreakout = successes * input.avgCompanyValue;
    const portfolioValue = valueAtBreakout * growthMultiple;
    const nizekEquityValue = portfolioValue * ownership;
    return {
      year,
      capitalInvested: ANNUAL_COMMITMENT,
      startups,
      failures: startups - successes,
      successes,
      yearsOfGrowth,
      growthRate: growth * 100,
      valueAtBreakout,
      portfolioValue,
      nizekEquityValue,
      investorValue: nizekEquityValue * INVESTOR_PARTICIPATION,
      growthMultiple,
    };
  });

  const portfolioValue = cohorts.reduce((s, c) => s + c.portfolioValue, 0);
  const nizekEquityValue = portfolioValue * ownership;
  const investorValue = nizekEquityValue * INVESTOR_PARTICIPATION;
  const investorProfit = investorValue - TOTAL_INVESTMENT;
  const moic = TOTAL_INVESTMENT > 0 ? investorValue / TOTAL_INVESTMENT : 0;

  // Portfolio value at the end of each year: only cohorts already created
  // contribute, each compounded for the years it has been alive.
  const labels: string[] = [];
  const portfolioByYear: number[] = [];
  for (let t = 0; t <= hold; t++) {
    labels.push(`Y${t}`);
    let v = 0;
    for (const c of cohorts) {
      if (c.year <= t) v += c.valueAtBreakout * Math.pow(1 + growthFor(c.year), t - c.year);
    }
    portfolioByYear.push(v);
  }

  const investorCurve = portfolioByYear.map((v) => v * ownership * INVESTOR_PARTICIPATION);

  const cashflows = Array.from({ length: hold + 1 }, (_, y) =>
    (y < COMMITMENT_YEARS ? -ANNUAL_COMMITMENT : 0) + (y === hold ? investorValue : 0),
  );
  const irr = investorValue > 0 ? irrFromFlows(cashflows) : -100;

  return {
    inputs: input,
    totalInvestment: TOTAL_INVESTMENT,
    totalStartups: startups * COMMITMENT_YEARS,
    totalSuccesses: successes * COMMITMENT_YEARS,
    portfolioValue,
    nizekEquityValue,
    investorValue,
    investorProfit,
    moic,
    irr,
    cohorts,
    labels,
    portfolioByYear,
    investorCurve,
    realEstate: benchmark(input.realEstateYield, hold),
    publicMarket: benchmark(input.publicMarketReturn, hold),
    cashflows,
  };
}

export const defaultInvestmentInputs: InvestmentInputs = {
  startupsPerYear: 10,
  successesPerYear: 1,
  avgCompanyValue: 3_000_000,
  annualGrowth: 20,
  growthByYear: [20, 20, 20, 20, 20],
  avgNizekOwnership: 25,
  realEstateYield: 7,
  publicMarketReturn: 8,
};

export type NumericInvestmentKey = {
  [K in keyof InvestmentInputs]: InvestmentInputs[K] extends number ? K : never;
}[keyof InvestmentInputs];

export interface InvestmentControlMeta {
  key: NumericInvestmentKey;
  label: string;
  min: number;
  max: number;
  step: number;
  unit: "kd" | "percent" | "count" | "years";
  help: string;
  group: "Each year" | "Growth" | "Ownership" | "Benchmarks";
}

export const investmentControls: InvestmentControlMeta[] = [
  {
    key: "startupsPerYear",
    label: "Startups built per year",
    min: 0,
    max: 20,
    step: 1,
    unit: "count",
    help: "Nizek commits to ten new companies every year for five years.",
    group: "Each year",
  },
  {
    key: "successesPerYear",
    label: "Successes per year",
    min: 0,
    max: 10,
    step: 1,
    unit: "count",
    help: "Companies from each cohort that become meaningful. The rest fail or stay small.",
    group: "Each year",
  },
  {
    key: "avgCompanyValue",
    label: "Value when a company breaks out",
    min: 0,
    max: 100_000_000,
    step: 1_000_000,
    unit: "kd",
    help: "Valuation of a successful company in the year it emerges from its cohort.",
    group: "Growth",
  },
  {
    key: "annualGrowth",
    label: "Annual value growth (all years)",
    min: 0,
    max: 100,
    step: 5,
    unit: "percent",
    help: "Baseline compounding for every cohort. Tune an individual year below.",
    group: "Growth",
  },
  {
    key: "avgNizekOwnership",
    label: "Average NIZEK ownership",
    min: 0,
    max: 50,
    step: 1,
    unit: "percent",
    help: "Average equity NIZEK holds in successful companies.",
    group: "Ownership",
  },
  {
    key: "realEstateYield",
    label: "Real estate return",
    min: 0,
    max: 15,
    step: 0.5,
    unit: "percent",
    help: "Annual total return of the property benchmark, same annual cash schedule.",
    group: "Benchmarks",
  },
  {
    key: "publicMarketReturn",
    label: "Public market return",
    min: 0,
    max: 20,
    step: 0.5,
    unit: "percent",
    help: "Annual total return of the index benchmark, same annual cash schedule.",
    group: "Benchmarks",
  },
];

/** Growth sliders for each cohort, so an individual year can be tuned. */
export const cohortGrowthControls = Array.from({ length: COMMITMENT_YEARS }, (_, i) => ({
  index: i,
  label: `Year ${i + 1} cohort growth`,
  min: 0,
  max: 100,
  step: 5,
  help: `Annual growth of the winners created in Year ${i + 1}.`,
}));

export const investmentGroups = ["Each year", "Growth", "Ownership", "Benchmarks"] as const;

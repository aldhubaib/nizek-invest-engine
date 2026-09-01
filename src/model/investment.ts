/**
 * NIZEK investor participation model — venture outcome based.
 *
 * Fixed offer: KD400,000 per year for 5 years (KD2,000,000 total).
 * The investor participates in a share of NIZEK's ownership in the companies
 * created during the window.
 *
 * Venture value is NOT compounded like real estate or public equities. Each
 * annual cohort produces a small number of successful companies, and each of
 * those carries an expected exit valuation. Portfolio value is simply the sum
 * of the expected exit valuations of every successful company. Earlier cohorts
 * usually carry a higher expected exit valuation because they have had more
 * time to mature; later cohorts carry less.
 */

export const ANNUAL_COMMITMENT = 360_000;
export const COMMITMENT_YEARS = 5;
export const TOTAL_INVESTMENT = ANNUAL_COMMITMENT * COMMITMENT_YEARS;
export const INVESTOR_PARTICIPATION = 0.25;

export interface InvestmentInputs {
  startupsPerYear: number; // startups created each year
  /** Capital committed by the investor in each year, index 0 = Year 1. */
  capitalByYear: number[];
  /** Successful companies per cohort, index 0 = Year 1 cohort. */
  successesByYear: number[];
  /** Expected exit valuation of each successful company, per cohort. */
  exitValuesByYear: number[][];
  avgNizekOwnership: number; // %
  investorShare: number; // % of NIZEK's ownership allocated to the investor
  realEstateYield: number; // % annual
  publicMarketReturn: number; // % annual
}

export interface CohortResult {
  year: number; // 1..5
  capitalInvested: number;
  startups: number;
  failures: number;
  successes: number;
  exitValue: number; // average expected exit valuation per successful company
  exitValues: number[]; // expected exit valuation of each successful company
  portfolioValue: number; // successes x exit valuation
  nizekEquityValue: number;
  investorValue: number;
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
  /** Cumulative expected exit value of every cohort created so far, Y0..Y5. */
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

function benchmark(rate: number, hold: number, capital: number[]): BenchmarkResult {
  const total = capital.reduce((a, b) => a + b, 0);
  const r = rate / 100;
  const curve: number[] = [];
  let v = 0;
  for (let y = 0; y <= hold; y++) {
    // Same schedule as the investor: KD400,000 committed at the start of each
    // of the first five years, then compounded.
    const contribution = capital[y] ?? 0;
    v = v * (1 + r) + contribution;
    curve.push(v);
  }
  const finalValue = curve[curve.length - 1] ?? 0;
  const flows = Array.from({ length: hold + 1 }, (_, y) =>
    -(capital[y] ?? 0) + (y === hold ? finalValue : 0),
  );
  return {
    finalValue,
    profit: finalValue - total,
    annualizedReturn: irrFromFlows(flows),
    curve,
  };
}

export function projectInvestment(input: InvestmentInputs): InvestmentResult {
  const hold = COMMITMENT_YEARS;
  const ownership = input.avgNizekOwnership / 100;
  const participation = (input.investorShare ?? INVESTOR_PARTICIPATION * 100) / 100;
  const startups = Math.max(0, input.startupsPerYear);
  const capitalByYear = Array.from({ length: COMMITMENT_YEARS }, (_, i) =>
    Math.max(0, input.capitalByYear?.[i] ?? ANNUAL_COMMITMENT),
  );
  const totalInvestment = capitalByYear.reduce((a, b) => a + b, 0);
  const successesFor = (year: number) =>
    Math.min(Math.max(0, input.successesByYear?.[year - 1] ?? 0), startups);


  const cohorts: CohortResult[] = Array.from({ length: COMMITMENT_YEARS }, (_, i) => {
    const year = i + 1;
    const successes = successesFor(year);
    const raw = input.exitValuesByYear?.[i] ?? [];
    const exitValues = Array.from({ length: successes }, (_, k) =>
      Math.max(0, raw[k] ?? raw[raw.length - 1] ?? 0),
    );
    const portfolioValue = exitValues.reduce((a, b) => a + b, 0);
    const exitValue = successes > 0 ? portfolioValue / successes : 0;
    const nizekEquityValue = portfolioValue * ownership;
    return {
      year,
      capitalInvested: capitalByYear[i] ?? 0,
      startups,
      failures: startups - successes,
      successes,
      exitValue,
      exitValues,
      portfolioValue,
      nizekEquityValue,
      investorValue: nizekEquityValue * participation,
    };
  });

  const portfolioValue = cohorts.reduce((s, c) => s + c.portfolioValue, 0);
  const nizekEquityValue = portfolioValue * ownership;
  const investorValue = nizekEquityValue * participation;
  const investorProfit = investorValue - totalInvestment;
  const moic = totalInvestment > 0 ? investorValue / totalInvestment : 0;

  // Cumulative expected exit value of the cohorts created so far.
  const labels: string[] = [];
  const portfolioByYear: number[] = [];
  for (let t = 0; t <= hold; t++) {
    labels.push(`Y${t}`);
    portfolioByYear.push(
      cohorts.reduce((s, c) => (c.year <= t ? s + c.portfolioValue : s), 0),
    );
  }

  const investorCurve = portfolioByYear.map((v) => v * ownership * participation);

  const cashflows = Array.from({ length: hold + 1 }, (_, y) =>
    -(capitalByYear[y] ?? 0) + (y === hold ? investorValue : 0),
  );
  const irr = investorValue > 0 ? irrFromFlows(cashflows) : -100;

  return {
    inputs: input,
    totalInvestment,
    totalStartups: startups * COMMITMENT_YEARS,
    totalSuccesses: cohorts.reduce((s2, c) => s2 + c.successes, 0),
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
    realEstate: benchmark(input.realEstateYield, hold, capitalByYear),
    publicMarket: benchmark(input.publicMarketReturn, hold, capitalByYear),
    cashflows,
  };
}

export const defaultInvestmentInputs: InvestmentInputs = {
  startupsPerYear: 10,
  capitalByYear: [
    ANNUAL_COMMITMENT,
    ANNUAL_COMMITMENT,
    ANNUAL_COMMITMENT,
    ANNUAL_COMMITMENT,
    ANNUAL_COMMITMENT,
  ],
  successesByYear: [3, 3, 3, 3, 3],
  exitValuesByYear: [
    [5_000_000, 3_000_000, 2_000_000],
    [5_000_000, 3_000_000, 2_000_000],
    [5_000_000, 3_000_000, 2_000_000],
    [5_000_000, 3_000_000, 2_000_000],
    [5_000_000, 3_000_000, 2_000_000],
  ],
  avgNizekOwnership: 30,
  investorShare: 25,
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
  group: "Each year" | "Exit value" | "Ownership";
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
    key: "avgNizekOwnership",
    label: "Average NIZEK ownership",
    min: 0,
    max: 50,
    step: 1,
    unit: "percent",
    help: "Average equity NIZEK holds in successful companies at exit.",
    group: "Ownership",
  },
  {
    key: "investorShare",
    label: "Investor share of NIZEK",
    min: 0,
    max: 100,
    step: 1,
    unit: "percent",
    help: "Share of NIZEK's ownership the investor participates in. Not ownership of NIZEK itself.",
    group: "Ownership",
  },
];

/** Per-cohort assumptions, so an individual year can be tuned. */
export const cohortExitControls = Array.from({ length: COMMITMENT_YEARS }, (_, i) => ({
  index: i,
  label: `Year ${i + 1}`,
  min: 0,
  max: 100_000_000,
  step: 1_000_000,
  capitalMin: 0,
  capitalMax: 2_000_000,
  capitalStep: 10_000,
  successMin: 0,
  successMax: 10,
  successStep: 1,
  help: `Winners created in Year ${i + 1} and the expected exit valuation of each.`,
}));

export const investmentGroups = ["Each year", "Exit value", "Ownership"] as const;

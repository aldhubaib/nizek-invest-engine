/**
 * NIZEK investor participation model.
 *
 * Fixed offer: KD400,000 per year for 5 years (KD2,000,000 total).
 * The investor participates in 25% of NIZEK's ownership in successful companies.
 */

export const ANNUAL_COMMITMENT = 400_000;
export const COMMITMENT_YEARS = 5;
export const TOTAL_INVESTMENT = ANNUAL_COMMITMENT * COMMITMENT_YEARS;
export const INVESTOR_PARTICIPATION = 0.25;

export interface InvestmentInputs {
  successfulCompanies: number; // 0–10
  avgCompanyValue: number; // KD
  avgNizekOwnership: number; // %
  holdYears: number;
  realEstateYield: number; // % annual
  publicMarketReturn: number; // % annual
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
  portfolioValue: number;
  nizekEquityValue: number;
  investorValue: number;
  investorProfit: number;
  moic: number;
  irr: number; // %
  labels: string[];
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
  const hold = Math.max(COMMITMENT_YEARS, Math.round(input.holdYears));
  const companies = Math.max(0, input.successfulCompanies);

  const portfolioValue = companies * input.avgCompanyValue;
  const nizekEquityValue = portfolioValue * (input.avgNizekOwnership / 100);
  const investorValue = nizekEquityValue * INVESTOR_PARTICIPATION;
  const investorProfit = investorValue - TOTAL_INVESTMENT;
  const moic = TOTAL_INVESTMENT > 0 ? investorValue / TOTAL_INVESTMENT : 0;

  const cashflows = Array.from({ length: hold + 1 }, (_, y) =>
    (y < COMMITMENT_YEARS ? -ANNUAL_COMMITMENT : 0) + (y === hold ? investorValue : 0),
  );
  const irr = investorValue > 0 ? irrFromFlows(cashflows) : -100;

  const shape = (t: number) => {
    const k = 8;
    const mid = 0.62;
    const f = (x: number) => 1 / (1 + Math.exp(-k * (x - mid)));
    return (f(t) - f(0)) / (f(1) - f(0));
  };

  const labels: string[] = [];
  const investorCurve: number[] = [];
  for (let y = 0; y <= hold; y++) {
    labels.push(`Y${y}`);
    investorCurve.push(investorValue * shape(y / hold));
  }

  return {
    inputs: input,
    totalInvestment: TOTAL_INVESTMENT,
    portfolioValue,
    nizekEquityValue,
    investorValue,
    investorProfit,
    moic,
    irr,
    labels,
    investorCurve,
    realEstate: benchmark(input.realEstateYield, hold),
    publicMarket: benchmark(input.publicMarketReturn, hold),
    cashflows,
  };
}

export const defaultInvestmentInputs: InvestmentInputs = {
  successfulCompanies: 4,
  avgCompanyValue: 30_000_000,
  avgNizekOwnership: 25,
  holdYears: 8,
  realEstateYield: 7,
  publicMarketReturn: 8,
};

export interface InvestmentControlMeta {
  key: keyof InvestmentInputs;
  label: string;
  min: number;
  max: number;
  step: number;
  unit: "kd" | "percent" | "count" | "years";
  help: string;
  group: "Outcomes" | "Ownership" | "Benchmarks";
}

export const investmentControls: InvestmentControlMeta[] = [
  {
    key: "successfulCompanies",
    label: "Successful companies",
    min: 0,
    max: 50,
    step: 1,
    unit: "count",
    help: "Startups out of the 50 built that become meaningful successes.",
    group: "Outcomes",
  },
  {
    key: "avgCompanyValue",
    label: "Average company value",
    min: 5_000_000,
    max: 100_000_000,
    step: 5_000_000,
    unit: "kd",
    help: "Average valuation of each successful startup at exit.",
    group: "Outcomes",
  },
  {
    key: "avgNizekOwnership",
    label: "Average NIZEK ownership",
    min: 10,
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
    help: "Annual total return of the property benchmark.",
    group: "Benchmarks",
  },
  {
    key: "publicMarketReturn",
    label: "Public market return",
    min: 0,
    max: 20,
    step: 0.5,
    unit: "percent",
    help: "Annual total return of the index benchmark.",
    group: "Benchmarks",
  },
];

export const investmentGroups = ["Outcomes", "Ownership", "Benchmarks"] as const;

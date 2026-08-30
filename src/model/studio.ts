/**
 * NIZEK venture-studio commitment model (KD).
 *
 * Models the actual offer: an annual commitment for a number of years,
 * a fixed build rate of startups per year, and a participation in NIZEK's
 * ownership of every company created during the commitment window.
 */

export interface StudioInputs {
  annualCommitment: number; // KD per year
  commitmentYears: number;
  startupsPerYear: number;
  investorParticipation: number; // % of NIZEK's ownership in each startup
  failureRate: number; // %
  smallShare: number; // %
  mediumShare: number; // %
  largeShare: number; // %
  outlierShare: number; // %
  avgValuation: number; // KD, reference exit valuation
  nizekOwnership: number; // % at formation
  dilution: number; // % to exit
  holdYears: number; // years from commitment start to liquidity
  realEstateYield: number; // % annual
  publicMarketReturn: number; // % annual
}

export const studioTierMultiples = {
  small: 0.4,
  medium: 1,
  large: 3.5,
  outlier: 15,
} as const;

export type StudioTier = keyof typeof studioTierMultiples;

export const studioTierLabels: Record<StudioTier, string> = {
  small: "Small winners",
  medium: "Medium winners",
  large: "Large winners",
  outlier: "Outliers",
};

export interface StudioResult {
  inputs: StudioInputs;
  totalStartups: number;
  totalCommitment: number;
  shares: { failure: number } & Record<StudioTier, number>;
  tiers: {
    key: StudioTier;
    label: string;
    share: number;
    count: number;
    exitValuation: number;
    grossValue: number;
    investorValue: number;
  }[];
  failures: number;
  portfolioValue: number;
  effectiveOwnership: number;
  nizekEquityValue: number;
  investorEquityValue: number;
  profit: number;
  moic: number;
  irr: number; // %
  costPerStartup: number;
  cumulativeStartups: number[];
  investorValueCurve: number[];
  realEstateCurve: number[];
  publicMarketCurve: number[];
  labels: string[];
  realEstateFinal: number;
  publicMarketFinal: number;
}

const norm = (v: number) => Math.max(0, v);

function irrFromFlows(flows: number[]): number {
  const npv = (r: number) => flows.reduce((s, f, i) => s + f / Math.pow(1 + r, i), 0);
  let lo = -0.95;
  let hi = 5;
  if (npv(lo) < 0) return -95;
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    if (npv(mid) > 0) lo = mid;
    else hi = mid;
  }
  return ((lo + hi) / 2) * 100;
}

export function projectStudio(input: StudioInputs): StudioResult {
  const years = Math.max(1, Math.round(input.commitmentYears));
  const hold = Math.max(years, Math.round(input.holdYears));
  const totalStartups = Math.round(input.startupsPerYear) * years;
  const totalCommitment = input.annualCommitment * years;

  const raw = {
    failure: norm(input.failureRate),
    small: norm(input.smallShare),
    medium: norm(input.mediumShare),
    large: norm(input.largeShare),
    outlier: norm(input.outlierShare),
  };
  const sum = raw.failure + raw.small + raw.medium + raw.large + raw.outlier || 1;
  const shares = {
    failure: (raw.failure / sum) * 100,
    small: (raw.small / sum) * 100,
    medium: (raw.medium / sum) * 100,
    large: (raw.large / sum) * 100,
    outlier: (raw.outlier / sum) * 100,
  };

  const effectiveOwnership =
    (input.nizekOwnership / 100) * (1 - Math.min(95, Math.max(0, input.dilution)) / 100);
  const participation = input.investorParticipation / 100;

  const tierKeys: StudioTier[] = ["small", "medium", "large", "outlier"];
  const tiers = tierKeys.map((key) => {
    const share = shares[key];
    const count = (share / 100) * totalStartups;
    const exitValuation = input.avgValuation * studioTierMultiples[key];
    const grossValue = count * exitValuation;
    return {
      key,
      label: studioTierLabels[key],
      share,
      count,
      exitValuation,
      grossValue,
      investorValue: grossValue * effectiveOwnership * participation,
    };
  });

  const portfolioValue = tiers.reduce((s, t) => s + t.grossValue, 0);
  const nizekEquityValue = portfolioValue * effectiveOwnership;
  const investorEquityValue = nizekEquityValue * participation;
  const profit = investorEquityValue - totalCommitment;
  const moic = totalCommitment > 0 ? investorEquityValue / totalCommitment : 0;

  const flows: number[] = [];
  for (let y = 0; y <= hold; y++) {
    const out = y < years ? -input.annualCommitment : 0;
    const inflow = y === hold ? investorEquityValue : 0;
    flows.push(out + inflow);
  }
  const irr = irrFromFlows(flows);

  const shape = (t: number) => {
    const k = 8;
    const mid = 0.62;
    const f = (x: number) => 1 / (1 + Math.exp(-k * (x - mid)));
    return (f(t) - f(0)) / (f(1) - f(0));
  };

  const cumulativeStartups: number[] = [];
  const investorValueCurve: number[] = [];
  const realEstateCurve: number[] = [];
  const publicMarketCurve: number[] = [];
  const labels: string[] = [];
  let re = 0;
  let pm = 0;
  for (let y = 0; y <= hold; y++) {
    const contribution = y < years ? input.annualCommitment : 0;
    re = re * (1 + input.realEstateYield / 100) + contribution;
    pm = pm * (1 + input.publicMarketReturn / 100) + contribution;
    cumulativeStartups.push(Math.min(totalStartups, Math.round(input.startupsPerYear) * Math.min(y, years)));
    investorValueCurve.push(investorEquityValue * shape(y / hold));
    realEstateCurve.push(re);
    publicMarketCurve.push(pm);
    labels.push(`Y${y}`);
  }

  return {
    inputs: input,
    totalStartups,
    totalCommitment,
    shares,
    tiers,
    failures: (shares.failure / 100) * totalStartups,
    portfolioValue,
    effectiveOwnership,
    nizekEquityValue,
    investorEquityValue,
    profit,
    moic,
    irr,
    costPerStartup: totalStartups > 0 ? totalCommitment / totalStartups : 0,
    cumulativeStartups,
    investorValueCurve,
    realEstateCurve,
    publicMarketCurve,
    labels,
    realEstateFinal: re,
    publicMarketFinal: pm,
  };
}

export const defaultStudioInputs: StudioInputs = {
  annualCommitment: 400_000,
  commitmentYears: 5,
  startupsPerYear: 10,
  investorParticipation: 25,
  failureRate: 60,
  smallShare: 22,
  mediumShare: 12,
  largeShare: 5.5,
  outlierShare: 0.5,
  avgValuation: 3_000_000,
  nizekOwnership: 40,
  dilution: 40,
  holdYears: 8,
  realEstateYield: 7,
  publicMarketReturn: 8,
};

export interface StudioControlMeta {
  key: keyof StudioInputs;
  label: string;
  min: number;
  max: number;
  step: number;
  unit: "kd" | "percent" | "count" | "years";
  help: string;
  group: "Commitment" | "Outcome distribution" | "Company economics" | "Benchmarks";
}

export const studioControls: StudioControlMeta[] = [
  {
    key: "annualCommitment",
    label: "Annual commitment",
    min: 100_000,
    max: 1_500_000,
    step: 50_000,
    unit: "kd",
    help: "Capital committed each year of the programme.",
    group: "Commitment",
  },
  {
    key: "commitmentYears",
    label: "Commitment years",
    min: 3,
    max: 10,
    step: 1,
    unit: "years",
    help: "Length of the build window.",
    group: "Commitment",
  },
  {
    key: "startupsPerYear",
    label: "Startups per year",
    min: 4,
    max: 20,
    step: 1,
    unit: "count",
    help: "Companies NIZEK creates annually.",
    group: "Commitment",
  },
  {
    key: "investorParticipation",
    label: "Participation in NIZEK's ownership",
    min: 5,
    max: 60,
    step: 1,
    unit: "percent",
    help: "Your share of NIZEK's equity in each company created.",
    group: "Commitment",
  },
  {
    key: "holdYears",
    label: "Hold period",
    min: 5,
    max: 15,
    step: 1,
    unit: "years",
    help: "Years from first cheque to full liquidity.",
    group: "Commitment",
  },
  {
    key: "failureRate",
    label: "Failure rate",
    min: 20,
    max: 90,
    step: 1,
    unit: "percent",
    help: "Companies returning zero. Shares normalise to 100%.",
    group: "Outcome distribution",
  },
  {
    key: "smallShare",
    label: "Small winners",
    min: 0,
    max: 60,
    step: 0.5,
    unit: "percent",
    help: "Exit at 0.4x the reference valuation.",
    group: "Outcome distribution",
  },
  {
    key: "mediumShare",
    label: "Medium winners",
    min: 0,
    max: 40,
    step: 0.5,
    unit: "percent",
    help: "Exit at 1x the reference valuation.",
    group: "Outcome distribution",
  },
  {
    key: "largeShare",
    label: "Large winners",
    min: 0,
    max: 25,
    step: 0.5,
    unit: "percent",
    help: "Exit at 3.5x the reference valuation.",
    group: "Outcome distribution",
  },
  {
    key: "outlierShare",
    label: "Outlier winners",
    min: 0,
    max: 10,
    step: 0.25,
    unit: "percent",
    help: "Exit at 15x the reference valuation.",
    group: "Outcome distribution",
  },
  {
    key: "avgValuation",
    label: "Reference startup valuation",
    min: 500_000,
    max: 20_000_000,
    step: 250_000,
    unit: "kd",
    help: "Benchmark exit valuation. Each tier scales from it.",
    group: "Company economics",
  },
  {
    key: "nizekOwnership",
    label: "NIZEK ownership at formation",
    min: 10,
    max: 80,
    step: 1,
    unit: "percent",
    help: "Equity NIZEK holds in each company it builds.",
    group: "Company economics",
  },
  {
    key: "dilution",
    label: "Dilution to exit",
    min: 0,
    max: 80,
    step: 1,
    unit: "percent",
    help: "Cumulative dilution from later rounds and option pools.",
    group: "Company economics",
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

export const studioGroups = [
  "Commitment",
  "Outcome distribution",
  "Company economics",
  "Benchmarks",
] as const;

export const kd = (v: number) => {
  const abs = Math.abs(v);
  const sign = v < 0 ? "-" : "";
  if (abs >= 1_000_000) return `${sign}KD${(abs / 1_000_000).toFixed(abs >= 10_000_000 ? 1 : 2)}M`;
  if (abs >= 1_000) return `${sign}KD${(abs / 1_000).toFixed(abs >= 100_000 ? 0 : 1)}K`;
  return `${sign}KD${abs.toFixed(0)}`;
};

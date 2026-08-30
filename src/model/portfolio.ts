/**
 * NIZEK venture-studio portfolio engine.
 *
 * Pure functions. No hardcoded outputs — every figure on the simulator is
 * derived from the inputs below.
 */

export interface PortfolioInputs {
  startups: number;
  failureRate: number; // % of portfolio written to zero
  smallShare: number; // % of portfolio exiting at the small tier
  mediumShare: number;
  largeShare: number;
  outlierShare: number;
  avgValuation: number; // reference exit valuation, USD
  ownership: number; // NIZEK ownership at formation, %
  dilution: number; // total dilution to NIZEK by exit, %
  holdYears: number;
  investorTicket: number; // USD invested into NIZEK
  nizekPostMoney: number; // NIZEK post-money at entry, USD
}

/** Exit valuation of each tier expressed as a multiple of the reference valuation. */
export const tierMultiples = {
  small: 0.4,
  medium: 1,
  large: 3.5,
  outlier: 15,
} as const;

export type TierKey = keyof typeof tierMultiples;

export const tierLabels: Record<TierKey, string> = {
  small: "Small winners",
  medium: "Medium winners",
  large: "Large winners",
  outlier: "Outliers",
};

export interface TierResult {
  key: TierKey;
  label: string;
  share: number; // normalised % of portfolio
  count: number;
  exitValuation: number; // per company
  grossValue: number; // all companies in tier
  nizekValue: number;
  contribution: number; // % of NIZEK equity value
}

export interface PortfolioResult {
  inputs: PortfolioInputs;
  normalised: { failure: number } & Record<TierKey, number>;
  tiers: TierResult[];
  failures: number;
  winners: number;
  portfolioValue: number;
  effectiveOwnership: number;
  nizekEquityValue: number;
  investorOwnership: number;
  investorEquityValue: number;
  profit: number;
  moic: number;
  irr: number; // %
  annualisedProfit: number;
  valueCurve: number[]; // NIZEK equity value by year, 0..holdYears
  investorCurve: number[];
  labels: string[];
  costPerStartup: number;
  impliedEntryValuePerStartup: number;
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export function projectPortfolio(input: PortfolioInputs): PortfolioResult {
  const startups = Math.max(1, Math.round(input.startups));

  // Shares are normalised so the portfolio always accounts for 100% of companies.
  const raw = {
    failure: Math.max(0, input.failureRate),
    small: Math.max(0, input.smallShare),
    medium: Math.max(0, input.mediumShare),
    large: Math.max(0, input.largeShare),
    outlier: Math.max(0, input.outlierShare),
  };
  const sum = raw.failure + raw.small + raw.medium + raw.large + raw.outlier || 1;
  const normalised = {
    failure: (raw.failure / sum) * 100,
    small: (raw.small / sum) * 100,
    medium: (raw.medium / sum) * 100,
    large: (raw.large / sum) * 100,
    outlier: (raw.outlier / sum) * 100,
  };

  const effectiveOwnership = (input.ownership / 100) * (1 - clamp(input.dilution, 0, 95) / 100);

  const tierKeys: TierKey[] = ["small", "medium", "large", "outlier"];
  const rawTiers = tierKeys.map((key) => {
    const share = normalised[key];
    const count = (share / 100) * startups;
    const exitValuation = input.avgValuation * tierMultiples[key];
    const grossValue = count * exitValuation;
    return { key, label: tierLabels[key], share, count, exitValuation, grossValue };
  });

  const portfolioValue = rawTiers.reduce((s, t) => s + t.grossValue, 0);
  const nizekEquityValue = portfolioValue * effectiveOwnership;

  const tiers: TierResult[] = rawTiers.map((t) => ({
    ...t,
    nizekValue: t.grossValue * effectiveOwnership,
    contribution: nizekEquityValue > 0 ? (t.grossValue / portfolioValue) * 100 : 0,
  }));

  const investorOwnership =
    input.nizekPostMoney > 0 ? clamp(input.investorTicket / input.nizekPostMoney, 0, 1) : 0;
  const investorEquityValue = nizekEquityValue * investorOwnership;
  const profit = investorEquityValue - input.investorTicket;
  const moic = input.investorTicket > 0 ? investorEquityValue / input.investorTicket : 0;
  const years = Math.max(1, Math.round(input.holdYears));
  const irr = moic > 0 ? (Math.pow(moic, 1 / years) - 1) * 100 : -100;

  // Value accrual curve: exits cluster in the back half of the hold period.
  const shape = (t: number) => {
    const k = 8;
    const mid = 0.62;
    const f = (x: number) => 1 / (1 + Math.exp(-k * (x - mid)));
    const f0 = f(0);
    const f1 = f(1);
    return (f(t) - f0) / (f1 - f0);
  };

  const valueCurve: number[] = [];
  const investorCurve: number[] = [];
  const labels: string[] = [];
  for (let y = 0; y <= years; y++) {
    const p = shape(y / years);
    valueCurve.push(nizekEquityValue * p);
    investorCurve.push(investorEquityValue * p);
    labels.push(`Y${y}`);
  }

  return {
    inputs: input,
    normalised,
    tiers,
    failures: (normalised.failure / 100) * startups,
    winners: startups - (normalised.failure / 100) * startups,
    portfolioValue,
    effectiveOwnership,
    nizekEquityValue,
    investorOwnership,
    investorEquityValue,
    profit,
    moic,
    irr,
    annualisedProfit: profit / years,
    valueCurve,
    investorCurve,
    labels,
    costPerStartup: startups > 0 ? input.nizekPostMoney / startups : 0,
    impliedEntryValuePerStartup: startups > 0 ? nizekEquityValue / startups : 0,
  };
}

export type PresetKey = "conservative" | "good" | "great" | "exceptional" | "custom";

export const presetOrder: PresetKey[] = [
  "conservative",
  "good",
  "great",
  "exceptional",
  "custom",
];

export const presetLabels: Record<PresetKey, string> = {
  conservative: "Conservative",
  good: "Good",
  great: "Great",
  exceptional: "Exceptional",
  custom: "Custom",
};

export const presetNotes: Record<PresetKey, string> = {
  conservative: "Downside discipline. Most of the portfolio fails, no outliers.",
  good: "A studio that works. One large winner carries the book.",
  great: "Top-quartile venture studio outcomes with a first outlier.",
  exceptional: "Top-decile. Power law fully expressed.",
  custom: "Your assumptions.",
};

const shared = {
  investorTicket: 1_000_000,
  nizekPostMoney: 30_000_000,
};

export const presets: Record<Exclude<PresetKey, "custom">, PortfolioInputs> = {
  conservative: {
    startups: 12,
    failureRate: 70,
    smallShare: 20,
    mediumShare: 8,
    largeShare: 2,
    outlierShare: 0,
    avgValuation: 20_000_000,
    ownership: 30,
    dilution: 45,
    holdYears: 7,
    ...shared,
  },
  good: {
    startups: 18,
    failureRate: 60,
    smallShare: 22,
    mediumShare: 12,
    largeShare: 5.5,
    outlierShare: 0.5,
    avgValuation: 30_000_000,
    ownership: 35,
    dilution: 40,
    holdYears: 7,
    ...shared,
  },
  great: {
    startups: 24,
    failureRate: 52,
    smallShare: 24,
    mediumShare: 15,
    largeShare: 7,
    outlierShare: 2,
    avgValuation: 40_000_000,
    ownership: 38,
    dilution: 38,
    holdYears: 8,
    ...shared,
  },
  exceptional: {
    startups: 30,
    failureRate: 45,
    smallShare: 25,
    mediumShare: 17,
    largeShare: 9,
    outlierShare: 4,
    avgValuation: 55_000_000,
    ownership: 42,
    dilution: 35,
    holdYears: 8,
    ...shared,
  },
};

export const defaultPortfolioInputs: PortfolioInputs = presets.good;

export interface PortfolioControlMeta {
  key: keyof PortfolioInputs;
  label: string;
  min: number;
  max: number;
  step: number;
  unit: "count" | "percent" | "currency" | "years";
  help: string;
  group: "Portfolio construction" | "Outcome distribution" | "Economics" | "Your position";
}

export const portfolioControls: PortfolioControlMeta[] = [
  {
    key: "startups",
    label: "Number of startups",
    min: 4,
    max: 60,
    step: 1,
    unit: "count",
    help: "Companies built and funded by the studio over the fund life.",
    group: "Portfolio construction",
  },
  {
    key: "holdYears",
    label: "Hold period",
    min: 3,
    max: 12,
    step: 1,
    unit: "years",
    help: "Years from entry to full liquidity.",
    group: "Portfolio construction",
  },
  {
    key: "failureRate",
    label: "Failure rate",
    min: 20,
    max: 90,
    step: 1,
    unit: "percent",
    help: "Companies returning zero. Shares are normalised to 100%.",
    group: "Outcome distribution",
  },
  {
    key: "smallShare",
    label: "Small winners",
    min: 0,
    max: 60,
    step: 0.5,
    unit: "percent",
    help: `Exit at ${tierMultiples.small}x the reference valuation.`,
    group: "Outcome distribution",
  },
  {
    key: "mediumShare",
    label: "Medium winners",
    min: 0,
    max: 40,
    step: 0.5,
    unit: "percent",
    help: `Exit at ${tierMultiples.medium}x the reference valuation.`,
    group: "Outcome distribution",
  },
  {
    key: "largeShare",
    label: "Large winners",
    min: 0,
    max: 25,
    step: 0.5,
    unit: "percent",
    help: `Exit at ${tierMultiples.large}x the reference valuation.`,
    group: "Outcome distribution",
  },
  {
    key: "outlierShare",
    label: "Outlier winners",
    min: 0,
    max: 12,
    step: 0.25,
    unit: "percent",
    help: `Exit at ${tierMultiples.outlier}x the reference valuation.`,
    group: "Outcome distribution",
  },
  {
    key: "avgValuation",
    label: "Average startup valuation",
    min: 5_000_000,
    max: 150_000_000,
    step: 1_000_000,
    unit: "currency",
    help: "Reference exit valuation. Each tier scales from this number.",
    group: "Economics",
  },
  {
    key: "ownership",
    label: "Average NIZEK ownership",
    min: 5,
    max: 70,
    step: 1,
    unit: "percent",
    help: "Ownership taken at formation across the portfolio.",
    group: "Economics",
  },
  {
    key: "dilution",
    label: "Dilution to exit",
    min: 0,
    max: 80,
    step: 1,
    unit: "percent",
    help: "Cumulative dilution from downstream rounds and option pools.",
    group: "Economics",
  },
  {
    key: "investorTicket",
    label: "Your investment",
    min: 100_000,
    max: 10_000_000,
    step: 100_000,
    unit: "currency",
    help: "Capital you commit to NIZEK.",
    group: "Your position",
  },
  {
    key: "nizekPostMoney",
    label: "NIZEK post-money",
    min: 10_000_000,
    max: 120_000_000,
    step: 1_000_000,
    unit: "currency",
    help: "Entry valuation of NIZEK. Sets your ownership.",
    group: "Your position",
  },
];

export const portfolioGroups = [
  "Portfolio construction",
  "Outcome distribution",
  "Economics",
  "Your position",
] as const;

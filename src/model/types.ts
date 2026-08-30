export type AssumptionKey =
  | "startingCustomers"
  | "newCustomersMonth1"
  | "acquisitionGrowth"
  | "arpa"
  | "annualPriceIncrease"
  | "monthlyChurn"
  | "netExpansion"
  | "grossMargin"
  | "cac"
  | "rdPercent"
  | "gaPercent"
  | "fixedOpexMonthly"
  | "startingCash"
  | "roundSize"
  | "preMoney"
  | "followOnYear"
  | "followOnSize"
  | "followOnPre"
  | "exitYear"
  | "exitMultiple"
  | "investorTicket"
  | "optionPool";

export type Assumptions = Record<AssumptionKey, number>;

export type AssumptionUnit = "currency" | "percent" | "multiple" | "number" | "year";

export type AssumptionGroup =
  | "Growth"
  | "Retention"
  | "Pricing"
  | "Costs"
  | "Capital"
  | "Exit";

export interface AssumptionMeta {
  key: AssumptionKey;
  label: string;
  group: AssumptionGroup;
  unit: AssumptionUnit;
  min: number;
  max: number;
  step: number;
  help: string;
}

export interface MonthPoint {
  month: number;
  customers: number;
  newCustomers: number;
  mrr: number;
  revenue: number;
  grossProfit: number;
  sm: number;
  rd: number;
  ga: number;
  opex: number;
  ebitda: number;
  cash: number;
}

export interface YearPoint {
  year: number;
  label: string;
  customers: number;
  newCustomers: number;
  arr: number;
  revenue: number;
  grossProfit: number;
  sm: number;
  rd: number;
  ga: number;
  opex: number;
  ebitda: number;
  ebitdaMargin: number;
  cash: number;
  headcount: number;
}

export interface CapTableEntry {
  name: string;
  ownership: number;
}

export interface Round {
  name: string;
  year: number;
  size: number;
  preMoney: number;
  postMoney: number;
  dilution: number;
}

export interface Returns {
  ticket: number;
  entryOwnership: number;
  exitOwnership: number;
  exitArr: number;
  exitValuation: number;
  proceeds: number;
  moic: number;
  irr: number;
  holdYears: number;
}

export interface Kpis {
  ltv: number;
  cac: number;
  ltvToCac: number;
  paybackMonths: number;
  ruleOf40: number;
  burnMultiple: number;
  peakBurn: number;
  runwayMonths: number;
  cashLow: number;
  breakevenMonth: number | null;
}

export interface Projection {
  assumptions: Assumptions;
  months: MonthPoint[];
  years: YearPoint[];
  rounds: Round[];
  capTable: CapTableEntry[];
  returns: Returns;
  kpis: Kpis;
}

export interface Scenario {
  id: string;
  name: string;
  overrides: Partial<Assumptions>;
}

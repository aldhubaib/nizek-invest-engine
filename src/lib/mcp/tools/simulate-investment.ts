import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

export default defineTool({
  name: "simulate_investment",
  title: "Simulate an investment",
  description:
    "Run NIZEK's venture-studio financial model for a chosen number of ownership seats and assumptions. Returns portfolio value, NIZEK equity value, investor value, profit, MOIC, IRR, the five yearly cohorts, and real-estate / public-market benchmarks.",
  inputSchema: {
    seats: z.number().int().min(1).max(6).describe("Ownership seats, 1-6. Each seat is 5%."),
    startupsPerYear: z.number().int().min(1).max(50).nullable().describe("Startups built each year. Default 10."),
    successesPerYear: z
      .number()
      .int()
      .min(0)
      .max(50)
      .nullable()
      .describe("Successful companies per yearly cohort. Default 3."),
    exitValues: z
      .array(z.number().positive())
      .nullable()
      .describe("Expected exit valuation in KD of each successful company in a cohort, e.g. [5000000,3000000,2000000]."),
    avgNizekOwnership: z.number().min(1).max(100).nullable().describe("Average NIZEK ownership per startup, %. Default 30."),
    realEstateYield: z.number().min(0).max(50).nullable().describe("Real-estate benchmark annual yield, %. Default 7."),
    publicMarketReturn: z.number().min(0).max(50).nullable().describe("Public-market benchmark annual return, %. Default 8."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (input) => {
    const m = await import("@/model/investment");
    const base = m.defaultInvestmentInputs;
    const years = m.COMMITMENT_YEARS;

    const successes = input.successesPerYear ?? base.successesByYear[0] ?? 3;
    const exits =
      input.exitValues && input.exitValues.length > 0
        ? input.exitValues
        : (base.exitValuesByYear[0] ?? []);

    const inputs = {
      ...base,
      seats: input.seats,
      startupsPerYear: input.startupsPerYear ?? base.startupsPerYear,
      successesByYear: Array.from({ length: years }, () => successes),
      exitValuesByYear: Array.from({ length: years }, () =>
        Array.from({ length: successes }, (_unused, i) => exits[i] ?? exits[exits.length - 1] ?? 0),
      ),
      avgNizekOwnership: input.avgNizekOwnership ?? base.avgNizekOwnership,
      realEstateYield: input.realEstateYield ?? base.realEstateYield,
      publicMarketReturn: input.publicMarketReturn ?? base.publicMarketReturn,
    };

    const r = m.projectInvestment(inputs);
    const summary = {
      currency: "KD",
      seats: r.seats,
      ownershipPercent: r.ownershipPercent,
      annualCommitment: r.annualCommitment,
      maxCommitment: r.maxCommitment,
      totalInvestment: r.totalInvestment,
      totalStartups: r.totalStartups,
      totalSuccesses: r.totalSuccesses,
      portfolioValue: r.portfolioValue,
      nizekEquityValue: r.nizekEquityValue,
      investorValue: r.investorValue,
      investorProfit: r.investorProfit,
      moic: r.moic,
      irrPercent: r.irr,
      cohorts: r.cohorts,
      benchmarks: { realEstate: r.realEstate, publicMarket: r.publicMarket },
    };

    return {
      content: [{ type: "text", text: JSON.stringify(summary, null, 2) }],
      structuredContent: summary,
    };
  },
});

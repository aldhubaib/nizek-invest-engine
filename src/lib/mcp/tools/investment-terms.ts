import { defineTool } from "@lovable.dev/mcp-js";

export default defineTool({
  name: "investment_terms",
  title: "Investment terms",
  description:
    "Return NIZEK's fixed investment terms: total seats, seats already committed, ownership per seat, and the quarterly / annual / five-year commitment per seat in KD.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async () => {
    const m = await import("@/model/investment");
    const terms = {
      currency: "KD",
      totalSeats: m.TOTAL_SEATS,
      reservedSeats: m.RESERVED_SEATS,
      availableSeats: m.AVAILABLE_SEATS,
      ownershipPerSeatPercent: m.SEAT_OWNERSHIP,
      totalInvestorParticipationPercent: m.TOTAL_SEATS * m.SEAT_OWNERSHIP,
      participationBasis:
        "Percent participation in NIZEK's equity position across the portfolio startups — not ownership in NIZEK the company.",
      paymentSchedule: 'KD15,000 per seat every three months, paid quarterly in advance.',
      quarterlyCommitmentPerSeat: m.SEAT_QUARTERLY_COMMITMENT,
      annualCommitmentPerSeat: m.SEAT_ANNUAL_COMMITMENT,
      commitmentYears: m.COMMITMENT_YEARS,
      maxCommitmentPerSeat: m.SEAT_MAX_COMMITMENT,
    };
    return {
      content: [{ type: "text", text: JSON.stringify(terms, null, 2) }],
      structuredContent: terms,
    };
  },
});

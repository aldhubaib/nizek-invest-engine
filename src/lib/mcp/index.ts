import { auth, defineMcp } from "@lovable.dev/mcp-js";

import investmentTerms from "./tools/investment-terms";
import simulateInvestment from "./tools/simulate-investment";

const projectRef = import.meta.env["VITE_SUPABASE_PROJECT_ID"] ?? "project-ref-unset";

export default defineMcp({
  name: "nizek-investor-hub",
  title: "NIZEK Investor Hub",
  version: "0.1.0",
  instructions:
    "Tools for the NIZEK venture-studio investor platform. Use `investment_terms` for the fixed seat structure and commitment amounts, and `simulate_investment` to run the live financial model for a chosen number of seats and assumptions.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [investmentTerms, simulateInvestment],
});

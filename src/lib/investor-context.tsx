import { createContext, useContext, type ReactNode } from "react";

import type { InvestorContext as InvestorProfile } from "@/lib/investor.functions";

const Ctx = createContext<InvestorProfile | null>(null);

export function InvestorProvider({
  investor,
  children,
}: {
  investor: InvestorProfile | null;
  children: ReactNode;
}) {
  return <Ctx.Provider value={investor}>{children}</Ctx.Provider>;
}

/** The investor behind the current personalized link, or null on public visits. */
export function useInvestor() {
  return useContext(Ctx);
}

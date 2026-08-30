import type { Assumptions, Scenario } from "./types";
import { defaultAssumptions } from "./assumptions";

export const presetScenarios: Scenario[] = [
  {
    id: "bear",
    name: "Bear",
    overrides: {
      acquisitionGrowth: 0.8,
      monthlyChurn: 2.4,
      netExpansion: 96,
      arpa: 2900,
      grossMargin: 66,
      cac: 34000,
      exitMultiple: 4,
    },
  },
  { id: "base", name: "Base", overrides: {} },
  {
    id: "bull",
    name: "Bull",
    overrides: {
      acquisitionGrowth: 3.2,
      monthlyChurn: 0.8,
      netExpansion: 118,
      arpa: 4000,
      grossMargin: 80,
      cac: 20000,
      exitMultiple: 11,
    },
  },
];


export const applyScenario = (
  base: Assumptions,
  overrides: Partial<Assumptions>,
): Assumptions => ({ ...base, ...overrides });

export const scenarioAssumptions = (id: string): Assumptions => {
  const s = presetScenarios.find((p) => p.id === id);
  return applyScenario(defaultAssumptions, s?.overrides ?? {});
};

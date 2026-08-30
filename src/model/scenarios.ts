import type { Assumptions, Scenario } from "./types";
import { defaultAssumptions } from "./assumptions";

export const presetScenarios: Scenario[] = [
  {
    id: "bear",
    name: "Bear",
    overrides: {
      acquisitionGrowth: 2,
      monthlyChurn: 2.2,
      netExpansion: 98,
      arpa: 3000,
      grossMargin: 68,
      cac: 20000,
      exitMultiple: 4,
    },
  },
  { id: "base", name: "Base", overrides: {} },
  {
    id: "bull",
    name: "Bull",
    overrides: {
      acquisitionGrowth: 7,
      monthlyChurn: 0.6,
      netExpansion: 128,
      arpa: 4600,
      grossMargin: 84,
      cac: 11000,
      exitMultiple: 12,
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

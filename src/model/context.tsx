import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { defaultAssumptions } from "./assumptions";
import { project } from "./engine";
import { presetScenarios } from "./scenarios";
import type { Assumptions, AssumptionKey, Projection, Scenario } from "./types";

interface ModelContextValue {
  assumptions: Assumptions;
  projection: Projection;
  baseProjection: Projection;
  scenarios: Scenario[];
  activeScenario: string;
  isCustom: boolean;
  setAssumption: (key: AssumptionKey, value: number) => void;
  loadScenario: (id: string) => void;
  saveScenario: (name: string) => void;
  reset: () => void;
}

// Keep a single context instance across HMR updates: if this module is
// re-evaluated while Chrome.tsx still holds the old reference (or vice versa),
// a fresh createContext() would make consumers miss the provider.
const globalStore = globalThis as unknown as {
  __nizekModelContext?: React.Context<ModelContextValue | null>;
};
const ModelContext =
  globalStore.__nizekModelContext ?? createContext<ModelContextValue | null>(null);
globalStore.__nizekModelContext = ModelContext;

const STORAGE_KEY = "nizek.model.v1";


export function ModelProvider({ children }: { children: ReactNode }) {
  const [assumptions, setAssumptions] = useState<Assumptions>(defaultAssumptions);
  const [custom, setCustom] = useState<Scenario[]>([]);
  const [activeScenario, setActiveScenario] = useState("base");
  const [isCustom, setIsCustom] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as {
        assumptions?: Partial<Assumptions>;
        custom?: Scenario[];
        activeScenario?: string;
        isCustom?: boolean;
      };
      if (parsed.assumptions) setAssumptions({ ...defaultAssumptions, ...parsed.assumptions });
      if (parsed.custom) setCustom(parsed.custom);
      if (parsed.activeScenario) setActiveScenario(parsed.activeScenario);
      if (parsed.isCustom) setIsCustom(true);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ assumptions, custom, activeScenario, isCustom }),
      );
    } catch {
      /* ignore */
    }
  }, [assumptions, custom, activeScenario, isCustom]);

  const scenarios = useMemo(() => [...presetScenarios, ...custom], [custom]);

  const setAssumption = useCallback((key: AssumptionKey, value: number) => {
    setAssumptions((prev) => ({ ...prev, [key]: value }));
    setIsCustom(true);
  }, []);

  const loadScenario = useCallback(
    (id: string) => {
      const s = [...presetScenarios, ...custom].find((x) => x.id === id);
      if (!s) return;
      setAssumptions({ ...defaultAssumptions, ...s.overrides });
      setActiveScenario(id);
      setIsCustom(false);
    },
    [custom],
  );

  const saveScenario = useCallback(
    (name: string) => {
      const overrides: Partial<Assumptions> = {};
      (Object.keys(assumptions) as AssumptionKey[]).forEach((k) => {
        if (assumptions[k] !== defaultAssumptions[k]) overrides[k] = assumptions[k];
      });
      const id = `custom-${Date.now()}`;
      setCustom((prev) => [...prev, { id, name, overrides }]);
      setActiveScenario(id);
      setIsCustom(false);
    },
    [assumptions],
  );

  const reset = useCallback(() => {
    setAssumptions(defaultAssumptions);
    setActiveScenario("base");
    setIsCustom(false);
  }, []);

  const value = useMemo<ModelContextValue>(
    () => ({
      assumptions,
      projection: project(assumptions),
      baseProjection: project(defaultAssumptions),
      scenarios,
      activeScenario,
      isCustom,
      setAssumption,
      loadScenario,
      saveScenario,
      reset,
    }),
    [assumptions, scenarios, activeScenario, isCustom, setAssumption, loadScenario, saveScenario, reset],
  );

  return <ModelContext.Provider value={value}>{children}</ModelContext.Provider>;
}

export const useModel = () => {
  const ctx = useContext(ModelContext);
  if (!ctx) throw new Error("useModel must be used inside ModelProvider");
  return ctx;
};

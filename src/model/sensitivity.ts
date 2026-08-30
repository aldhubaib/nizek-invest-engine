import { project } from "./engine";
import type { Assumptions, AssumptionKey } from "./types";

export interface SensitivityGridData {
  rows: number[];
  cols: number[];
  values: number[][];
}

const steps = (min: number, max: number, n: number) =>
  Array.from({ length: n }, (_, i) => min + ((max - min) * i) / (n - 1));

export const sensitivity = (
  base: Assumptions,
  rowKey: AssumptionKey,
  colKey: AssumptionKey,
  rowRange: [number, number],
  colRange: [number, number],
  metric: "moic" | "irr" = "moic",
  n = 5,
): SensitivityGridData => {
  const rows = steps(rowRange[0], rowRange[1], n);
  const cols = steps(colRange[0], colRange[1], n);
  const values = rows.map((r) =>
    cols.map((c) => {
      const p = project({ ...base, [rowKey]: r, [colKey]: c });
      return metric === "moic" ? p.returns.moic : p.returns.irr;
    }),
  );
  return { rows, cols, values };
};

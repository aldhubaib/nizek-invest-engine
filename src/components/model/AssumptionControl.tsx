import { useModel } from "@/model/context";
import { defaultAssumptions } from "@/model/assumptions";
import { formatByUnit } from "@/model/format";
import type { AssumptionMeta } from "@/model/types";
import { ValueField } from "./ValueField";

export function AssumptionControl({ meta }: { meta: AssumptionMeta }) {
  const { assumptions, setAssumption } = useModel();
  const value = assumptions[meta.key];
  const base = defaultAssumptions[meta.key];
  const changed = value !== base;

  return (
    <div className="border-b border-border py-6">
      <div className="flex items-baseline justify-between gap-4">
        <label htmlFor={meta.key} className="text-sm text-muted-foreground">
          {meta.label}
        </label>
        <ValueField
          label={meta.label}
          display={formatByUnit(value, meta.unit)}
          value={value}
          min={meta.min}
          max={meta.max}
          onCommit={(v) => setAssumption(meta.key, v)}
        />
      </div>
      <input
        id={meta.key}
        type="range"
        min={meta.min}
        max={meta.max}
        step={meta.step}
        value={value}
        onChange={(e) => setAssumption(meta.key, Number(e.target.value))}
        className="mt-4"
        aria-label={meta.label}
      />
      <div className="mt-2 flex items-center justify-between">
        <span className="text-[11px] leading-relaxed text-subtle">{meta.help}</span>
        {changed && (
          <button
            type="button"
            onClick={() => setAssumption(meta.key, base)}
            className="label-xs shrink-0 pl-4 transition-colors hover:text-foreground"
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
}

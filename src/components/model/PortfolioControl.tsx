import type { PortfolioControlMeta, PortfolioInputs } from "@/model/portfolio";
import { currency, number as fmtNumber } from "@/model/format";

export function formatControl(v: number, unit: PortfolioControlMeta["unit"]) {
  switch (unit) {
    case "currency":
      return currency(v);
    case "percent":
      return `${Number.isInteger(v) ? v : v.toFixed(2).replace(/0$/, "")}%`;
    case "years":
      return `${Math.round(v)} yrs`;
    default:
      return fmtNumber(v);
  }
}

export function PortfolioControl({
  meta,
  value,
  base,
  onChange,
  onReset,
}: {
  meta: PortfolioControlMeta;
  value: number;
  base: number;
  onChange: (key: keyof PortfolioInputs, v: number) => void;
  onReset: (key: keyof PortfolioInputs) => void;
}) {
  const changed = Math.abs(value - base) > 1e-9;
  return (
    <div className="border-b border-border py-5">
      <div className="flex items-baseline justify-between gap-4">
        <label htmlFor={meta.key} className="text-sm text-muted-foreground">
          {meta.label}
        </label>
        <span className="num text-sm text-foreground tabular-nums">
          {formatControl(value, meta.unit)}
        </span>
      </div>
      <input
        id={meta.key}
        type="range"
        min={meta.min}
        max={meta.max}
        step={meta.step}
        value={value}
        onChange={(e) => onChange(meta.key, Number(e.target.value))}
        className="mt-4"
        aria-label={meta.label}
      />
      <div className="mt-2 flex items-start justify-between gap-4">
        <span className="text-[11px] leading-relaxed text-subtle">{meta.help}</span>
        {changed && (
          <button
            type="button"
            onClick={() => onReset(meta.key)}
            className="label-xs shrink-0 transition-colors hover:text-foreground"
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
}

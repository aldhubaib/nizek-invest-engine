import { useEffect, useState } from "react";

/**
 * Editable numeric readout. Shows a formatted value when idle; on focus it
 * becomes a plain typable number. Accepts shorthand like "5m", "250k", "1.5b".
 */
export function ValueField({
  id,
  display,
  value,
  min,
  max,
  onCommit,
  label,
}: {
  id?: string;
  display: string;
  value: number;
  min: number;
  max: number;
  onCommit: (v: number) => void;
  label: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    if (!editing) setDraft("");
  }, [editing]);

  const commit = (raw: string) => {
    const parsed = parseValue(raw);
    if (parsed !== null) {
      onCommit(Math.min(max, Math.max(min, parsed)));
    }
    setEditing(false);
  };

  return (
    <input
      id={id}
      type="text"
      inputMode="decimal"
      aria-label={`${label} value`}
      value={editing ? draft : display}
      onFocus={(e) => {
        setEditing(true);
        setDraft(String(value));
        requestAnimationFrame(() => e.target.select());
      }}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={(e) => commit(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") (e.target as HTMLInputElement).blur();
        if (e.key === "Escape") {
          setEditing(false);
          (e.target as HTMLInputElement).blur();
        }
      }}
      className="num w-32 shrink-0 border-b border-transparent bg-transparent text-right text-sm text-foreground tabular-nums outline-none transition-colors hover:border-border focus:border-foreground"
    />
  );
}

export function parseValue(raw: string): number | null {
  const s = raw.trim().toLowerCase().replace(/[,\s]/g, "").replace(/^kd|^\$/, "").replace(/%$/, "");
  const m = s.match(/^(-?\d*\.?\d+)([kmb])?$/);
  if (!m) return null;
  const n = Number(m[1]);
  if (!Number.isFinite(n)) return null;
  const mult = m[2] === "k" ? 1e3 : m[2] === "m" ? 1e6 : m[2] === "b" ? 1e9 : 1;
  return n * mult;
}

import { useId } from "react";

export interface Series {
  name: string;
  values: number[];
  muted?: boolean;
  dashed?: boolean;
}

const W = 1000;
const H = 380;
const PAD = { top: 24, right: 24, bottom: 36, left: 64 };

const scale = (v: number, min: number, max: number, a: number, b: number) =>
  max === min ? (a + b) / 2 : a + ((v - min) / (max - min)) * (b - a);

function axisTicks(min: number, max: number, count = 4) {
  return Array.from({ length: count + 1 }, (_, i) => min + ((max - min) * i) / count);
}

export function LineChart({
  series,
  labels,
  format,
  height = H,
}: {
  series: Series[];
  labels: string[];
  format: (v: number) => string;
  height?: number;
}) {
  const all = series.flatMap((s) => s.values);
  const rawMin = Math.min(0, ...all);
  const rawMax = Math.max(...all, 1);
  const min = rawMin;
  const max = rawMax * 1.05;
  const x = (i: number) =>
    scale(i, 0, Math.max(labels.length - 1, 1), PAD.left, W - PAD.right);
  const y = (v: number) => scale(v, min, max, height - PAD.bottom, PAD.top);

  return (
    <svg viewBox={`0 0 ${W} ${height}`} className="w-full" role="img" aria-label="Chart">
      {axisTicks(min, max).map((t, i) => (
        <g key={i}>
          <line
            x1={PAD.left}
            x2={W - PAD.right}
            y1={y(t)}
            y2={y(t)}
            stroke="currentColor"
            strokeOpacity={i === 0 ? 0.28 : 0.09}
            strokeWidth={1}
          />
          <text
            x={PAD.left - 12}
            y={y(t) + 4}
            textAnchor="end"
            className="num"
            fontSize={13}
            fill="currentColor"
            fillOpacity={0.45}
          >
            {format(t)}
          </text>
        </g>
      ))}
      {labels.map((l, i) => (
        <text
          key={l + i}
          x={x(i)}
          y={height - 10}
          textAnchor="middle"
          className="num"
          fontSize={13}
          fill="currentColor"
          fillOpacity={0.45}
        >
          {l}
        </text>
      ))}
      {series.map((s) => (
        <polyline
          key={s.name}
          fill="none"
          stroke="currentColor"
          strokeOpacity={s.muted ? 0.35 : 1}
          strokeWidth={s.muted ? 1 : 1.75}
          strokeDasharray={s.dashed ? "4 6" : undefined}
          points={s.values.map((v, i) => `${x(i)},${y(v)}`).join(" ")}
          style={{ transition: "all 400ms cubic-bezier(0.16,1,0.3,1)" }}
        />
      ))}
    </svg>
  );
}

export function BarChart({
  values,
  labels,
  format,
  height = H,
}: {
  values: number[];
  labels: string[];
  format: (v: number) => string;
  height?: number;
}) {
  const min = Math.min(0, ...values);
  const max = Math.max(...values, 1) * 1.05;
  const y = (v: number) => scale(v, min, max, height - PAD.bottom, PAD.top);
  const bw = (W - PAD.left - PAD.right) / values.length;

  return (
    <svg viewBox={`0 0 ${W} ${height}`} className="w-full" role="img" aria-label="Chart">
      {axisTicks(min, max).map((t, i) => (
        <g key={i}>
          <line
            x1={PAD.left}
            x2={W - PAD.right}
            y1={y(t)}
            y2={y(t)}
            stroke="currentColor"
            strokeOpacity={0.09}
          />
          <text
            x={PAD.left - 12}
            y={y(t) + 4}
            textAnchor="end"
            className="num"
            fontSize={13}
            fill="currentColor"
            fillOpacity={0.45}
          >
            {format(t)}
          </text>
        </g>
      ))}
      <line
        x1={PAD.left}
        x2={W - PAD.right}
        y1={y(0)}
        y2={y(0)}
        stroke="currentColor"
        strokeOpacity={0.3}
      />
      {values.map((v, i) => {
        const top = Math.min(y(v), y(0));
        const h = Math.abs(y(v) - y(0));
        return (
          <g key={i}>
            <rect
              x={PAD.left + i * bw + bw * 0.28}
              y={top}
              width={bw * 0.44}
              height={Math.max(h, 1)}
              fill="currentColor"
              fillOpacity={v < 0 ? 0.3 : 0.9}
              style={{ transition: "all 400ms cubic-bezier(0.16,1,0.3,1)" }}
            />
            <text
              x={PAD.left + i * bw + bw / 2}
              y={height - 10}
              textAnchor="middle"
              className="num"
              fontSize={13}
              fill="currentColor"
              fillOpacity={0.45}
            >
              {labels[i]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function DonutBar({
  entries,
}: {
  entries: { name: string; ownership: number }[];
}) {
  const id = useId();
  let acc = 0;
  const total = entries.reduce((s, e) => s + e.ownership, 0) || 1;
  return (
    <div className="w-full">
      <div className="flex h-3 w-full overflow-hidden border border-border-strong">
        {entries.map((e, i) => {
          acc += e.ownership;
          return (
            <div
              key={id + e.name}
              style={{
                width: `${(e.ownership / total) * 100}%`,
                opacity: 1 - i * 0.16,
              }}
              className="h-full bg-foreground transition-all duration-500"
              title={e.name}
            />
          );
        })}
      </div>
      <div className="mt-6 grid grid-cols-1 gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-5">
        {entries.map((e) => (
          <div key={e.name} className="bg-background p-5">
            <div className="label-xs">{e.name}</div>
            <div className="num mt-2 text-xl">{(e.ownership * 100).toFixed(2)}%</div>
          </div>
        ))}
      </div>
      <span className="sr-only">{acc.toFixed(2)}</span>
    </div>
  );
}

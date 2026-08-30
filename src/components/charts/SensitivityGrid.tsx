import type { SensitivityGridData } from "@/model/sensitivity";

export function SensitivityGrid({
  data,
  rowLabel,
  colLabel,
  formatAxis,
  formatCell,
}: {
  data: SensitivityGridData;
  rowLabel: string;
  colLabel: string;
  formatAxis: { row: (v: number) => string; col: (v: number) => string };
  formatCell: (v: number) => string;
}) {
  const flat = data.values.flat().filter((v) => Number.isFinite(v));
  const min = Math.min(...flat);
  const max = Math.max(...flat);
  const opacity = (v: number) =>
    max === min ? 0.5 : 0.06 + ((v - min) / (max - min)) * 0.9;

  return (
    <div className="overflow-x-auto">
      <div className="label-xs mb-4">
        {rowLabel} × {colLabel}
      </div>
      <table className="w-full min-w-[640px] border-collapse">
        <thead>
          <tr>
            <th className="label-xs py-3 text-left">{rowLabel}</th>
            {data.cols.map((c) => (
              <th key={c} className="label-xs py-3 text-right">
                {formatAxis.col(c)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.rows.map((r, i) => (
            <tr key={r}>
              <td className="num py-2 pr-6 text-sm text-muted-foreground">{formatAxis.row(r)}</td>
              {data.values[i]!.map((v, j) => (
                <td key={j} className="p-1">
                  <div
                    className="num flex h-12 items-center justify-end px-3 text-sm text-foreground"
                    style={{ background: `rgba(255,255,255,${opacity(v) * 0.16})` }}
                  >
                    {Number.isFinite(v) ? formatCell(v) : "—"}
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

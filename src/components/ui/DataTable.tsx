export interface TableRow {
  label: string;
  values: string[];
  emphasis?: boolean;
  divider?: boolean;
}

export function DataTable({
  columns,
  rows,
  corner = "",
}: {
  columns: string[];
  rows: TableRow[];
  corner?: string;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] border-collapse">
        <thead>
          <tr className="border-b border-border-strong">
            <th className="label-xs sticky left-0 bg-background py-4 text-left">{corner}</th>
            {columns.map((c) => (
              <th key={c} className="label-xs py-4 text-right">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr
              key={r.label}
              className={`border-b border-border ${r.divider ? "border-border-strong" : ""}`}
            >
              <td
                className={`sticky left-0 bg-background py-4 pr-6 text-sm ${
                  r.emphasis ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {r.label}
              </td>
              {r.values.map((v, i) => (
                <td
                  key={i}
                  className={`num py-4 text-right text-sm ${
                    r.emphasis ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {v}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

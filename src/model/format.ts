export const currency = (v: number, digits = 0) => {
  const abs = Math.abs(v);
  const sign = v < 0 ? "-" : "";
  if (abs >= 1_000_000_000) return `${sign}$${(abs / 1_000_000_000).toFixed(2)}B`;
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(abs >= 10_000_000 ? 1 : 2)}M`;
  if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(digits)}K`;
  return `${sign}$${abs.toFixed(digits)}`;
};

export const currencyExact = (v: number) =>
  `${v < 0 ? "-" : ""}$${Math.abs(Math.round(v)).toLocaleString("en-US")}`;

export const percent = (v: number, digits = 1) => `${v.toFixed(digits)}%`;

export const multiple = (v: number, digits = 1) => `${v.toFixed(digits)}x`;

export const number = (v: number, digits = 0) =>
  Math.round(v).toLocaleString("en-US", { maximumFractionDigits: digits });

export const formatByUnit = (v: number, unit: string) => {
  switch (unit) {
    case "currency":
      return currency(v);
    case "percent":
      return percent(v);
    case "multiple":
      return multiple(v);
    case "year":
      return `Y${Math.round(v)}`;
    default:
      return number(v);
  }
};

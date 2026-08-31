import { Link, type LinkProps } from "@tanstack/react-router";
import { useState } from "react";
import { useModel } from "@/model/context";
import { multiple } from "@/model/format";
import nizekLogo from "@/assets/nizek-logo.png.asset.json";


const nav = [
  { to: "#why", label: "Why" },
  { to: "#problem", label: "Problem" },
  { to: "#how-we-build", label: "Model" },
  { to: "#investment", label: "Investment" },
  { to: "#model", label: "Simulator" },
  { to: "#founders", label: "Founders" },
  { to: "#proof", label: "Proof" },
  { to: "#timeline", label: "Timeline" },
  { to: "#contact", label: "Contact" },
] as const;


export function Header() {
  const { projection, activeScenario, isCustom, scenarios } = useModel();
  const [open, setOpen] = useState(false);
  const current = isCustom
    ? "Custom"
    : (scenarios.find((s) => s.id === activeScenario)?.name ?? "Base");

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur">
      <div className="flex items-center justify-between px-6 py-5 md:px-12">
        <Link to="/" className="flex items-center">
          <img src={nizekLogo.url} alt="NIZEK" className="h-6 w-auto" />
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "text-xs text-foreground" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-6">
          <span className="label-xs hidden md:inline">
            {current} · {multiple(projection.returns.moic)}
          </span>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="label-xs lg:hidden"
            aria-expanded={open}
          >
            {open ? "Close" : "Menu"}
          </button>
        </div>
      </div>
      {open && (
        <nav className="grid grid-cols-2 gap-px border-t border-border bg-border lg:hidden">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              onClick={() => setOpen(false)}
              className="bg-background px-6 py-5 text-sm text-muted-foreground"
            >
              {n.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-border px-6 py-16 md:px-12">
      <div className="mx-auto flex max-w-[1400px] flex-col justify-between gap-10 md:flex-row">
        <div>
          <img src={nizekLogo.url} alt="NIZEK" className="h-6 w-auto" />
          <p className="mt-4 max-w-md text-xs leading-relaxed text-subtle">
            All figures on this platform are generated live from a single financial model.
            Illustrative only; not an offer to sell securities.
          </p>
        </div>
        <div className="flex gap-16">
          <div className="flex flex-col gap-3">
            <span className="label-xs">Platform</span>
            <Link to="/model" className="text-xs text-muted-foreground hover:text-foreground">
              Model
            </Link>
            <Link to="/simulator" className="text-xs text-muted-foreground hover:text-foreground">
              Simulator
            </Link>
            <Link to="/returns" className="text-xs text-muted-foreground hover:text-foreground">
              Returns
            </Link>
          </div>
          <div className="flex flex-col gap-3">
            <span className="label-xs">Contact</span>
            <a
              href="mailto:investors@nizek.com"
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              investors@nizek.com
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export function NextStep({ to, label }: { to: NonNullable<LinkProps["to"]>; label: string }) {
  return (
    <Link
      to={to}
      className="group inline-flex items-baseline gap-6 border-b border-border-strong pb-3 text-2xl text-foreground transition-colors hover:border-foreground md:text-3xl"
    >
      <span className="display-xl">{label}</span>
      <span className="label-xs transition-transform group-hover:translate-x-1">→</span>
    </Link>
  );
}

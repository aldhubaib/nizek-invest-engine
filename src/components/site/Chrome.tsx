import { Link, type LinkProps } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useModel } from "@/model/context";
import { multiple } from "@/model/format";
import nizekLogo from "@/assets/nizek-logo.png.asset.json";


const nav = [
  { id: "why", label: "Why" },
  { id: "problem", label: "Problem" },
  { id: "how-we-build", label: "Model" },
  { id: "investment", label: "Investment" },
  { id: "founders", label: "Founders" },
  { id: "model", label: "Simulator" },
  { id: "proof", label: "Proof" },
  { id: "timeline", label: "Timeline" },
  { id: "contact", label: "Contact" },
] as const;

function useActiveSection() {
  const [active, setActive] = useState<string>("");
  useEffect(() => {
    const onScroll = () => {
      let current = "";
      for (const n of nav) {
        const el = document.getElementById(n.id);
        if (el && el.getBoundingClientRect().top <= 140) current = n.id;
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);
  return active;
}


export function Header() {
  const { projection, activeScenario, isCustom, scenarios } = useModel();
  const [open, setOpen] = useState(false);
  const active = useActiveSection();
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
            <a
              key={n.id}
              href={`#${n.id}`}
              aria-current={active === n.id ? "true" : undefined}
              className={`text-xs transition-colors hover:text-foreground ${
                active === n.id ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {n.label}
            </a>
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
            <a
              key={n.id}
              href={`#${n.id}`}
              onClick={() => setOpen(false)}
              className={`bg-background px-6 py-5 text-sm ${
                active === n.id ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {n.label}
            </a>
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
            <a href="#how-we-build" className="text-xs text-muted-foreground hover:text-foreground">
              Model
            </a>
            <a href="#model" className="text-xs text-muted-foreground hover:text-foreground">
              Simulator
            </a>
            <a href="#timeline" className="text-xs text-muted-foreground hover:text-foreground">
              Timeline
            </a>
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

import { Link, type LinkProps } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import nizekLogo from "@/assets/nizek-logo.png.asset.json";


const nav = [
  { id: "why", label: "Why Nizek" },
  { id: "founders", label: "Founders" },
  { id: "how-we-build", label: "Model" },
  { id: "regional", label: "Regional sourcing" },
  { id: "equity", label: "Equity" },
  { id: "structure", label: "Fund" },
  { id: "advantages", label: "Advantages" },
  { id: "investment", label: "Seats" },
  { id: "model", label: "Simulator" },
  { id: "team", label: "Team" },
  { id: "reserve", label: "Request allocation" },
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
  const [open, setOpen] = useState(false);
  const active = useActiveSection();
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
    <footer className="border-t border-border px-6 py-12 md:px-12">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-8 md:flex-row md:items-center md:justify-between">
        <img src={nizekLogo.url} alt="NIZEK" className="h-5 w-auto" />
        <div className="flex flex-wrap items-center gap-x-10 gap-y-3">
          <a
            href="mailto:investors@nizek.com"
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            investors@nizek.com
          </a>
          <span className="text-xs text-subtle">Kuwait / GCC</span>
          <a href="#reserve" className="text-xs text-muted-foreground hover:text-foreground">
            Legal
          </a>
          <a href="#reserve" className="text-xs text-muted-foreground hover:text-foreground">
            Privacy
          </a>
        </div>
      </div>
      <p className="mx-auto mt-8 max-w-[1400px] text-[11px] leading-relaxed text-subtle">
        Illustrative only; not an offer to sell securities.
      </p>
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

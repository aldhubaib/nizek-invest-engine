import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn("reveal", visible && "is-visible", className)}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

export function Section({
  children,
  className,
  id,
  invert = false,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
  invert?: boolean;
}) {
  return (
    <section
      id={id}
      className={cn(
        "border-t border-border px-6 py-24 md:px-12 md:py-32",
        invert && "section-invert",
        className,
      )}
    >
      <div className="mx-auto w-full max-w-[1400px]">{children}</div>
    </section>
  );
}

export function SectionHeading({
  index,
  title,
  lede,
}: {
  index?: string;
  title: string;
  lede?: string;
}) {
  return (
    <Reveal>
      <div className="mb-16 max-w-3xl">
        {index && <div className="label-xs mb-6">{index}</div>}
        <h2 className="display-xl text-4xl md:text-6xl">{title}</h2>
        {lede && (
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
            {lede}
          </p>
        )}
      </div>
    </Reveal>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <div className="label-xs">{children}</div>;
}

export function Metric({
  label,
  value,
  note,
  size = "md",
}: {
  label: string;
  value: string;
  note?: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizes = {
    sm: "text-xl md:text-2xl",
    md: "text-3xl md:text-4xl",
    lg: "text-4xl md:text-6xl",
  };
  return (
    <div className="flex flex-col gap-3">
      <div className="label-xs">{label}</div>
      <div className={cn("num text-foreground", sizes[size])}>{value}</div>
      {note && <div className="text-xs text-muted-foreground">{note}</div>}
    </div>
  );
}

export function MetricGrid({
  children,
  cols = 4,
}: {
  children: ReactNode;
  cols?: 2 | 3 | 4;
}) {
  const map = { 2: "md:grid-cols-2", 3: "md:grid-cols-3", 4: "md:grid-cols-4" };
  return (
    <div className={cn("grid grid-cols-1 gap-px border border-border bg-border", map[cols])}>
      {children}
    </div>
  );
}

export function MetricCell({ children }: { children: ReactNode }) {
  return <div className="bg-background p-8">{children}</div>;
}

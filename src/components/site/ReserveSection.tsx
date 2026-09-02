import { useState } from "react";
import { Reveal, Section, SectionHeading } from "@/components/ui/primitives";
import { submitSeatRequest } from "@/lib/investor.functions";
import {
  RESERVED_SEATS,
  SEAT_QUARTERLY_COMMITMENT,
  SEAT_OWNERSHIP,
  TOTAL_SEATS,
} from "@/model/investment";

const QUARTERLY_PER_SEAT = SEAT_QUARTERLY_COMMITMENT;
const OWNERSHIP_PER_SEAT = SEAT_OWNERSHIP;

function kd(value: number) {
  return `KD${value.toLocaleString("en-US")}`;
}

export function ReserveSection() {
  const firstOpen = Array.from({ length: TOTAL_SEATS }, (_, i) => i + 1).find(
    (n) => !RESERVED_SEATS.includes(n),
  )!;

  const [selected, setSelected] = useState<number[]>([firstOpen]);
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    fullName: "",
    company: "",
    email: "",
    phone: "",
    message: "",
  });

  const seats = selected.length;
  const quarterly = seats * QUARTERLY_PER_SEAT;
  const metrics: Array<[string, string]> = [
    ["Seats selected", String(seats).padStart(2, "0")],
    ["Participation", `${seats * OWNERSHIP_PER_SEAT}%`],
    ["Quarterly capital call", `${kd(quarterly)} every 3 months`],
    ["Capital call schedule", "Called quarterly in advance"],

  ];

  function toggleSeat(n: number) {
    if (RESERVED_SEATS.includes(n)) return;
    setSelected((prev) => {
      if (prev.includes(n)) {
        const next = prev.filter((s) => s !== n);
        return next.length ? next : prev;
      }
      return [...prev, n].sort((a, b) => a - b);
    });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setStatus("sending");
    try {
      await submitSeatRequest({ data: { ...form, seats } });
      setStatus("done");
    } catch {
      setStatus("idle");
      setError("We couldn't send your request. Please email investors@nizek.com directly.");
    }
  }

  const field =
    "w-full border-b border-border bg-transparent py-4 text-base text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground";

  return (
    <Section id="reserve" invert>
      <SectionHeading
        index="12 — Request allocation"
        title="Choose Your Allocation."
        lede="Select the seats you are interested in and submit your details. Our team will contact you to discuss allocation, legal structure and next steps."
      />

      <Reveal>
        <div className="grid grid-cols-2 gap-px border border-border-strong bg-border-strong sm:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: TOTAL_SEATS }, (_, i) => i + 1).map((n) => {
            const reserved = RESERVED_SEATS.includes(n);
            const active = selected.includes(n);
            return (
              <button
                key={n}
                type="button"
                disabled={reserved}
                onClick={() => toggleSeat(n)}
                aria-pressed={active}
                className={`group relative flex aspect-square flex-col justify-between p-5 text-left transition-colors duration-300 ${
                  reserved
                    ? "cursor-not-allowed bg-[repeating-linear-gradient(135deg,transparent,transparent_6px,currentColor_6px,currentColor_7px)] text-muted-foreground opacity-40"
                    : active
                      ? "bg-foreground text-background"
                      : "bg-background text-foreground hover:bg-foreground/5"
                }`}
              >
                <span className="label-xs">{String(n).padStart(2, "0")}</span>
                <span className="display-xl text-3xl md:text-4xl">{OWNERSHIP_PER_SEAT}%</span>
                <span className="label-xs">
                  {reserved ? "Committed" : active ? "Selected" : "Available"}
                </span>
              </button>
            );
          })}
        </div>
      </Reveal>

      <Reveal delay={80}>
        <div className="mt-px grid grid-cols-1 gap-px border border-border-strong bg-border-strong sm:grid-cols-2 lg:grid-cols-5">
          {metrics.map(([label, value]) => (
            <div key={label} className="bg-background px-5 py-8">
              <div className="label-xs text-muted-foreground">{label}</div>
              <div className="display-xl mt-4 text-2xl md:text-3xl">{value}</div>
            </div>
          ))}
        </div>
      </Reveal>

      <div className="mt-20 grid grid-cols-1 gap-16 lg:grid-cols-[1.2fr_0.8fr]">
        <Reveal>
          {status === "done" ? (
            <div className="border border-border-strong p-10 md:p-14">
              <div className="label-xs">Request received</div>
              <h3 className="display-xl mt-6 text-3xl md:text-5xl">
                Thank You For Your Interest In The Nizek Venture Fund.
              </h3>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground">
                Your seat request has been received and our team will contact you shortly to
                discuss allocation and next steps.
              </p>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <input
                className={field}
                placeholder="Full name"
                required
                maxLength={120}
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              />
              <input
                className={field}
                placeholder="Company / family office"
                maxLength={160}
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
              />
              <input
                className={field}
                type="email"
                placeholder="Email"
                required
                maxLength={255}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              <input
                className={field}
                placeholder="Phone number"
                required
                maxLength={40}
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
              <div className="md:col-span-2">
                <div className="label-xs text-muted-foreground">Number of seats</div>
                <div className="display-xl mt-3 text-2xl">{String(seats).padStart(2, "0")}</div>
              </div>
              <textarea
                className={`${field} md:col-span-2`}
                placeholder="Message (optional)"
                rows={3}
                maxLength={1000}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
              />
              {error && <p className="text-sm text-muted-foreground md:col-span-2">{error}</p>}
              <div className="md:col-span-2">
                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="label-xs border border-current px-10 py-5 transition-colors hover:bg-foreground hover:text-background disabled:opacity-50"
                >
                  {status === "sending" ? "Sending…" : "Request allocation"}
                </button>
              </div>
            </form>
          )}
        </Reveal>

        <Reveal delay={120}>
          <div className="border-t border-border pt-8 text-sm leading-relaxed text-muted-foreground">
            <div className="label-xs mb-6 text-foreground">Important</div>
            <p>Submitting this form is an expression of interest only.</p>
            <p className="mt-4">
              It does not constitute a binding investment commitment or guarantee seat
              availability.
            </p>
            <p className="mt-4">
              Final allocation is subject to confirmation, due diligence, legal documentation,
              and availability.
            </p>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Reveal, Section, SectionHeading } from "@/components/ui/primitives";
import { getFundPositions, submitSeatRequest } from "@/lib/investor.functions";
import { useInvestor } from "@/lib/investor-context";
import { trackInvestorEvent } from "@/hooks/useEngagement";
import {
  RESERVED_SEATS,
  SEAT_QUARTERLY_COMMITMENT,
  SEAT_OWNERSHIP,
  TOTAL_SEATS,
  investorPosition,
} from "@/model/investment";

const QUARTERLY_PER_SEAT = SEAT_QUARTERLY_COMMITMENT;
const OWNERSHIP_PER_SEAT = SEAT_OWNERSHIP;

function kd(value: number) {
  return `KD${value.toLocaleString("en-US")}`;
}

export function ReserveSection() {
  const investor = useInvestor();
  const { data: livePositions } = useQuery({
    queryKey: ["fund-positions"],
    queryFn: () => getFundPositions(),
    staleTime: 60_000,
  });

  // Availability comes from the fund_positions table; the static list is the fallback.
  const takenSeats = useMemo(() => {
    if (!livePositions?.length) return RESERVED_SEATS as readonly number[];
    return livePositions
      .filter((p) => p.status !== "available")
      .map((p) => p.code.charCodeAt(0) - 64);
  }, [livePositions]);

  const firstOpen =
    Array.from({ length: TOTAL_SEATS }, (_, i) => i + 1).find((n) => !takenSeats.includes(n)) ?? 1;

  const [selected, setSelected] = useState<number[]>([firstOpen]);
  const [editing, setEditing] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    fullName: "",
    company: "",
    email: "",
    phone: "",
    message: "",
  });

  // Prefill from the investor record when the visit came through a private link.
  useEffect(() => {
    if (!investor) return;
    setForm((prev) => ({
      ...prev,
      fullName: prev.fullName || investor.fullName,
      email: prev.email || investor.email,
      phone: prev.phone || investor.phone,
      company: prev.company || investor.company,
    }));
  }, [investor]);

  const knowsDetails = Boolean(investor && form.fullName && form.phone);

  const seats = selected.length;
  const quarterly = seats * QUARTERLY_PER_SEAT;
  const positionNames = selected.map((n) => investorPosition(n));

  const summary: Array<[string, string]> = [
    ["Selected", positionNames.join(" + ")],
    ["Fund ownership", `${seats * OWNERSHIP_PER_SEAT}%`],
    ["Quarterly capital call", `${kd(quarterly)} every 3 months`],
  ];

  function toggleSeat(n: number) {
    if (takenSeats.includes(n)) return;
    setSelected((prev) => {
      if (prev.includes(n)) {
        const next = prev.filter((s) => s !== n);
        return next.length ? next : prev;
      }
      return [...prev, n].sort((a, b) => a - b);
    });
    trackInvestorEvent("positions_selected", { position: investorPosition(n) });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setStatus("sending");
    try {
      await submitSeatRequest({ data: { ...form, seats, positions: positionNames } });
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
        title="Request Your Ownership Position."
        lede="Select the available Investor positions you would like to discuss with Nizek. Your request will be sent directly to the Nizek investment team."
      />

      <Reveal>
        <div className="grid grid-cols-2 gap-px border border-border-strong bg-border-strong sm:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: TOTAL_SEATS }, (_, i) => i + 1).map((n) => {
            const reserved = takenSeats.includes(n);
            const active = selected.includes(n);
            return (
              <button
                key={n}
                type="button"
                disabled={reserved}
                onClick={() => toggleSeat(n)}
                aria-pressed={active}
                aria-label={
                  reserved
                    ? `${investorPosition(n)} committed`
                    : `Select ${investorPosition(n)}`
                }
                className={`group relative flex aspect-square flex-col justify-between p-5 text-left transition-colors duration-300 ${
                  reserved
                    ? "cursor-not-allowed bg-[repeating-linear-gradient(135deg,transparent,transparent_6px,currentColor_6px,currentColor_7px)] text-muted-foreground opacity-40"
                    : active
                      ? "bg-foreground text-background"
                      : "bg-background text-foreground hover:bg-foreground/5"
                }`}
              >
                <span className="label-xs">{investorPosition(n)}</span>
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
        <div className="mt-px grid grid-cols-1 gap-px border border-border-strong bg-border-strong sm:grid-cols-3">
          {summary.map(([label, value]) => (
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
                Thank you, {form.fullName.split(" ")[0] || "investor"}.
              </h3>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground">
                Your request has been delivered to the Nizek investment team. A partner will contact
                you directly to confirm availability and walk through the next steps.
              </p>
              <div className="mt-10 grid grid-cols-1 gap-px border border-border bg-border sm:grid-cols-3">
                {summary.map(([k, v]) => (
                  <div key={k} className="bg-background p-6">
                    <div className="label-xs text-muted-foreground">{k}</div>
                    <div className="mt-3 text-base text-foreground">{v}</div>
                  </div>
                ))}
              </div>
              <p className="mt-8 text-[11px] leading-relaxed text-subtle">
                Submitting a request does not create a binding investment commitment. For anything
                urgent, email investors@nizek.com.
              </p>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="grid grid-cols-1 gap-8 md:grid-cols-2">
              {knowsDetails && !editing ? (
                <div className="md:col-span-2 border border-border-strong p-8">
                  <div className="label-xs text-muted-foreground">Your details</div>
                  <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div>
                      <div className="label-xs text-muted-foreground">Name</div>
                      <div className="mt-2 text-base">{form.fullName}</div>
                    </div>
                    <div>
                      <div className="label-xs text-muted-foreground">Phone</div>
                      <div className="mt-2 text-base">{form.phone}</div>
                    </div>
                    <div>
                      <div className="label-xs text-muted-foreground">Company / family office</div>
                      <div className="mt-2 text-base">{form.company || "—"}</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditing(true)}
                    className="label-xs mt-8 border-b border-current pb-1"
                  >
                    Edit details
                  </button>
                </div>
              ) : (
              <>
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
                placeholder="Phone number"
                required
                maxLength={40}
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
              <input
                className={field}
                placeholder="Company / family office (optional)"
                maxLength={160}
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
              />
              </>
              )}
              <div className="md:col-span-2">
                <div className="label-xs text-muted-foreground">Selected ownership positions</div>
                <div className="display-xl mt-3 text-2xl">{positionNames.join(" + ")}</div>
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
                  {status === "sending" ? "Sending…" : "Submit investment request"}
                </button>
                <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
                  Submitting a request does not create a binding investment commitment.
                </p>
              </div>
            </form>
          )}
        </Reveal>

        <Reveal delay={120}>
          <div className="border-t border-border pt-8 text-sm leading-relaxed text-muted-foreground">
            <div className="label-xs mb-6 text-foreground">Important</div>
            <p>Requests are reviewed in the order they are received.</p>
            <p className="mt-4">
              Final allocation is subject to confirmation, due diligence, legal documentation, and
              availability.
            </p>
            <p className="mt-4">
              Requests are delivered directly to the Nizek investment team.
            </p>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}

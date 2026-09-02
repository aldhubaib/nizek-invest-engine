import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { getInvestorDetail, rotateInvestorToken } from "@/lib/admin.functions";
import { publicLink } from "@/lib/public-link";

export const Route = createFileRoute("/_authenticated/admin/investors/$id")({
  head: () => ({
    meta: [
      { title: "Investor profile — NIZEK admin" },
      { name: "description", content: "Section engagement and allocation activity for one investor." },
      { property: "og:title", content: "Investor profile — NIZEK admin" },
      { property: "og:description", content: "Private investor engagement profile." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: InvestorDetail,
});

/** Website order — never sorted by engagement. */
const SECTIONS: { key: string; label: string }[] = [
  { key: "hero", label: "Hero" },
  { key: "why_nizek", label: "Why Nizek" },
  { key: "founder_pipeline", label: "Founder pipeline" },
  { key: "venture_model", label: "Venture building model" },
  { key: "regional_sourcing", label: "Regional sourcing" },
  { key: "equity_model", label: "Equity model" },
  { key: "fund_structure", label: "Fund structure" },
  { key: "advantages", label: "Investor advantages" },
  { key: "investment", label: "The investment" },
  { key: "simulator", label: "Financial simulator" },
  { key: "team", label: "Team" },
  { key: "request_allocation", label: "Request allocation" },
];

function clock(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function longDuration(seconds: number) {
  if (!seconds) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m ? `${m}m ${String(s).padStart(2, "0")}s` : `${s}s`;
}

function when(value: string | null) {
  return value ? new Date(value).toLocaleString() : "—";
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-border p-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 text-sm">{value}</p>
    </div>
  );
}

function InvestorDetail() {
  const { id } = Route.useParams();
  const [invite, setInvite] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "investor", id],
    queryFn: () => getInvestorDetail({ data: { id } }),
  });

  const rotate = useMutation({
    mutationFn: () => rotateInvestorToken({ data: { id } }),
    onSuccess: (res) => setInvite(publicLink(res.invitePath)),
  });

  if (isLoading) return <p className="mx-auto max-w-5xl px-6 py-16 text-sm">Loading…</p>;
  if (error || !data)
    return (
      <p className="mx-auto max-w-5xl px-6 py-16 text-sm text-muted-foreground">
        This profile is unavailable. Admin access is required.
      </p>
    );

  const { investor, sections, simulatorState, requests } = data;
  const sectionSeconds = sections as Record<string, number>;
  const maxSeconds = Math.max(1, ...SECTIONS.map((s) => sectionSeconds[s.key] ?? 0));
  const latestRequest = requests[0];

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <Link
        to="/admin/investors"
        className="font-mono text-[11px] uppercase tracking-[0.28em] text-muted-foreground"
      >
        ← All investors
      </Link>
      <h1 className="mt-4 text-3xl font-medium tracking-tight">{investor.fullName}</h1>

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Mobile" value={investor.mobile || "—"} />
        <Stat label="Status" value={investor.opened ? "Viewed" : "Not opened"} />
        <Stat label="First opened" value={when(investor.firstViewedAt)} />
        <Stat label="Last viewed" value={when(investor.lastViewedAt)} />
        <Stat label="Visits" value={String(investor.visits ?? 0)} />
        <Stat label="Total active time" value={longDuration(investor.activeSeconds)} />
        <Stat label="Simulator used" value={investor.simulatorUsed ? "Yes" : "No"} />
        <Stat
          label="Allocation request"
          value={latestRequest ? latestRequest.positions || "Requested" : "—"}
        />
      </div>

      <section className="mt-14">
        <h2 className="font-mono text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
          Section engagement
        </h2>
        <div className="mt-6 space-y-3">
          {SECTIONS.map((s) => {
            const seconds = sectionSeconds[s.key] ?? 0;
            return (
              <div key={s.key} className="grid grid-cols-[minmax(0,1fr)_120px] items-center gap-4">
                <div>
                  <p className="text-sm">{s.label}</p>
                  <div className="mt-2 h-1.5 w-full bg-border">
                    <div
                      className="h-1.5 bg-foreground"
                      style={{ width: `${Math.round((seconds / maxSeconds) * 100)}%` }}
                    />
                  </div>
                </div>
                <p className="text-right font-mono text-xs">
                  {seconds ? clock(seconds) : <span className="text-muted-foreground">Not viewed</span>}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-14">
        <h2 className="font-mono text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
          Simulator
        </h2>
        <p className="mt-4 text-sm">Used: {investor.simulatorUsed ? "Yes" : "No"}</p>
        {simulatorState && (
          <div className="mt-4 border border-border p-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              Last state — {when(simulatorState.at)}
            </p>
            <pre className="mt-2 overflow-x-auto whitespace-pre-wrap break-all font-mono text-xs">
              {simulatorState.payload}
            </pre>
          </div>
        )}
      </section>

      <section className="mt-14">
        <h2 className="font-mono text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
          Allocation request
        </h2>
        {!requests.length && <p className="mt-4 text-sm text-muted-foreground">No request yet.</p>}
        {requests.map((r) => (
          <div key={r.id} className="mt-4 border border-border p-5">
            <p className="text-sm">{r.positions || "Positions not specified"}</p>
            <p className="mt-2 text-xs text-muted-foreground">
              Ownership requested: {r.ownership}% · Quarterly capital call: KD
              {r.quarterly.toLocaleString("en-US")} · {when(r.submittedAt)}
            </p>
            {r.message && <p className="mt-3 text-sm">{r.message}</p>}
          </div>
        ))}
      </section>

      <section className="mt-14 border border-border p-6">
        <h2 className="font-mono text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
          Private link
        </h2>
        <p className="mt-3 text-xs text-muted-foreground">
          Issuing a new link invalidates the previous one.
        </p>
        <button
          type="button"
          onClick={() => rotate.mutate()}
          className="mt-4 border border-foreground px-5 py-2 text-xs font-medium uppercase tracking-[0.18em]"
        >
          {rotate.isPending ? "Generating…" : "Generate new link"}
        </button>
        {invite && (
          <div className="mt-4">
            <p className="break-all font-mono text-xs">{invite}</p>
            <button
              type="button"
              onClick={() => void navigator.clipboard.writeText(invite)}
              className="mt-3 border border-border px-4 py-2 text-xs uppercase tracking-[0.18em]"
            >
              Copy link
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

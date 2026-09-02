import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { getInvestorDetail, rotateInvestorToken, updateInvestorNotes } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin/investors/$id")({
  head: () => ({
    meta: [
      { title: "Investor profile — NIZEK admin" },
      { name: "description", content: "Engagement, simulator activity and allocation history for one investor." },
      { property: "og:title", content: "Investor profile — NIZEK admin" },
      { property: "og:description", content: "Private investor engagement profile." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: InvestorDetail,
});

const TABS = ["Overview", "Engagement", "Simulator", "Allocation", "Activity", "Notes"] as const;
type Tab = (typeof TABS)[number];

const SECTION_LABELS: Record<string, string> = {
  hero: "Hero",
  why_nizek: "Why Nizek",
  founder_pipeline: "Founder pipeline",
  venture_model: "Venture building model",
  regional_sourcing: "Regional sourcing",
  equity_model: "Equity model",
  fund_structure: "Fund structure",
  advantages: "Investor advantages",
  investment: "The investment",
  simulator: "Simulator",
  team: "Team",
  request_allocation: "Request allocation",
};

function minutes(seconds: number) {
  if (seconds < 60) return `${seconds}s`;
  return `${Math.round(seconds / 60)}m`;
}

function when(value: string | null) {
  return value ? new Date(value).toLocaleString() : "—";
}

function InvestorDetail() {
  const { id } = Route.useParams();
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>("Overview");
  const [notes, setNotes] = useState<string | null>(null);
  const [invite, setInvite] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "investor", id],
    queryFn: () => getInvestorDetail({ data: { id } }),
  });

  const rotate = useMutation({
    mutationFn: () => rotateInvestorToken({ data: { id } }),
    onSuccess: (res) => setInvite(`${window.location.origin}${res.invitePath}`),
  });

  const saveNotes = useMutation({
    mutationFn: () => updateInvestorNotes({ data: { id, notes: notes ?? "" } }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["admin", "investor", id] }),
  });

  if (isLoading) return <p className="mx-auto max-w-5xl px-6 py-16 text-sm">Loading…</p>;
  if (error || !data)
    return (
      <p className="mx-auto max-w-5xl px-6 py-16 text-sm text-muted-foreground">
        This profile is unavailable. Admin access is required.
      </p>
    );

  const { investor, sessions, sections, events, requests } = data;
  const maxSeconds = Math.max(1, ...sections.map((s) => s.seconds));
  const simulatorEvents = events.filter((e) =>
    ["assumption_changed", "simulator_snapshot", "simulator_opened", "positions_selected"].includes(
      e.type,
    ),
  );

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <Link to="/admin/investors" className="font-mono text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
        ← All investors
      </Link>
      <h1 className="mt-4 text-3xl font-medium tracking-tight">{investor.fullName}</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {investor.company || "—"} · {investor.email} · {investor.phone || "no phone"}
      </p>

      <div className="mt-8 flex flex-wrap gap-2 border-b border-border pb-3">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`px-3 py-1 font-mono text-[11px] uppercase tracking-[0.2em] ${
              tab === t ? "bg-foreground text-background" : "text-muted-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Overview" ? (
        <div className="mt-8 grid gap-6 sm:grid-cols-4">
          {[
            ["Visits", String(investor.visits)],
            ["Active time", minutes(investor.activeSeconds)],
            ["First opened", when(investor.firstViewedAt)],
            ["Last seen", when(investor.lastViewedAt)],
            ["Engagement", investor.engagementStatus],
            ["Allocation", investor.allocationStatus],
            ["Link status", investor.tokenRevoked ? "revoked" : "active"],
            ["Sessions", String(sessions.length)],
          ].map(([label, value]) => (
            <div key={label} className="border border-border p-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                {label}
              </p>
              <p className="mt-2 text-sm">{value}</p>
            </div>
          ))}
          <div className="sm:col-span-4">
            <button
              type="button"
              onClick={() => rotate.mutate()}
              className="border border-foreground px-4 py-2 text-sm transition-colors hover:bg-foreground hover:text-background"
            >
              {rotate.isPending ? "Issuing…" : "Issue new private link"}
            </button>
            {invite ? (
              <p className="mt-3 break-all font-mono text-xs">New link (shown once): {invite}</p>
            ) : null}
          </div>
        </div>
      ) : null}

      {tab === "Engagement" ? (
        <div className="mt-8 space-y-3">
          {sections.length === 0 ? (
            <p className="text-sm text-muted-foreground">No section engagement recorded yet.</p>
          ) : null}
          {sections.map((s) => (
            <div key={s.sectionId} className="grid grid-cols-[180px_1fr_60px] items-center gap-4">
              <p className="text-sm">{SECTION_LABELS[s.sectionId] ?? s.sectionId}</p>
              <div className="h-2 bg-muted">
                <div
                  className="h-2 bg-foreground"
                  style={{ width: `${Math.round((s.seconds / maxSeconds) * 100)}%` }}
                />
              </div>
              <p className="text-right font-mono text-xs text-muted-foreground">
                {minutes(s.seconds)}
              </p>
            </div>
          ))}
        </div>
      ) : null}

      {tab === "Simulator" ? (
        <div className="mt-8 divide-y divide-border border-y border-border">
          {simulatorEvents.length === 0 ? (
            <p className="py-6 text-sm text-muted-foreground">No simulator activity yet.</p>
          ) : null}
          {simulatorEvents.map((e, idx) => (
            <div key={idx} className="py-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                {e.type.replace(/_/g, " ")} · {when(e.at)}
              </p>
              <p className="mt-1 break-all font-mono text-xs">{e.payload}</p>
            </div>
          ))}
        </div>
      ) : null}

      {tab === "Allocation" ? (
        <div className="mt-8 space-y-6">
          {requests.length === 0 ? (
            <p className="text-sm text-muted-foreground">No allocation request submitted yet.</p>
          ) : null}
          {requests.map((r) => (
            <div key={r.id} className="border border-border p-5">
              <p className="text-sm font-medium">
                {r.positions.map((p) => `Investor ${p}`).join(" + ") || "—"}
              </p>
              <p className="mt-2 font-mono text-xs text-muted-foreground">
                {r.ownership}% fund ownership · KD{r.quarterly.toLocaleString("en-US")} every 3 months ·{" "}
                {when(r.submittedAt)}
              </p>
              {r.message ? <p className="mt-3 text-sm">{r.message}</p> : null}
            </div>
          ))}
        </div>
      ) : null}

      {tab === "Activity" ? (
        <div className="mt-8 divide-y divide-border border-y border-border">
          {events.map((e, idx) => (
            <div key={idx} className="flex flex-wrap justify-between gap-2 py-3">
              <p className="text-sm">{e.type.replace(/_/g, " ")}</p>
              <p className="font-mono text-xs text-muted-foreground">{when(e.at)}</p>
            </div>
          ))}
          {events.length === 0 ? (
            <p className="py-6 text-sm text-muted-foreground">No activity recorded yet.</p>
          ) : null}
        </div>
      ) : null}

      {tab === "Notes" ? (
        <div className="mt-8">
          <textarea
            className="min-h-40 w-full border border-border bg-transparent p-4 text-sm outline-none focus:border-foreground"
            value={notes ?? investor.notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Internal notes about this investor…"
          />
          <button
            type="button"
            onClick={() => saveNotes.mutate()}
            className="mt-4 border border-foreground px-4 py-2 text-sm transition-colors hover:bg-foreground hover:text-background"
          >
            {saveNotes.isPending ? "Saving…" : "Save notes"}
          </button>
        </div>
      ) : null}
    </div>
  );
}

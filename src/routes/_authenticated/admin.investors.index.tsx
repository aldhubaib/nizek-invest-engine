import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { createInvestor, listInvestors } from "@/lib/admin.functions";
import { publicLink } from "@/lib/public-link";

export const Route = createFileRoute("/_authenticated/admin/investors/")({
  head: () => ({
    meta: [
      { title: "Investor engagement — NIZEK admin" },
      { name: "description", content: "Track investor engagement across Nizek Venture Studio Fund A." },
      { property: "og:title", content: "Investor engagement — NIZEK admin" },
      { property: "og:description", content: "Private admin dashboard for investor engagement." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: InvestorsDashboard,
});

const levelStyles: Record<string, string> = {
  hot: "bg-foreground text-background",
  engaged: "border border-foreground text-foreground",
  warm: "border border-border text-foreground",
  cold: "border border-border text-muted-foreground",
};

function minutes(seconds: number) {
  if (seconds < 60) return `${seconds}s`;
  return `${Math.round(seconds / 60)}m`;
}

function when(value: string | null) {
  return value ? new Date(value).toLocaleString() : "—";
}




function InvestorsDashboard() {

  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "investors"],
    queryFn: () => listInvestors(),
  });
  const [form, setForm] = useState({ fullName: "", email: "", phone: "", company: "" });
  const [invite, setInvite] = useState<string | null>(null);

  const create = useMutation({
    mutationFn: () => createInvestor({ data: form }),
    onSuccess: (res) => {
      setInvite(publicLink(res.invitePath));
      setForm({ fullName: "", email: "", phone: "", company: "" });
      void qc.invalidateQueries({ queryKey: ["admin", "investors"] });
    },
  });

  const field =
    "w-full border-b border-border bg-transparent py-2 text-sm outline-none focus:border-foreground";

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
        Admin — investor engagement
      </p>
      <h1 className="mt-3 text-3xl font-medium tracking-tight">Investors</h1>

      <section className="mt-10 border border-border p-6">
        <h2 className="text-sm font-medium uppercase tracking-[0.2em]">Generate private link</h2>
        <p className="mt-2 text-xs text-muted-foreground">
          Enter the investor's name and phone number. A unique private link is generated for them —
          nothing is emailed.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-4">
          <input
            className={field}
            placeholder="Full name"
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
          />
          <input
            className={field}
            placeholder="Phone number"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          <input
            className={field}
            placeholder="Email (optional)"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            className={field}
            placeholder="Company (optional)"
            value={form.company}
            onChange={(e) => setForm({ ...form, company: e.target.value })}
          />
        </div>
        <button
          type="button"
          disabled={create.isPending || form.fullName.trim().length < 2 || form.phone.trim().length < 4}
          onClick={() => create.mutate()}
          className="mt-6 border border-foreground px-5 py-2 text-sm transition-colors hover:bg-foreground hover:text-background disabled:opacity-40"
        >
          {create.isPending ? "Generating…" : "Generate private link"}
        </button>
        {invite ? (
          <div className="mt-4 border border-border p-4">
            <p className="text-xs text-muted-foreground">Private link (shown once)</p>
            <p className="mt-2 break-all font-mono text-xs text-foreground">{invite}</p>
            <button
              type="button"
              onClick={() => void navigator.clipboard.writeText(invite)}
              className="mt-3 border border-border px-3 py-1 text-xs transition-colors hover:bg-foreground hover:text-background"
            >
              Copy link
            </button>
          </div>
        ) : null}
        {create.isError ? (
          <p className="mt-4 text-xs text-muted-foreground">
            Could not generate the link. Confirm you have admin access and try again.
          </p>
        ) : null}
      </section>

      <section className="mt-12">
        {isLoading ? <p className="text-sm text-muted-foreground">Loading…</p> : null}
        {error ? (
          <p className="text-sm text-muted-foreground">
            You need an admin role to view investor engagement.
          </p>
        ) : null}
        <div className="divide-y divide-border border-y border-border">
          {(data ?? []).map((i) => (
            <Link
              key={i.id}
              to="/admin/investors/$id"
              params={{ id: i.id }}
              className="grid gap-2 py-5 transition-colors hover:bg-muted/40 sm:grid-cols-[2fr_1fr_1fr_1fr_auto] sm:items-center"
            >
              <div>
                <p className="text-sm font-medium">{i.fullName}</p>
                <p className="text-xs text-muted-foreground">{i.company || i.email || "—"}</p>
              </div>
              <p className="font-mono text-xs text-muted-foreground">{i.visits} visits</p>
              <p className="font-mono text-xs text-muted-foreground">{minutes(i.activeSeconds)} active</p>
              <p className="font-mono text-xs text-muted-foreground">{when(i.lastViewedAt)}</p>
              <span
                className={`justify-self-start px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] ${levelStyles[i.level]}`}
              >
                {i.level}
              </span>
            </Link>
          ))}
        </div>
        {data && data.length === 0 ? (
          <p className="py-8 text-sm text-muted-foreground">No investors invited yet.</p>
        ) : null}
      </section>
    </div>
  );
}

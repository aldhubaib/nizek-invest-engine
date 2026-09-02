import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { createInvestor, listInvestors, rotateInvestorToken } from "@/lib/admin.functions";
import { publicLink } from "@/lib/public-link";

const LINK_STORE = "nizek.investor.links";

function readLinks(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(LINK_STORE) ?? "{}") as Record<string, string>;
  } catch {
    return {};
  }
}

function persistLinks(links: Record<string, string>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LINK_STORE, JSON.stringify(links));
}

export const Route = createFileRoute("/_authenticated/admin/investors/")({
  head: () => ({
    meta: [
      { title: "Investor access — NIZEK admin" },
      { name: "description", content: "Create investor links and track presentation engagement." },
      { property: "og:title", content: "Investor access — NIZEK admin" },
      { property: "og:description", content: "Private admin dashboard for investor engagement." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: InvestorsDashboard,
});

function duration(seconds: number) {
  if (!seconds) return "—";
  if (seconds < 60) return `${seconds}s`;
  return `${Math.round(seconds / 60)}m`;
}

function when(value: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return "Today";
  return d.toLocaleDateString();
}

function InvestorsDashboard() {
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "investors"],
    queryFn: () => listInvestors(),
  });

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ fullName: "", phone: "" });
  const [created, setCreated] = useState<
    { fullName: string; mobile: string; link: string } | null
  >(null);
  const [copied, setCopied] = useState(false);

  const create = useMutation({
    mutationFn: () => createInvestor({ data: form }),
    onSuccess: (res) => {
      setCreated({ fullName: res.fullName, mobile: res.mobile, link: publicLink(res.invitePath) });
      setForm({ fullName: "", phone: "" });
      setOpen(false);
      setCopied(false);
      void qc.invalidateQueries({ queryKey: ["admin", "investors"] });
    },
  });

  const field =
    "w-full border-b border-border bg-transparent py-2 text-sm outline-none focus:border-foreground";

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
            Admin — investor access
          </p>
          <h1 className="mt-3 text-3xl font-medium tracking-tight">Investors</h1>
        </div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="border border-foreground px-5 py-2.5 text-xs font-medium uppercase tracking-[0.18em]"
        >
          {open ? "Cancel" : "+ Add Investor"}
        </button>
      </div>

      {open && (
        <section className="mt-8 border border-border p-6">
          <h2 className="text-sm font-medium uppercase tracking-[0.2em]">Add investor</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <label className="block">
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                Full name
              </span>
              <input
                className={field}
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                placeholder="Ahmed Al…"
              />
            </label>
            <label className="block">
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                Mobile number
              </span>
              <input
                className={field}
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+965 …"
              />
            </label>
          </div>
          <button
            type="button"
            disabled={create.isPending || form.fullName.trim().length < 2 || form.phone.trim().length < 4}
            onClick={() => create.mutate()}
            className="mt-6 bg-foreground px-6 py-3 text-xs font-medium uppercase tracking-[0.18em] text-background disabled:opacity-40"
          >
            {create.isPending ? "Creating…" : "Create investor"}
          </button>
          {create.error && (
            <p className="mt-3 text-xs text-muted-foreground">Could not create this investor.</p>
          )}
        </section>
      )}

      {created && (
        <section className="mt-8 border border-foreground p-6">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            Investor
          </p>
          <p className="mt-1 text-lg">{created.fullName}</p>
          <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            Mobile
          </p>
          <p className="mt-1 text-sm">{created.mobile}</p>
          <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            Private link
          </p>
          <p className="mt-1 break-all font-mono text-xs">{created.link}</p>
          <button
            type="button"
            onClick={() => {
              void navigator.clipboard.writeText(created.link);
              setCopied(true);
            }}
            className="mt-4 border border-foreground px-5 py-2 text-xs font-medium uppercase tracking-[0.18em]"
          >
            {copied ? "Copied" : "Copy link"}
          </button>
        </section>
      )}

      <section className="mt-12">
        {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
        {error && (
          <p className="text-sm text-muted-foreground">
            This dashboard is unavailable. Admin access is required.
          </p>
        )}
        {data && data.length === 0 && (
          <p className="text-sm text-muted-foreground">No investors yet.</p>
        )}
        {data && data.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead>
                <tr className="border-b border-border font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  <th className="py-3 pr-4">Investor</th>
                  <th className="py-3 pr-4">Mobile</th>
                  <th className="py-3 pr-4">Status</th>
                  <th className="py-3 pr-4">Last viewed</th>
                  <th className="py-3 pr-4">Visits</th>
                  <th className="py-3 pr-4">Time spent</th>
                  <th className="py-3 pr-4">Simulator</th>
                  <th className="py-3">Allocation request</th>
                </tr>
              </thead>
              <tbody>
                {data.map((i) => (
                  <tr key={i.id} className="border-b border-border/60">
                    <td className="py-4 pr-4">
                      <Link
                        to="/admin/investors/$id"
                        params={{ id: i.id }}
                        className="underline underline-offset-4"
                      >
                        {i.fullName}
                      </Link>
                    </td>
                    <td className="py-4 pr-4 font-mono text-xs">{i.mobile || "—"}</td>
                    <td className="py-4 pr-4">
                      <span
                        className={`inline-block px-2 py-1 font-mono text-[10px] uppercase tracking-[0.18em] ${
                          i.opened
                            ? "bg-foreground text-background"
                            : "border border-border text-muted-foreground"
                        }`}
                      >
                        {i.opened ? "Viewed" : "Not opened"}
                      </span>
                    </td>
                    <td className="py-4 pr-4">{when(i.lastViewedAt)}</td>
                    <td className="py-4 pr-4">{i.visits ? `${i.visits} visits` : "—"}</td>
                    <td className="py-4 pr-4">{duration(i.activeSeconds)}</td>
                    <td className="py-4 pr-4">{i.simulatorUsed ? "Yes" : "No"}</td>
                    <td className="py-4">
                      {i.allocationRequested ? i.allocationPositions || "Yes" : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

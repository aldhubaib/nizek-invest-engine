import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import {
  createInvestor,
  listAllocationRequests,
  listInvestors,
  rotateInvestorToken,
  updateInvestor,
} from "@/lib/admin.functions";
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
  const requests = useQuery({
    queryKey: ["admin", "allocation-requests"],
    queryFn: () => listAllocationRequests(),
  });

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ fullName: "", phone: "" });
  const [created, setCreated] = useState<
    { fullName: string; mobile: string; link: string } | null
  >(null);
  const [copied, setCopied] = useState(false);
  const [links, setLinks] = useState<Record<string, string>>(() => readLinks());
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ fullName: "", phone: "" });

  const save = useMutation({
    mutationFn: () =>
      updateInvestor({
        data: { id: editId!, fullName: editForm.fullName.trim(), phone: editForm.phone.trim() },
      }),
    onSuccess: () => {
      setEditId(null);
      void qc.invalidateQueries({ queryKey: ["admin", "investors"] });
    },
  });

  const saveLink = (id: string, link: string) => {
    setLinks((prev) => {
      const next = { ...prev, [id]: link };
      persistLinks(next);
      return next;
    });
  };

  const rotate = useMutation({
    mutationFn: (id: string) => rotateInvestorToken({ data: { id } }),
    onSuccess: (res, id) => saveLink(id, publicLink(res.invitePath)),
  });

  const copy = (id: string, link: string) => {
    void navigator.clipboard.writeText(link);
    setCopiedId(id);
    window.setTimeout(() => setCopiedId((v) => (v === id ? null : v)), 1500);
  };

  const create = useMutation({
    mutationFn: () => createInvestor({ data: form }),
    onSuccess: (res) => {
      saveLink(res.id, publicLink(res.invitePath));
      setCreated({ fullName: res.fullName, mobile: res.mobile, link: publicLink(res.invitePath) });
      setForm({ fullName: "", phone: "" });
      setOpen(false);
      setCopied(false);
      void qc.invalidateQueries({ queryKey: ["admin", "investors"] });
    },
  });

  const field =
    "w-full border-b border-border bg-transparent py-2 text-sm outline-none focus:border-foreground";

  type SortKey =
    | "fullName"
    | "mobile"
    | "opened"
    | "lastViewedAt"
    | "visits"
    | "activeSeconds"
    | "simulatorUsed"
    | "allocationRequested"
    | "link";

  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({
    key: "fullName",
    dir: "asc",
  });

  const toggleSort = (key: SortKey) =>
    setSort((prev) =>
      prev.key === key ? { key, dir: prev.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" },
    );

  const sortValue = (row: NonNullable<typeof data>[number], key: SortKey): string | number => {
    switch (key) {
      case "fullName":
        return row.fullName?.toLowerCase() ?? "";
      case "mobile":
        return row.mobile ?? "";
      case "opened":
        return row.opened ? 1 : 0;
      case "lastViewedAt":
        return row.lastViewedAt ? new Date(row.lastViewedAt).getTime() : 0;
      case "visits":
        return row.visits ?? 0;
      case "activeSeconds":
        return row.activeSeconds ?? 0;
      case "simulatorUsed":
        return row.simulatorUsed ? 1 : 0;
      case "allocationRequested":
        return row.allocationRequested ? 1 : 0;
      case "link":
        return links[row.id] ? 1 : 0;
    }
  };

  const rows = data
    ? [...data].sort((a, b) => {
        const av = sortValue(a, sort.key);
        const bv = sortValue(b, sort.key);
        const cmp =
          typeof av === "number" && typeof bv === "number"
            ? av - bv
            : String(av).localeCompare(String(bv));
        return sort.dir === "asc" ? cmp : -cmp;
      })
    : [];

  const SortTh = ({
    label,
    sortKey,
    className = "py-3 pr-4",
  }: {
    label: string;
    sortKey: SortKey;
    className?: string;
  }) => (
    <th className={className}>
      <button
        type="button"
        onClick={() => toggleSort(sortKey)}
        className="inline-flex items-center gap-1 uppercase tracking-[0.2em] hover:text-foreground"
      >
        {label}
        <span className="opacity-60">
          {sort.key === sortKey ? (sort.dir === "asc" ? "▲" : "▼") : "↕"}
        </span>
      </button>
    </th>
  );

  return (
    <div className="mx-auto w-full max-w-[1800px] px-6 py-16">
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
                  <th className="py-3 pr-4">Allocation request</th>
                  <th className="py-3">Private link</th>
                </tr>
              </thead>
              <tbody>
                {data.map((i) => (
                  <tr key={i.id} className="border-b border-border/60">
                    <td className="py-4 pr-4">
                      {editId === i.id ? (
                        <input
                          className={field}
                          value={editForm.fullName}
                          onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                        />
                      ) : (
                        <div className="flex items-center gap-3">
                          <Link
                            to="/admin/investors/$id"
                            params={{ id: i.id }}
                            className="underline underline-offset-4"
                          >
                            {i.fullName}
                          </Link>
                          <button
                            type="button"
                            onClick={() => {
                              setEditId(i.id);
                              setEditForm({ fullName: i.fullName, phone: i.mobile ?? "" });
                            }}
                            className="border border-border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground"
                          >
                            Edit
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="py-4 pr-4 font-mono text-xs">
                      {editId === i.id ? (
                        <div className="flex flex-col gap-2">
                          <input
                            className={field}
                            value={editForm.phone}
                            onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                          />
                          <div className="flex gap-2">
                            <button
                              type="button"
                              disabled={
                                save.isPending ||
                                editForm.fullName.trim().length < 2 ||
                                editForm.phone.trim().length < 4
                              }
                              onClick={() => save.mutate()}
                              className="bg-foreground px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-background disabled:opacity-40"
                            >
                              {save.isPending ? "Saving…" : "Save"}
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditId(null)}
                              className="border border-border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em]"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        i.mobile || "—"
                      )}
                    </td>
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
                    <td className="py-4 pr-4">
                      {i.allocationRequested ? i.allocationPositions || "Yes" : "—"}
                    </td>
                    <td className="py-4">
                      {links[i.id] ? (
                        <div className="flex items-center gap-3">
                          <span className="max-w-[220px] truncate font-mono text-[11px] text-muted-foreground">
                            {links[i.id]}
                          </span>
                          <button
                            type="button"
                            onClick={() => copy(i.id, links[i.id] ?? "")}
                            className="border border-foreground px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em]"
                          >
                            {copiedId === i.id ? "Copied" : "Copy"}
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          disabled={rotate.isPending && rotate.variables === i.id}
                          onClick={() => rotate.mutate(i.id)}
                          className="border border-border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] disabled:opacity-40"
                        >
                          {rotate.isPending && rotate.variables === i.id ? "Generating…" : "Generate link"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="mt-16">
        <h2 className="font-mono text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
          Investment requests
        </h2>
        {requests.isLoading ? (
          <p className="mt-6 text-sm text-muted-foreground">Loading requests…</p>
        ) : !requests.data?.length ? (
          <p className="mt-6 text-sm text-muted-foreground">No requests submitted yet.</p>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead>
                <tr className="border-b border-border font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  <th className="py-3 pr-4">Submitted</th>
                  <th className="py-3 pr-4">Name</th>
                  <th className="py-3 pr-4">Contact</th>
                  <th className="py-3 pr-4">Positions</th>
                  <th className="py-3 pr-4">Ownership</th>
                  <th className="py-3 pr-4">Quarterly</th>
                  <th className="py-3">Message</th>
                </tr>
              </thead>
              <tbody>
                {requests.data.map((r) => (
                  <tr key={r.id} className="border-b border-border align-top">
                    <td className="py-4 pr-4 whitespace-nowrap">{when(r.submittedAt)}</td>
                    <td className="py-4 pr-4">
                      {r.investorId ? (
                        <Link
                          to="/admin/investors/$id"
                          params={{ id: r.investorId }}
                          className="underline underline-offset-4"
                        >
                          {r.fullName}
                        </Link>
                      ) : (
                        r.fullName
                      )}
                      {r.company ? (
                        <div className="text-xs text-muted-foreground">{r.company}</div>
                      ) : null}
                    </td>
                    <td className="py-4 pr-4">
                      <div>{r.phone}</div>
                    </td>

                    <td className="py-4 pr-4">{r.positions || "—"}</td>
                    <td className="py-4 pr-4">{r.ownership}%</td>
                    <td className="py-4 pr-4">KD{r.quarterly.toLocaleString("en-US")}</td>
                    <td className="py-4 max-w-[320px] text-muted-foreground">{r.message || "—"}</td>
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

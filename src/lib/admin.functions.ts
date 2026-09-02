import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertAdmin(context: { supabase: { rpc: Function }; userId: string }) {
  const { data, error } = await (context.supabase.rpc as (
    fn: string,
    args: Record<string, unknown>,
  ) => Promise<{ data: boolean | null; error: unknown }>)("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (error || !data) throw new Error("Forbidden");
}

/** "A", "C" → "Investor A + Investor C" */
function positionLabels(codes: string[] | null | undefined) {
  if (!codes || !codes.length) return "";
  return codes.map((c) => `Investor ${c}`).join(" + ");
}

/** Investor list for the admin dashboard. */
export const listInvestors = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context as never);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [investorsRes, requestsRes] = await Promise.all([
      supabaseAdmin
        .from("investors")
        .select(
          "id, full_name, phone, total_visits, total_active_seconds, first_viewed_at, last_viewed_at, created_at, allocation_requested, simulator_used",
        )
        .order("last_viewed_at", { ascending: false, nullsFirst: false }),
      supabaseAdmin
        .from("allocation_requests")
        .select("investor_id, positions, submitted_at")
        .order("submitted_at", { ascending: false }),
    ]);
    if (investorsRes.error) throw new Error(investorsRes.error.message);

    const latestRequest = new Map<string, string[]>();
    for (const r of requestsRes.data ?? []) {
      if (!r.investor_id || latestRequest.has(r.investor_id)) continue;
      latestRequest.set(r.investor_id, (r.positions ?? []) as string[]);
    }

    return (investorsRes.data ?? []).map((i) => ({
      id: i.id,
      fullName: i.full_name,
      mobile: i.phone ?? "",
      visits: i.total_visits,
      activeSeconds: i.total_active_seconds,
      firstViewedAt: i.first_viewed_at,
      lastViewedAt: i.last_viewed_at,
      createdAt: i.created_at,
      opened: Boolean(i.first_viewed_at),
      simulatorUsed: i.simulator_used,
      allocationRequested: i.allocation_requested,
      allocationPositions: positionLabels(latestRequest.get(i.id)),
    }));
  });

/** Full engagement profile for one investor. */
export const getInvestorDetail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    await assertAdmin(context as never);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const [investorRes, sectionsRes, eventsRes, requestsRes] = await Promise.all([
      supabaseAdmin.from("investors").select("*").eq("id", data.id).maybeSingle(),
      supabaseAdmin
        .from("investor_section_views")
        .select("section_id, active_seconds")
        .eq("investor_id", data.id),
      supabaseAdmin
        .from("investor_events")
        .select("event_type, payload, occurred_at")
        .eq("investor_id", data.id)
        .order("occurred_at", { ascending: false })
        .limit(60),
      supabaseAdmin
        .from("allocation_requests")
        .select("*")
        .eq("investor_id", data.id)
        .order("submitted_at", { ascending: false }),
    ]);

    if (!investorRes.data) throw new Error("Investor not found");
    const i = investorRes.data;

    const sectionTotals = new Map<string, number>();
    for (const s of sectionsRes.data ?? []) {
      sectionTotals.set(s.section_id, (sectionTotals.get(s.section_id) ?? 0) + s.active_seconds);
    }

    const simulatorEvent = (eventsRes.data ?? []).find((e) =>
      ["simulator_snapshot", "assumption_changed", "positions_selected"].includes(e.event_type),
    );

    return {
      investor: {
        id: i.id,
        fullName: i.full_name,
        mobile: i.phone ?? "",
        visits: i.total_visits,
        activeSeconds: i.total_active_seconds,
        firstViewedAt: i.first_viewed_at,
        lastViewedAt: i.last_viewed_at,
        opened: Boolean(i.first_viewed_at),
        simulatorUsed: i.simulator_used,
        allocationRequested: i.allocation_requested,
        tokenRevoked: Boolean(i.token_revoked_at),
      },
      sections: Object.fromEntries(sectionTotals),
      simulatorState: simulatorEvent
        ? { at: simulatorEvent.occurred_at, payload: JSON.stringify(simulatorEvent.payload ?? {}) }
        : null,
      requests: (requestsRes.data ?? []).map((r) => ({
        id: r.id,
        positions: positionLabels(r.positions as string[]),
        ownership: Number(r.ownership_percent),
        quarterly: Number(r.quarterly_capital_call),
        message: r.message ?? "",
        submittedAt: r.submitted_at,
      })),
    };
  });

/** Create an investor (name + mobile only) and return the private link. */
export const createInvestor = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        fullName: z.string().trim().min(2).max(120),
        phone: z.string().trim().min(4).max(40),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context as never);
    const { generateToken, hashToken } = await import("@/lib/investor-access.server");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const token = generateToken();
    const { data: inserted, error } = await supabaseAdmin
      .from("investors")
      .insert({
        full_name: data.fullName,
        phone: data.phone,
        access_token_hash: await hashToken(token),
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);

    return { id: inserted.id, fullName: data.fullName, mobile: data.phone, invitePath: `/i/${token}` };
  });

/** Issue a fresh invitation link, invalidating the previous one. */
export const rotateInvestorToken = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    await assertAdmin(context as never);
    const { generateToken, hashToken } = await import("@/lib/investor-access.server");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const token = generateToken();
    const { error } = await supabaseAdmin
      .from("investors")
      .update({
        access_token_hash: await hashToken(token),
        token_issued_at: new Date().toISOString(),
        token_revoked_at: null,
      })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { invitePath: `/i/${token}` };
  });

/** Update internal notes on an investor record. */
export const updateInvestorNotes = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({ id: z.string().uuid(), notes: z.string().max(4000) }).parse(data),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context as never);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("investors")
      .update({ internal_notes: data.notes })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

/** Every ownership-position request, including requests from public visits. */
export const listAllocationRequests = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context as never);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("allocation_requests")
      .select(
        "id, investor_id, full_name, email, phone, company, positions, ownership_percent, quarterly_capital_call, message, submitted_at",
      )
      .order("submitted_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return (data ?? []).map((r) => ({
      id: r.id,
      investorId: r.investor_id,
      fullName: r.full_name,
      email: r.email ?? "",
      phone: r.phone,
      company: r.company ?? "",
      positions: positionLabels(r.positions as string[]),
      ownership: Number(r.ownership_percent),
      quarterly: Number(r.quarterly_capital_call),
      message: r.message ?? "",
      submittedAt: r.submitted_at,
    }));
  });

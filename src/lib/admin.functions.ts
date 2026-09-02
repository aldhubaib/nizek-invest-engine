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

export type EngagementLevel = "cold" | "warm" | "engaged" | "hot";

function engagementLevel(activeSeconds: number, visits: number, requested: boolean): EngagementLevel {
  if (requested) return "hot";
  if (activeSeconds > 480 || visits >= 3) return "engaged";
  if (activeSeconds > 90) return "warm";
  return "cold";
}

/** Investor list with engagement signals for the admin dashboard. */
export const listInvestors = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context as never);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("investors")
      .select(
        "id, full_name, email, company, engagement_status, allocation_status, total_visits, total_active_seconds, first_viewed_at, last_viewed_at, created_at",
      )
      .order("last_viewed_at", { ascending: false, nullsFirst: false });
    if (error) throw new Error(error.message);

    return (data ?? []).map((i) => ({
      id: i.id,
      fullName: i.full_name,
      email: i.email,
      company: i.company ?? "",
      engagementStatus: i.engagement_status,
      allocationStatus: i.allocation_status,
      visits: i.total_visits,
      activeSeconds: i.total_active_seconds,
      firstViewedAt: i.first_viewed_at,
      lastViewedAt: i.last_viewed_at,
      level: engagementLevel(
        i.total_active_seconds,
        i.total_visits,
        i.allocation_status !== "none",
      ),
    }));
  });

/** Full engagement profile for one investor. */
export const getInvestorDetail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    await assertAdmin(context as never);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const [investorRes, sessionsRes, sectionsRes, eventsRes, requestsRes] = await Promise.all([
      supabaseAdmin.from("investors").select("*").eq("id", data.id).maybeSingle(),
      supabaseAdmin
        .from("investor_sessions")
        .select("id, started_at, last_seen_at, active_seconds, device_type")
        .eq("investor_id", data.id)
        .order("started_at", { ascending: false })
        .limit(50),
      supabaseAdmin
        .from("investor_section_views")
        .select("section_id, active_seconds, max_visible_percent, first_viewed_at")
        .eq("investor_id", data.id),
      supabaseAdmin
        .from("investor_events")
        .select("event_type, payload, occurred_at")
        .eq("investor_id", data.id)
        .order("occurred_at", { ascending: false })
        .limit(120),
      supabaseAdmin
        .from("allocation_requests")
        .select("*")
        .eq("investor_id", data.id)
        .order("submitted_at", { ascending: false }),
    ]);

    if (!investorRes.data) throw new Error("Investor not found");
    const i = investorRes.data;

    const sectionTotals = new Map<string, { seconds: number; visible: number }>();
    for (const s of sectionsRes.data ?? []) {
      const prev = sectionTotals.get(s.section_id) ?? { seconds: 0, visible: 0 };
      sectionTotals.set(s.section_id, {
        seconds: prev.seconds + s.active_seconds,
        visible: Math.max(prev.visible, s.max_visible_percent),
      });
    }

    return {
      investor: {
        id: i.id,
        fullName: i.full_name,
        email: i.email,
        phone: i.phone ?? "",
        company: i.company ?? "",
        engagementStatus: i.engagement_status,
        allocationStatus: i.allocation_status,
        notes: i.internal_notes,
        visits: i.total_visits,
        activeSeconds: i.total_active_seconds,
        firstViewedAt: i.first_viewed_at,
        lastViewedAt: i.last_viewed_at,
        tokenRevoked: Boolean(i.token_revoked_at),
      },
      sessions: (sessionsRes.data ?? []).map((s) => ({
        id: s.id,
        startedAt: s.started_at,
        lastSeenAt: s.last_seen_at,
        activeSeconds: s.active_seconds,
        device: s.device_type,
      })),
      sections: Array.from(sectionTotals.entries())
        .map(([sectionId, v]) => ({ sectionId, ...v }))
        .sort((a, b) => b.seconds - a.seconds),
      events: (eventsRes.data ?? []).map((e) => ({
        type: e.event_type,
        payload: JSON.stringify(e.payload ?? {}),
        at: e.occurred_at,
      })),
      requests: (requestsRes.data ?? []).map((r) => ({
        id: r.id,
        positions: r.positions,
        ownership: Number(r.ownership_percent),
        quarterly: Number(r.quarterly_capital_call),
        message: r.message ?? "",
        status: r.status,
        submittedAt: r.submitted_at,
      })),
    };
  });

/** Create an investor and return the one-time personalized invitation link. */
export const createInvestor = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        fullName: z.string().trim().min(2).max(120),
        email: z.string().trim().max(255).optional().default(""),
        phone: z.string().trim().min(4).max(40),
        company: z.string().trim().max(160).optional().default(""),
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
        email: data.email,
        phone: data.phone || null,
        company: data.company || null,
        access_token_hash: await hashToken(token),
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);

    return { id: inserted.id, invitePath: `/i/${token}` };
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

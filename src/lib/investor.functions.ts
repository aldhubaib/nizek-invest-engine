import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const schema = z.object({
  fullName: z.string().trim().min(2).max(120),
  company: z.string().trim().max(160).optional().default(""),
  email: z.string().trim().email().max(255).optional().default(""),
  phone: z.string().trim().min(5).max(40),
  seats: z.number().int().min(1).max(6),
  positions: z.array(z.string().trim().max(40)).max(6).optional().default([]),
  message: z.string().trim().max(1000).optional().default(""),
});

export type SeatRequestInput = z.infer<typeof schema>;

const ANNUAL_PER_SEAT = 150_000;
const OWNERSHIP_PER_SEAT = 5;
const POSITION_CODES = ["A", "B", "C", "D", "E", "F"] as const;
type PositionCode = (typeof POSITION_CODES)[number];

function formatKD(value: number) {
  return `KD${value.toLocaleString("en-US")}`;
}

function codesFromLabels(labels: string[]): PositionCode[] {
  return labels
    .map((l) => l.trim().slice(-1).toUpperCase())
    .filter((c): c is PositionCode => (POSITION_CODES as readonly string[]).includes(c));
}

/** Public availability of the six ownership positions in Fund A. */
export const getFundPositions = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("fund_positions")
    .select("position_code, display_name, ownership_percent, status")
    .order("position_code", { ascending: true });
  if (error || !data) return [];
  // Only availability is exposed — never the identity behind a position.
  return data.map((p) => ({
    code: p.position_code,
    label: p.display_name,
    ownership: Number(p.ownership_percent),
    status: p.status,
  }));
});

/**
 * Redeem a personalized invitation token: verifies the hash, opens a tracked
 * visit and sets a signed HttpOnly session cookie so the raw token can be
 * dropped from the URL immediately.
 */
export const redeemInviteToken = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z.object({ token: z.string().trim().min(8).max(200) }).parse(data),
  )
  .handler(async ({ data }) => {
    const { hashToken, setInvestorCookie } = await import("@/lib/investor-access.server");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const tokenHash = await hashToken(data.token);
    const { data: investor } = await supabaseAdmin
      .from("investors")
      .select("id, full_name, token_revoked_at, total_visits, first_viewed_at")
      .eq("access_token_hash", tokenHash)
      .maybeSingle();

    if (!investor || investor.token_revoked_at) return { ok: false as const };

    const { data: session } = await supabaseAdmin
      .from("investor_sessions")
      .insert({ investor_id: investor.id })
      .select("id")
      .single();

    const now = new Date().toISOString();
    await supabaseAdmin
      .from("investors")
      .update({
        engagement_status: "opened",
        first_viewed_at: investor.first_viewed_at ?? now,
        last_viewed_at: now,
        total_visits: (investor.total_visits ?? 0) + 1,
      })
      .eq("id", investor.id);

    if (session) {
      await supabaseAdmin.from("investor_events").insert({
        investor_id: investor.id,
        session_id: session.id,
        event_type: "session_start",
      });
      await setInvestorCookie({ investorId: investor.id, sessionId: session.id });
    }

    return { ok: true as const };
  });

export interface InvestorContext {
  id: string;
  fullName: string;
  firstName: string;
  email: string;
  phone: string;
  company: string;
  allocationStatus: string;
}

/** Resolve the investor behind the current signed session cookie, if any. */
export const getInvestorContext = createServerFn({ method: "GET" }).handler(async () => {
  const { readInvestorCookie } = await import("@/lib/investor-access.server");
  const cookie = await readInvestorCookie();
  if (!cookie) return null;

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin
    .from("investors")
    .select("id, full_name, email, phone, company, allocation_status, token_revoked_at")
    .eq("id", cookie.investorId)
    .maybeSingle();
  if (!data || data.token_revoked_at) return null;

  const context: InvestorContext = {
    id: data.id,
    fullName: data.full_name,
    firstName: data.full_name.split(" ")[0] ?? data.full_name,
    email: data.email,
    phone: data.phone ?? "",
    company: data.company ?? "",
    allocationStatus: data.allocation_status,
  };
  return context;
});

const SECTION_KEYS = [
  "hero",
  "why_nizek",
  "founder_pipeline",
  "venture_model",
  "regional_sourcing",
  "equity_model",
  "fund_structure",
  "advantages",
  "investment",
  "simulator",
  "team",
  "request_allocation",
] as const;

const engagementSchema = z.object({
  activeSeconds: z.number().int().min(0).max(86_400),
  sections: z
    .array(
      z.object({
        sectionId: z.enum(SECTION_KEYS),
        activeSeconds: z.number().int().min(0).max(86_400),
        visiblePercent: z.number().int().min(0).max(100),
      }),
    )
    .max(20),
  events: z
    .array(
      z.object({
        type: z.enum([
          "section_milestone",
          "positions_selected",
          "simulator_opened",
          "assumption_changed",
          "simulator_snapshot",
        ]),
        payload: z.record(z.string(), z.unknown()).default({}),
      }),
    )
    .max(25)
    .default([]),
});

/**
 * Aggregated engagement flush. The client batches and debounces; nothing here
 * stores IP addresses, user agents or any device fingerprint.
 */
export const recordEngagement = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => engagementSchema.parse(data))
  .handler(async ({ data }) => {
    const { readInvestorCookie } = await import("@/lib/investor-access.server");
    const cookie = await readInvestorCookie();
    if (!cookie) return { ok: false as const };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const now = new Date().toISOString();

    await supabaseAdmin
      .from("investor_sessions")
      .update({ last_seen_at: now, active_seconds: data.activeSeconds })
      .eq("id", cookie.sessionId);

    for (const s of data.sections) {
      const { data: existing } = await supabaseAdmin
        .from("investor_section_views")
        .select("id, view_count, max_visible_percent")
        .eq("session_id", cookie.sessionId)
        .eq("section_id", s.sectionId)
        .maybeSingle();

      if (existing) {
        await supabaseAdmin
          .from("investor_section_views")
          .update({
            active_seconds: s.activeSeconds,
            max_visible_percent: Math.max(existing.max_visible_percent, s.visiblePercent),
          })
          .eq("id", existing.id);
      } else {
        await supabaseAdmin.from("investor_section_views").insert({
          session_id: cookie.sessionId,
          investor_id: cookie.investorId,
          section_id: s.sectionId,
          active_seconds: s.activeSeconds,
          max_visible_percent: s.visiblePercent,
        });
      }
    }

    if (data.events.length) {
      await supabaseAdmin.from("investor_events").insert(
        data.events.map((e) => ({
          investor_id: cookie.investorId,
          session_id: cookie.sessionId,
          event_type: e.type,
          payload: e.payload as never,
        })),
      );
    }

    const totalActive = data.sections.reduce((sum, s) => sum + s.activeSeconds, 0);
    await supabaseAdmin
      .from("investors")
      .update({
        last_viewed_at: now,
        total_active_seconds: Math.max(data.activeSeconds, totalActive),
        engagement_status: data.activeSeconds > 90 ? "reviewing" : "opened",
      })
      .eq("id", cookie.investorId);

    return { ok: true as const };
  });

/**
 * Investor allocation request. Persists the request, links it to the investor
 * record when the visit came through a personalized link, and notifies
 * investors@nizek.com when a transactional email provider is configured.
 */
export const submitSeatRequest = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => schema.parse(data))
  .handler(async ({ data }) => {
    const { readInvestorCookie } = await import("@/lib/investor-access.server");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const cookie = await readInvestorCookie();

    const annual = data.seats * ANNUAL_PER_SEAT;
    const quarterly = annual / 4;
    const ownership = data.seats * OWNERSHIP_PER_SEAT;
    const codes = codesFromLabels(data.positions);

    const { data: fund } = await supabaseAdmin
      .from("funds")
      .select("id")
      .eq("code", "Fund A")
      .maybeSingle();

    let adminLink = "";
    if (fund) {
      const { data: request } = await supabaseAdmin
        .from("allocation_requests")
        .insert({
          fund_id: fund.id,
          investor_id: cookie?.investorId ?? null,
          session_id: cookie?.sessionId ?? null,
          full_name: data.fullName,
          email: data.email || null,
          phone: data.phone,
          company: data.company || null,
          positions: codes,
          ownership_percent: ownership,
          quarterly_capital_call: quarterly,
          message: data.message || null,
        })
        .select("id")
        .single();
      if (request && cookie) {
        await supabaseAdmin
          .from("investors")
          .update({ allocation_status: "requested", engagement_status: "interested" })
          .eq("id", cookie.investorId);
        await supabaseAdmin.from("investor_events").insert({
          investor_id: cookie.investorId,
          session_id: cookie.sessionId,
          event_type: "allocation_requested",
          payload: { positions: codes, ownership } as never,
        });
      }
      if (cookie) adminLink = `/admin/investors/${cookie.investorId}`;
    }

    const summary = [
      `Full name: ${data.fullName}`,
      `Company / family office: ${data.company || "—"}`,
      `Email: ${data.email || "—"}`,
      `Phone: ${data.phone}`,
      `Positions requested: ${data.positions.length ? data.positions.join(" + ") : data.seats}`,
      `Total fund ownership requested: ${ownership}%`,
      `Quarterly capital call: ${formatKD(quarterly)} every 3 months`,
      `Message: ${data.message || "—"}`,
      adminLink ? `Investor profile: ${adminLink}` : "Investor profile: — (public visit)",
      `Submitted: ${new Date().toISOString()}`,
    ].join("\n");

    const subject = `New Ownership Position Request — ${data.fullName}`;
    const apiKey = process.env["RESEND_API_KEY"];
    const from = process.env["INVESTOR_EMAIL_FROM"];

    if (apiKey && from) {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from,
          to: ["investors@nizek.com"],
          ...(data.email ? { reply_to: data.email } : {}),
          subject,
          text: summary,
        }),
      });
      if (!res.ok) {
        console.error("[seat-request] email delivery failed", res.status, subject, summary);
        return { ok: true as const, delivered: false as const };
      }
      return { ok: true as const, delivered: true as const };
    }

    console.info(`[seat-request] ${subject}\n${summary}`);
    return { ok: true as const, delivered: false as const };
  });

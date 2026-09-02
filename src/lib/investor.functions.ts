import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const schema = z.object({
  fullName: z.string().trim().min(2).max(120),
  company: z.string().trim().max(160).optional().default(""),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().min(5).max(40),
  seats: z.number().int().min(1).max(6),
  positions: z.array(z.string().trim().max(40)).max(6).optional().default([]),
  message: z.string().trim().max(1000).optional().default(""),
});

export type SeatRequestInput = z.infer<typeof schema>;

const ANNUAL_PER_SEAT = 150_000;
const OWNERSHIP_PER_SEAT = 5;

function formatKD(value: number) {
  return `KD${value.toLocaleString("en-US")}`;
}

/**
 * Investor seat request. Sends a notification to investors@nizek.com when a
 * transactional email provider is configured; otherwise the request is
 * recorded in the server logs so nothing is silently lost.
 */
export const submitSeatRequest = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => schema.parse(data))
  .handler(async ({ data }) => {
    const annual = data.seats * ANNUAL_PER_SEAT;
    const summary = [
      `Full name: ${data.fullName}`,
      `Company / family office: ${data.company || "—"}`,
      `Email: ${data.email}`,
      `Phone: ${data.phone}`,
      `Positions requested: ${data.positions.length ? data.positions.join(" + ") : data.seats}`,
      `Total fund ownership requested: ${data.seats * OWNERSHIP_PER_SEAT}%`,
      `Quarterly capital call: ${formatKD(annual / 4)} every 3 months`,
      `Message: ${data.message || "—"}`,
      `Submitted: ${new Date().toISOString()}`,
    ].join("\n");

    const subject = `New Ownership Position Request — ${data.fullName}`;
    const apiKey = process.env["RESEND_API_KEY"];
    const from = process.env["INVESTOR_EMAIL_FROM"];

    if (apiKey && from) {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from,
          to: ["investors@nizek.com"],
          reply_to: data.email,
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

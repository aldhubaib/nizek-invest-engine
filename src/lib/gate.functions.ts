import { createServerFn } from "@tanstack/react-start";
import { useSession, getRequest } from "@tanstack/react-start/server";
import { createHash, timingSafeEqual } from "node:crypto";

type GateSession = { unlocked?: boolean };

function sessionConfig() {
  return {
    password: process.env["SESSION_SECRET"]!,
    name: "site-gate",
    maxAge: 60 * 60 * 24 * 7,
    cookie: { httpOnly: true, secure: true, sameSite: "lax" as const, path: "/" },
  };
}

function passwordMatches(input: string, expected: string): boolean {
  const a = createHash("sha256").update(input, "utf8").digest();
  const b = createHash("sha256").update(expected, "utf8").digest();
  return timingSafeEqual(a, b);
}

/**
 * The gate is only enforced on the published site. Local dev and the Lovable
 * preview always pass, so the password never has to be toggled off to work.
 */
function isPreviewHost(host: string): boolean {
  return (
    host.startsWith("localhost") ||
    host.startsWith("127.0.0.1") ||
    host.includes("lovableproject.com") ||
    host.includes("id-preview--") ||
    host.includes("-dev.lovable.app")
  );
}

export const isUnlocked = createServerFn({ method: "GET" }).handler(async () => {
  if (!process.env["SITE_PASSWORD"] || !process.env["SESSION_SECRET"]) return true;
  const host = new URL(getRequest().url).host;
  if (isPreviewHost(host)) return true;
  const session = await useSession<GateSession>(sessionConfig());
  return session.data.unlocked === true;
});

export const unlockSite = createServerFn({ method: "POST" })
  .inputValidator((data: { password: string }) => data)
  .handler(async ({ data }) => {
    const expected = process.env["SITE_PASSWORD"];
    if (!expected) return { ok: true as const };
    if (!passwordMatches(data.password ?? "", expected)) return { ok: false as const };
    const session = await useSession<GateSession>(sessionConfig());
    await session.update({ unlocked: true });
    return { ok: true as const };
  });

export const lockSite = createServerFn({ method: "POST" }).handler(async () => {
  const session = await useSession<GateSession>(sessionConfig());
  await session.clear();
  return { ok: true as const };
});

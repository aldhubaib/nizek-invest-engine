/**
 * Server-only helpers for the personalized investor-access system.
 *
 * Access tokens are never stored in plaintext: the invitation link carries a
 * random token, the database stores only its SHA-256 hash. After redemption the
 * token is exchanged for a signed, HttpOnly session cookie so it never has to
 * appear in the URL again.
 */
import { getRequestHeader, setResponseHeader } from "@tanstack/react-start/server";

export const INVESTOR_COOKIE = "nz_investor";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 60; // 60 days

const encoder = new TextEncoder();

function toHex(buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** SHA-256 hex digest of a raw access token. */
export async function hashToken(token: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(token.trim()));
  return toHex(digest);
}

/** Cryptographically strong, URL-safe invitation token. */
export function generateToken(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return toHex(bytes.buffer);
}

function secret() {
  return process.env["SESSION_SECRET"] || process.env["SUPABASE_SERVICE_ROLE_KEY"] || "nizek-dev";
}

async function sign(payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return toHex(await crypto.subtle.sign("HMAC", key, encoder.encode(payload)));
}

export interface InvestorSessionCookie {
  investorId: string;
  sessionId: string;
}

export async function setInvestorCookie(value: InvestorSessionCookie) {
  const payload = `${value.investorId}.${value.sessionId}`;
  const signature = await sign(payload);
  const cookie = `${INVESTOR_COOKIE}=${payload}.${signature}; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=${MAX_AGE_SECONDS}`;
  setResponseHeader("set-cookie", cookie);
}

export function clearInvestorCookie() {
  setResponseHeader(
    "set-cookie",
    `${INVESTOR_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=0`,
  );
}

export async function readInvestorCookie(): Promise<InvestorSessionCookie | null> {
  const header = getRequestHeader("cookie");
  if (!header) return null;
  const match = header
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${INVESTOR_COOKIE}=`));
  if (!match) return null;
  const raw = decodeURIComponent(match.slice(INVESTOR_COOKIE.length + 1));
  const parts = raw.split(".");
  if (parts.length !== 3) return null;
  const [investorId, sessionId, signature] = parts as [string, string, string];
  const expected = await sign(`${investorId}.${sessionId}`);
  if (expected.length !== signature.length) return null;
  let diff = 0;
  for (let i = 0; i < expected.length; i += 1) {
    diff |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  }
  if (diff !== 0) return null;
  return { investorId, sessionId };
}

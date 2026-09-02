/**
 * Invitation links must point at the public published site. The admin console is
 * often opened from a gated preview host, where an investor link would 401.
 */
export const PUBLIC_SITE_URL = "https://nizek-invest-engine.lovable.app";

export function publicLink(path: string) {
  const origin = typeof window === "undefined" ? "" : window.location.origin;
  const isPrivateHost =
    !origin ||
    origin.includes("-preview--") ||
    origin.includes("lovable.dev") ||
    origin.includes("localhost");
  return `${isPrivateHost ? PUBLIC_SITE_URL : origin}${path}`;
}

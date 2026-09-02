import { createFileRoute, redirect } from "@tanstack/react-router";

import { redeemInviteToken } from "@/lib/investor.functions";

/**
 * Personalized invitation entry point. The raw token is exchanged for a signed
 * HttpOnly session cookie and then dropped from the URL immediately.
 */
export const Route = createFileRoute("/i/$token")({
  ssr: true,
  head: () => ({ meta: [{ title: "Your NIZEK invitation" }, { name: "robots", content: "noindex" }] }),
  loader: async ({ params }) => {
    const result = await redeemInviteToken({ data: { token: params.token } });
    throw redirect({ to: result.ok ? "/presentation" : "/", replace: true });
  },
  component: () => null,
});

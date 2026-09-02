import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";

import { supabase } from "@/integrations/supabase/client";

type OAuthClient = { name?: string; client_name?: string; redirect_uri?: string };
type AuthorizationDetails = {
  client?: OAuthClient;
  scope?: string;
  redirect_url?: string;
  redirect_to?: string;
};
type OAuthResult = { data?: AuthorizationDetails | null; error?: { message: string } | null };
type OAuthNamespace = {
  getAuthorizationDetails: (id: string) => Promise<OAuthResult>;
  approveAuthorization: (id: string) => Promise<OAuthResult>;
  denyAuthorization: (id: string) => Promise<OAuthResult>;
};

function oauth(): OAuthNamespace {
  return (supabase.auth as unknown as { oauth: OAuthNamespace }).oauth;
}

export const Route = createFileRoute("/.lovable/oauth/consent")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>) => ({
    authorization_id: typeof s["authorization_id"] === "string" ? (s["authorization_id"] as string) : "",
  }),
  beforeLoad: async ({ search, location }) => {
    if (!search.authorization_id) throw new Error("Missing authorization_id");
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      throw redirect({ to: "/login", search: { next: location.pathname + location.searchStr } });
    }
  },
  loader: async ({ location }) => {
    const authorizationId = new URLSearchParams(location.search).get("authorization_id")!;
    const { data, error } = await oauth().getAuthorizationDetails(authorizationId);
    if (error) throw new Error(error.message);
    const immediate = data?.redirect_url ?? data?.redirect_to;
    if (immediate && !data?.client) throw redirect({ href: immediate });
    return data ?? null;
  },
  component: Consent,
  errorComponent: ({ error }) => (
    <main className="mx-auto max-w-md px-6 py-24">
      <h1 className="display-xl text-3xl">Authorization unavailable</h1>
      <p className="mt-4 text-sm text-muted-foreground">
        {String((error as Error)?.message ?? error)}
      </p>
    </main>
  ),
});

function Consent() {
  const details = Route.useLoaderData();
  const { authorization_id } = Route.useSearch();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clientName = details?.client?.name ?? details?.client?.client_name ?? "an application";
  const scopes = (details?.scope ?? "").split(" ").filter(Boolean);

  async function decide(approve: boolean) {
    setBusy(true);
    setError(null);
    const { data, error } = approve
      ? await oauth().approveAuthorization(authorization_id)
      : await oauth().denyAuthorization(authorization_id);
    if (error) {
      setBusy(false);
      return setError(error.message);
    }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) {
      setBusy(false);
      return setError("No redirect returned by the authorization server.");
    }
    window.location.href = target;
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-24">
      <div className="label-xs text-subtle">Authorization</div>
      <h1 className="display-xl mt-6 text-3xl md:text-4xl">
        Connect {clientName} to NIZEK Investor Hub
      </h1>
      <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
        {clientName} will be able to call this app&apos;s enabled tools while you are signed in.
      </p>
      {details?.client?.redirect_uri && (
        <p className="mt-3 break-all text-xs text-subtle">
          Redirects to {details.client.redirect_uri}
        </p>
      )}
      {scopes.length > 0 && (
        <ul className="mt-6 space-y-2 text-sm text-foreground">
          {scopes.map((s) => (
            <li key={s} className="border-b border-border pb-2">
              {s === "email"
                ? "Share your email address"
                : s === "profile" || s === "openid"
                  ? "Share your basic profile"
                  : `Additional permission requested: ${s}`}
            </li>
          ))}
        </ul>
      )}
      <p className="mt-6 text-xs text-subtle">
        This does not bypass this app&apos;s permissions or backend policies.
      </p>

      {error && (
        <p role="alert" className="mt-6 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="mt-10 space-y-3">
        <button
          disabled={busy}
          onClick={() => decide(true)}
          className="label-xs w-full border border-foreground bg-foreground px-6 py-4 text-background disabled:opacity-50"
        >
          Approve
        </button>
        <button
          disabled={busy}
          onClick={() => decide(false)}
          className="label-xs w-full border border-border px-6 py-4 text-foreground transition-colors hover:border-foreground disabled:opacity-50"
        >
          Cancel connection
        </button>
      </div>
    </main>
  );
}

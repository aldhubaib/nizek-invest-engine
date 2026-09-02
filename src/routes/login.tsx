import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { lovable } from "@/integrations/lovable/index";

function safeNext(next: string | undefined) {
  if (!next) return "/";
  if (!next.startsWith("/") || next.startsWith("//")) return "/";
  return next;
}

export const Route = createFileRoute("/login")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>) => ({
    next: typeof s["next"] === "string" ? (s["next"] as string) : "",
  }),
  head: () => ({
    meta: [
      { title: "Sign in — NIZEK Investor Hub" },
      { name: "description", content: "Nizek team sign-in for the investor access dashboard." },
      { property: "og:title", content: "Sign in — NIZEK Investor Hub" },
      { property: "og:description", content: "Nizek team sign-in for the investor access dashboard." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Login,
});

function Login() {
  const { next } = Route.useSearch();
  const target = safeNext(next);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onGoogle() {
    setError(null);
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
      extraParams: { prompt: "select_account" },
    });
    if (result.error) {
      setBusy(false);
      return setError(String(result.error));
    }
    if (result.redirected) return;
    window.location.href = target;
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-24">
      <h1 className="display-xl text-4xl">Sign in</h1>
      <p className="mt-4 text-sm text-muted-foreground">
        Nizek team access to the investor dashboard. Use your Nizek Google account.
      </p>

      <button
        type="button"
        onClick={onGoogle}
        disabled={busy}
        className="label-xs mt-10 w-full border border-foreground bg-foreground px-6 py-4 text-background transition-opacity disabled:opacity-50"
      >
        Continue with Google
      </button>

      {error && (
        <p role="alert" className="mt-4 text-sm text-destructive">
          {error}
        </p>
      )}
    </main>
  );
}

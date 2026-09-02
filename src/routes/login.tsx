import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { supabase } from "@/integrations/supabase/client";
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
      { name: "description", content: "Sign in to authorize access to the NIZEK investor platform." },
      { property: "og:title", content: "Sign in — NIZEK Investor Hub" },
      { property: "og:description", content: "Sign in to authorize access to the NIZEK investor platform." },
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
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);
    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setBusy(false);
      if (error) return setError(error.message);
      window.location.href = target;
      return;
    }
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}${target}` },
    });
    setBusy(false);
    if (error) return setError(error.message);
    setNotice("Check your email to confirm your account, then sign in.");
  }

  async function onGoogle() {
    setError(null);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: `${window.location.origin}${target}`,
    });
    if (result.error) return setError(String(result.error));
    if (result.redirected) return;
    window.location.href = target;
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-24">
      <h1 className="display-xl text-4xl">
        {mode === "signin" ? "Sign in" : "Create an account"}
      </h1>
      <p className="mt-4 text-sm text-muted-foreground">
        Access to the NIZEK investor platform and its connected tools.
      </p>

      <form onSubmit={onSubmit} className="mt-10 space-y-4">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full border border-border bg-background px-4 py-3 text-foreground outline-none focus:border-foreground"
        />
        <input
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full border border-border bg-background px-4 py-3 text-foreground outline-none focus:border-foreground"
        />
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
        {notice && <p className="text-sm text-muted-foreground">{notice}</p>}
        <button
          type="submit"
          disabled={busy}
          className="label-xs w-full border border-foreground bg-foreground px-6 py-4 text-background disabled:opacity-50"
        >
          {mode === "signin" ? "Sign in" : "Create account"}
        </button>
      </form>

      <button
        type="button"
        onClick={onGoogle}
        className="label-xs mt-4 w-full border border-border px-6 py-4 text-foreground transition-colors hover:border-foreground"
      >
        Continue with Google
      </button>

      <button
        type="button"
        onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
        className="mt-8 text-sm text-muted-foreground underline underline-offset-4"
      >
        {mode === "signin" ? "Need an account? Create one" : "Already have an account? Sign in"}
      </button>
    </main>
  );
}

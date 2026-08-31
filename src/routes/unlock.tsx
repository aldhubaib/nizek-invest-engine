import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/unlock")({
  validateSearch: (search: Record<string, unknown>): { error?: boolean } =>
    search["error"] === "1" ? { error: true } : {},

  head: () => ({
    meta: [
      { title: "NIZEK — Private Access" },
      { name: "description", content: "This investor platform is private. Enter the access password to continue." },
      { property: "og:title", content: "NIZEK — Private Access" },
      { property: "og:description", content: "Private investor platform. Password required." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Unlock,
});

function Unlock() {
  const { error } = Route.useSearch();

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-6">
      <div className="w-full max-w-md border border-border-strong p-10">
        <div className="label-xs">Private</div>
        <h1 className="display-xl mt-4 text-3xl md:text-4xl">NIZEK Investor Platform</h1>
        <p className="mt-4 text-sm text-muted-foreground">
          Access is restricted. Enter the password you were given.
        </p>
        <form method="post" action="/api/unlock" className="mt-8 space-y-4">
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="Password"
            className="num w-full border border-border bg-transparent px-4 py-3 text-sm text-foreground outline-none focus:border-border-strong"
          />
          {error && <p className="text-xs text-muted-foreground">Incorrect password.</p>}
          <button
            type="submit"
            className="w-full border border-border-strong px-4 py-3 text-sm text-foreground transition-colors hover:bg-foreground hover:text-background"
          >
            Enter
          </button>
        </form>
      </div>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";

import { PresentationPage } from "@/components/site/PresentationPage";
import { InvestorProvider } from "@/lib/investor-context";
import { getInvestorContext } from "@/lib/investor.functions";
import { useEngagement } from "@/hooks/useEngagement";

export const Route = createFileRoute("/presentation")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Your NIZEK investor presentation" },
      {
        name: "description",
        content:
          "A personalized walkthrough of Nizek Venture Studio Fund A — the model, the portfolio and your ownership position.",
      },
      { property: "og:title", content: "Your NIZEK investor presentation" },
      {
        property: "og:description",
        content: "Nizek Venture Studio Fund A — model the outcome of your ownership position.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  loader: async () => await getInvestorContext(),
  component: PersonalizedPresentation,
});

function PersonalizedPresentation() {
  const investor = Route.useLoaderData();
  useEngagement(Boolean(investor));

  return (
    <InvestorProvider investor={investor}>
      {investor ? (
        <div className="border-b border-border bg-foreground px-6 py-3 text-background">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2">
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] opacity-70">
              Private invitation
            </p>
            <p className="text-sm">
              Welcome, <span className="font-medium">{investor.firstName}</span>. This presentation
              was prepared for you.
            </p>
          </div>
        </div>
      ) : null}
      <PresentationPage />
    </InvestorProvider>
  );
}

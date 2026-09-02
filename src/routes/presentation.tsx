import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";

import { PresentationPage } from "@/components/site/PresentationPage";
import { InvestorOnboarding } from "@/components/site/InvestorOnboarding";
import { InvestorProvider } from "@/lib/investor-context";
import { acknowledgeConfidentiality, getInvestorContext } from "@/lib/investor.functions";
import { useEngagement } from "@/hooks/useEngagement";
import { requireSiteAccess } from "@/lib/site-access";


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
  beforeLoad: async ({ location }) => {
    await requireSiteAccess(location.href);
  },
  loader: async () => await getInvestorContext(),
  component: PersonalizedPresentation,
});

function PersonalizedPresentation() {
  const investor = Route.useLoaderData();
  const storageKey = investor ? `nizek-onboarded-${investor.id}` : "";
  const [entered, setEntered] = useState(() => {
    if (typeof window === "undefined" || !storageKey) return false;
    return window.sessionStorage.getItem(storageKey) === "1";
  });
  const showOnboarding = Boolean(investor) && !entered;
  useEngagement(Boolean(investor) && entered);

  function handleEnter() {
    void acknowledgeConfidentiality().catch(() => {
      /* acknowledgment must never block entry */
    });
    if (typeof window !== "undefined" && storageKey) {
      window.sessionStorage.setItem(storageKey, "1");
    }
    setEntered(true);
  }

  return (
    <InvestorProvider investor={investor}>
      {investor ? (
        <div className="border-b border-border px-6 py-2.5">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2">
            <p className="label-xs">Private Investor Presentation</p>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-subtle">
              Prepared for {investor.fullName}
            </p>
          </div>
        </div>
      ) : null}
      <PresentationPage />
      {investor && showOnboarding ? (
        <InvestorOnboarding fullName={investor.fullName} onEnter={handleEnter} />
      ) : null}
    </InvestorProvider>
  );

}

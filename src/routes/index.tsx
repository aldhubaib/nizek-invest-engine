import { createFileRoute } from "@tanstack/react-router";

import { PresentationPage } from "@/components/site/PresentationPage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "We Don't Invest in Startups. We Build Them. — NIZEK" },
      {
        name: "description",
        content:
          "NIZEK is a GCC venture creation platform building ten startups a year. Six ownership seats — model the outcome live.",
      },
      { property: "og:title", content: "We Don't Invest in Startups. We Build Them. — NIZEK" },
      {
        property: "og:description",
        content:
          "Since 2009 NIZEK has built products and teams across the GCC. Now a structured venture creation platform.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PresentationPage,
});

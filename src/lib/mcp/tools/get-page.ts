import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { z } from "zod";

import { buildHomePage } from "../site-content";

const uiSchema = z.object({
  layout: z.string(),
  columns: z.number(),
  hasChart: z.boolean(),
  hasImage: z.boolean(),
  hasInteractiveControl: z.boolean(),
  visible: z.boolean(),
  deviceScope: z.enum(["all", "desktop", "mobile"]),
  theme: z.enum(["light", "dark"]),
});

const sectionSchema = z.object({
  section_id: z.string(),
  section_order: z.number(),
  eyebrow: z.string().nullable(),
  headline: z.string().nullable(),
  subheadline: z.string().nullable(),
  body: z.array(z.string()),
  cards: z.array(
    z.object({
      index: z.string().optional(),
      title: z.string(),
      body: z.string().optional(),
      value: z.string().optional(),
      note: z.string().optional(),
    }),
  ),
  metrics: z.array(
    z.object({ label: z.string(), value: z.string(), note: z.string().optional() }),
  ),
  lists: z.array(z.object({ label: z.string(), items: z.array(z.string()) })),
  tables: z.array(
    z.object({
      label: z.string(),
      columns: z.array(z.string()),
      rows: z.array(z.array(z.string())),
    }),
  ),
  timeline: z.array(
    z.object({ step: z.string(), title: z.string(), note: z.string().optional() }),
  ),
  diagram: z
    .object({
      label: z.string(),
      nodes: z.array(
        z.object({
          label: z.string(),
          value: z.string().optional(),
          note: z.string().optional(),
        }),
      ),
    })
    .nullable(),
  cta: z.array(z.object({ label: z.string(), target: z.string().optional() })),
  faq: z.array(z.object({ question: z.string(), answer: z.string() })),
  ui: uiSchema,
});

export default defineTool({
  name: "get_page",
  title: "Get full page content",
  description:
    "Return the complete current content of the NIZEK investor website in exact display order, section by section: eyebrow, headline, subheadline, body copy, cards, metrics, tables, timelines, diagrams, CTAs, FAQ, team bios, fund structure, equity model, simulator labels and assumptions, benchmark labels, navigation and footer — plus UI metadata per section (layout, column count, chart/image/interactive flags, visibility, device scope). Read-only; intended for a full content audit (repetition, duplicated concepts, weak messaging, ordering, inconsistent investment terms).",
  inputSchema: {
    page: z
      .enum(["home"])
      .describe("Page identifier. The site is a single page: use \"home\"."),
  },
  outputSchema: {
    page: z.string(),
    url: z.string(),
    title: z.string(),
    meta_description: z.string(),
    generated_at: z.string(),
    navigation: z.array(z.string()),
    investment_terms: z.object({
      currency: z.string(),
      totalSeats: z.number(),
      reservedSeats: z.array(z.number()),
      availableSeats: z.number(),
      ownershipPerSeatPercent: z.number(),
      quarterlyCommitmentPerSeat: z.number(),
      annualCommitmentPerSeat: z.number(),
      commitmentYears: z.number(),
      maxCommitmentPerSeat: z.number(),
    }),
    footer: z.object({
      disclaimer: z.string(),
      links: z.array(
        z.object({ group: z.string(), label: z.string(), target: z.string() }),
      ),
    }),
    section_count: z.number(),
    sections: z.array(sectionSchema),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ page }) => {
    if (page !== "home") {
      throw new ToolError(`Unknown page "${page}". Only "home" exists.`);
    }
    const data = await buildHomePage();
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      structuredContent: data,
    };
  },
});

/**
 * Read-only structured snapshot of the live NIZEK investor website (the single
 * page rendered by src/routes/index.tsx plus its section components).
 *
 * The copy here is the actual copy rendered on the site, in display order.
 * Numbers that are derived from the financial model are resolved at call time
 * from src/model/investment.ts so this snapshot never drifts from the app.
 */

export type UiMeta = {
  layout: string;
  columns: number;
  hasChart: boolean;
  hasImage: boolean;
  hasInteractiveControl: boolean;
  visible: boolean;
  deviceScope: "all" | "desktop" | "mobile";
  theme: "light" | "dark";
};

export type Card = {
  index?: string;
  title: string;
  body?: string;
  value?: string;
  note?: string;
};

export type Section = {
  section_id: string;
  section_order: number;
  eyebrow: string | null;
  headline: string | null;
  subheadline: string | null;
  body: string[];
  cards: Card[];
  metrics: { label: string; value: string; note?: string }[];
  lists: { label: string; items: string[] }[];
  tables: { label: string; columns: string[]; rows: string[][] }[];
  timeline: { step: string; title: string; note?: string }[];
  diagram: { label: string; nodes: { label: string; value?: string; note?: string }[] } | null;
  cta: { label: string; target?: string }[];
  faq: { question: string; answer: string }[];
  ui: UiMeta;
};

const ui = (o: Partial<UiMeta> & { layout: string; columns: number }): UiMeta => ({
  hasChart: false,
  hasImage: false,
  hasInteractiveControl: false,
  visible: true,
  deviceScope: "all",
  theme: "light",
  ...o,
});

const empty = {
  body: [] as string[],
  cards: [] as Card[],
  metrics: [] as Section["metrics"],
  lists: [] as Section["lists"],
  tables: [] as Section["tables"],
  timeline: [] as Section["timeline"],
  diagram: null as Section["diagram"],
  cta: [] as Section["cta"],
  faq: [] as Section["faq"],
};

const kd = (v: number) =>
  v >= 1_000_000
    ? `KD${(v / 1_000_000).toFixed(v % 1_000_000 === 0 ? 0 : 1)}M`
    : v >= 1_000
      ? `KD${(v / 1_000).toFixed(v % 1_000 === 0 ? 0 : 1)}K`
      : `KD${v}`;

export async function buildHomePage() {
  const m = await import("@/model/investment");
  const inputs = m.defaultInvestmentInputs;
  const result = m.projectInvestment(inputs);

  const sections: Section[] = [
    {
      ...empty,
      section_id: "hero",
      section_order: 1,
      eyebrow: "NIZEK · Venture creation platform · GCC",
      headline: "We Don't Invest in Startups. We Build Them.",
      subheadline: null,
      body: [
        "Since 2009, Nizek has been building technology companies, products, and engineering teams across the GCC. Today, we are transforming that experience into a structured venture creation platform capable of launching multiple startups every year.",
      ],
      cta: [{ label: "Explore the Investment", target: "#model" }],
      ui: ui({ layout: "hero", columns: 1 }),
    },
    {
      ...empty,
      section_id: "why",
      section_order: 2,
      eyebrow: "01 — Why Nizek",
      headline: "Built to Build. Since 2009.",
      subheadline:
        "Nizek has spent more than seventeen years building technology products, teams and companies across the GCC. The venture studio is not a new capability we are trying to create — it is an operating system built from infrastructure, people and experience that already exist.",
      body: [
        "An investor is not funding Nizek to first assemble a venture studio. The teams, disciplines and operating routines required to create companies are already in place and already in use.",
        "The capital is not being used to discover whether Nizek can build companies. It is being used to apply an existing capability across a larger portfolio.",
        "Track record — real companies built through the Nizek Venture Studio.",
        "Every company shown here is a real venture that has been built or is currently being built through the Nizek Venture Studio.",
        "Our portfolio spans multiple stages — from successful exits and funded companies to ventures currently under construction. We believe investors should evaluate our ability to repeatedly build companies, not just individual success stories.",
      ],
      metrics: [
        { label: "Founded", value: "2009" },
        { label: "Years operating", value: "17+" },
        { label: "Products shipped", value: "120+" },
        { label: "Regional experience", value: "GCC" },
      ],
      cards: [
        {
          title: "Dabdoob",
          index: "Success story",
          body: "One of the GCC's best-known e-commerce platforms. Built with Nizek from its early stages and successfully scaled into a leading regional consumer technology company.",
        },
        {
          title: "Provien",
          index: "Series A",
          body: "Built inside the Nizek Venture Studio. After validation, the company transitioned to its own dedicated engineering team while continuing under Nizek's long-term technical leadership.",
          note: "Series A funding round completed.",
        },
        {
          title: "Ad Space",
          index: "Currently building",
          body: "A regional Digital Out-of-Home advertising platform currently being built inside the Nizek Venture Studio. Time building: 6 months. Indicative value: KD3M.",
          note: "Indicative current company value based on the latest available valuation basis. Not a guaranteed future value.",
        },
        {
          title: "Hazawy",
          index: "Currently building",
          body: "A modern commerce platform currently being built inside the Nizek Venture Studio. Time building: 2 months. Indicative value: KD1.5M.",
          note: "Indicative current company value based on the latest available valuation basis. Not a guaranteed future value.",
        },
      ],

      lists: [
        {
          label: "The infrastructure already exists",
          items: [
            "Product Strategy — What gets built, in what order, and why.",
            "Engineering — Internal teams that build and ship the product.",
            "Product Design — Interfaces customers can actually use.",
            "Technical Leadership — Architecture decisions that hold up as the company scales.",
            "Market Validation — Assumptions tested early to reduce wasted time and capital.",
            "Business Model Design — Pricing, revenue model and long-term sustainability.",
            "Founder Selection — Entrepreneurs evaluated and qualified before a company is built.",
            "Fundraising Readiness — Structure, metrics and documentation for future rounds.",
          ],
        },
      ],


      ui: ui({ layout: "metric-band + card grid", columns: 4 }),
    },
    {
      ...empty,
      section_id: "problem",
      section_order: 3,
      eyebrow: "02 — The problem",
      headline: "Traditional Venture Capital Has One Major Weakness",
      subheadline:
        "VCs invest after founders have already built something. And the hardest part is finding great entrepreneurs in the first place — capital is abundant, exceptional founders are not.",
      body: ["They hope execution improves. We don't."],
      lists: [
        {
          label: "Weaknesses",
          items: [
            "Finding great entrepreneurs",
            "Weak founders",
            "Poor technology",
            "Technical debt",
            "Bad hiring",
            "Weak product strategy",
          ],
        },
      ],
      ui: ui({ layout: "card grid", columns: 3, theme: "dark" }),
    },
    {
      ...empty,
      section_id: "how-we-build",
      section_order: 4,
      eyebrow: "03 — Our model",
      headline: "We Build Companies From Day One",
      subheadline: "Every startup goes through the same repeatable operating system.",
      timeline: [
        "Idea",
        "Validation",
        "Product",
        "Technology",
        "Launch",
        "Growth",
        "Fundraising",
        "Exit",
      ].map((t, i) => ({ step: String(i + 1).padStart(2, "0"), title: t })),
      ui: ui({ layout: "vertical flow stack", columns: 1 }),
    },
    {
      ...empty,
      section_id: "founders",
      section_order: 5,
      eyebrow: "04 — Founder pipeline",
      headline: "We Don't Find Founders. We Qualify Them.",
      subheadline:
        "Venture capital's hardest problem is founder risk: a handful of meetings, then a decade of consequences. Nizek runs a repeatable system for discovering, testing and selecting founders before a single dinar is committed.",
      body: [
        "The problem: Most investors meet entrepreneurs through pitch events, introductions or applications, and must decide after a few conversations. Execution is discovered after the money is gone.",
        "Our solution: Every founder enters the Nizek Founder Residency first — roughly three months building inside one of our existing startups. Only those who prove themselves are offered investment.",
        "The founder is evaluating us at the same time. By the end of the residency, both sides know the answer.",
        "Traditional venture capital invests first and evaluates execution later. Nizek evaluates execution first and invests later.",
        "The result is a continuous pipeline of founders who have already proven they can execute before receiving capital — making the studio repeatable, scalable and far less dependent on luck.",
      ],
      timeline: [
        { step: "01", title: "Applications", note: "Open, continuous inbound from the region's operators." },
        { step: "02", title: "Founder Residency", note: "~3 months building inside a live Nizek startup." },
        { step: "03", title: "Performance Evaluation", note: "Judged on real output, not a pitch deck." },
        { step: "04", title: "Founder Approved", note: "Both sides decide to build a company together." },
        { step: "05", title: "Investment", note: "Capital, equity and platform are committed." },
        { step: "06", title: "Startup Launch", note: "The company enters the annual cohort." },
      ],
      lists: [
        {
          label: "What the residency measures",
          items: [
            "Execution",
            "Leadership",
            "Commitment",
            "Problem solving",
            "Product thinking",
            "Communication",
            "Work under pressure",
            "Cultural fit",
          ],
        },
      ],
      ui: ui({ layout: "two-column + process grid", columns: 3, theme: "dark" }),
    },
    {
      ...empty,
      section_id: "independence",
      section_order: 6,
      eyebrow: "04 — Venture building model",
      headline: "From Idea To Scalable Company.",
      subheadline:
        "Nizek works beside the entrepreneur from problem discovery through product, validation and launch. As the company grows, shared venture-studio resources transition into a dedicated engineering team while Nizek remains the long-term technology and CTO partner.",
      body: [
        "01 — Build together: During the first year, the entrepreneur works directly with Nizek's venture-studio team to understand the problem, validate the opportunity, shape the product and launch the company.",
        "02 — Dedicated capacity: Once the company requires permanent engineering capacity, Nizek hires a dedicated team that works exclusively on that startup. The startup pays the actual engineering team cost plus a 15% Nizek management margin.",
        "03 — Continuous leadership: Nizek continues as the long-term CTO and technology partner, supervising architecture, technical decisions, engineering quality and product technology strategy.",
        "We don't build software and hand it over. We build companies alongside entrepreneurs — and stay behind the technology as they scale.",
      ],
      lists: [
        {
          label: "Year one — what Nizek works on with the entrepreneur",
          items: [
            "Problem validation",
            "Product strategy",
            "Product design",
            "Technology",
            "Market validation",
            "Business model",
            "Launch",
          ],
        },
        {
          label: "Nizek's ongoing responsibility",
          items: [
            "CTO leadership",
            "Technical strategy",
            "Architecture",
            "Engineering standards",
            "Technical supervision",
            "Product and technology direction",
          ],
        },
        {
          label: "Why this matters",
          items: [
            "Venture experience — the entrepreneur does not build the company alone. Nizek brings years of product, technology and company-building knowledge into the earliest decisions.",
            "Dedicated execution — successful companies graduate from shared studio capacity into engineering resources dedicated exclusively to them.",
            "Continuous CTO leadership — founders continue benefiting from experienced technical leadership instead of having to manage engineering alone.",
            "Scalable studio model — shared studio resources return to building new companies while mature ventures fund their own dedicated capacity.",
          ],
        },
      ],
      timeline: [
        { step: "01", title: "Problem" },
        { step: "02", title: "Validation" },
        { step: "03", title: "Product Strategy" },
        { step: "04", title: "Build" },
        { step: "05", title: "Launch" },
        { step: "06", title: "Market Validation" },
        { step: "07", title: "Dedicated Engineering Team", note: "Engineering team cost + 15% management margin" },
        { step: "08", title: "Ongoing Nizek CTO Leadership" },
        { step: "09", title: "Scale" },
      ],
      ui: ui({ layout: "three-column + cycle grid", columns: 4 }),
    },
    {
      ...empty,
      section_id: "equity",
      section_order: 7,
      eyebrow: "06 — Equity model",
      headline: "How Ownership Works",
      subheadline:
        "Investors acquire ownership in Nizek Venture Studio Fund A, which holds equity positions in the portfolio companies created through the Nizek Venture Studio. The ownership structure is intentionally designed to provide diversified exposure through a single investment.",
      body: [
        "The ownership chain: Entrepreneurs → Nizek Venture Studio (builds the company and earns equity) → Nizek Venture Studio Fund A (holds the portfolio equity) → Investors (own units in the Fund).",
        "Equity earned through venture building: founders partner with Nizek to accelerate the creation of their company. The equity reflects the long-term value Nizek creates across the life of the business — long-term company building, not traditional software development.",
        "Protecting long-term ownership: every startup agreement is negotiated individually. Where appropriate, anti-dilution protection is included to help preserve the Fund's ownership as companies raise future investment rounds. The minimum protection target is based on a KD3,000,000 valuation.",
        "Nizek builds companies. The Fund holds the portfolio. Investors participate in the value created.",
      ],
      metrics: [
        { label: "Founder (example startup)", value: "70%" },
        { label: "Fund A position (example startup)", value: "30%" },
        { label: "Investor share of the Fund (1 unit)", value: "5%" },
        { label: "Look-through share of the startup (1 unit)", value: "1.5%" },
        { label: "Minimum protection target", value: "KD3,000,000" },
      ],
      lists: [
        {
          label: "How the model works",
          items: [
            "01 — Entrepreneurs join the Nizek Venture Studio.",
            "02 — Nizek works alongside the founders to validate, build and launch the company.",
            "03 — In exchange for years of venture-building support, Nizek earns an agreed equity position.",
            "04 — That equity becomes part of Nizek Venture Studio Fund A, allowing investors to participate in the portfolio through Fund ownership.",
          ],
        },
        {
          label: "Equity earned through venture building",
          items: [
            "Founder Selection",
            "Problem Discovery",
            "Product Strategy",
            "Market Validation",
            "Product Design",
            "Technology Development",
            "Technical Leadership",
            "Go-To-Market Support",
            "Hiring Support",
            "Long-Term CTO Leadership",
          ],
        },
        {
          label: "Key benefits",
          items: [
            "Diversified Portfolio — one investment provides exposure to multiple venture-backed companies.",
            "Aligned Founders — founders remain highly motivated because they continue owning the majority of their businesses.",
            "Professional Structure — ownership is held through Nizek Venture Studio Fund A using a clear and transparent investment structure.",
            "Long-Term Value Creation — the Fund participates in the value created as portfolio companies grow over time.",
          ],
        },
      ],
      diagram: {
        label: "Ownership chain",
        nodes: [
          { label: "Entrepreneurs", value: "", note: "Founders join the studio to build their company." },
          {
            label: "Nizek Venture Studio",
            value: "30% example position",
            note: "Builds the company and earns equity.",
          },
          {
            label: "Nizek Venture Studio Fund A",
            value: "",
            note: "Holds the portfolio equity.",
          },
          {
            label: "Investors",
            value: "5% per unit",
            note: "Own units in the Fund.",
          },
        ],
      },
      ui: ui({ layout: "ownership chain + step grid + contribution grid + example table + benefit cards", columns: 4, theme: "dark" }),


    },
    {
      ...empty,
      section_id: "track-record",
      section_order: 8,
      eyebrow: "07 — Track record",
      headline: "We've Been Building Since 2009",
      subheadline: null,
      body: [
        "2009 → Today",
        "Proven venture creation experience: teams, technology and go-to-market built in-house rather than outsourced.",
      ],
      metrics: [
        { label: "Continuous operation across the GCC", value: "17+ Years" },
        { label: "Products delivered end to end", value: "Hundreds" },
        { label: "Kuwait, Gulf-wide distribution", value: "GCC Focus" },
        { label: "Part of the success story", value: "Dabdoob" },
      ],
      lists: [
        { label: "Featured companies", items: ["Ad Space", "Hazawy", "Dabdoob", "Others"] },
      ],
      ui: ui({ layout: "metric grid", columns: 4 }),
    },
    {
      ...empty,
      section_id: "team",
      section_order: 9,
      eyebrow: "08 — The people behind the studio",
      headline: "A Venture Studio Is Only As Good As The Team Behind It.",
      subheadline: null,
      body: [
        "Nizek is not an investment fund managed by financiers. It is an operating venture studio built by entrepreneurs, product builders and technology leaders who have spent years designing, developing and scaling technology companies across the GCC.",
        "Our investors are not only investing in startups. They are investing in a proven team with the experience, infrastructure and execution capability required to repeatedly build companies from the ground up.",
        "Why this team: Most investment firms provide capital. We provide the people required to transform ideas into companies.",
        "Capital alone does not build startups. Execution does.",
      ],
      cards: [],
      ui: ui({ layout: "founder profile + leadership grid", columns: 4, hasImage: true }),
    },
    {
      ...empty,
      section_id: "proof",
      section_order: 10,
      eyebrow: "09 — Current proof",
      headline: "Not Theory. Reality.",
      subheadline: null,
      cards: [
        {
          title: "Ad Space",
          value: "KD3M indicative valuation",
          note: "Time to build: 6 months",
          body: "Valuation basis: latest priced round discussions and comparable regional media-tech multiples.",
        },
        {
          title: "Hazawy",
          value: "KD1.5M indicative valuation",
          note: "Time to build: 2 months",
          body: "Valuation basis: internal build cost, traction to date and comparable early-stage GCC rounds.",
        },
      ],
      ui: ui({ layout: "two-card grid", columns: 2, theme: "dark" }),
    },
    {
      ...empty,
      section_id: "diversification",
      section_order: 11,
      eyebrow: "10 — Diversification",
      headline: "One Investment. Fifty Opportunities.",
      subheadline:
        "Backing a single startup is a binary bet: it works, or the capital is gone. Participating across a studio portfolio spreads that same commitment over 50+ companies built on shared infrastructure — no single outcome decides the result.",
      body: ["Diversification reduces dependence on any single company's success."],
      metrics: [
        { label: "One startup", value: "1", note: "company carries the entire outcome" },
        { label: "The Nizek portfolio", value: "50+", note: "companies over five annual cohorts" },
      ],
      lists: [
        {
          label: "One startup",
          items: [
            "A single team, a single market, a single thesis",
            "One wrong hire or one bad quarter ends it",
            "No second attempt with the same capital",
            "Outcome concentrated in one exit event",
          ],
        },
        {
          label: "The Nizek portfolio",
          items: [
            "Ten new companies built every year, across sectors",
            "Failures are absorbed by the portfolio, not fatal to it",
            "Shared engineering, marketing and operations lower the cost of each attempt",
            "Multiple independent paths to a meaningful outcome",
          ],
        },
      ],
      ui: ui({ layout: "comparison columns", columns: 2 }),
    },
    {
      ...empty,
      section_id: "visibility",
      section_order: 12,
      eyebrow: "11 — Early visibility",
      headline: "See Tomorrow's Companies Before Everyone Else.",
      subheadline:
        "Most investors meet a company when it is already raising — the story is polished, the price is set, the seats are taken. Inside the studio, investors see companies from the day they are created, and watch how they actually behave over time.",
      body: [
        "Investors follow these companies throughout the journey rather than discovering them at the moment they raise. This is early visibility and the opportunity to evaluate future investments with far more information than the market has — it is not a guarantee of participation, and it does not create priority or first-refusal rights unless such rights are set out in the legal documents.",
      ],
      timeline: [
        { step: "01", title: "Idea", note: "The thesis is written, the market sized, the first sketch made." },
        { step: "02", title: "Validation", note: "Demand is tested with real users before code is committed." },
        { step: "03", title: "MVP", note: "The in-house team ships the first working product." },
        { step: "04", title: "Traction", note: "Early usage, retention and revenue signals appear." },
        { step: "05", title: "Fundraising", note: "The company approaches the outside market for the first time." },
        { step: "06", title: "Growth", note: "Scale, expansion and the path toward an exit." },
      ],
      ui: ui({ layout: "process grid", columns: 3, theme: "dark" }),
    },
    {
      ...empty,
      section_id: "regional",
      section_order: 13,
      eyebrow: "12 — Regional sourcing",
      headline: "Source Broadly. Select Carefully.",
      subheadline:
        "Nizek sources entrepreneurs and opportunities from across the GCC, giving the venture studio access to a broader pool of founders and ideas. Every opportunity then goes through our structured qualification process before becoming part of the portfolio.",
      body: [
        "Sourcing and selection process: Regional Sourcing → Founder Evaluation → Founder Residency → Investment Decision → Portfolio Company.",
        "The map represents where opportunities are sourced. It does not imply offices or operations in every country.",
        "Investment philosophy: “The hardest asset to find is not capital. It is exceptional entrepreneurs.”",
        "Our regional sourcing network helps us discover more opportunities. Our qualification process determines which founders earn our partnership.",
        "Why this matters: a regional sourcing network gives investors exposure to a far broader and more diversified set of founders than a venture studio limited to a single local market. Selectivity — not volume — determines which of those founders receive Nizek's capital, technology and time.",
        "Our competitive advantage is not simply seeing more founders. It is combining regional sourcing with disciplined founder selection.",
      ],
      cards: [
        {
          index: "01",
          title: "Broader Opportunity Pool",
          body: "Regional sourcing provides access to a wider range of founders, industries and business opportunities than a single local ecosystem.",
        },
        {
          index: "02",
          title: "Better Selection",
          body: "A larger sourcing network allows Nizek to remain highly selective rather than investing simply because opportunities are limited.",
        },
        {
          index: "03",
          title: "Portfolio Diversification",
          body: "Ideas and founders originating from different GCC markets create a healthier and more diversified portfolio.",
        },
        {
          index: "04",
          title: "Disciplined Qualification",
          body: "Every entrepreneur must complete Nizek's qualification process before becoming part of the venture studio.",
        },
      ],
      timeline: [
        { step: "01", title: "Regional Sourcing" },
        { step: "02", title: "Founder Evaluation" },
        { step: "03", title: "Founder Residency" },
        { step: "04", title: "Investment Decision" },
        { step: "05", title: "Portfolio Company" },
      ],
      diagram: {
        label: "Regional sourcing network — animated SVG map of the GCC",
        nodes: [
          { label: "Kuwait" },
          { label: "Saudi Arabia" },
          { label: "Bahrain" },
          { label: "Qatar" },
          { label: "United Arab Emirates" },
          { label: "Oman" },
        ],
      },
      ui: ui({ layout: "process strip + map diagram + card grid", columns: 4, hasImage: true }),


    },
    {
      ...empty,
      section_id: "comparison",
      section_order: 14,
      eyebrow: "13 — Comparison",
      headline: "Why This Is Different",
      subheadline: null,
      lists: [
        {
          label: "Traditional VC",
          items: [
            "Waits for founders",
            "Invests later",
            "Limited influence",
            "Unknown technology",
            "Unknown execution",
          ],
        },
        {
          label: "Nizek",
          items: [
            "Creates founders",
            "Builds technology",
            "Controls execution",
            "Owns infrastructure",
            "Launches repeatedly",
          ],
        },
      ],
      ui: ui({ layout: "comparison columns", columns: 2, theme: "dark" }),
    },
    {
      ...empty,
      section_id: "investors",
      section_order: 15,
      eyebrow: "14 — Investor case",
      headline: "Why Investors Win",
      subheadline: null,
      cards: [
        { title: "Diversification", body: "Exposure to dozens of startups instead of one." },
        { title: "Deal Flow", body: "See opportunities before the market." },
        { title: "Execution", body: "Built by an experienced venture studio." },
        {
          title: "Optional Follow-on",
          body: "Opportunity to participate in future funding rounds, subject to the investment terms.",
        },
      ],
      ui: ui({ layout: "card grid", columns: 2 }),
    },
    {
      ...empty,
      section_id: "investment",
      section_order: 16,
      eyebrow: "15 — The investment",
      headline: "One Investment. Fifty Companies.",
      subheadline: "Instead of investing in one startup, invest in the platform that creates them.",
      body: [
        "Six investors participate in 30% of Nizek's portfolio equity allocation, with each ownership seat representing 5% participation in Nizek's equity position across the portfolio startups.",
        "Not ownership in Nizek.",
      ],
      metrics: [
        {
          label: "Per seat, every 3 months",
          value: kd(m.SEAT_QUARTERLY_COMMITMENT),
          note: "paid quarterly in advance",
        },
        {
          label: "Your commitment (default 2 seats)",
          value: `${kd(result.seats * m.SEAT_QUARTERLY_COMMITMENT)} every 3 months`,
          note: `${result.seats} seats — ${result.ownershipPercent}% participation, paid quarterly in advance`,
        },
        {
          label: "Nizek commits to",
          value: `${inputs.startupsPerYear} startups`,
          note: `every year — minimum ${result.totalStartups}`,
        },
      ],
      ui: ui({ layout: "metric grid", columns: 3, theme: "dark" }),
    },
    {
      ...empty,
      section_id: "ownership",
      section_order: 17,
      eyebrow: "16 — Limited ownership",
      headline: "Only Six Ownership Seats.",
      subheadline: "This investment vehicle is intentionally limited to only six ownership seats.",
      body: [
        `Each seat represents ${m.SEAT_OWNERSHIP}% participation in Nizek's equity position across the portfolio startups — not ownership in Nizek itself. Six seats together represent ${m.TOTAL_SEATS * m.SEAT_OWNERSHIP}%.`,
        `Each ownership seat requires a ${kd(m.SEAT_QUARTERLY_COMMITMENT)} commitment every three months, paid quarterly in advance.`,
        "Once all six seats have been allocated, this investment vehicle will be closed.",
      ],
      metrics: [
        { label: "Total seats", value: String(m.TOTAL_SEATS) },
        { label: "Reserved", value: String(m.RESERVED_SEATS.length) },
        { label: "Remaining", value: String(m.AVAILABLE_SEATS) },
      ],
      tables: [
        {
          label: "Seat grid",
          columns: ["Ownership position", "Status", "Ownership", "Commitment"],
          rows: Array.from({ length: m.TOTAL_SEATS }, (_, i) => {
            const n = i + 1;
            const reserved = m.RESERVED_SEATS.includes(n);
            return [
              m.investorPosition(n),
              reserved ? "Taken" : "Available",
              `${m.SEAT_OWNERSHIP}%`,
              `${kd(m.SEAT_QUARTERLY_COMMITMENT)} / quarter`,
            ];
          }),
        },
      ],
      ui: ui({ layout: "text + seat grid", columns: 6 }),
    },
    {
      ...empty,
      section_id: "capital",
      section_order: 18,
      eyebrow: "17 — Capital deployment",
      headline: "Where The Money Goes",
      subheadline: null,
      body: ["Every dinar creates assets. Not overhead."],
      lists: [
        { label: "Allocation", items: ["Developers", "Marketing", "Operations", "Ecosystem"] },
      ],
      ui: ui({ layout: "card strip", columns: 4, theme: "dark" }),
    },
    {
      ...empty,
      section_id: "lifecycle",
      section_order: 19,
      eyebrow: "07 — Fund structure",
      headline: "One Fund. One Portfolio. One Ownership Structure.",
      subheadline:
        "Nizek Venture Studio Fund A is designed as a single investment vehicle that holds the equity positions created across the venture portfolio. As new companies are added, investor ownership remains consolidated through the same Fund structure.",
      body: [
        "Investors hold one position in Fund A. Fund A holds the underlying portfolio. As the portfolio grows, that ownership position stays the same.",
        "Nizek Venture Studio Fund A is being structured through Abu Dhabi, UAE.",
        "One investment vehicle. A growing portfolio of companies. One clear ownership position.",
      ],
      diagram: {
        label: "Structure",
        nodes: [
          { label: "Investors", note: "Investor A, B, C, D, E, F" },
          { label: "Nizek Venture Studio Fund A", note: "Abu Dhabi, UAE" },
          {
            label: "Portfolio companies",
            note: "Startup 01 through Startup 50 — every company created through the venture studio is held inside Fund A.",
          },
        ],
      },
      cards: [
        {
          index: "01",
          title: "One Ownership Position",
          body: "Investors hold one ownership position in Fund A rather than maintaining separate holdings across every portfolio company.",
        },
        {
          index: "02",
          title: "Centralized Portfolio",
          body: "The equity positions created through the venture studio are held within one investment vehicle.",
        },
        {
          index: "03",
          title: "Scalable Structure",
          body: "New portfolio companies can be added to Fund A while investor ownership remains consolidated through the same structure.",
        },
      ],
      ui: ui({ layout: "fund diagram + benefit cards", columns: 3 }),

    },
    {
      ...empty,
      section_id: "model",
      section_order: 20,
      eyebrow: "19 — The investment simulator",
      headline: "If Nizek builds successful companies, what could your investment become?",
      subheadline:
        "Ten new startups every year, five cohorts. Portfolio value is the sum of the expected exit valuations of the winners. Move the assumptions and it re-prices instantly.",
      body: [
        "Allocation interface — Secure your position in the Nizek ecosystem.",
        `Each seat is ${m.SEAT_OWNERSHIP}% participation in Nizek's equity position across the portfolio startups, for ${kd(m.SEAT_QUARTERLY_COMMITMENT)} every three months paid in advance. Everything below updates instantly.`,
        "Live — pool allocation active.",
        "How the portfolio is built, one cohort at a time: Every year new capital is drawn and a new cohort of startups is created. Most fail; a few reach an exit. Each cohort is valued at the expected exit valuation of its winners — earlier cohorts carry higher expected exits because they have had more time to mature.",
      ],
      cta: [{ label: "Show assumptions" }, { label: "Close" }, { label: "Reset" }],
      metrics: [
        { label: "Seats selected", value: String(result.seats) },
        { label: "Participation", value: `${result.ownershipPercent.toFixed(1)}%` },
        { label: "Quarterly commitment", value: kd(result.annualCommitment / 4) },
        { label: "Estimated portfolio value", value: kd(result.portfolioValue) },
        { label: "Estimated investor value", value: kd(result.investorValue) },
        { label: "Multiple", value: `${result.moic.toFixed(2)}x` },
        {
          label: "Estimated value",
          value: kd(result.investorValue),
          note: "Your share of Nizek's equity in the successful companies",
        },
        {
          label: "Estimated profit",
          value: kd(result.investorProfit),
          note: "Value created above the capital you committed",
        },
        {
          label: "Return",
          value: `${result.moic.toFixed(2)}x`,
          note: "What every dinar comes back as",
        },
        {
          label: "Nizek ownership",
          value: kd(result.nizekEquityValue),
          note: `${inputs.avgNizekOwnership}% average equity across the successful companies.`,
        },
        {
          label: "Investor share",
          value: kd(result.investorValue),
          note: `${result.ownershipPercent}% participation in Nizek's equity position — ${result.seats} seats × ${m.SEAT_OWNERSHIP}%.`,
        },
        {
          label: "Estimated return",
          value: `${result.moic.toFixed(2)}x`,
          note: `On ${kd(result.annualCommitment / 4)} called every three months, paid quarterly in advance.`,
        },
      ],
      tables: [
        {
          label: "Cohorts (default assumptions)",
          columns: ["Year", "Invested", "Successes", "EEV (estimated enterprise value)", "Nizek equity", "Investor equity"],
          rows: result.cohorts.map((c) => [
            `Year ${c.year}`,
            `${kd(c.capitalInvested / 4)} / quarter`,
            String(c.successes),
            c.exitValues.length > 1
              ? `${c.exitValues.map((v) => kd(v).replace("KD", "")).join(" + ")} = ${kd(c.portfolioValue).replace("KD", "")}`
              : kd(c.portfolioValue),
            kd(c.nizekEquityValue),
            kd(c.investorValue),
          ]),
        },
        {
          label: "Assumption controls",
          columns: ["Group", "Label", "Min", "Max", "Step", "Unit", "Help", "Default"],
          rows: m.investmentControls.map((c) => [
            c.group,
            c.label,
            String(c.min),
            String(c.max),
            String(c.step),
            c.unit,
            c.help,
            String(inputs[c.key]),
          ]),
        },
        {
          label: "Per-cohort assumption controls",
          columns: ["Cohort", "Successes (default)", "Estimated enterprise values (default)", "Help"],
          rows: m.cohortExitControls.map((c) => [
            c.label,
            String(inputs.successesByYear[c.index] ?? 0),
            (inputs.exitValuesByYear[c.index] ?? []).map(kd).join(", "),
            c.help,
          ]),
        },
        {
          label: "Benchmarks",
          columns: ["Benchmark", "Assumed annual return", "Final value", "Profit"],
          rows: [
            [
              "Real estate",
              `${inputs.realEstateYield}%`,
              kd(result.realEstate.finalValue),
              kd(result.realEstate.profit),
            ],
            [
              "Public market",
              `${inputs.publicMarketReturn}%`,
              kd(result.publicMarket.finalValue),
              kd(result.publicMarket.profit),
            ],
          ],
        },
      ],
      timeline: [
        { step: "01", title: "Portfolio value", note: `${result.totalSuccesses} winners out of ${result.totalStartups} startups, each valued at its expected exit valuation.` },
        { step: "02", title: "Nizek ownership", note: `${inputs.avgNizekOwnership}% average equity across the successful companies.` },
        { step: "03", title: "Investor share", note: `${result.ownershipPercent}% participation in Nizek's equity position.` },
        { step: "04", title: "Estimated return", note: `On ${kd(result.annualCommitment / 4)} called every three months, paid quarterly in advance.` },
      ],
      ui: ui({
        layout: "interactive simulator — seat selector, metrics matrix, cohort table, funnel",
        columns: 6,
        hasChart: true,
        hasInteractiveControl: true,
      }),
    },
    {
      ...empty,
      section_id: "timeline",
      section_order: 21,
      eyebrow: "20 — Timeline",
      headline: "Fifty Companies In Five Years",
      subheadline: null,
      body: ["Then the portfolio continues to mature well beyond the commitment window."],
      metrics: [
        { label: "Year 1", value: "10 startups" },
        { label: "Year 2", value: "20 startups" },
        { label: "Year 3", value: "30 startups" },
        { label: "Year 4", value: "40 startups" },
        { label: "Year 5", value: "50+ startups" },
      ],
      ui: ui({ layout: "timeline strip", columns: 5, theme: "dark" }),
    },
    {
      ...empty,
      section_id: "reserve",
      section_order: 22,
      eyebrow: "21 — Reserve your seat",
      headline: "Choose Your Allocation.",
      subheadline:
        "The Nizek Venture Fund is limited to six ownership seats. Select the number of seats you are interested in and submit your details. Our team will contact you to discuss the allocation, legal structure, and next steps.",
      body: [
        `Each seat represents ${m.SEAT_OWNERSHIP}% participation in Nizek's equity position across the portfolio startups, at ${kd(m.SEAT_QUARTERLY_COMMITMENT)} every three months, paid quarterly in advance.`,
        "Important: Submitting this form is an expression of interest only.",
        "It does not constitute a binding investment commitment or guarantee seat availability.",
        "Final allocation is subject to confirmation, due diligence, legal documentation, and availability.",
        "Success state — Request received: Thank You For Your Interest In The Nizek Venture Fund. Your seat request has been received and our team will contact you shortly to discuss allocation and next steps.",
      ],
      metrics: [
        { label: "Seats selected", value: "01 (default)" },
        { label: "Participation", value: `${m.SEAT_OWNERSHIP}% per seat` },
        { label: "Quarterly commitment", value: `${kd(m.SEAT_QUARTERLY_COMMITMENT)} per seat, every 3 months` },
        { label: "Payment schedule", value: "Paid quarterly in advance" },
      ],
      lists: [
        {
          label: "Form fields",
          items: [
            "Full name (required)",
            "Company / family office",
            "Email (required)",
            "Phone number (required)",
            "Number of seats",
            "Message (optional)",
          ],
        },
      ],
      cta: [{ label: "Request allocation" }, { label: "Sending…" }],
      ui: ui({
        layout: "seat selector + form",
        columns: 6,
        hasInteractiveControl: true,
        theme: "dark",
      }),
    },
    {
      ...empty,
      section_id: "contact",
      section_order: 23,
      eyebrow: null,
      headline: "We Didn't Build One Startup. We Built The Machine That Builds Them.",
      subheadline: null,
      body: [
        "If you're looking to invest in one company… this isn't for you.",
        "If you're looking to participate in the creation of the next generation of GCC technology companies… let's talk.",
      ],
      cta: [{ label: "investors@nizek.com", target: "mailto:investors@nizek.com" }],
      ui: ui({ layout: "closing statement", columns: 2 }),
    },
  ];

  const team = await import("@/data/team");
  const teamSection = sections.find((s) => s.section_id === "team")!;
  teamSection.cards = [
    {
      title: team.founder.name,
      note: team.founder.role,
      body: team.founderBio.join(" "),
    },
    ...team.team.map((t) => ({ title: t.name, note: t.role, body: t.bio })),
  ];

  return {
    page: "home",
    url: "/",
    title: "We Don't Invest in Startups. We Build Them. — NIZEK",
    meta_description:
      "NIZEK is a GCC venture creation platform building 10 startups a year. One commitment, fifty companies — model the returns live.",
    generated_at: new Date().toISOString(),
    navigation: [
      "Why",
      "Problem",
      "Model",
      "Founders",
      "Equity",
      "Track record",
      "Team",
      "Regional",
      "Investment",
      "Seats",
      "Fund",
      "Simulator",
      "Timeline",
      "Reserve",
      "Contact",
    ],
    investment_terms: {
      currency: "KD",
      totalSeats: m.TOTAL_SEATS,
      reservedSeats: m.RESERVED_SEATS,
      availableSeats: m.AVAILABLE_SEATS,
      ownershipPerSeatPercent: m.SEAT_OWNERSHIP,
      quarterlyCommitmentPerSeat: m.SEAT_QUARTERLY_COMMITMENT,
      annualCommitmentPerSeat: m.SEAT_ANNUAL_COMMITMENT,
      commitmentYears: m.COMMITMENT_YEARS,
      maxCommitmentPerSeat: m.SEAT_MAX_COMMITMENT,
    },
    footer: {
      disclaimer:
        "All figures on this platform are generated live from a single financial model. Illustrative only; not an offer to sell securities.",
      links: [
        { group: "Platform", label: "Model", target: "#how-we-build" },
        { group: "Platform", label: "Simulator", target: "#model" },
        { group: "Platform", label: "Timeline", target: "#timeline" },
        { group: "Contact", label: "investors@nizek.com", target: "mailto:investors@nizek.com" },
      ],
    },
    section_count: sections.length,
    sections,
  };
}

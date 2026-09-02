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
      eyebrow: "05 — Operating model",
      headline: "From Building To Independence",
      subheadline:
        "NIZEK does not permanently support every startup with its internal team. We provide the technology, product development and engineering needed to launch and validate the business in its first year — then hand it over.",
      body: [
        "Every startup accepted into the NIZEK Venture Studio receives a full product and engineering organisation from day one, in exchange for an agreed equity stake.",
        "Founders focus on building the business, acquiring customers and validating the market — not on hiring and managing an engineering team from day one.",
        "Building an Internal Team. At the end of the first year, the startup begins building its own internal technology team. Rather than replacing Nizek, the company transitions from shared venture-building resources to a dedicated team working exclusively for the startup. Nizek remains the long-term technology partner providing CTO leadership, technical supervision, architecture oversight, engineering standards and strategic product guidance. The startup pays only the actual cost of the dedicated engineering team plus a fixed 15% management margin.",
        "The engineering team gradually moves from NIZEK to the startup, freeing NIZEK to redirect its resources toward building the next generation of companies.",
        "Engineering Capacity Is Recycled, Not Consumed. Instead of permanently allocating developers to mature companies, capacity returns to the studio and is reinvested into new ventures. That is what makes the program repeatable, scalable and capital efficient.",
        "NIZEK's goal is not to become a startup's long-term software company. Our goal is to launch it, validate it and prepare it to stand on its own — so the studio can keep creating new companies without increasing operational complexity.",
      ],
      lists: [
        {
          label: "What the studio provides",
          items: [
            "Product Strategy",
            "UI/UX Design",
            "Software Development",
            "Technical Leadership",
            "Product Management",
            "Infrastructure & DevOps",
            "Technical Support",
          ],
        },
        { label: "Why this matters", items: ["Repeatable", "Scalable", "Capital efficient"] },
      ],
      timeline: [
        { step: "01", title: "Startup Accepted", note: "Into the venture studio" },
        { step: "02", title: "NIZEK Builds Product", note: "Year 1" },
        { step: "03", title: "Market Validation", note: "Customers, traction, proof" },
        { step: "04", title: "Startup Hires Internal Team", note: "Its own engineers" },
        { step: "05", title: "Dedicated Internal Team", note: "Shared studio team to dedicated team, with ongoing Nizek technical leadership" },
        { step: "06", title: "Independent Company", note: "Technically self-sufficient" },
        { step: "07", title: "NIZEK Builds The Next Startup", note: "Capacity recycled" },
        { step: "08", title: "Repeat", note: "The loop closes" },
      ],
      ui: ui({ layout: "three-column + cycle grid", columns: 4 }),
    },
    {
      ...empty,
      section_id: "equity",
      section_order: 7,
      eyebrow: "06 — Our equity model",
      headline: "We Earn Equity By Building Companies, Not By Funding Them.",
      subheadline:
        "Nizek does not simply invest cash. We become an active venture-building partner. In exchange for creating and launching each company, Nizek receives an equity position — typically between 20% and 30% — depending on the opportunity, complexity and level of involvement.",
      body: [
        "Instead of charging startups significant cash fees in their earliest stages, we align our success with the founder by taking equity.",
        "If the company succeeds, both the founder and Nizek succeed together. The studio is paid in ownership, not invoices — which keeps early capital inside the business and keeps our incentives identical to the founder's.",
        "Equity protection — Protecting Long-Term Ownership: Every startup has its own investment agreement. To protect the long-term value created by the venture studio, Nizek negotiates customised anti-dilution provisions for each company. The exact terms vary depending on the startup, the funding strategy and future investors.",
        "Ownership protected until approximately KD3,000,000 company valuation — preserving meaningful ownership through the earliest funding rounds while still allowing startups to raise the capital they need to grow.",
        "Investor alignment — Investor Ownership Comes From Nizek's Equity: The investment fund does not receive ownership directly from founders. Instead, investors participate in Nizek's equity position.",
        "Founder ownership is not reduced by the investor's participation. The investor's interest comes entirely from Nizek's allocation.",
        "Founders remain the majority owners. Nizek earns equity by creating companies. Investors participate through Nizek's ownership — not by reducing the founder's equity beyond the agreed venture studio allocation.",
      ],
      metrics: [
        { label: "Typical studio equity", value: "20–30%" },
        { label: "Founder retains", value: "70–80%" },
        { label: "Ownership protected until approximately", value: "KD3,000,000" },
        { label: "Founder (illustration)", value: "75%" },
        { label: "Nizek (illustration)", value: "25%" },
        { label: "Investor participation in Nizek's position (illustration)", value: "25%" },
        { label: "Effective ownership in startup (illustration)", value: "6.25%" },
      ],
      lists: [
        {
          label: "Nizek's contribution",
          items: [
            "Product Strategy",
            "Technology Development",
            "UI / UX Design",
            "Technical Leadership",
            "Product Management",
            "Infrastructure",
            "Founder Support",
            "Operational Execution",
          ],
        },
      ],
      diagram: {
        label: "Ownership flow (illustration only)",
        nodes: [
          { label: "Founder", value: "70–80%", note: "Remains the majority owner." },
          {
            label: "Nizek",
            value: "20–30%",
            note: "Earned by creating, building and launching the company.",
          },
          {
            label: "Investor",
            value: "% of Nizek",
            note: "Participates in Nizek's equity position across the portfolio startups — never the founder's, and never Nizek itself.",
          },
        ],
      },
      ui: ui({ layout: "columns + vertical flow diagram", columns: 3, theme: "dark" }),
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
      eyebrow: "12 — Regional first",
      headline: "Built for the GCC. Designed to Scale Beyond Borders.",
      subheadline:
        "Nizek does not build companies for a single city or a single country. Every venture is designed from day one with regional expansion in mind.",
      body: [
        "Our experience across the GCC allows us to identify opportunities that can be replicated across multiple markets instead of relying on the limited size of any single economy.",
        "By focusing on regional opportunities, startups have access to significantly larger customer bases, stronger revenue potential and greater long-term valuations.",
        "This creates a larger addressable market and increases the probability of building companies with regional relevance.",
        "Instead of asking “Can this succeed in Kuwait?” we ask “Can this become a regional company?”",
        "Only ideas capable of expanding across multiple GCC markets are selected for venture creation.",
        "Our ambition is not to create Kuwait startups. Our ambition is to build regional technology companies that can scale across the GCC and beyond.",
      ],
      cards: [
        {
          index: "01",
          title: "Larger Markets",
          body: "Every company is designed to reach millions of customers across the GCC rather than serving a single local market.",
        },
        {
          index: "02",
          title: "Higher Valuations",
          body: "Regional businesses generally attract higher valuations than businesses operating in only one country.",
        },
        {
          index: "03",
          title: "Faster Expansion",
          body: "Products are built with regional infrastructure, localization and scalability from the beginning.",
        },
        {
          index: "04",
          title: "Diversified Revenue",
          body: "Revenue generated across multiple countries reduces dependence on a single economy.",
        },
      ],
      diagram: {
        label: "Gulf Cooperation Council — animated SVG map with expansion routes",
        nodes: [
          { label: "Kuwait" },
          { label: "Saudi Arabia" },
          { label: "Bahrain" },
          { label: "Qatar" },
          { label: "United Arab Emirates" },
          { label: "Oman" },
        ],
      },
      ui: ui({ layout: "text + map diagram + card grid", columns: 4, hasImage: true }),
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
          columns: ["Seat", "Status", "Ownership", "Commitment"],
          rows: Array.from({ length: m.TOTAL_SEATS }, (_, i) => {
            const n = i + 1;
            const reserved = m.RESERVED_SEATS.includes(n);
            return [
              `Seat ${String(n).padStart(2, "0")}`,
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
      eyebrow: "18 — Institutional Fund Structure",
      headline: "One Fund. Fifty Companies. One Ownership Structure.",
      subheadline:
        "To provide investors with a simple, transparent and scalable ownership model, all investments are made through a dedicated investment fund established in Abu Dhabi, UAE.",
      body: [
        "Instead of investors owning shares directly in dozens of different startups, each investor owns a percentage of the investment fund.",
        "As new startups are created, every investment agreement is signed by the fund, making the fund the legal shareholder of every portfolio company.",
        "One ownership vehicle that grows over time, while the legal structure stays simple for investors.",
      ],
      diagram: {
        label: "Ownership structure",
        nodes: [
          { label: "Investors", note: "Investor A, B, C, D, E, F" },
          { label: "NIZEK Venture Fund", note: "Abu Dhabi, UAE" },
          { label: "Startups", note: "Startup 01 … Startup 50+" },
        ],
      },
      timeline: [
        { step: "01", title: "Investors subscribe to ownership units in the NIZEK Venture Fund." },
        { step: "02", title: "The fund commits capital over five years." },
        { step: "03", title: "Every startup investment agreement is executed directly by the fund." },
        { step: "04", title: "The fund becomes the shareholder of each startup." },
        { step: "05", title: "As more startups are created, the value of the fund's portfolio grows." },
      ],
      cards: [
        {
          index: "01",
          title: "Simple Ownership",
          body: "Investors own one fund instead of managing ownership in dozens of separate companies.",
        },
        {
          index: "02",
          title: "Centralized Portfolio",
          body: "Every startup becomes part of one professionally managed investment vehicle.",
        },
        {
          index: "03",
          title: "Scalable Structure",
          body: "New startups are automatically added to the fund without changing the ownership structure.",
        },
        {
          index: "04",
          title: "Aligned Interests",
          body: "All investors participate in the performance of the same diversified portfolio.",
        },
      ],
      ui: ui({ layout: "text + fund diagram + steps + benefit cards", columns: 4 }),
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

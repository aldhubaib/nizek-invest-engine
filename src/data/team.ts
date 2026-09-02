import founderPhoto from "@/assets/abdulaziz-aldhubaib.png.asset.json";

export type TeamMember = {
  name: string;
  role: string;
  bio: string;
  /** Why this person matters to the Fund — shown above the bio. */
  responsibility?: string;
  /** Absolute or imported image URL. Leave empty to render the monogram frame. */
  photo?: string;
  linkedin?: string;
};

/** Founding partner — centerpiece of the section. */
export const founder: TeamMember = {
  name: "Abdulaziz Al-Dhubaib",
  role: "Founder & Managing Partner",
  photo: founderPhoto.url,
  linkedin: "",
  bio: "Abdulaziz has been building technology companies since 2009.",
};

/** Founder's role inside the venture studio — responsibilities, not a biography. */
export const founderRole: string[] = [
  "Identifies high-potential founders",
  "Shapes venture strategy",
  "Oversees product direction",
  "Leads technology decisions",
  "Guides company building",
  "Works directly with founders throughout the venture lifecycle",
  "Responsible for portfolio quality",
];

export const founderSummary =
  "Abdulaziz leads the venture studio end to end — selecting the founders Nizek partners with, setting the strategy for each venture, and staying involved in product and technology decisions from first build through scale.";

/** Venture studio leadership — real roles only. */
export const team: TeamMember[] = [
  {
    name: "Product Lead",
    role: "Product Lead",
    responsibility: "Product Strategy & Delivery",
    bio: "Translates validated problems into product strategy, roadmaps and shipped software across the portfolio.",
    photo: "",
    linkedin: "",
  },
  {
    name: "Public Relations",
    role: "Public Relations",
    responsibility: "Reputation & Media",
    bio: "Builds the public narrative for each venture and manages media relationships across the GCC.",
    photo: "",
    linkedin: "",
  },
  {
    name: "Marketing",
    role: "Marketing",
    responsibility: "Brand & Go-To-Market",
    bio: "Owns brand positioning and the go-to-market motion applied to every company the studio launches.",
    photo: "",
    linkedin: "",
  },
];

/** Capabilities every venture receives from the studio. */
export const ventureCapabilities: string[] = [
  "Product Strategy",
  "Technology Leadership",
  "Technical Architecture",
  "Product Design",
  "Brand Strategy",
  "Public Relations",
  "Go-To-Market Validation",
  "AI & Automation",
  "Founder Support",
  "Hiring Support",
  "Operational Guidance",
];

/** Track record — editable values. */
export const trackRecord: { label: string; value: string; note?: string }[] = [
  { label: "Founded", value: "2009" },
  { label: "Years building products", value: "16+" },
  { label: "Technology products delivered", value: "120+", note: "Editable" },
  { label: "Portfolio companies", value: "6", note: "Editable" },
  { label: "Largest startup exit", value: "KD30M", note: "Dabdoob" },
];

/** Current portfolio — add more dynamically. */
export const currentPortfolio: string[] = ["Ad Space", "Hazawy"];

export const advantages: { index: string; title: string; note: string }[] = [
  { index: "01", title: "Product Strategy", note: "Problem validation, positioning and roadmap before a line of code." },
  { index: "02", title: "Technology Development", note: "In-house engineering teams that ship production software." },
  { index: "03", title: "UI / UX Design", note: "One design standard applied across every company built." },
  { index: "04", title: "Growth & Marketing", note: "Acquisition, brand and revenue systems from day one." },
  { index: "05", title: "Founder Development", note: "Operators coached into owners who can run the company." },
  { index: "06", title: "Operational Execution", note: "Finance, legal, hiring and process handled centrally." },
];

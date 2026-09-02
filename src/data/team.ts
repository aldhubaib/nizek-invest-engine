import founderPhoto from "@/assets/abdulaziz-aldhubaib.png.asset.json";

export type TeamMember = {
  name: string;
  role: string;
  bio: string;
  /** Absolute or imported image URL. Leave empty to render the monogram frame. */
  photo?: string;
  linkedin?: string;
};

/** Founding partner — centerpiece of the section. */
export const founder: TeamMember = {
  name: "Abdulaziz Al-Dhubaib",
  role: "Founder & CEO",
  photo: founderPhoto.url,
  linkedin: "",
  bio: "Abdulaziz has been building technology companies since 2009.",
};

export const founderBio: string[] = [
  "Abdulaziz has been building technology companies since 2009.",
  "Over the past decade he has led the development of products across multiple industries, helping founders transform ideas into scalable businesses.",
  "His work has contributed to some of the GCC's most successful technology ventures, including Dabdoob, one of the region's largest startup exits.",
  "Rather than investing only capital, Abdulaziz has built a venture creation system that combines product strategy, software engineering, operational execution and founder development into one repeatable model.",
  "His vision is to build the leading venture studio in the GCC by creating dozens of technology companies over the coming years.",
];

/** Leadership team — add unlimited members; the grid scales automatically. */
export const team: TeamMember[] = [
  {
    name: "Team Member",
    role: "Chief Technology Officer",
    bio: "Leads engineering across the studio portfolio, from architecture to delivery.",
    photo: "",
    linkedin: "",
  },
  {
    name: "Team Member",
    role: "Head of Product",
    bio: "Turns validated problems into product strategy, roadmaps and shipped software.",
    photo: "",
    linkedin: "",
  },
  {
    name: "Team Member",
    role: "Head of Design",
    bio: "Owns the UI/UX standard applied to every company the studio builds.",
    photo: "",
    linkedin: "",
  },
  {
    name: "Team Member",
    role: "Head of Growth",
    bio: "Builds acquisition, brand and revenue engines for each new venture.",
    photo: "",
    linkedin: "",
  },
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

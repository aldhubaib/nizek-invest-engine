import { Reveal, Section, SectionHeading } from "@/components/ui/primitives";
import {
  founder,
  founderRole,
  founderSummary,
  ventureCapabilities,
  type TeamMember,
} from "@/data/team";

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function Portrait({ member, className }: { member: TeamMember; className?: string }) {
  return (
    <div className={`relative aspect-[3/4] w-full overflow-hidden border border-border ${className ?? ""}`}>
      {member.photo ? (
        <img
          src={member.photo}
          alt={`${member.name}, ${member.role}`}
          loading="lazy"
          className="h-full w-full object-cover grayscale transition-transform duration-700 hover:scale-[1.03]"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-muted/20">
          <span className="display-xl text-4xl text-subtle md:text-5xl">{initials(member.name)}</span>
        </div>
      )}
    </div>
  );
}

export function TeamSection() {
  return (
    <Section id="team">
      <SectionHeading
        index="11 — The team"
        title="The Leadership Behind The Venture Studio."
        lede="Nizek Venture Studio is led by operators who build companies, not by an organisational chart. Leadership sets the direction; a shared capability set is applied to every venture in the portfolio."
      />

      {/* Part 1 — Founder & Managing Partner */}
      <Reveal delay={80}>
        <div className="grid grid-cols-1 gap-px border border-border bg-border lg:grid-cols-[minmax(0,440px)_1fr]">
          <div className="bg-background p-6 md:p-8">
            <Portrait member={founder} />
          </div>
          <div className="flex flex-col justify-center bg-background p-10 md:p-14">
            <div className="label-xs">Founder &amp; Managing Partner</div>
            <h3 className="display-xl mt-6 text-4xl md:text-6xl">{founder.name}</h3>
            <div className="mt-4 text-sm text-muted-foreground">{founder.role}</div>
            <p className="mt-8 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {founderSummary}
            </p>

            <div className="mt-10 border-t border-border pt-8">
              <div className="label-xs text-subtle">Role inside the venture studio</div>
              <ul className="mt-6 grid grid-cols-1 gap-x-10 gap-y-4 sm:grid-cols-2">
                {founderRole.map((item) => (
                  <li key={item} className="flex gap-4 text-sm leading-relaxed text-foreground">
                    <span className="num text-[11px] text-subtle">—</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {founder.linkedin && (
              <a
                href={founder.linkedin}
                target="_blank"
                rel="noreferrer noopener"
                className="label-xs mt-10 inline-flex w-fit border border-border-strong px-5 py-3 transition-colors hover:bg-foreground hover:text-background"
              >
                LinkedIn
              </a>
            )}
          </div>
        </div>
      </Reveal>




      {/* Part 3 — Shared venture studio capabilities */}
      <Reveal delay={180}>
        <div className="mt-24">
          <div className="label-xs mb-8">Shared Venture Studio Capabilities</div>
          <h3 className="display-xl max-w-3xl text-3xl leading-[1.15] md:text-5xl">
            Every Venture Receives
          </h3>
          <div className="mt-10 grid grid-cols-2 gap-px border border-border bg-border sm:grid-cols-3 lg:grid-cols-4">
            {ventureCapabilities.map((c, i) => (
              <div key={c} className="bg-background px-6 py-8">
                <div className="num text-[11px] text-subtle">{String(i + 1).padStart(2, "0")}</div>
                <div className="mt-3 text-sm text-foreground">{c}</div>
              </div>
            ))}
            <div className="bg-background px-6 py-8">
              <p className="text-sm leading-relaxed text-muted-foreground">
                Applied by the same studio team to every company in the portfolio.
              </p>
            </div>
          </div>
        </div>
      </Reveal>

      {/* Investor message */}
      <Reveal delay={200}>
        <div className="mt-24 border border-border p-10 md:p-20">
          <p className="display-xl max-w-4xl text-2xl leading-[1.2] md:text-4xl">
            A venture studio is defined by its ability to repeatedly build companies—not by the
            number of people on its organisational chart.
          </p>
        </div>
      </Reveal>

      {/* Closing */}
      <Reveal delay={220}>
        <div className="mt-px border border-border border-t-0 p-10 md:p-20">
          <p className="display-xl max-w-4xl text-2xl leading-[1.2] md:text-4xl">
            The same leadership team, systems and operating experience are applied across every
            company inside the portfolio.
          </p>
        </div>
      </Reveal>
    </Section>
  );
}

import { Reveal, Section, SectionHeading } from "@/components/ui/primitives";
import {
  founder,
  founderFocus,
  team,
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
          <span className="display-xl text-5xl text-subtle md:text-7xl">{initials(member.name)}</span>
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
        title="The People Behind The Building."
        lede="Nizek Venture Studio is operated by entrepreneurs, product builders and technology leaders with hands-on experience turning ideas into operating companies."
      />

      {/* Founder — visual anchor */}
      <Reveal delay={80}>
        <div className="grid grid-cols-1 gap-px border border-border bg-border lg:grid-cols-[minmax(0,420px)_1fr]">
          <div className="bg-background p-6">
            <Portrait member={founder} />
          </div>
          <div className="flex flex-col justify-center bg-background p-10 md:p-14">
            <div className="label-xs">Founder</div>
            <h3 className="display-xl mt-6 text-4xl md:text-6xl">{founder.name}</h3>
            <div className="mt-4 text-sm text-muted-foreground">{founder.role}</div>

            <div className="mt-10 grid grid-cols-1 gap-px border border-border bg-border sm:grid-cols-2">
              {founderFocus.map((f) => (
                <div key={f.title} className="bg-background p-6">
                  <div className="num text-[11px] text-subtle">{f.index}</div>
                  <div className="label-xs mt-3">{f.title}</div>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{f.note}</p>
                </div>
              ))}
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

      {/* Leadership team */}
      <Reveal delay={140}>
        <div className="mt-24">
          <div className="label-xs mb-8">Leadership team</div>
          <div className="grid grid-cols-1 gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
            {team.map((m, i) => (
              <div key={`${m.name}-${i}`} className="bg-background p-6">
                <Portrait member={m} />
                <div className="mt-6 display-xl text-xl md:text-2xl">{m.name}</div>
                <div className="mt-2 text-xs text-muted-foreground">{m.role}</div>
                {m.responsibility && (
                  <div className="mt-5 border-t border-border pt-5">
                    <div className="label-xs text-subtle">Venture-studio responsibility</div>
                    <div className="mt-2 text-sm text-foreground">{m.responsibility}</div>
                  </div>
                )}
                <p className="mt-5 text-sm leading-relaxed text-muted-foreground">{m.bio}</p>
                {m.linkedin && (
                  <a
                    href={m.linkedin}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="label-xs mt-6 inline-flex border border-border-strong px-4 py-2 transition-colors hover:bg-foreground hover:text-background"
                  >
                    LinkedIn
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      {/* The operating system */}
      <Reveal delay={180}>
        <div className="mt-24">
          <div className="label-xs mb-8">The team behind every venture</div>
          <div className="grid grid-cols-2 gap-px border border-border bg-border sm:grid-cols-3 lg:grid-cols-5">
            {ventureCapabilities.map((c, i) => (
              <div key={c} className="bg-background px-6 py-8">
                <div className="num text-[11px] text-subtle">{String(i + 1).padStart(2, "0")}</div>
                <div className="mt-3 text-sm text-foreground">{c}</div>
              </div>
            ))}
            <div className="bg-background px-6 py-8">
              <p className="text-sm leading-relaxed text-muted-foreground">
                An existing multidisciplinary venture-building capability — not one person.
              </p>
            </div>
          </div>
        </div>
      </Reveal>

      {/* Investor message */}
      <Reveal delay={200}>
        <div className="mt-24 border border-border p-10 md:p-20">
          <p className="display-xl max-w-4xl text-2xl leading-[1.2] md:text-4xl">
            A venture studio does not succeed because it has capital. It succeeds because it has
            people capable of repeatedly turning opportunities into companies.
          </p>
        </div>
      </Reveal>

      {/* Closing */}
      <Reveal delay={220}>
        <div className="mt-px border border-border border-t-0 p-10 md:p-20">
          <p className="display-xl max-w-3xl text-3xl leading-[1.15] md:text-5xl">
            Capital creates the opportunity. Execution creates the company.
          </p>
          <p className="mt-6 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            The people responsible for that execution are already inside Nizek.
          </p>
        </div>
      </Reveal>
    </Section>
  );
}

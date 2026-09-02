import { Reveal, Section, SectionHeading } from "@/components/ui/primitives";
import {
  founder,
  founderBio,
  team,
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
        title="A Venture Studio Is Only As Good As The Team Behind It."
        lede="An operating studio run by entrepreneurs, product builders and technology leaders."
      />

      {/* Founding partner */}
      <Reveal delay={80}>
        <div className="grid grid-cols-1 gap-px border border-border bg-border lg:grid-cols-[minmax(0,420px)_1fr]">
          <div className="bg-background p-6">
            <Portrait member={founder} />
          </div>
          <div className="flex flex-col justify-center bg-background p-10 md:p-14">
            <div className="label-xs">Founding partner</div>
            <h3 className="display-xl mt-6 text-4xl md:text-6xl">{founder.name}</h3>
            <div className="mt-4 text-sm text-muted-foreground">{founder.role}</div>
            <div className="mt-10 max-w-2xl space-y-5">
              {founderBio.map((p) => (
                <p key={p} className="text-sm leading-relaxed text-muted-foreground">
                  {p}
                </p>
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




      {/* Why this team */}
      <Reveal delay={160}>
        <div className="mt-24 border border-border p-10 md:p-20">
          <p className="display-xl max-w-4xl text-3xl leading-[1.15] md:text-5xl">
            Capital alone does not build startups. Execution does.
          </p>
        </div>
      </Reveal>

      {/* Leadership team */}
      <Reveal delay={180}>
        <div className="mt-24">
          <div className="label-xs mb-8">Leadership team</div>
          <div className="grid grid-cols-1 gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
            {team.map((m, i) => (
              <div key={`${m.name}-${i}`} className="bg-background p-6">
                <Portrait member={m} />
                <div className="mt-6 display-xl text-xl md:text-2xl">{m.name}</div>
                <div className="mt-2 text-xs text-muted-foreground">{m.role}</div>
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
    </Section>
  );
}

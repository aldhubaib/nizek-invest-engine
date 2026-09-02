import { useState } from "react";

interface Props {
  fullName: string;
  onEnter: () => void;
}

/**
 * Full-screen private-invitation gate shown before the personalized
 * presentation. Institutional, monochrome, no marketing language.
 */
export function InvestorOnboarding({ fullName, onEnter }: Props) {
  const [agreed, setAgreed] = useState(false);
  const [leaving, setLeaving] = useState(false);

  function enter() {
    if (!agreed || leaving) return;
    setLeaving(true);
    onEnter();
  }

  return (
    <div
      className={`fixed inset-0 z-[100] overflow-y-auto bg-background text-foreground transition-opacity duration-700 ${
        leaving ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      <div className="mx-auto flex min-h-full max-w-3xl flex-col justify-center px-6 py-24 sm:px-10">
        <p className="label-xs">Private Investment Invitation</p>

        <div className="mt-16 border-t border-border pt-10">
          <p className="label-xs">Prepared Exclusively For</p>
          <p className="mt-5 text-3xl font-normal tracking-[-0.03em] sm:text-4xl">{fullName}</p>
        </div>

        <h1 className="display-xl mt-16 text-4xl sm:text-5xl">
          You Have Been Personally Invited To Review
          <br />
          Nizek Venture Studio Fund A
        </h1>

        <p className="mt-10 max-w-2xl text-base leading-relaxed text-muted-foreground">
          This investment opportunity is being presented to a limited group of prospective
          stakeholders selected by Nizek.
        </p>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
          This private presentation has been prepared specifically for you and explains the Venture
          Studio, Fund structure, ownership model and investment opportunity.
        </p>

        <div className="mt-20 border-t border-border pt-10">
          <h2 className="text-xl tracking-[-0.02em]">Private &amp; Confidential</h2>
          <p className="mt-6 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            This presentation contains confidential and commercially sensitive information belonging
            to Nizek.
          </p>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            It has been prepared exclusively for the individual named above and is provided solely
            for the purpose of evaluating a potential investment in Nizek Venture Studio Fund A.
          </p>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Please do not share, forward, reproduce or distribute this presentation or your private
            access link without the prior written consent of Nizek.
          </p>
        </div>

        <label className="mt-16 flex max-w-2xl cursor-pointer items-start gap-4 border-t border-border pt-10 text-sm leading-relaxed">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-1 h-4 w-4 shrink-0 appearance-none border border-border-strong bg-transparent checked:bg-foreground focus:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            aria-label="Confidentiality acknowledgment"
          />
          <span className="text-muted-foreground">
            I acknowledge that this presentation is confidential and agree not to distribute its
            contents or my private access link without Nizek&apos;s permission.
          </span>
        </label>

        <div className="mt-12">
          <button
            type="button"
            onClick={enter}
            disabled={!agreed}
            className="border border-foreground px-8 py-4 font-mono text-[11px] uppercase tracking-[0.28em] transition-colors duration-300 enabled:hover:bg-foreground enabled:hover:text-background disabled:cursor-not-allowed disabled:border-border disabled:text-faint"
          >
            Enter Private Presentation
          </button>
        </div>
      </div>
    </div>
  );
}

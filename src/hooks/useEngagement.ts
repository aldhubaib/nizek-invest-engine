import { useEffect, useRef } from "react";

import { recordEngagement } from "@/lib/investor.functions";

/** DOM anchor id → database section key. */
export const SECTION_MAP: Record<string, string> = {
  hero: "hero",
  why: "why_nizek",
  founders: "founder_pipeline",
  "how-we-build": "venture_model",
  regional: "regional_sourcing",
  equity: "equity_model",
  structure: "fund_structure",
  advantages: "advantages",
  investment: "investment",
  model: "simulator",
  team: "team",
  reserve: "request_allocation",
};

type PendingEvent = { type: string; payload: Record<string, unknown> };

const queue: PendingEvent[] = [];

/** Queue a behavioural event (simulator change, position selection, …). */
export function trackInvestorEvent(type: PendingEvent["type"], payload: Record<string, unknown> = {}) {
  queue.push({ type, payload });
  if (queue.length > 25) queue.splice(0, queue.length - 25);
}

/**
 * Lightweight, aggregated engagement tracking. Time is only counted while the
 * tab is visible and the section is at least 40% on screen; totals are flushed
 * on an interval rather than per scroll event.
 */
export function useEngagement(enabled: boolean) {
  const totals = useRef<Record<string, { seconds: number; visible: number }>>({});
  const active = useRef(0);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    const visibility: Record<string, number> = {};
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const key = SECTION_MAP[entry.target.id];
          if (!key) continue;
          visibility[key] = Math.round(entry.intersectionRatio * 100);
        }
      },
      { threshold: [0, 0.25, 0.4, 0.6, 0.8, 1] },
    );

    for (const id of Object.keys(SECTION_MAP)) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }

    // Idle rule: nothing is counted after 60 seconds without interaction.
    let lastActivity = Date.now();
    const markActive = () => {
      lastActivity = Date.now();
    };
    const activityEvents = ["mousemove", "mousedown", "keydown", "scroll", "touchstart", "wheel"];
    for (const evt of activityEvents) {
      window.addEventListener(evt, markActive, { passive: true });
    }

    const tick = window.setInterval(() => {
      if (document.hidden) return;
      if (Date.now() - lastActivity > 60_000) return;
      active.current += 1;
      for (const [key, ratio] of Object.entries(visibility)) {
        if (ratio < 40) continue;
        const bucket = totals.current[key] ?? { seconds: 0, visible: 0 };
        bucket.seconds += 1;
        bucket.visible = Math.max(bucket.visible, ratio);
        totals.current[key] = bucket;
      }
    }, 1000);

    async function flush() {
      const sections = Object.entries(totals.current).map(([sectionId, v]) => ({
        sectionId: sectionId as never,
        activeSeconds: v.seconds,
        visiblePercent: v.visible,
      }));
      const events = queue.splice(0, queue.length).map((e) => ({
        type: e.type as never,
        payload: e.payload,
      }));
      if (!sections.length && !events.length) return;
      try {
        await recordEngagement({ data: { activeSeconds: active.current, sections, events } });
      } catch {
        /* engagement tracking must never break the presentation */
      }
    }

    const flushTimer = window.setInterval(flush, 15_000);
    const onHide = () => {
      if (document.hidden) void flush();
    };
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("pagehide", () => void flush());

    return () => {
      observer.disconnect();
      window.clearInterval(tick);
      window.clearInterval(flushTimer);
      document.removeEventListener("visibilitychange", onHide);
      void flush();
    };
  }, [enabled]);
}

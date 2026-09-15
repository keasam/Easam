"use client";

import { useEffect, useState } from "react";

/**
 * Track which page section is currently in the reader's focus band
 * (IntersectionObserver with a band around the viewport middle).
 *
 * Used to make K-AI suggestions context-aware: while the visitor reads
 * the Projects section, K-AI offers project deep-dive prompts.
 */
export function useActiveSection(ids: string[]): string {
  const [active, setActive] = useState<string>(ids[0] ?? "");

  useEffect(() => {
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => !!el);
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      // a horizontal band around the upper-middle of the viewport —
      // matches the navbar scrollspy so context and highlight agree
      { rootMargin: "-40% 0px -55% 0px", threshold: 0 }
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [ids.join("|")]);

  return active;
}

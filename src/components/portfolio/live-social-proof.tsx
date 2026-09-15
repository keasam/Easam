"use client";

import { motion } from "framer-motion";
import { ArrowRight, Heart } from "lucide-react";
import type { FeedbackAggregate } from "@/lib/kai-feedback-client";
import { useFeedbackAggregate } from "@/hooks/use-feedback-aggregate";

/**
 * Live cross-visitor "N% found K-AI helpful" social proof.
 *
 * Renders NOTHING until real ratings exist (honest empty states).
 * - variant "strip": compact row for inside the chat welcome bubble
 * - variant "line":  larger standalone line (AI section) — with an optional
 *   cta that deep-links into the chat ("see why →")
 *
 * Controlled mode: pass `stats` (the chat widget's live-updating state).
 * Uncontrolled: fetches a shared snapshot once via useFeedbackAggregate.
 */
export function LiveSocialProof({
  variant,
  stats: statsProp,
  cta,
}: {
  variant: "strip" | "line";
  stats?: FeedbackAggregate | null;
  cta?: { label: string; onClick: () => void };
}) {
  const hooked = useFeedbackAggregate();
  const stats = statsProp !== undefined ? statsProp : hooked;

  if (!stats || stats.total === 0 || stats.pct === null) return null;
  const label = `${stats.total} rating${stats.total === 1 ? "" : "s"}`;
  const heart = (
    <Heart className="h-3 w-3 animate-pulse fill-amber-400 text-amber-500" />
  );

  if (variant === "strip") {
    return (
      <span className="mt-2 flex items-center gap-1.5 border-t border-primary/10 pt-2 text-[10.5px] font-bold text-muted-foreground">
        {heart}
        <span className="text-gradient tabular-nums">{stats.pct}%</span>
        of visitors found K-AI helpful
        <span className="font-medium tabular-nums">· {label}</span>
      </span>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="mt-3"
    >
      <p className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-foreground/75">
        {heart}
        <span className="text-gradient font-extrabold tabular-nums">
          {stats.pct}%
        </span>
        of visitors found K-AI helpful
        <span className="font-normal text-muted-foreground">
          · {label} and counting
        </span>
      </p>
      {cta && (
        <button
          onClick={cta.onClick}
          className="cta-slide group/cta mt-1.5 ml-[26px] flex items-center gap-1.5 rounded-lg px-1.5 py-1 text-[12.5px] font-extrabold text-primary outline-none transition-colors hover:text-teal-700 focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          {cta.label}
          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover/cta:translate-x-0.5" />
        </button>
      )}
    </motion.div>
  );
}

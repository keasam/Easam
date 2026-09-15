"use client";

import { motion } from "framer-motion";

interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  highlight?: string;
  description?: string;
  align?: "center" | "left";
}

/**
 * Coordinated, staggered reveal for every section heading:
 * eyebrow pill pops → title rises out of a blur → description fades →
 * divider bar sweeps outward from the center.
 * (MotionConfig reducedMotion="user" in page.tsx disables this for
 * visitors who prefer reduced motion.)
 */
const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.11, delayChildren: 0.04 },
  },
};

const item = {
  hidden: { opacity: 0, y: 22, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.6, ease: "easeOut" as const },
  },
};

const divider = {
  hidden: { opacity: 0, scaleX: 0.2 },
  show: {
    opacity: 1,
    scaleX: 1,
    transition: { duration: 0.7, ease: "easeOut" as const },
  },
};

export function SectionHeading({
  eyebrow,
  title,
  highlight,
  description,
  align = "center",
}: SectionHeadingProps) {
  const alignCls = align === "center" ? "text-center mx-auto" : "text-left";

  return (
    <motion.div
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      className={`max-w-2xl ${alignCls} mb-8 md:mb-10`}
    >
      <motion.span
        variants={item}
        className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-secondary/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-primary mb-4"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
        {eyebrow}
      </motion.span>
      <motion.h2
        variants={item}
        className="text-3xl md:text-4xl lg:text-[2.75rem] font-extrabold leading-tight tracking-tight text-balance text-foreground"
      >
        {title} {highlight && <span className="text-gradient">{highlight}</span>}
      </motion.h2>
      {description && (
        <motion.p
          variants={item}
          className="mt-4 text-base md:text-lg text-muted-foreground leading-relaxed text-pretty"
        >
          {description}
        </motion.p>
      )}
      <motion.div
        variants={divider}
        className={`mt-5 flex items-center gap-2 ${align === "center" ? "justify-center" : ""}`}
        aria-hidden
      >
        <span className="h-[3px] w-10 rounded-full bg-gradient-to-r from-transparent to-primary/50" />
        <span className="h-[3px] w-24 rounded-full shimmer-line" />
        <span className="h-[3px] w-10 rounded-full bg-gradient-to-r from-amber-400/60 to-transparent" />
      </motion.div>
    </motion.div>
  );
}

"use client";

import { motion, useScroll, useSpring } from "framer-motion";
import {
  BadgeCheck,
  Briefcase,
  ChevronDown,
  CircleDot,
  Layers,
  Microscope,
  Rocket,
  Settings,
  Sparkles,
} from "lucide-react";
import { useRef, useState } from "react";
import { SectionHeading } from "./section-heading";
import { experience } from "@/lib/resume-data";
import { askKai } from "@/lib/vcard";

const roleIcons: Record<string, React.ElementType> = {
  rocket: Rocket,
  microscope: Microscope,
  badgecheck: BadgeCheck,
  settings: Settings,
};

function BoldedPoint({ text, bold }: { text: string; bold?: string }) {
  if (!bold) return <>{text}</>;
  const idx = text.indexOf(bold);
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <strong className="font-bold text-foreground">
        {text.slice(idx, idx + bold.length)}
      </strong>
      {text.slice(idx + bold.length)}
    </>
  );
}

function ExperienceCard({ index }: { index: number }) {
  const job = experience[index];
  const Icon = roleIcons[job.icon] ?? Briefcase;
  const [expanded, setExpanded] = useState(index === 0);

  return (
    <motion.article
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55 }}
      className={`lift overflow-hidden rounded-3xl border bg-white/85 shadow-sm backdrop-blur ${
        job.current ? "border-primary/30 shadow-lg shadow-primary/10" : "border-primary/10"
      }`}
    >
        {/* header */}
        <button
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="group flex w-full items-start justify-between gap-4 p-6 text-left md:p-7"
        >
          <div className="flex items-start gap-4">
            <span
              className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-white shadow-lg transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110 ${
                job.current
                  ? "bg-gradient-to-br from-primary to-emerald-500 shadow-primary/30"
                  : "bg-gradient-to-br from-amber-400 to-orange-400 shadow-amber-400/30"
              }`}
            >
              <Icon className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-base font-extrabold tracking-tight md:text-lg">
                {job.role}
              </h3>
              <p className="mt-0.5 text-sm font-bold text-primary">{job.company}</p>
              <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <CircleDot className="h-3 w-3" /> {job.location}
                </span>
                <span>·</span>
                <span>{job.period}</span>
                {job.current && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700 ring-1 ring-emerald-200">
                    <CircleDot className="h-2.5 w-2.5" /> Current
                  </span>
                )}
              </p>
            </div>
          </div>
          <ChevronDown
            className={`mt-2 h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-300 group-hover:text-primary ${
              expanded ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* body */}
        <motion.div
          initial={false}
          animate={{ height: expanded ? "auto" : 0, opacity: expanded ? 1 : 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-hidden"
        >
          <div className="border-t border-primary/10 px-6 pb-6 pt-5 md:px-7 md:pb-7">
            <ul className="space-y-3">
              {job.points.map((p, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.03 * i }}
                  className="flex gap-3 text-sm leading-relaxed text-muted-foreground"
                >
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gradient-to-r from-primary to-amber-400" />
                  <span>
                    <BoldedPoint text={p.text} bold={p.bold} />
                  </span>
                </motion.li>
              ))}
            </ul>

            {/* role-level K-AI deep-dive */}
            {job.kaiQuestion && (
              <div className="group/role mt-5 flex flex-wrap items-center gap-3 rounded-2xl border border-dashed border-primary/25 bg-gradient-to-r from-secondary/60 via-white to-accent/40 px-4 py-3 transition-colors hover:border-primary/45">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary/90 to-emerald-500 text-white shadow-md shadow-primary/25 transition-transform duration-300 group-hover/role:rotate-6 group-hover/role:scale-110">
                  <Sparkles className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-extrabold tracking-tight text-foreground">
                    Deep-dive this role with K-AI
                  </p>
                  <p className="truncate text-[11px] font-medium text-muted-foreground">
                    “{job.kaiQuestion}”
                  </p>
                </div>
                <button
                  onClick={() => askKai(job.kaiQuestion)}
                  aria-label={`Ask K-AI about the ${job.role} role at ${job.company}`}
                  className="chip-shine inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-primary to-emerald-500 px-3.5 py-1.5 text-[11px] font-extrabold text-primary-foreground shadow-md shadow-primary/25 transition-all hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.97]"
                >
                  <Sparkles className="h-3 w-3" />
                  Ask K-AI
                </button>
              </div>
            )}

            {/* flagship sub-projects */}
            {job.subProjects?.map((sp) => (
              <div
                key={sp.name}
                className="group/sub mt-6 rounded-2xl border border-primary/15 bg-gradient-to-br from-secondary/50 to-white p-5 transition-all duration-300 hover:border-primary/35 hover:shadow-md hover:shadow-primary/10"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-primary to-emerald-500 text-white shadow transition-transform duration-300 group-hover/sub:rotate-6 group-hover/sub:scale-110">
                    <Layers className="h-4 w-4" />
                  </span>
                  <h4 className="text-sm font-extrabold md:text-[15px]">{sp.name}</h4>
                  <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700">
                    {sp.tagline}
                  </span>
                  <button
                    onClick={() =>
                      askKai(`Tell me about Karthik's work on ${sp.name.split(" — ")[0]} — what did he own and deliver?`)
                    }
                    aria-label={`Ask K-AI about ${sp.name.split(" — ")[0]}`}
                    className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-white px-3 py-1 text-[11px] font-extrabold text-primary opacity-70 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:opacity-100 hover:shadow-md active:scale-[0.97]"
                  >
                    <Sparkles className="h-3 w-3" />
                    Ask K-AI
                  </button>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {sp.description}
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {sp.tags.map((t) => (
                    <span
                      key={t}
                      className="rounded-full border border-primary/15 bg-white px-2.5 py-1 text-[11px] font-bold text-primary"
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <ul className="mt-4 space-y-2">
                  {sp.points.map((pt, i) => (
                    <li
                      key={i}
                      className="flex gap-2.5 text-[13px] leading-relaxed text-muted-foreground"
                    >
                      <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-amber-500" />
                      {pt}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </motion.div>
    </motion.article>
  );
}

export function Experience() {
  const timelineRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ["start 75%", "end 55%"],
  });
  const fill = useSpring(scrollYProgress, { stiffness: 90, damping: 22 });

  return (
    <section id="experience" className="relative py-12 md:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Career Journey"
          title="Nine years of"
          highlight="compounding delivery impact"
          description="From leading 25-member operations at Genpact to executive-level delivery ownership — every role added a new layer of the PM craft."
        />

        <div ref={timelineRef} className="relative">
          {/* vertical gradient line — mobile & desktop */}
          <div
            aria-hidden
            className="timeline-line absolute bottom-8 left-[13px] top-2 w-[3px] rounded-full md:left-[163px]"
          />
          {/* scroll-fill overlay — fills as you scroll through the section */}
          <motion.div
            aria-hidden
            style={{ scaleY: fill }}
            className="absolute bottom-8 left-[13px] top-2 w-[3px] origin-top rounded-full bg-gradient-to-b from-primary via-emerald-500 to-amber-400 shadow-[0_0_12px_oklch(0.6_0.1_184/0.5)] md:left-[163px]"
          />
          {/* node dots */}
          {experience.map((job, i) => (
            <motion.span
              key={job.role}
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 * i, type: "spring", stiffness: 260 }}
              className={`absolute left-[7px] top-8 z-10 grid h-4 w-4 place-items-center rounded-full ring-4 ring-background md:left-[157px] ${
                job.current ? "bg-emerald-500" : "bg-amber-400"
              }`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-white" />
            </motion.span>
          ))}

          <div className="space-y-8 md:space-y-10">
            {experience.map((job, i) => (
              <div key={job.role} className="relative pl-10 md:pl-[200px]">
                {/* year chip — inline on mobile, floated left of line on desktop */}
                <span className="mb-3 ml-1 inline-block rounded-full border border-primary/15 bg-white px-3 py-1 text-[11px] font-extrabold text-primary shadow-sm md:absolute md:left-0 md:top-7 md:mb-0 md:ml-0 md:max-w-[136px] md:text-center">
                  {job.period}
                </span>
                <ExperienceCard index={i} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

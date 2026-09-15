"use client";

import { motion } from "framer-motion";
import { GraduationCap, Layers3, Wrench } from "lucide-react";
import { SectionHeading } from "./section-heading";
import { methodologies, tools, education } from "@/lib/resume-data";

function ChipCloud({
  items,
  variant,
}: {
  items: string[];
  variant: "teal" | "amber";
}) {
  return (
    <div className="flex flex-wrap gap-2.5">
      {items.map((item, i) => (
        <motion.span
          key={item}
          initial={{ opacity: 0, scale: 0.85 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.035, duration: 0.3 }}
          whileHover={{ y: -3, scale: 1.04 }}
          className={`chip-shine cursor-default rounded-full border px-4 py-2 text-[13px] font-bold shadow-sm transition-shadow hover:shadow-md ${
            variant === "teal"
              ? "border-primary/15 bg-white text-primary hover:border-primary/40"
              : "border-amber-300/40 bg-white text-amber-700 hover:border-amber-400"
          }`}
        >
          {item}
        </motion.span>
      ))}
    </div>
  );
}

export function Toolkit() {
  return (
    <section id="toolkit" className="relative py-12 md:py-16">
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-b from-transparent via-secondary/25 to-transparent"
      />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Methodologies & Tools"
          title="The stack that keeps delivery"
          highlight="predictable"
        />

        <div className="grid gap-6 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.55 }}
            className="lift card-glow rounded-3xl border border-primary/10 bg-white/85 p-7 shadow-sm backdrop-blur md:p-8"
          >
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-primary to-emerald-500 text-white shadow-lg shadow-primary/25">
                <Layers3 className="h-5 w-5" />
              </span>
              <h3 className="text-lg font-extrabold tracking-tight">Methodologies</h3>
            </div>
            <div className="mt-6">
              <ChipCloud items={methodologies} variant="teal" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.55, delay: 0.1 }}
            className="lift card-glow rounded-3xl border border-amber-300/40 bg-white/85 p-7 shadow-sm backdrop-blur md:p-8"
          >
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-400 text-white shadow-lg shadow-amber-400/25">
                <Wrench className="h-5 w-5" />
              </span>
              <h3 className="text-lg font-extrabold tracking-tight">Tools & Platforms</h3>
            </div>
            <div className="mt-6">
              <ChipCloud items={tools} variant="amber" />
            </div>
          </motion.div>
        </div>

        {/* education */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.55, delay: 0.05 }}
          className="lift mx-auto mt-8 flex max-w-3xl flex-col items-start gap-4 rounded-3xl border border-primary/10 bg-gradient-to-r from-white via-white to-secondary/60 p-7 shadow-sm backdrop-blur sm:flex-row sm:items-center md:p-8"
        >
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-primary to-emerald-500 text-white shadow-lg shadow-primary/25">
            <GraduationCap className="h-7 w-7" />
          </span>
          <div className="flex-1">
            <h3 className="text-base font-extrabold tracking-tight md:text-lg">
              {education.degree}
            </h3>
            <p className="mt-1 text-sm font-semibold text-muted-foreground">
              {education.school} · {education.period}
            </p>
          </div>
          <span className="rounded-full bg-secondary px-4 py-1.5 text-xs font-extrabold text-primary">
            B.Tech
          </span>
        </motion.div>
      </div>
    </section>
  );
}

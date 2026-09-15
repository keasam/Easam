"use client";

import { motion } from "framer-motion";
import {
  CalendarRange,
  FolderKanban,
  Globe2,
  Layers,
  ShieldCheck,
  Users,
} from "lucide-react";
import { SectionHeading } from "./section-heading";
import { highlights } from "@/lib/resume-data";

const iconMap: Record<string, React.ElementType> = {
  calendar: CalendarRange,
  folders: FolderKanban,
  users: Users,
  layers: Layers,
  shield: ShieldCheck,
  globe: Globe2,
};

export function Highlights() {
  return (
    <section id="highlights" className="relative py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Key Highlights"
          title="Numbers & wins that"
          highlight="speak for themselves"
        />

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {highlights.map((h, i) => {
            const Icon = iconMap[h.icon] ?? Layers;
            const teal = i % 2 === 0;
            return (
              <motion.div
                key={h.title}
                initial={{ opacity: 0, y: 26, filter: "blur(5px)" }}
                whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: (i % 3) * 0.08, duration: 0.55 }}
                className="lift card-glow group relative overflow-hidden rounded-3xl border border-primary/10 bg-white/85 p-6 shadow-sm backdrop-blur"
              >
                <div
                  className={`absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-60 blur-2xl transition-transform duration-500 group-hover:scale-[1.7] ${
                    teal ? "bg-secondary" : "bg-amber-100"
                  }`}
                />
                <span
                  className={`relative grid h-11 w-11 place-items-center rounded-2xl shadow-lg transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110 ${
                    teal
                      ? "bg-gradient-to-br from-primary to-emerald-500 text-white shadow-primary/25"
                      : "bg-gradient-to-br from-amber-400 to-orange-400 text-white shadow-amber-400/25"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="relative mt-4 text-[15px] font-extrabold tracking-tight md:text-base">
                  {h.title}
                </h3>
                <p className="relative mt-2 text-[13px] leading-relaxed text-muted-foreground">
                  {h.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

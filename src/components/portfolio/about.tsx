"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import {
  Bot,
  CalendarRange,
  FolderKanban,
  Handshake,
  Layers,
  Network,
  Quote,
  Sparkles,
  Users,
} from "lucide-react";
import { SectionHeading } from "./section-heading";
import { profile, stats, aiSnapshot } from "@/lib/resume-data";
import { useCountUp } from "@/hooks/use-portfolio";

const iconMap: Record<string, React.ElementType> = {
  calendar: CalendarRange,
  folders: FolderKanban,
  handshake: Handshake,
  users: Users,
  network: Network,
  layers: Layers,
};

function StatCard({
  stat,
  index,
}: {
  stat: (typeof stats)[number];
  index: number;
}) {
  const Icon = iconMap[stat.icon] ?? Layers;
  const { ref, value } = useCountUp(stat.value);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: index * 0.07, duration: 0.5 }}
      className="lift card-glow group relative overflow-hidden rounded-3xl border border-primary/10 bg-white/80 p-5 text-center shadow-sm backdrop-blur md:p-6"
    >
      <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-gradient-to-br from-secondary to-amber-50 opacity-70 transition-transform duration-500 group-hover:scale-150" />
      <span className="relative mx-auto mb-3 grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-primary to-emerald-500 text-primary-foreground shadow-lg shadow-primary/25">
        <Icon className="h-5 w-5" />
      </span>
      <p className="relative text-3xl font-extrabold tracking-tight md:text-4xl">
        <span ref={ref} className="text-gradient">
          {value}
        </span>
        <span className="text-gradient">{stat.suffix}</span>
      </p>
      <p className="relative mt-1 text-xs font-bold uppercase tracking-wider text-muted-foreground md:text-[13px]">
        {stat.label}
      </p>
    </motion.div>
  );
}

/** Types out text at ~2 chars/frame once enabled */
function useTypeOnce(text: string, enabled: boolean, delay = 900) {
  const [out, setOut] = useState("");
  const startedRef = useRef(false);

  useEffect(() => {
    if (!enabled || startedRef.current) return;
    startedRef.current = true;

    let raf = 0;
    let i = 0;
    const timeout = setTimeout(() => {
      const tick = () => {
        i += 2;
        setOut(text.slice(0, i));
        if (i < text.length) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }, delay);

    return () => {
      clearTimeout(timeout);
      cancelAnimationFrame(raf);
    };
  }, [enabled, text, delay]);

  return out;
}

/** AI snapshot card — types out the AI summary when scrolled into view */
function AiSnapshot() {
  const containerRef = useRef<HTMLDivElement>(null);
  const inView = useInView(containerRef, { once: true, margin: "-80px" });
  const typed = useTypeOnce(aiSnapshot, inView, 900);

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6 }}
      className="relative mx-auto mt-10 max-w-4xl overflow-hidden rounded-3xl border border-primary/15 bg-gradient-to-br from-white via-white to-secondary/60 p-[1px] shadow-xl shadow-primary/10"
    >
      <div className="rounded-3xl p-6 md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="relative grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-primary to-emerald-500 text-white shadow-lg shadow-primary/30">
              <Bot className="h-5 w-5" />
              <span className="absolute inset-0 animate-pulse-ring rounded-2xl" />
            </span>
            <div>
              <p className="text-sm font-extrabold">K-AI Career Snapshot</p>
              <p className="text-xs text-muted-foreground">
                Generated from Karthik&apos;s resume · always up to date
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-700 ring-1 ring-emerald-200">
            <Sparkles className="h-3 w-3" /> AI Powered
          </span>
        </div>

        <div className="mt-5 rounded-2xl border border-primary/10 bg-white/85 p-5 md:p-6">
          <Quote className="mb-2 h-5 w-5 text-amber-500" />
          <p
            className={`min-h-[96px] text-sm leading-relaxed text-foreground/85 md:text-[15px] md:leading-7 ${
              typed.length < aiSnapshot.length ? "typing-caret" : ""
            }`}
          >
            {typed || "\u00A0"}
          </p>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] font-semibold text-muted-foreground">
          {["ERP Delivery", "LegalTech", "Agile / Scrum", "RAID & Risk", "UAT & Go-Live", "Stakeholder Mgmt"].map(
            (t) => (
              <span key={t} className="rounded-full bg-secondary px-3 py-1">
                {t}
              </span>
            )
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function About() {
  return (
    <section id="about" className="relative py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="About Me"
          title="Delivery leadership that turns ideas into"
          highlight="launched platforms"
        />

        <div className="grid items-start gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-base leading-relaxed text-muted-foreground md:text-lg md:leading-8">
              {profile.summaryIntro}
            </p>
            <p className="mt-5 text-base leading-relaxed text-muted-foreground md:text-lg md:leading-8">
              {profile.summaryBody}
            </p>
            <div className="mt-6 rounded-2xl border-l-4 border-amber-400 bg-amber-50/70 p-5">
              <p className="text-sm leading-relaxed text-amber-900/90 md:text-[15px] md:leading-7">
                <strong className="font-bold">Proven platform builder:</strong>{" "}
                {profile.summaryProof}
              </p>
            </div>
          </motion.div>

          {/* stats grid */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
            {stats.map((s, i) => (
              <StatCard key={s.label} stat={s} index={i} />
            ))}
          </div>
        </div>

        <AiSnapshot />
      </div>
    </section>
  );
}

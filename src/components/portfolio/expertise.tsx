"use client";

import { motion } from "framer-motion";
import {
  CalendarCheck2,
  ClipboardList,
  Coins,
  GitMerge,
  Rocket,
  ShieldAlert,
  TestTube2,
  Wrench,
  Award,
  Bot,
  FileBarChart,
  Handshake,
  Network,
  Scale,
  Users2,
  Workflow,
} from "lucide-react";
import { SectionHeading } from "./section-heading";
import { deliveryCompetencies, leadershipCompetencies } from "@/lib/resume-data";

const deliveryIcons = [
  ClipboardList,
  CalendarCheck2,
  Coins,
  ShieldAlert,
  GitMerge,
  Rocket,
  TestTube2,
  Wrench,
];

const leadershipIcons = [
  Handshake,
  Users2,
  Scale,
  ShieldAlert,
  Network,
  FileBarChart,
  Workflow,
  Award,
];

function CompetencyCard({
  title,
  subtitle,
  items,
  icons,
  accent,
  delay,
}: {
  title: string;
  subtitle: string;
  items: string[];
  icons: React.ElementType[];
  accent: "teal" | "amber";
  delay: number;
}) {
  const isTeal = accent === "teal";

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay }}
      className={`lift card-glow relative overflow-hidden rounded-3xl border p-6 shadow-sm md:p-8 ${
        isTeal
          ? "border-primary/15 bg-gradient-to-br from-white to-secondary/50"
          : "border-amber-300/40 bg-gradient-to-br from-white to-accent/40"
      }`}
    >
      <div
        aria-hidden
        className={`absolute -right-10 -top-10 h-36 w-36 rounded-full blur-2xl ${
          isTeal ? "bg-secondary" : "bg-amber-100"
        }`}
      />
      <div className="relative">
        <div className="flex items-center gap-3">
          <span
            className={`grid h-12 w-12 place-items-center rounded-2xl text-white shadow-lg ${
              isTeal
                ? "bg-gradient-to-br from-primary to-emerald-500 shadow-primary/30"
                : "bg-gradient-to-br from-amber-400 to-orange-400 shadow-amber-400/30"
            }`}
          >
            {isTeal ? <Wrench className="h-5.5 w-5.5" /> : <Users2 className="h-5.5 w-5.5" />}
          </span>
          <div>
            <h3 className="text-lg font-extrabold tracking-tight md:text-xl">{title}</h3>
            <p className="text-xs font-semibold text-muted-foreground">{subtitle}</p>
          </div>
        </div>

        <ul className="mt-6 grid gap-2.5 sm:grid-cols-2">
          {items.map((item, i) => {
            const Icon = icons[i % icons.length];
            return (
              <motion.li
                key={item}
                initial={{ opacity: 0, x: -14 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.05 * i, duration: 0.35 }}
                className={`group flex items-center gap-3 rounded-2xl border bg-white/80 px-3.5 py-3 text-[13px] font-semibold text-foreground/80 transition-all hover:-translate-y-0.5 hover:shadow-md ${
                  isTeal
                    ? "border-primary/10 hover:border-primary/35 hover:text-primary"
                    : "border-amber-300/30 hover:border-amber-400/60 hover:text-amber-700"
                }`}
              >
                <span
                  className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl transition-transform group-hover:scale-110 ${
                    isTeal ? "bg-secondary text-primary" : "bg-amber-100 text-amber-600"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </span>
                {item}
              </motion.li>
            );
          })}
        </ul>
      </div>
    </motion.div>
  );
}

export function Expertise() {
  return (
    <section id="expertise" className="relative py-12 md:py-16">
      {/* soft bg tint */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-b from-transparent via-secondary/30 to-transparent"
      />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Core Competencies"
          title="The toolkit behind"
          highlight="on-time, on-scope delivery"
          description="A proven operating system across the full project lifecycle — from planning and risk control to releases, UAT, and post-production care."
        />

        <div className="grid gap-6 lg:grid-cols-2">
          <CompetencyCard
            title="Project & Delivery Management"
            subtitle="Owning outcomes from kickoff to go-live"
            items={deliveryCompetencies}
            icons={deliveryIcons}
            accent="teal"
            delay={0}
          />
          <CompetencyCard
            title="Stakeholder & Team Leadership"
            subtitle="Aligning people, expectations & outcomes"
            items={leadershipCompetencies}
            icons={leadershipIcons}
            accent="amber"
            delay={0.12}
          />
        </div>

        {/* bot divider note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mx-auto mt-10 flex max-w-xl items-center justify-center gap-2 text-center text-xs font-semibold text-muted-foreground"
        >
          <Bot className="h-4 w-4 text-primary" />
          Tip: ask K-AI “How does Karthik manage risk?” to see these in action.
        </motion.p>
      </div>
    </section>
  );
}

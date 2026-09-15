"use client";

import { motion } from "framer-motion";
import { Bot, MessageSquareText, ScanSearch, Sparkles, Zap } from "lucide-react";
import { LiveSocialProof } from "@/components/portfolio/live-social-proof";
import { askKai } from "@/lib/vcard";

const features = [
  {
    icon: MessageSquareText,
    title: "Conversational Resume",
    description:
      "K-AI has read every line of Karthik's resume. Ask it anything — projects, metrics, tools — and get instant, grounded answers.",
    tag: "Live now",
  },
  {
    icon: ScanSearch,
    title: "AI Career Snapshot",
    description:
      "A distilled, auto-generated summary of Karthik's profile appears as you scroll — the TL;DR version of a 9-year career.",
    tag: "Live now",
  },
  {
    icon: Zap,
    title: "Zero-Click Answers",
    description:
      "Smart suggestion chips get you answers in one tap. No forms, no waiting for callbacks to get basic facts.",
    tag: "Live now",
  },
];

export function AiExperience() {
  return (
    <section id="ai" className="relative overflow-hidden py-12 md:py-16">
      {/* decorative art */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="animate-blob absolute -left-40 top-10 h-[380px] w-[380px] rounded-full bg-[var(--blob-mint)] blur-3xl" />
        <div className="animate-blob-delayed absolute -right-32 bottom-0 h-[340px] w-[340px] rounded-full bg-[var(--blob-teal)] blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          {/* art side */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7 }}
            className="relative mx-auto w-full max-w-md"
          >
            <div
              aria-hidden
              className="animate-spin-slow absolute -inset-5 rounded-full opacity-50"
              style={{
                background:
                  "conic-gradient(from 90deg, oklch(0.85 0.1 180), oklch(0.93 0.09 90), oklch(0.88 0.1 160), oklch(0.85 0.1 180))",
                filter: "blur(22px)",
              }}
            />
            <div className="glass-card relative overflow-hidden rounded-[2rem] p-3">
              <img
                src="/images/hero-art.png"
                alt="Abstract AI network artwork representing Karthik's AI-driven portfolio"
                loading="lazy"
                className="w-full rounded-3xl"
              />
              {/* floating chat mock */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="absolute -bottom-5 left-1/2 w-[86%] -translate-x-1/2"
              >
                <div className="flex items-center gap-3 rounded-2xl border border-primary/15 bg-white/95 p-3.5 shadow-xl backdrop-blur">
                  <span className="relative grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary to-emerald-500 text-white">
                    <Bot className="h-4.5 w-4.5" />
                    <span className="absolute inset-0 animate-pulse-ring rounded-xl" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-extrabold text-primary">K-AI</p>
                    <p className="truncate text-xs font-semibold text-muted-foreground">
                      “Karthik led 7+ projects with 30+ team members…”
                    </p>
                  </div>
                  <span className="grid h-7 w-7 place-items-center rounded-lg bg-secondary">
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                  </span>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* content side */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.55 }}
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-secondary/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                AI-Driven Portfolio
              </span>
              <h2 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight md:text-4xl">
                This resume <span className="text-gradient">talks back.</span>
              </h2>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
                Instead of scrolling through a static PDF, interact with{" "}
                <strong className="font-bold text-foreground">K-AI</strong> — an
                assistant trained on Karthik&apos;s complete resume. It&apos;s a
                glimpse of how Karthik brings AI into delivery: practical,
                grounded, and focused on saving people time.
              </p>
              {/* live cross-visitor sentiment (only renders once real ratings exist);
                  the “see why” CTA deep-links straight into the chat */}
              <LiveSocialProof
                variant="line"
                cta={{
                  label: "See why visitors love it",
                  onClick: () => askKai(),
                }}
              />
            </motion.div>

            <div className="mt-8 space-y-4">
              {features.map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, x: 28 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="lift flex items-start gap-4 rounded-3xl border border-primary/10 bg-white/85 p-5 shadow-sm backdrop-blur"
                >
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-primary to-emerald-500 text-white shadow-lg shadow-primary/25">
                    <f.icon className="h-5 w-5" />
                  </span>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-[15px] font-extrabold tracking-tight">
                        {f.title}
                      </h3>
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700 ring-1 ring-emerald-200">
                        {f.tag}
                      </span>
                    </div>
                    <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
                      {f.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

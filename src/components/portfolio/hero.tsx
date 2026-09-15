"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowDown,
  ArrowRight,
  Bot,
  Download,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { profile } from "@/lib/resume-data";
import { useTypewriter } from "@/hooks/use-portfolio";
import { useActiveSection } from "@/hooks/use-active-section";
import { SECTION_PROMPTS } from "@/lib/contextual-prompts";
import { askKai } from "@/lib/vcard";

const HERO_PROMPTS = [
  "How does Karthik manage risk?",
  "Tell me about OfficeGX",
  "What is his leadership style?",
  "Show me his ERP delivery work",
  "Has he worked with US clients?",
  "What methodologies does he use?",
];

const ALL_SECTION_IDS = [
  "top",
  "about",
  "expertise",
  "experience",
  "projects",
  "products",
  "highlights",
  "ai",
  "toolkit",
  "contact",
];

/**
 * Contextual-first prompt ordering: while the visitor reads a specific
 * section, that section's grounded prompts rotate first (keep the base
 * prompts as filler, deduplicated).
 */
function promptsFor(sectionId: string): string[] {
  const scoped = SECTION_PROMPTS[sectionId] ?? [];
  const ordered = [...scoped];
  for (const p of HERO_PROMPTS) {
    if (!ordered.includes(p)) ordered.push(p);
  }
  return ordered;
}

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.12 * i, duration: 0.6, ease: "easeOut" as const },
  }),
};

export function Hero({ onOpenChat }: { onOpenChat: () => void }) {
  const typed = useTypewriter(profile.roles);
  const spotRef = useRef<HTMLDivElement>(null);
  const [promptIdx, setPromptIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const reducedMotion = useRef(false);

  // which section is the visitor reading right now → context-aware prompts
  const activeSection = useActiveSection(ALL_SECTION_IDS);
  const prompts = promptsFor(activeSection);

  // when the reading context changes, jump to the most relevant prompt
  // (previous-render tracking — no setState-in-effect cascades)
  const [prevSection, setPrevSection] = useState(activeSection);
  if (prevSection !== activeSection) {
    setPrevSection(activeSection);
    setPromptIdx(0);
  }

  // rotate suggested prompts (paused on hover, disabled for reduced-motion users)
  useEffect(() => {
    reducedMotion.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reducedMotion.current) return;
    const t = setInterval(() => {
      if (!paused) setPromptIdx((i) => (i + 1) % prompts.length);
    }, 3400);
    return () => clearInterval(t);
  }, [paused, prompts.length]);

  // mouse-follow spotlight (rAF-throttled via direct style write)
  const onSpotMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const el = spotRef.current;
    if (!el) return;
    const rect = e.currentTarget.getBoundingClientRect();
    el.style.background = `radial-gradient(560px circle at ${e.clientX - rect.left}px ${
      e.clientY - rect.top
    }px, oklch(0.88 0.07 170 / 0.4), transparent 65%)`;
  }, []);

  return (
    <section
      id="top"
      onMouseMove={onSpotMove}
      className="relative min-h-screen overflow-hidden pt-24 pb-14 md:pt-32 md:pb-16"
    >
      {/* mouse-follow spotlight */}
      <div
        ref={spotRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 transition-[background] duration-200 ease-out"
      />

      {/* animated blobs */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="animate-blob absolute -top-24 -left-24 h-[420px] w-[420px] rounded-full bg-[var(--blob-teal)] blur-3xl" />
        <div className="animate-blob-delayed absolute top-1/3 -right-32 h-[460px] w-[460px] rounded-full bg-[var(--blob-amber)] blur-3xl" />
        <div className="animate-blob absolute -bottom-40 left-1/3 h-[400px] w-[400px] rounded-full bg-[var(--blob-mint)] blur-3xl" />
        {/* grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "linear-gradient(oklch(0.9 0.04 175 / 0.35) 1px, transparent 1px), linear-gradient(90deg, oklch(0.9 0.04 175 / 0.35) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
            maskImage:
              "radial-gradient(ellipse 80% 60% at 50% 30%, black 30%, transparent 75%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 80% 60% at 50% 30%, black 30%, transparent 75%)",
          }}
        />
      </div>

      <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:gap-8 lg:px-8">
        {/* ------- left column ------- */}
        <div>
          <motion.div variants={fadeUp} initial="hidden" animate="show" custom={0}>
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/60 bg-emerald-50 px-4 py-1.5 text-xs font-bold text-emerald-700 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              Available for new opportunities
            </span>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={1}
            className="mt-6 text-4xl font-extrabold tracking-tight sm:text-5xl xl:text-6xl"
          >
            Hi, I&apos;m{" "}
            <span className="text-gradient">Karthik Easam</span>
            <span className="mt-4 block text-2xl font-bold text-foreground/85 sm:text-3xl xl:text-4xl">
              <span className="typing-caret">{typed}</span>
            </span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={2}
            className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg"
          >
            <span className="font-semibold text-foreground">9+ years</span>{" "}
            leading end-to-end delivery of software &amp; business initiatives —
            running a portfolio of <span className="font-semibold text-foreground">7+ concurrent projects</span> and{" "}
            <span className="font-semibold text-foreground">9+ client relationships</span> while
            coordinating <span className="font-semibold text-foreground">30+ cross-functional experts</span> across
            Product, Engineering, QA, UI/UX, Operations &amp; Finance.
          </motion.p>

          {/* CTA row */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={3}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <button
              onClick={onOpenChat}
              className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-emerald-500 px-6 py-3 text-sm font-bold text-primary-foreground shadow-xl shadow-primary/30 transition-all hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-primary/40"
            >
              <Bot className="h-4.5 w-4.5 transition-transform group-hover:rotate-12" />
              Chat with my AI Twin
            </button>
            <a
              href="#projects"
              className="inline-flex items-center gap-2 rounded-full border-2 border-primary/25 bg-white/70 px-6 py-3 text-sm font-bold text-primary backdrop-blur transition-all hover:border-primary/50 hover:bg-secondary"
            >
              <Sparkles className="h-4 w-4" />
              Explore Delivery Work
            </a>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 rounded-full px-4 py-3 text-sm font-bold text-muted-foreground transition-colors hover:text-primary"
            >
              <Download className="h-4 w-4" />
              Get in touch
            </a>
          </motion.div>

          {/* K-AI suggested prompts carousel */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={3.5}
            className="mt-6 flex items-center gap-3"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            <span className="hidden shrink-0 items-center gap-1.5 text-xs font-bold text-muted-foreground sm:inline-flex">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              Try asking
            </span>
            <button
              onClick={() => askKai(prompts[promptIdx] ?? HERO_PROMPTS[0])}
              aria-label={`Ask K-AI: ${prompts[promptIdx] ?? HERO_PROMPTS[0]}`}
              className="chip-shine group/prompt inline-flex max-w-full items-center gap-2 overflow-hidden rounded-full border border-primary/25 bg-white/80 py-2 pl-4 pr-3 text-xs font-bold text-primary shadow-sm backdrop-blur transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md active:scale-[0.98] md:text-[13px]"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={promptIdx}
                  initial={{ y: 14, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -14, opacity: 0 }}
                  transition={{ duration: 0.28, ease: "easeOut" }}
                  className="truncate"
                >
                  “{prompts[promptIdx] ?? HERO_PROMPTS[0]}”
                </motion.span>
              </AnimatePresence>
              <ArrowRight className="h-3.5 w-3.5 shrink-0 transition-transform duration-300 group-hover/prompt:translate-x-0.5" />
            </button>
            {/* progress dots */}
            <span className="hidden items-center gap-1 lg:inline-flex" aria-hidden>
              {prompts.map((_, i) => (
                <button
                  key={i}
                  tabIndex={-1}
                  onClick={() => setPromptIdx(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === promptIdx
                      ? "dot-glow w-4 bg-gradient-to-r from-primary to-amber-400"
                      : "w-1.5 bg-primary/20 hover:bg-primary/40"
                  }`}
                />
              ))}
            </span>
          </motion.div>

          {/* quick contact chips */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={4}
            className="mt-9 flex flex-wrap gap-2.5"
          >
            {[
              { icon: MapPin, label: profile.location, href: undefined },
              { icon: Mail, label: profile.email, href: `mailto:${profile.email}` },
              { icon: Phone, label: profile.phone, href: profile.phoneHref },
              { icon: Linkedin, label: "in/easamkarthik", href: profile.linkedinHref },
            ].map(({ icon: Icon, label, href }) =>
              href ? (
                <a
                  key={label}
                  href={href}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-white/70 px-3.5 py-2 text-xs font-semibold text-muted-foreground backdrop-blur transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:text-primary"
                >
                  <Icon className="h-3.5 w-3.5 text-primary" />
                  {label}
                </a>
              ) : (
                <span
                  key={label}
                  className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-white/70 px-3.5 py-2 text-xs font-semibold text-muted-foreground backdrop-blur"
                >
                  <Icon className="h-3.5 w-3.5 text-primary" />
                  {label}
                </span>
              )
            )}
          </motion.div>
        </div>

        {/* ------- right column: avatar card ------- */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.7, ease: "easeOut" }}
          className="relative mx-auto w-full max-w-sm lg:max-w-md"
        >
          {/* conic ring */}
          <div
            aria-hidden
            className="animate-spin-slow absolute -inset-6 rounded-[2.5rem] opacity-60"
            style={{
              background:
                "conic-gradient(from 0deg, oklch(0.85 0.1 180), oklch(0.93 0.09 90), oklch(0.85 0.1 160), oklch(0.85 0.1 180))",
              filter: "blur(18px)",
            }}
          />
          <div className="glass-card animate-float-slow relative overflow-hidden rounded-[2rem] p-6">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-secondary to-emerald-50">
              <img
                src={profile.avatarUrl}
                alt={`Photo of ${profile.name}, ${profile.title}`}
                className="aspect-[4/4.4] w-full object-cover object-top"
              />
              <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white/95 to-transparent" />
              {/* AI status pill */}
              <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-xs font-bold text-primary shadow-lg backdrop-blur">
                <span className="animate-orb h-2 w-2 rounded-full bg-emerald-500" />
                K-AI Assistant Online
              </div>
            </div>

            <div className="mt-5 flex items-end justify-between">
              <div>
                <p className="text-lg font-extrabold tracking-tight">{profile.name}</p>
                <p className="text-sm font-medium text-muted-foreground">
                  {profile.title} — Software Delivery
                </p>
              </div>
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-accent/80 text-accent-foreground shadow-md">
                <ShieldCheck className="h-5 w-5" />
              </span>
            </div>
          </div>

          {/* floating badges */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="glass-card animate-float absolute -left-6 top-10 hidden rounded-2xl px-4 py-3 sm:block"
          >
            <p className="text-2xl font-extrabold text-gradient-soft">9+</p>
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Years Delivery
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="glass-card animate-float-slow absolute -right-4 bottom-24 hidden rounded-2xl px-4 py-3 sm:block"
          >
            <p className="text-2xl font-extrabold text-gradient-soft">7+</p>
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Live Projects
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.5 }}
            className="glass-card animate-float absolute -bottom-12 left-6 hidden rounded-2xl px-4 py-3 sm:block"
          >
            <p className="text-2xl font-extrabold text-gradient-soft">30+</p>
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Team Members Led
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* scroll hint */}
      <motion.a
        href="#about"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6 }}
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-primary md:flex"
        aria-label="Scroll to about section"
      >
        Scroll to explore
        <span className="grid h-9 w-9 animate-bounce place-items-center rounded-full border border-primary/25 bg-white/70">
          <ArrowDown className="h-4 w-4 text-primary" />
        </span>
      </motion.a>
    </section>
  );
}

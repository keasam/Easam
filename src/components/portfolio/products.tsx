"use client";

import { motion } from "framer-motion";
import {
  ArrowUpRight,
  AudioWaveform,
  Bot,
  ClipboardCheck,
  Cpu,
  Droplets,
  RadioTower,
  Sparkles,
} from "lucide-react";
import { SectionHeading } from "./section-heading";
import { askKai } from "@/lib/vcard";

/**
 * IoT & digital-infrastructure product portfolio (Radise India years).
 * Content supplied directly by Karthik — kept faithful to his wording.
 */
const products = [
  {
    name: "SmartPile® Inspector / Duplex",
    tagline: "IoT pile-driving & integrity monitoring",
    image: "/images/product-smartpile-inspector.png",
    alt: "Illustration of pile-driving rig monitored by audio and embedded sensors with live reporting dashboard",
    icon: AudioWaveform,
    description:
      "IoT-enabled pile-driving and integrity monitoring solution using audio and embedded sensors for real-time data capture, blow counting, driving-stress monitoring, and automated reporting.",
    points: [
      "Owned development of the IoT-enabled monitoring solution — real-time data capture, blow counting, driving-stress monitoring, and automated reporting.",
      "Managed product requirements, roadmap, cross-functional delivery, testing, and field deployment across hardware, software, cloud, and engineering teams.",
    ],
    tags: ["IoT", "Audio Sensors", "Embedded Sensors", "Blow Counting", "Automated Reporting", "Field Deployment"],
    accent: "teal" as const,
    askQuestion:
      "Walk me through SmartPile Inspector / Duplex — what did Karthik own on the IoT pile-driving and integrity monitoring product?",
  },
  {
    name: "SmartPile® EDC",
    tagline: "Embedded structural sensing",
    image: "/images/product-smartpile-edc.png",
    alt: "Illustration of embedded sensors collecting strain and temperature data from concrete piles with wireless transmission",
    icon: Cpu,
    description:
      "Embedded structural sensing solution for collecting strain, temperature, and load-related data from piles and concrete structures.",
    points: [
      "Managed an embedded structural sensing solution collecting strain, temperature, and load-related data from piles and concrete structures.",
      "Coordinated sensor, wireless communication, data acquisition, and software integration for real-time structural monitoring and analysis.",
    ],
    tags: ["Embedded Sensing", "Strain & Temperature", "Wireless Communication", "Data Acquisition", "Structural Monitoring"],
    accent: "amber" as const,
    askQuestion:
      "What was Karthik's role on SmartPile EDC — the embedded structural sensing product for piles and concrete structures?",
  },
  {
    name: "SmartWaterMonitor",
    tagline: "Remote water-level & pressure monitoring",
    image: "/images/product-smartwater.png",
    alt: "Illustration of a dam with water-level and pressure sensors connected via cellular to a cloud monitoring dashboard",
    icon: Droplets,
    description:
      "IoT-based water-level and pressure monitoring solution integrating sensors, cellular connectivity, cloud data management, alerts, and remote monitoring.",
    points: [
      "Owned an IoT-based water-level and pressure monitoring solution integrating sensors, cellular connectivity, cloud data management, alerts, and remote monitoring.",
      "Managed product requirements, integrations, testing, and deployment for applications including dams, embankments, seepage, and geotechnical monitoring.",
    ],
    tags: ["IoT", "Cellular Connectivity", "Cloud Data", "Alerts", "Dams & Embankments", "Geotechnical"],
    accent: "teal" as const,
    askQuestion:
      "Tell me about SmartWaterMonitor — how did Karthik manage the IoT water-level and pressure monitoring product for dams and geotechnical applications?",
  },
  {
    name: "SmartFieldSheet / SmartDensity",
    tagline: "Mobile field-data collection & QA/QC",
    image: "/images/product-smartfieldsheet.png",
    alt: "Illustration of a field engineer capturing density-gauge data wirelessly on a mobile app with automated reports",
    icon: ClipboardCheck,
    description:
      "Mobile field-data collection and reporting solution that wirelessly captured density-gauge data and streamlined QA/QC approvals, report generation, and client submission.",
    points: [
      "Managed a mobile field-data collection and reporting solution wirelessly capturing density-gauge data — streamlined QA/QC approvals, report generation, and client submission.",
      "Led product requirements, workflow digitization, testing, and field implementation to replace manual field sheets, data entry, and reporting processes.",
    ],
    tags: ["Mobile Data Collection", "Wireless Capture", "Density Gauge", "QA/QC Approvals", "Report Generation", "Workflow Digitization"],
    accent: "amber" as const,
    askQuestion:
      "How did SmartFieldSheet / SmartDensity replace manual field sheets — what did Karthik manage on this mobile field-data product?",
  },
];

/** The strong portfolio line — featured as a banner above the grid */
const portfolioLine =
  "Managed IoT and digital infrastructure products spanning embedded sensors, hardware, wireless connectivity, mobile applications, cloud platforms, analytics, automated reporting, and real-time monitoring across construction and geotechnical domains.";

/* Coordinated reveal choreography */
const gridContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.13 } },
};

const cardItem = {
  hidden: { opacity: 0, y: 36, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.6, ease: "easeOut" as const },
  },
};

const tagItem = {
  hidden: { opacity: 0, scale: 0.7, y: 8 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 380, damping: 22 },
  },
};

const chipsContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.2 } },
};

const chips = [
  { label: "Embedded Sensors", icon: Cpu },
  { label: "Hardware", icon: RadioTower },
  { label: "Wireless Connectivity", icon: RadioTower },
  { label: "Mobile Applications", icon: ClipboardCheck },
  { label: "Cloud Platforms", icon: AudioWaveform },
  { label: "Analytics & Reporting", icon: Sparkles },
  { label: "Real-Time Monitoring", icon: AudioWaveform },
];

export function Products() {
  return (
    <section id="products" className="relative py-12 md:py-16">
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-b from-transparent via-secondary/30 to-transparent"
      />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="IoT & Digital Infrastructure — Radise India"
          title="Product portfolio"
          highlight="managed end-to-end"
          description="Four IoT products owned across requirements, roadmap, delivery, testing, and field deployment — from embedded sensors to cloud dashboards."
        />

        {/* Strong portfolio line — featured banner */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.55 }}
          className="mx-auto mb-8 max-w-4xl rounded-3xl border border-primary/15 bg-gradient-to-r from-secondary/80 via-white to-accent/50 p-6 shadow-sm md:p-8"
        >
          <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-primary">
            Portfolio line
          </p>
          <p className="mt-2 text-sm font-semibold leading-relaxed text-foreground/85 md:text-[15px] md:leading-7">
            {portfolioLine}
          </p>
          <div className="mt-4 flex flex-wrap gap-1.5">
            <motion.div
              variants={chipsContainer}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-40px" }}
              className="flex flex-wrap gap-1.5"
            >
              {chips.map((c) => (
                <motion.span
                  key={c.label}
                  variants={tagItem}
                  className="inline-flex items-center gap-1.5 rounded-full border border-primary/15 bg-white/80 px-3 py-1 text-[11px] font-bold text-primary"
                >
                  <c.icon className="h-3 w-3" />
                  {c.label}
                </motion.span>
              ))}
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          variants={gridContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="grid gap-6 md:grid-cols-2 md:gap-8"
        >
          {products.map((p, i) => {
            const isTeal = p.accent === "teal";
            return (
              <motion.article
                key={p.name}
                variants={cardItem}
                className="lift card-glow group flex flex-col overflow-hidden rounded-[1.75rem] border border-primary/10 bg-white/85 shadow-md backdrop-blur transition-shadow hover:shadow-2xl hover:shadow-primary/15"
              >
                {/* image header */}
                <div className="relative h-44 overflow-hidden md:h-52">
                  <img
                    src={p.image}
                    alt={p.alt}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.07] group-hover:rotate-[0.5deg]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-white/10 to-transparent" />
                  <span
                    className={`animate-float absolute left-5 top-5 grid h-12 w-12 place-items-center rounded-2xl text-white shadow-xl transition-transform duration-300 group-hover:scale-110 ${
                      isTeal
                        ? "bg-gradient-to-br from-primary to-emerald-500"
                        : "bg-gradient-to-br from-amber-400 to-orange-400"
                    }`}
                  >
                    <p.icon className="h-6 w-6" />
                  </span>
                  <span className="chip-shine absolute right-5 top-5 rounded-full bg-white/90 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-primary shadow">
                    Product 0{i + 1}
                  </span>
                </div>

                {/* content */}
                <div className="flex flex-1 flex-col p-6 md:p-7">
                  <p
                    className={`text-xs font-extrabold uppercase tracking-[0.16em] ${
                      isTeal ? "text-primary" : "text-amber-600"
                    }`}
                  >
                    {p.tagline}
                  </p>
                  <h3 className="mt-2 text-xl font-extrabold tracking-tight md:text-2xl">
                    {p.name}
                  </h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground md:leading-6">
                    {p.description}
                  </p>

                  <ul className="mt-4 space-y-2">
                    {p.points.map((pt) => (
                      <li
                        key={pt}
                        className="flex gap-2.5 text-[13px] leading-relaxed text-muted-foreground"
                      >
                        <ArrowUpRight
                          className={`mt-0.5 h-4 w-4 shrink-0 ${
                            isTeal ? "text-primary" : "text-amber-500"
                          }`}
                        />
                        {pt}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-4 mb-6 flex flex-wrap gap-1.5">
                    {p.tags.map((t) => (
                      <motion.span
                        key={t}
                        variants={tagItem}
                        className={`rounded-full px-3 py-1 text-[11px] font-bold ${
                          isTeal
                            ? "bg-secondary text-primary"
                            : "bg-amber-100/80 text-amber-700"
                        }`}
                      >
                        {t}
                      </motion.span>
                    ))}
                  </div>

                  {/* product-scoped K-AI deep-dive — pinned to card bottom for equal-height alignment */}
                  <button
                    onClick={() => askKai(p.askQuestion)}
                    aria-label={`Ask K-AI about ${p.name}`}
                    className={`group/ask mt-auto inline-flex items-center gap-2 self-start rounded-full border px-4 py-2 text-xs font-extrabold shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98] ${
                      isTeal
                        ? "border-primary/25 bg-gradient-to-r from-secondary/80 to-white text-primary hover:border-primary/50"
                        : "border-amber-300/50 bg-gradient-to-r from-amber-50 to-white text-amber-700 hover:border-amber-400"
                    }`}
                  >
                    <Sparkles className="h-3.5 w-3.5 transition-transform duration-300 group-hover/ask:rotate-12 group-hover/ask:scale-110" />
                    Ask K-AI about {p.name.split(" / ")[0]}
                  </button>
                </div>
              </motion.article>
            );
          })}
        </motion.div>

        {/* portfolio-wide K-AI CTA */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          onClick={() =>
            askKai(
              "Give me a tour of Karthik's IoT product portfolio — SmartPile Inspector/Duplex, SmartPile EDC, SmartWaterMonitor, and SmartFieldSheet/SmartDensity — and what each product proved about him."
            )
          }
          aria-label="Ask K-AI for a tour of the full IoT product portfolio"
          className="lift card-glow mx-auto mt-8 flex max-w-2xl items-center justify-center gap-3 rounded-2xl border border-primary/15 bg-gradient-to-r from-accent/50 via-white to-secondary/70 px-6 py-4 text-center shadow-sm"
        >
          <Bot className="h-5 w-5 shrink-0 text-primary" />
          <p className="text-xs font-semibold text-muted-foreground md:text-sm">
            Want the full IoT product story?{" "}
            <span className="font-bold text-primary underline decoration-primary/30 underline-offset-2">
              Ask K-AI for a tour of all four products
            </span>{" "}
            — one tap, instant answer
          </p>
        </motion.button>
      </div>
    </section>
  );
}

"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Bot, Scale, ServerCog, Sparkles, Wrench } from "lucide-react";
import { SectionHeading } from "./section-heading";
import { askKai } from "@/lib/vcard";

const projects = [
  {
    name: "OfficeGX",
    subtitle: "Integrated ERP Platform — built from scratch",
    image: "/images/project-erp.png",
    alt: "Illustration of the OfficeGX integrated ERP platform dashboard",
    icon: ServerCog,
    description:
      "End-to-end delivery coordination for a six-module ERP platform: owned the lifecycle from ideation and requirements through development, UAT, release, and continuous improvement.",
    points: [
      "Owned delivery across CRM, Project Management, HRMS, ATS, Sales & Purchasing, and Payroll modules",
      "Translated business requirements into actionable deliverables with Product, Engineering, UI/UX & QA",
      "Led UAT validation, defect triage, change requests, and production deployment",
    ],
    tags: ["ERP", "6 Modules", "UAT", "Go-Live", "Continuous Improvement"],
    accent: "teal" as const,
    askQuestion:
      "Walk me through how Karthik delivered OfficeGX — his role, the six modules, and how he handled UAT and release.",
  },
  {
    name: "eLegum",
    subtitle: "LegalTech Platform — concept to launch",
    image: "/images/project-legal.png",
    alt: "Illustration of the eLegum legal technology platform with AI assistant",
    icon: Scale,
    description:
      "Took a LegalTech platform from concept through launch: case submission, advocate consultation, appointment booking, payments, and document management — plus Lexa, an AI-powered legal assistant.",
    points: [
      "Led delivery from concept through launch and ongoing enhancement",
      "Prioritized customer requirements across five core legal workflows",
      "Supported delivery of Lexa, an AI-powered legal assistant, from dev through implementation",
    ],
    tags: ["LegalTech", "AI Assistant — Lexa", "Payments", "Docs", "Zero → Launch"],
    accent: "amber" as const,
    askQuestion:
      "What did Karthik do on the eLegum LegalTech platform, and how did Lexa the AI legal assistant come to life?",
  },
  {
    name: "Smart FieldSheet",
    subtitle: "Civil Engineering Digitization — IoT monitoring",
    image: "/images/project-fieldsheet.png",
    alt: "Illustration of Smart FieldSheet civil engineering field inspection platform",
    icon: Wrench,
    description:
      "Translated civil engineering field workflows into digitized product requirements — shifting field teams from paper to software. Sustained the SmartPile Inspector platform and IoT sensor integrations for real-time infrastructure monitoring.",
    points: [
      "Owned end-to-end delivery, replacing manual paper-based field processes with SmartFieldSheet / SmartDensity",
      "Streamlined QA/QC approvals, report generation, and client submission via wireless density-gauge capture",
      "Defined IoT sensor integration requirements for real-time monitoring of bridges & piles",
      "Guided a Quality Management System meeting formal civil-engineering compliance standards",
    ],
    tags: ["IoT Sensors", "SmartDensity", "QMS", "Infrastructure", "UAT Cycles", "Agile"],
    accent: "teal" as const,
    askQuestion:
      "How did Karthik turn Smart FieldSheet from a paper process into software, and what was his QA role at Radise?",
  },
];

export function Projects() {
  return (
    <section id="projects" className="relative py-12 md:py-16">
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-b from-transparent via-accent/20 to-transparent"
      />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Flagship Delivery Work"
          title="Platforms taken"
          highlight="from zero to launch"
          description="Three flagship products Karthik has driven end-to-end — an ERP suite, a LegalTech platform with AI, and civil-engineering IoT software."
        />

        <div className="space-y-8 md:space-y-10">
          {projects.map((p, i) => {
            const isTeal = p.accent === "teal";
            const reversed = i % 2 === 1;
            return (
              <motion.article
                key={p.name}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6 }}
                className="group grid items-stretch gap-6 overflow-hidden rounded-[2rem] border border-primary/10 bg-white/85 shadow-md backdrop-blur transition-shadow hover:shadow-2xl hover:shadow-primary/15 lg:grid-cols-2 lg:gap-0"
              >
                {/* image side */}
                <div
                  className={`relative min-h-[240px] overflow-hidden lg:min-h-[320px] ${
                    reversed ? "lg:order-2" : ""
                  }`}
                >
                  <img
                    src={p.image}
                    alt={p.alt}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                  />
                  <div
                    className={`absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r ${
                      reversed
                        ? "lg:bg-gradient-to-l"
                        : ""
                    } from-white/95 via-white/20 to-transparent`}
                  />
                  <span
                    className={`absolute left-5 top-5 grid h-12 w-12 place-items-center rounded-2xl text-white shadow-xl ${
                      isTeal
                        ? "bg-gradient-to-br from-primary to-emerald-500"
                        : "bg-gradient-to-br from-amber-400 to-orange-400"
                    }`}
                  >
                    <p.icon className="h-6 w-6" />
                  </span>
                  <span className="absolute right-5 top-5 rounded-full bg-white/90 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-primary shadow">
                    0{i + 1}
                  </span>
                </div>

                {/* content side */}
                <div
                  className={`flex flex-col justify-center p-6 md:p-9 ${
                    reversed ? "lg:order-1" : ""
                  }`}
                >
                  <p
                    className={`text-xs font-extrabold uppercase tracking-[0.16em] ${
                      isTeal ? "text-primary" : "text-amber-600"
                    }`}
                  >
                    {p.subtitle}
                  </p>
                  <h3 className="mt-2 text-2xl font-extrabold tracking-tight md:text-3xl">
                    {p.name}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-[15px] md:leading-7">
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

                  <div className="mt-5 flex flex-wrap gap-1.5">
                    {p.tags.map((t) => (
                      <span
                        key={t}
                        className={`rounded-full px-3 py-1 text-[11px] font-bold ${
                          isTeal
                            ? "bg-secondary text-primary"
                            : "bg-amber-100/80 text-amber-700"
                        }`}
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  {/* project-scoped K-AI deep-dive */}
                  <button
                    onClick={() => askKai(p.askQuestion)}
                    aria-label={`Ask K-AI about ${p.name}`}
                    className={`group/ask mt-6 inline-flex items-center gap-2 self-start rounded-full border px-4 py-2 text-xs font-extrabold shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98] ${
                      isTeal
                        ? "border-primary/25 bg-gradient-to-r from-secondary/80 to-white text-primary hover:border-primary/50"
                        : "border-amber-300/50 bg-gradient-to-r from-amber-50 to-white text-amber-700 hover:border-amber-400"
                    }`}
                  >
                    <Sparkles className="h-3.5 w-3.5 transition-transform duration-300 group-hover/ask:rotate-12 group-hover/ask:scale-110" />
                    Ask K-AI about {p.name}
                  </button>
                </div>
              </motion.article>
            );
          })}
        </div>

        {/* AI hint footer — now a live action */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          onClick={() =>
            askKai(
              "Compare the three flagship projects — OfficeGX, eLegum, and Smart FieldSheet. What did each prove about Karthik as a PM?"
            )
          }
          aria-label="Ask K-AI to compare all three flagship projects"
          className="lift card-glow mx-auto mt-12 flex max-w-2xl items-center justify-center gap-3 rounded-2xl border border-primary/15 bg-gradient-to-r from-secondary/70 via-white to-accent/50 px-6 py-4 text-center shadow-sm"
        >
          <Bot className="h-5 w-5 shrink-0 text-primary" />
          <p className="text-xs font-semibold text-muted-foreground md:text-sm">
            Want the full delivery story?{" "}
            <span className="font-bold text-primary underline decoration-primary/30 underline-offset-2">
              Ask K-AI to compare all three projects
            </span>{" "}
            — one tap, instant answer
          </p>
        </motion.button>
      </div>
    </section>
  );
}
